/* Family notifications. Every message is recorded in `notifications` with a
   dedupe key, so retries and repeated webhook deliveries never double-send.
   Delivery only reports "sent" when the email provider accepted the message. */
import { uid, nowIso, first, run, parseJson } from './util.js';
import { fmtDateLong, fmtTime, tzAbbrev, localToInstant } from './time.js';

export function emailStatus(env) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) return { configured: false, mode: 'off', detail: 'Email provider not configured (RESEND_API_KEY and EMAIL_FROM).' };
  const mode = env.EMAIL_MODE === 'live' ? 'live' : 'redirect';
  if (mode === 'redirect' && !env.EMAIL_REDIRECT_TO) return { configured: false, mode, detail: 'EMAIL_MODE is not live and EMAIL_REDIRECT_TO is empty; nothing will be sent.' };
  return { configured: true, mode, detail: mode === 'live' ? 'Sending to real recipients.' : 'Test mode: every email is redirected to ' + env.EMAIL_REDIRECT_TO + '.' };
}

export function render(tpl, vars) {
  const fill = (s) => (s || '').replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] == null ? '' : String(vars[k])));
  const body = fill(tpl.body).replace(/\n{3,}/g, '\n\n').trim();
  return { subject: fill(tpl.subject).replace(/\s+/g, ' ').trim(), body };
}

export function bookingVars(bk, settings, extra = {}) {
  const snap = parseJson(bk.snapshot, {});
  const form = parseJson(bk.form, {});
  const tz = settings.timezone;
  const loc = snap.location || {};
  const confirmed = bk.status === 'confirmed' || bk.status === 'completed';
  const details = confirmed
    ? [loc.facility_name, loc.address, loc.parking && 'Parking/entrance: ' + loc.parking, loc.weather_notes && 'Weather: ' + loc.weather_notes].filter(Boolean).join('\n')
    : '';
  const req = parseJson(bk.request, null);
  let relative = '';
  if (bk.date && bk.time) {
    const hrs = (localToInstant(bk.date, bk.time, tz) - Date.now()) / 3600000;
    relative = hrs < 30 ? 'tomorrow' : 'on ' + fmtDateLong(bk.date);
  }
  return {
    parent: form.parent || 'there',
    athlete: form.athlete || 'your athlete',
    service: snap.service_name || 'Training',
    date: bk.date ? fmtDateLong(bk.date) : '',
    time: bk.time ? fmtTime(bk.time) : '',
    timezone: bk.date && bk.time ? tzAbbrev(bk.date, bk.time, tz) + ', ' + tz.replace('_', ' ') : tz,
    coach: snap.coach_name || settings.calendar.coachName,
    location: loc.name || '',
    location_details: details,
    prep: snap.prep_instructions ? 'Before the session: ' + snap.prep_instructions : '',
    policy: (settings.cancellation.policyLines || []).join('\n'),
    requested: req ? [req.day, req.time, req.location, req.date].filter(Boolean).join(' · ') : '',
    relative,
    ...extra,
  };
}

async function sendViaResend(env, { to, subject, text, replyTo, fromName }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: (fromName ? fromName + ' <' + env.EMAIL_FROM + '>' : env.EMAIL_FROM), to: [to], subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body && (body.message || body.name)) || 'HTTP ' + res.status);
  return body.id;
}

/** Queue + attempt delivery. Returns the notification row status. */
export async function notify(env, db, settings, { bookingId, kind, to, subject, body, dedupeKey }) {
  const id = uid();
  const ins = await run(db,
    'INSERT OR IGNORE INTO notifications (id, booking_id, kind, channel, to_addr, subject, status, dedupe_key, created_at) VALUES (?,?,?,?,?,?,?,?,?)',
    id, bookingId || null, kind, 'email', to || null, subject, 'queued', dedupeKey || id, nowIso());
  if (!ins.meta || ins.meta.changes === 0) return { status: 'duplicate' };
  const st = emailStatus(env);
  let status, detail = null, providerId = null;
  if (!to) { status = 'skipped'; detail = 'No recipient email on file.'; }
  else if (!st.configured) { status = 'skipped'; detail = st.detail; }
  else {
    const dest = st.mode === 'live' ? to : env.EMAIL_REDIRECT_TO;
    try {
      providerId = await sendViaResend(env, {
        to: dest, subject: st.mode === 'live' ? subject : '[TEST → ' + to + '] ' + subject, text: body,
        replyTo: settings.notifications.replyTo, fromName: settings.notifications.fromName,
      });
      status = 'sent';
      if (st.mode !== 'live') detail = 'Redirected to ' + dest + ' (test mode).';
    } catch (e) { status = 'failed'; detail = String(e.message || e).slice(0, 300); }
  }
  await run(db, 'UPDATE notifications SET status = ?, detail = ?, provider_id = ?, sent_at = ? WHERE id = ?',
    status, detail, providerId, status === 'sent' ? nowIso() : null, id);
  return { id, status, detail };
}

export async function notifyBooking(env, db, settings, bk, kind, { dedupeKey, extra } = {}) {
  const toggles = settings.notifications;
  const enabled = { request_received: toggles.sendRequestReceipt, confirmation: toggles.sendConfirmation, cancellation: toggles.sendCancellation, reschedule: toggles.sendReschedule }[kind];
  if (enabled === false) return { status: 'disabled' };
  const form = parseJson(bk.form, {});
  const tpl = settings.templates[kind];
  if (!tpl) return { status: 'no_template' };
  const { subject, body } = render(tpl, bookingVars(bk, settings, extra));
  return notify(env, db, settings, { bookingId: bk.id, kind, to: form.email, subject, body, dedupeKey: dedupeKey || kind + ':' + bk.id });
}

export async function coachAlert(env, db, settings, subject, body, key) {
  const to = settings.notifications.coachAlertEmail;
  if (!to) return { status: 'skipped' };
  return notify(env, db, settings, { kind: 'coach_alert', to, subject, body, dedupeKey: key });
}

export async function lastNotification(db, bookingId) {
  return first(db, 'SELECT * FROM notifications WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1', bookingId);
}
