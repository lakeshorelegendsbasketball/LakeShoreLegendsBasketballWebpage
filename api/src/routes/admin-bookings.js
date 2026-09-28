import { all, first, run, stmt, uid, nowIso, json, readJson, HttpError, assert, isIsoDate, isHm, parseJson, clean, bookingEvent, audit, money } from '../lib/util.js';
import { getSettings } from '../lib/settings.js';
import { zoned, localToInstant, fmtDateLong, fmtTime, toMins, addDays } from '../lib/time.js';
import { hardConflictsFor } from '../lib/schedule.js';
import { applyResolution, releaseSlot, confirmBooking, daySlots, dayBlocks, snapshotFor, bookingToApi } from '../lib/bookings.js';
import { notifyBooking, bookingVars, render, notify } from '../lib/notify.js';
import { checkoutUrl } from '../lib/stripe.js';
import { requireDirector } from '../lib/auth.js';

const ATTENDANCE = ['not_recorded', 'present', 'late', 'no_show'];

async function loadBooking(db, user, id) {
  const bk = await first(db, 'SELECT * FROM bookings WHERE id = ?', id);
  assert(bk, 404, 'Booking not found.');
  if (user.role !== 'director') assert(bk.coach_id === user.id, 403, 'This booking is assigned to another coach.');
  return bk;
}

export async function listBookings(env, req, user) {
  const db = env.DB;
  const settings = await getSettings(db);
  const where = user.role === 'director' ? '' : 'WHERE b.coach_id = ?';
  const rows = await all(db, `SELECT b.*, f.parent_name AS f_parent, f.email AS f_email, f.phone AS f_phone, a.name AS a_name, a.grade AS a_grade,
      (SELECT COUNT(*) FROM notifications n WHERE n.booking_id = b.id AND n.status = 'failed') AS failed_notices
    FROM bookings b LEFT JOIN families f ON f.id = b.family_id LEFT JOIN athletes a ON a.id = b.athlete_id ${where}
    ORDER BY COALESCE(b.date, substr(b.created_at, 1, 10)) DESC, b.time DESC`, ...(where ? [user.id] : []));
  let paid = {};
  if (user.role === 'director') {
    for (const p of await all(db, "SELECT booking_id, SUM(CASE WHEN kind = 'charge' AND status = 'succeeded' THEN amount_cents WHEN kind = 'refund' THEN -amount_cents ELSE 0 END) AS net FROM payments WHERE booking_id IS NOT NULL GROUP BY booking_id")) paid[p.booking_id] = p.net;
  }
  const now = zoned(new Date(), settings.timezone);
  return json({
    now,
    timezone: settings.timezone,
    bookings: rows.map((r) => ({ ...bookingToApi(r, user), family: { id: r.family_id, parent: r.f_parent, email: r.f_email, phone: r.f_phone }, athlete: { id: r.athlete_id, name: r.a_name, grade: r.a_grade }, net_paid_cents: user.role === 'director' ? (paid[r.id] ?? null) : undefined })),
  });
}

export async function getBooking(env, req, user, id) {
  const db = env.DB;
  const bk = await loadBooking(db, user, id);
  const events = await all(db, 'SELECT * FROM booking_events WHERE booking_id = ? ORDER BY at', id);
  const notices = await all(db, 'SELECT id, kind, to_addr, subject, status, detail, created_at, sent_at FROM notifications WHERE booking_id = ? ORDER BY created_at', id);
  const payments = user.role === 'director' ? await all(db, 'SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at', id) : [];
  const family = bk.family_id ? await first(db, 'SELECT * FROM families WHERE id = ?', bk.family_id) : null;
  const packages = user.role === 'director' && bk.family_id ? await familyPackages(db, bk.family_id) : [];
  const ledger = user.role === 'director' ? await all(db, 'SELECT * FROM credit_ledger WHERE booking_id = ? ORDER BY at', id) : [];
  return json({ booking: bookingToApi(bk, user), events: events.map((e) => ({ ...e, data: parseJson(e.data, null) })), notifications: notices, payments, family, packages, ledger });
}

export async function patchBooking(env, req, user, id) {
  const db = env.DB;
  const bk = await loadBooking(db, user, id);
  const b = await readJson(req);
  const t = nowIso();
  const sets = [], args = [], changed = [];
  if (b.form) {
    const form = { ...parseJson(bk.form, {}) };
    for (const k of ['parent', 'athlete', 'email', 'phone', 'age', 'focus', 'notes']) if (b.form[k] !== undefined && b.form[k] !== form[k]) { form[k] = clean(b.form[k], k === 'notes' ? 2000 : 300); changed.push(k); }
    sets.push('form = ?'); args.push(JSON.stringify(form));
  }
  if (b.private_notes !== undefined) { sets.push('private_notes = ?'); args.push(clean(b.private_notes, 5000)); changed.push('private_notes'); }
  if (b.roster !== undefined) {
    const roster = (b.roster || []).slice(0, 30).map((m) => ({ name: clean(m.name, 200), contact: clean(m.contact, 200), primary: !!m.primary, paid: !!m.paid,
      ...(m.paid && m.paid_via === 'stripe' ? { paid_via: 'stripe' } : m.paid ? { paid_via: 'manual' } : {}) }));
    sets.push('roster = ?'); args.push(JSON.stringify(roster)); changed.push('roster');
    // When each family pays for its own athlete, the ticked boxes drive the payment status.
    const mode = b.payer_mode || bk.payer_mode;
    if (mode === 'each' && ['unknown', 'unpaid', 'pending', 'paid'].includes(bk.payment_status) && b.payment_status === undefined) {
      const athletes = Math.max(parseInt(b.players ?? bk.players, 10) || 1, roster.length, 1);
      const paidCount = roster.filter((m) => m.paid).length;
      sets.push('payment_status = ?'); args.push(paidCount >= athletes ? 'paid' : paidCount > 0 ? 'pending' : 'unpaid');
      sets.push('attention = ?'); args.push(paidCount > 0 && paidCount < athletes ? `${paidCount} of ${athletes} athletes paid.` : (/athletes paid\.$/.test(bk.attention || '') ? null : bk.attention));
    }
  }
  if (b.payer_mode !== undefined) { assert(['one', 'each'].includes(b.payer_mode), 400, 'Invalid payer mode.'); sets.push('payer_mode = ?'); args.push(b.payer_mode); changed.push('payer_mode'); }
  if (b.players !== undefined) { sets.push('players = ?'); args.push(clean(b.players, 10)); changed.push('players'); }
  if (b.clear_attention) { sets.push('attention = NULL'); changed.push('attention_cleared'); }
  let payFix = null;
  if (b.payment_status !== undefined && b.payment_status !== bk.payment_status) {
    requireDirector(user);
    assert(['unknown', 'unpaid', 'paid', 'complimentary'].includes(b.payment_status), 400, 'That status is set by Stripe or payment records, not by hand.');
    assert(clean(b.payment_reason), 400, 'Add a short reason for correcting the payment status.');
    sets.push('payment_status = ?'); args.push(b.payment_status);
    payFix = { from: bk.payment_status, to: b.payment_status, reason: clean(b.payment_reason, 300) };
  }
  if (b.coach_id !== undefined) { requireDirector(user); sets.push('coach_id = ?'); args.push(b.coach_id || null); changed.push('coach'); }
  if (!sets.length) return json({ ok: true });
  sets.push('updated_at = ?'); args.push(t);
  await db.batch([
    stmt(db, `UPDATE bookings SET ${sets.join(', ')} WHERE id = ?`, ...args, id),
    ...(changed.length ? [bookingEvent(db, id, user.id, 'edited', { fields: changed })] : []),
    ...(payFix ? [bookingEvent(db, id, user.id, 'payment_status_corrected', payFix)] : []),
  ]);
  if (b.coach_id !== undefined && bk.slot_id) await run(db, 'UPDATE slots SET coach_id = ? WHERE id = ?', b.coach_id || null, bk.slot_id);
  return json({ ok: true, changed });
}

export async function recordAttendance(env, req, user, id) {
  const db = env.DB;
  const settings = await getSettings(db);
  const bk = await loadBooking(db, user, id);
  const { attendance } = await readJson(req);
  assert(ATTENDANCE.includes(attendance), 400, 'Invalid attendance value.');
  assert(bk.kind === 'dated' && ['confirmed', 'completed', 'awaiting_payment'].includes(bk.status), 409, 'Attendance applies to scheduled sessions.');
  const started = localToInstant(bk.date, bk.time, settings.timezone).getTime() <= Date.now();
  const status = attendance !== 'not_recorded' && started ? 'completed' : (bk.status === 'completed' && attendance === 'not_recorded' ? 'confirmed' : bk.status);
  await db.batch([
    stmt(db, 'UPDATE bookings SET attendance = ?, status = ?, updated_at = ? WHERE id = ?', attendance, status, nowIso(), id),
    bookingEvent(db, id, user.id, 'attendance', { attendance, status }),
  ]);
  return json({ ok: true, status, attendance });
}

function paymentStatusFor(net, expected, refundedAny) {
  if (refundedAny && net <= 0) return 'refunded';
  if (refundedAny) return 'partially_refunded';
  if (expected == null || net >= expected) return net > 0 ? 'paid' : 'unpaid';
  return net > 0 ? 'pending' : 'unpaid';
}

export async function recordPayment(env, req, user, id) {
  const db = env.DB;
  requireDirector(user);
  const settings = await getSettings(db);
  const bk = await loadBooking(db, user, id);
  const b = await readJson(req);
  const amount = Math.round(Number(b.amount_cents));
  assert(Number.isFinite(amount) && amount > 0 && amount < 10000000, 400, 'Enter an amount greater than zero.');
  const kind = b.kind === 'refund' ? 'refund' : 'charge';
  const method = ['cash', 'venmo', 'zelle', 'check', 'card', 'other'].includes(b.method) ? b.method : 'other';
  const paidOn = isIsoDate(b.paid_on) ? b.paid_on : zoned(new Date(), settings.timezone).date;
  const t = nowIso();
  await run(db, `INSERT INTO payments (id, booking_id, source, kind, amount_cents, method, paid_on, status, note, recorded_by, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    'py' + uid(10), id, 'offline', kind, amount, method, paidOn, 'succeeded', clean(b.note, 500), user.id, t);
  const tot = await first(db, `SELECT SUM(CASE WHEN kind = 'charge' AND status = 'succeeded' THEN amount_cents ELSE 0 END) AS charged,
    SUM(CASE WHEN kind = 'refund' THEN amount_cents ELSE 0 END) AS refunded FROM payments WHERE booking_id = ?`, id);
  const expected = parseJson(bk.snapshot, {}).price_cents;
  const net = (tot.charged || 0) - (tot.refunded || 0);
  const status = paymentStatusFor(net, expected, (tot.refunded || 0) > 0);
  const attention = status === 'pending' ? `Partial payment recorded: ${money(net)} of ${money(expected)}.` : null;
  await db.batch([
    stmt(db, 'UPDATE bookings SET payment_status = ?, attention = COALESCE(?, attention), updated_at = ? WHERE id = ?', status, attention, t, id),
    bookingEvent(db, id, user.id, kind === 'refund' ? 'offline_refund' : 'offline_payment', { amount_cents: amount, method, paid_on: paidOn, note: clean(b.note, 500) }),
  ]);
  if (kind === 'charge' && bk.status === 'awaiting_payment' && status === 'paid') await confirmBooking(env, db, settings, id, user.id, 'offline_payment');
  return json({ ok: true, payment_status: status });
}

export async function setComplimentary(env, req, user, id) {
  const db = env.DB;
  requireDirector(user);
  const settings = await getSettings(db);
  const bk = await loadBooking(db, user, id);
  await db.batch([
    stmt(db, "UPDATE bookings SET payment_status = 'complimentary', updated_at = ? WHERE id = ?", nowIso(), id),
    bookingEvent(db, id, user.id, 'complimentary', null),
  ]);
  if (bk.status === 'awaiting_payment') await confirmBooking(env, db, settings, id, user.id, 'complimentary');
  return json({ ok: true });
}

export async function confirmManually(env, req, user, id) {
  const db = env.DB;
  const settings = await getSettings(db);
  const bk = await loadBooking(db, user, id);
  assert(bk.status === 'awaiting_payment', 409, 'Only bookings awaiting payment can be confirmed this way.');
  await confirmBooking(env, db, settings, id, user.id, 'coach_confirmed_payment_outstanding');
  return json({ ok: true });
}

/** Claim a target slot for an existing booking (reschedule / approve). */
async function takeSlot(db, settings, bk, target, status) {
  const slots = await daySlots(db, target.date);
  const blocks = await dayBlocks(db, target.date);
  const hard = hardConflictsFor({ ...target, coach_id: target.coach_id }, slots.filter((s) => s.id !== bk.slot_id), blocks, settings);
  assert(!hard.length, 409, 'That time conflicts with another booked session or blocked time (' + hard[0]?.kind + ').');
  const r = await run(db, "UPDATE slots SET status = ?, booking_id = ?, updated_at = ? WHERE id = ? AND status = 'open'", status, bk.id, nowIso(), target.id);
  assert(r.meta.changes, 409, 'That opening was just taken. Pick another time.');
  await applyResolution(db, settings, { ...target, status, booking_id: bk.id }, await daySlots(db, target.date));
}

async function resolveTarget(db, settings, user, b, fallbackDuration) {
  if (b.slot_id) {
    const s = await first(db, 'SELECT * FROM slots WHERE id = ?', b.slot_id);
    assert(s && s.status === 'open', 409, 'That opening is no longer free.');
    return s;
  }
  assert(isIsoDate(b.date) && isHm(b.time) && b.loc_id, 400, 'Pick an opening, or enter a date, time and location.');
  const loc = await first(db, 'SELECT * FROM locations WHERE id = ?', b.loc_id);
  assert(loc && !loc.archived_at, 400, 'Choose an active location.');
  const dup = await first(db, 'SELECT * FROM slots WHERE date = ? AND time = ? AND loc_id = ?', b.date, b.time, b.loc_id);
  if (dup) { assert(dup.status === 'open', 409, 'That time is already booked.'); return dup; }
  const t = nowIso();
  const s = { id: 's' + uid(10), date: b.date, time: b.time, duration: +b.duration || fallbackDuration || settings.defaultDuration, loc_id: b.loc_id, coach_id: user.role === 'director' ? (b.coach_id || null) : user.id };
  await run(db, "INSERT INTO slots (id, date, time, duration, loc_id, coach_id, status, created_at, updated_at) VALUES (?,?,?,?,?,?,'open',?,?)", s.id, s.date, s.time, s.duration, s.loc_id, s.coach_id, t, t);
  return { ...s, status: 'open' };
}

export async function reschedule(env, req, user, id) {
  const db = env.DB;
  const settings = await getSettings(db);
  const bk = await loadBooking(db, user, id);
  assert(bk.kind === 'dated' && ['awaiting_payment', 'confirmed'].includes(bk.status), 409, 'Only upcoming scheduled bookings can be rescheduled.');
  const b = await readJson(req);
  const target = await resolveTarget(db, settings, user, b, bk.duration);
  assert(target.id !== bk.slot_id, 400, 'That is the current time.');
  const oldSlot = bk.slot_id ? await first(db, 'SELECT * FROM slots WHERE id = ?', bk.slot_id) : null;
  await takeSlot(db, settings, bk, target, oldSlot && oldSlot.status === 'held' ? 'held' : 'booked');
  if (bk.slot_id) await releaseSlot(db, settings, bk.slot_id, { reopen: b.reopen_old !== false });
  const loc = await first(db, 'SELECT * FROM locations WHERE id = ?', target.loc_id);
  const snap = parseJson(bk.snapshot, {});
  snap.location = snapshotFor({}, loc, null, settings).location;
  const prev = { date: bk.date, time: bk.time, loc_id: bk.loc_id, location: (parseJson(bk.snapshot, {}).location || {}).name };
  await db.batch([
    stmt(db, 'UPDATE bookings SET slot_id = ?, date = ?, time = ?, duration = ?, loc_id = ?, coach_id = ?, snapshot = ?, updated_at = ? WHERE id = ?',
      target.id, target.date, target.time, target.duration, target.loc_id, target.coach_id || bk.coach_id, JSON.stringify(snap), nowIso(), id),
    bookingEvent(db, id, user.id, 'rescheduled', { from: prev, to: { date: target.date, time: target.time, loc_id: target.loc_id }, reason: clean(b.reason, 300) }),
  ]);
  let notice = null;
  if (b.notify) {
    const fresh = await first(db, 'SELECT * FROM bookings WHERE id = ?', id);
    notice = await notifyBooking(env, db, settings, fresh, 'reschedule', {
      dedupeKey: 'reschedule:' + id + ':' + target.date + 'T' + target.time,
      extra: { previous: prev.date ? fmtDateLong(prev.date) + ' at ' + fmtTime(prev.time) + (prev.location ? ' · ' + prev.location : '') : '' },
    });
  }
  return json({ ok: true, notice });
}

function hoursUntil(bk, settings) {
  if (!bk.date || !bk.time) return null;
  return (localToInstant(bk.date, bk.time, settings.timezone).getTime() - Date.now()) / 3600000;
}

/** What the cancellation policy says for this booking right now. */
export function cancelPolicy(bk, settings) {
  const h = hoursUntil(bk, settings);
  const c = settings.cancellation;
  if (h == null) return { hours: null, rule: 'No scheduled time.', refundPct: 100, creditRestorable: true };
  const late = h < c.fullRefundHours;
  return {
    hours: Math.round(h * 10) / 10,
    rule: late ? `Within ${c.fullRefundHours} hours: ${c.lateRetainerPct}% retainer applies.` : `More than ${c.fullRefundHours} hours ahead: full refund eligible.`,
    refundPct: late ? 100 - c.lateRetainerPct : 100,
    creditRestorable: h >= c.creditRestoreHours,
  };
}

export async function cancelPreview(env, req, user, id) {
  const db = env.DB;
  const settings = await getSettings(db);
  const bk = await loadBooking(db, user, id);
  const redeemed = await first(db, "SELECT * FROM credit_ledger WHERE idem_key = ?", 'redeem:' + id);
  return json({ policy: cancelPolicy(bk, settings), payment_status: bk.payment_status, has_slot: !!bk.slot_id, credit_redeemed: !!redeemed, email_on_file: !!parseJson(bk.form, {}).email });
}

export async function cancelBooking(env, req, user, id) {
  const db = env.DB;
  const settings = await getSettings(db);
  const bk = await loadBooking(db, user, id);
  assert(!['canceled', 'declined', 'expired', 'completed'].includes(bk.status), 409, 'This booking is already closed.');
  const b = await readJson(req);
  const outcome = ['unchanged', 'refund_pending', 'credit', 'restore_credit'].includes(b.payment_outcome) ? b.payment_outcome : 'unchanged';
  if (outcome !== 'unchanged') requireDirector(user);
  const policy = cancelPolicy(bk, settings);
  const t = nowIso();
  const info = { reason: clean(b.reason, 300) || 'canceled_by_coach', reopen: b.reopen !== false, notify: !!b.notify, payment_outcome: outcome, policy, by: user.id, at: t };
  let attention = null;
  const stmts = [];
  if (outcome === 'refund_pending') {
    attention = 'Refund to issue in Stripe (nothing was refunded automatically).' + (b.refund_note ? ' ' + clean(b.refund_note, 200) : '');
  }
  if (outcome === 'restore_credit') {
    const red = await first(db, 'SELECT * FROM credit_ledger WHERE idem_key = ?', 'redeem:' + id);
    assert(red, 400, 'No package credit was used for this booking.');
    assert(policy.creditRestorable || b.override_policy, 409, `Policy: credits are restored only when canceled at least ${settings.cancellation.creditRestoreHours} hours ahead. Check "override" to restore anyway.`);
    const upd = await run(db, 'UPDATE credit_ledger SET idem_key = ? WHERE idem_key = ?', 'redeem:' + id + ':restored:' + t, 'redeem:' + id);
    assert(upd.meta.changes, 409, 'Credit was already restored.');
    stmts.push(stmt(db, 'INSERT INTO credit_ledger (id, family_package_id, booking_id, delta, reason, idem_key, actor, note, at) VALUES (?,?,?,?,?,?,?,?,?)',
      uid(), red.family_package_id, id, red.delta === 0 ? 0 : 1, 'restore', 'restore:' + id + ':' + t, user.id, b.override_policy ? 'Policy override' : null, t));
  }
  if (outcome === 'credit') {
    assert(bk.family_id, 400, 'This booking has no family record to credit.');
    await ensureCreditPackage(db);
    const fpId = 'fp' + uid(10);
    stmts.push(stmt(db, `INSERT INTO family_packages (id, family_id, package_id, snapshot, status, credits_total, purchased_at, created_by, created_at) VALUES (?,?,?,?, 'active', 1, ?, ?, ?)`,
      fpId, bk.family_id, 'pkg_credit', JSON.stringify({ name: 'Session credit (from cancellation)', credits: 1, eligible_type_ids: null, source_booking: id }), t, user.id, t));
    stmts.push(stmt(db, 'INSERT INTO credit_ledger (id, family_package_id, booking_id, delta, reason, idem_key, actor, at) VALUES (?,?,?,?,?,?,?,?)',
      uid(), fpId, id, 1, 'purchase', 'cancel_credit:' + id, user.id, t));
    info.credit_family_package_id = fpId;
  }
  stmts.unshift(stmt(db, "UPDATE bookings SET status = 'canceled', hold_expires_at = NULL, cancel_info = ?, attention = ?, updated_at = ? WHERE id = ?", JSON.stringify(info), attention, t, id));
  stmts.push(bookingEvent(db, id, user.id, 'canceled', info));
  await db.batch(stmts);
  if (bk.slot_id) await releaseSlot(db, settings, bk.slot_id, { reopen: info.reopen });
  let notice = null;
  if (info.notify) {
    const outcomeText = {
      unchanged: '',
      refund_pending: 'A refund will be issued to your original payment method.',
      credit: 'A session credit has been added to your account for a future booking.',
      restore_credit: 'Your package credit has been restored.',
    }[outcome];
    notice = await notifyBooking(env, db, settings, { ...bk, status: 'canceled' }, 'cancellation', { extra: { cancel_outcome: outcomeText } });
  }
  return json({ ok: true, notice });
}

async function ensureCreditPackage(db) {
  const t = nowIso();
  await run(db, `INSERT OR IGNORE INTO packages (id, name, price_cents, credits, eligible_type_ids, validity_days, billing, active, created_at, updated_at)
    VALUES ('pkg_credit', 'Session credit (from cancellation)', 0, 1, NULL, NULL, 'one_time', 0, ?, ?)`, t, t);
}

export async function resend(env, req, user, id) {
  const db = env.DB;
  const settings = await getSettings(db);
  const bk = await loadBooking(db, user, id);
  const b = await readJson(req);
  const kind = b.kind || (bk.status === 'requested' ? 'request_received' : 'confirmation');
  if (kind === 'confirmation') assert(['confirmed', 'completed'].includes(bk.status), 409, 'Only confirmed bookings get a confirmation. Use the payment link or confirm it first.');
  const notice = await notifyBooking(env, db, settings, bk, kind, { dedupeKey: 'resend:' + kind + ':' + id + ':' + Date.now() });
  await bookingEvent(db, id, user.id, 'resent', { kind, status: notice.status }).run();
  return json({ notice });
}

export async function approveRequest(env, req, user, id) {
  const db = env.DB;
  const settings = await getSettings(db);
  const bk = await loadBooking(db, user, id);
  assert(bk.status === 'requested', 409, 'Only open requests can be approved.');
  const b = await readJson(req);
  const type = await first(db, 'SELECT * FROM session_types WHERE id = ?', b.type_id || bk.type_id);
  assert(type, 400, 'Pick the session type for this booking.');
  const target = await resolveTarget(db, settings, user, b, type.duration);
  const requirePay = b.require_payment !== false && !!type.pay_link;
  await takeSlot(db, settings, bk, target, 'booked');
  const loc = await first(db, 'SELECT * FROM locations WHERE id = ?', target.loc_id);
  const coach = target.coach_id ? await first(db, 'SELECT id, name FROM users WHERE id = ?', target.coach_id) : null;
  const snapshot = snapshotFor({ ...type, duration: target.duration }, loc, coach, settings);
  const t = nowIso();
  await db.batch([
    stmt(db, `UPDATE bookings SET kind = 'dated', status = ?, type_id = ?, snapshot = ?, slot_id = ?, date = ?, time = ?, duration = ?, loc_id = ?, coach_id = ?,
      checkout_ref = COALESCE(checkout_ref, ?), payment_status = CASE WHEN payment_status = 'unknown' THEN 'unpaid' ELSE payment_status END, payer_mode = ?, updated_at = ? WHERE id = ?`,
      requirePay ? 'awaiting_payment' : 'confirmed', type.id, JSON.stringify(snapshot), target.id, target.date, target.time, target.duration, target.loc_id, target.coach_id || null,
      type.pay_link ? id : null, type.pricing_basis === 'athlete' && (parseInt(bk.players, 10) || 1) > 1 ? 'each' : bk.payer_mode, t, id),
    bookingEvent(db, id, user.id, 'approved', { slot: target.id, date: target.date, time: target.time, require_payment: requirePay }),
  ]);
  const fresh = await first(db, 'SELECT * FROM bookings WHERE id = ?', id);
  let notice = null;
  if (b.notify !== false) {
    const form = parseJson(fresh.form, {});
    const payStep = requirePay ? 'To confirm the spot, please complete payment here: ' + checkoutUrl(type.pay_link, id, form.email) : 'No payment is needed right now.';
    notice = await notifyBooking(env, db, settings, fresh, 'approval', { dedupeKey: 'approval:' + id + ':' + target.date + 'T' + target.time, extra: { payment_step: payStep } });
  }
  if (!requirePay) await confirmBooking(env, db, settings, id, user.id, 'approved_no_payment');
  return json({ ok: true, notice, checkout_url: requirePay ? checkoutUrl(type.pay_link, id, parseJson(fresh.form, {}).email) : null });
}

export async function offerTimes(env, req, user, id) {
  const db = env.DB;
  const settings = await getSettings(db);
  const bk = await loadBooking(db, user, id);
  assert(bk.status === 'requested', 409, 'Only open requests can receive offers.');
  const b = await readJson(req);
  const opts = (b.options || []).filter((o) => isIsoDate(o.date) && isHm(o.time)).slice(0, 6);
  assert(opts.length, 400, 'Add at least one time to offer.');
  const locs = Object.fromEntries((await all(db, 'SELECT id, name FROM locations')).map((l) => [l.id, l.name]));
  const lines = opts.map((o) => '• ' + fmtDateLong(o.date) + ' at ' + fmtTime(o.time) + (o.loc_id ? ' — ' + (locs[o.loc_id] || '') : '')).join('\n');
  const reqJ = parseJson(bk.request, {}) || {};
  reqJ.offers = [...(reqJ.offers || []), { at: nowIso(), by: user.id, options: opts, message: clean(b.message, 1000) }];
  await db.batch([
    stmt(db, 'UPDATE bookings SET request = ?, updated_at = ? WHERE id = ?', JSON.stringify(reqJ), nowIso(), id),
    bookingEvent(db, id, user.id, 'offered_times', { options: opts }),
  ]);
  const notice = await notifyBooking(env, db, settings, bk, 'offer', { dedupeKey: 'offer:' + id + ':' + Date.now(), extra: { offer_times: lines, message: clean(b.message, 1000) } });
  return json({ ok: true, notice });
}

export async function declineRequest(env, req, user, id) {
  const db = env.DB;
  const settings = await getSettings(db);
  const bk = await loadBooking(db, user, id);
  assert(bk.status === 'requested', 409, 'Only open requests can be declined.');
  const b = await readJson(req);
  await db.batch([
    stmt(db, "UPDATE bookings SET status = 'declined', cancel_info = ?, updated_at = ? WHERE id = ?", JSON.stringify({ reason: clean(b.reason, 300), by: user.id, at: nowIso(), notify: !!b.notify }), nowIso(), id),
    bookingEvent(db, id, user.id, 'declined', { reason: clean(b.reason, 300) }),
  ]);
  const notice = b.notify ? await notifyBooking(env, db, settings, bk, 'decline', { extra: { reason: b.reason ? ' (' + clean(b.reason, 300) + ')' : '' } }) : null;
  return json({ ok: true, notice });
}

/** Permanent removal (director only). The client asks twice; the server also
    requires the typed word DELETE. The opening is released, payment records are
    kept for bookkeeping, and a full copy goes to the audit log. */
export async function deleteBooking(env, req, user, id) {
  const db = env.DB;
  requireDirector(user);
  const settings = await getSettings(db);
  const bk = await loadBooking(db, user, id);
  const b = await readJson(req);
  assert(b.confirm === 'DELETE', 400, 'Type DELETE to confirm.');
  const credit = await first(db, 'SELECT id FROM credit_ledger WHERE idem_key = ?', 'redeem:' + id);
  assert(!credit, 409, 'A package credit is applied to this booking. Cancel it with "Restore the package credit" first, then delete.');
  if (bk.slot_id) {
    const slot = await first(db, 'SELECT * FROM slots WHERE id = ?', bk.slot_id);
    if (slot && slot.booking_id === id) await releaseSlot(db, settings, bk.slot_id, { reopen: b.reopen !== false });
  }
  const events = await all(db, 'SELECT * FROM booking_events WHERE booking_id = ?', id);
  await audit(db, user.id, 'delete_booking', 'booking', id, { booking: bk, events });
  await db.batch([
    stmt(db, 'DELETE FROM booking_events WHERE booking_id = ?', id),
    stmt(db, 'DELETE FROM notifications WHERE booking_id = ?', id),
    stmt(db, 'DELETE FROM bookings WHERE id = ?', id),
  ]);
  return json({ ok: true });
}

/* ---- Package credits ---- */
export async function familyPackages(db, familyId) {
  const rows = await all(db, 'SELECT fp.*, (SELECT COALESCE(SUM(delta),0) FROM credit_ledger l WHERE l.family_package_id = fp.id) AS balance FROM family_packages fp WHERE fp.family_id = ? ORDER BY fp.created_at DESC', familyId);
  return rows.map((r) => ({ ...r, snapshot: parseJson(r.snapshot, {}), balance: r.credits_total == null ? null : r.balance }));
}

export async function redeemCredit(env, req, user, id) {
  const db = env.DB;
  requireDirector(user);
  const settings = await getSettings(db);
  const bk = await loadBooking(db, user, id);
  const { family_package_id } = await readJson(req);
  const fp = await first(db, 'SELECT * FROM family_packages WHERE id = ?', family_package_id);
  assert(fp && fp.family_id === bk.family_id, 400, 'That package does not belong to this family.');
  assert(fp.status === 'active', 409, 'That package is not active.');
  const today = zoned(new Date(), settings.timezone).date;
  assert(!fp.expires_on || fp.expires_on >= today, 409, 'That package expired on ' + fp.expires_on + '.');
  const elig = parseJson(fp.snapshot, {}).eligible_type_ids;
  assert(!elig || elig.includes(bk.type_id), 409, 'That package does not cover this session type.');
  assert(!['refunded', 'paid'].includes(bk.payment_status), 409, 'This booking is already paid.');
  const t = nowIso();
  const unlimited = fp.credits_total == null;
  const ins = await run(db, `INSERT OR IGNORE INTO credit_ledger (id, family_package_id, booking_id, delta, reason, idem_key, actor, at)
    SELECT ?,?,?,?, 'redeem', ?, ?, ? WHERE ? OR (SELECT COALESCE(SUM(delta),0) FROM credit_ledger WHERE family_package_id = ?) >= 1`,
    uid(), fp.id, id, unlimited ? 0 : -1, 'redeem:' + id, user.id, t, unlimited ? 1 : 0, fp.id);
  if (!ins.meta.changes) {
    const already = await first(db, 'SELECT id FROM credit_ledger WHERE idem_key = ?', 'redeem:' + id);
    throw new HttpError(409, already ? 'A credit was already used for this booking.' : 'No credits left on that package.');
  }
  await db.batch([
    stmt(db, "UPDATE bookings SET payment_status = 'package_credit', updated_at = ? WHERE id = ?", t, id),
    bookingEvent(db, id, user.id, 'credit_redeemed', { family_package_id: fp.id }),
  ]);
  if (bk.status === 'awaiting_payment') await confirmBooking(env, db, settings, id, user.id, 'package_credit');
  return json({ ok: true });
}

export async function listPayments(env, req, user) {
  requireDirector(user);
  const rows = await all(env.DB, `SELECT p.*, b.date, b.time, b.form, b.snapshot FROM payments p LEFT JOIN bookings b ON b.id = p.booking_id ORDER BY p.created_at DESC`);
  return json({ payments: rows.map((r) => ({ ...r, form: parseJson(r.form, {}), snapshot: parseJson(r.snapshot, {}) })) });
}

export async function previewTemplate(env, req, user) {
  const db = env.DB;
  const settings = await getSettings(db);
  const b = await readJson(req);
  const tpl = (b.template && b.template.body != null) ? b.template : settings.templates[b.kind];
  assert(tpl, 400, 'Unknown template.');
  const sample = {
    id: 'sample', status: 'confirmed', date: addDays(zoned(new Date(), settings.timezone).date, 2), time: '17:00',
    form: JSON.stringify({ parent: 'Jamie Sample', athlete: 'Alex Sample', email: 'family@example.com' }),
    snapshot: JSON.stringify({ service_name: '60 Minute Private Training', coach_name: settings.calendar.coachName, prep_instructions: 'Bring a ball and water.',
      location: { name: 'Park Ridge, IL', facility_name: 'Sample Gym', address: '123 Sample St', parking: 'Lot B, east door' } }),
    request: JSON.stringify({ day: 'Mondays', time: '4:00 PM', location: 'Park Ridge' }),
  };
  const out = render(tpl, bookingVars(sample, settings, { previous: 'Tuesday at 4:00 PM', cancel_outcome: 'A refund will be issued to your original payment method.', offer_times: '• Monday at 4:00 PM\n• Wednesday at 5:00 PM', message: '', payment_step: 'To confirm the spot, please complete payment here: https://buy.stripe.com/…', reason: '' }));
  if (b.send_test) {
    const res = await notify(env, db, settings, { kind: 'test', to: user.email, subject: '[Preview] ' + out.subject, body: out.body, dedupeKey: 'test:' + user.id + ':' + Date.now() });
    return json({ ...out, test: res });
  }
  return json(out);
}

export async function runReminders(env, db, settings) {
  const reminders = (settings.notifications.reminders || []).filter((r) => r.enabled && r.hoursBefore > 0).sort((a, b) => a.hoursBefore - b.hoursBefore);
  if (!reminders.length) return 0;
  const today = zoned(new Date(), settings.timezone).date;
  const maxH = Math.max(...reminders.map((r) => r.hoursBefore));
  const rows = await all(db, "SELECT * FROM bookings WHERE status = 'confirmed' AND date >= ? AND date <= ?", today, addDays(today, Math.ceil(maxH / 24) + 1));
  let sent = 0;
  for (const bk of rows) {
    const start = localToInstant(bk.date, bk.time, settings.timezone).getTime();
    const hrs = (start - Date.now()) / 3600000;
    if (hrs <= 0) continue;
    // Only the tightest window that applies, and never for a booking made inside that window.
    const r = reminders.find((x) => hrs <= x.hoursBefore);
    if (!r) continue;
    if (Date.parse(bk.created_at) > start - r.hoursBefore * 3600000) continue;
    const res = await notifyBooking(env, db, settings, bk, 'reminder', { dedupeKey: `reminder:${bk.id}:${bk.date}T${bk.time}:${r.hoursBefore}` });
    if (res.status === 'sent') sent++;
  }
  return sent;
}
