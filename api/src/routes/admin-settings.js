import { all, first, run, stmt, uid, nowIso, json, readJson, HttpError, assert, parseJson, clean, audit, normEmail, isIsoDate, isHm } from '../lib/util.js';
import { getSettings, saveSettings, DEFAULT_TEMPLATES, travelKey } from '../lib/settings.js';
import { requireDirector, hashPassword, validatePassword, newUserId } from '../lib/auth.js';
import { emailStatus } from '../lib/notify.js';
import { zoned } from '../lib/time.js';
import { resolveFamily, snapshotFor, bookingInsert } from '../lib/bookings.js';

export async function bootstrap(env, req, user) {
  const db = env.DB;
  const settings = await getSettings(db);
  const types = await all(db, 'SELECT * FROM session_types ORDER BY sort, created_at');
  const locs = await all(db, 'SELECT * FROM locations ORDER BY sort, created_at');
  const coaches = await all(db, 'SELECT id, email, name, role, active, phone, bio FROM users ORDER BY name');
  const director = user.role === 'director';
  return json({
    me: user,
    settings: director ? settings : { ...settings, templates: undefined },
    types: types.map((t) => ({ ...t, eligible_loc_ids: parseJson(t.eligible_loc_ids, null), coach_ids: parseJson(t.coach_ids, null), stripe_price_cents: director ? t.stripe_price_cents : undefined })),
    locations: locs.map((l) => ({ ...l, eligible_type_ids: parseJson(l.eligible_type_ids, null), rental_cost_cents: director ? l.rental_cost_cents : undefined })),
    coaches: director ? coaches : coaches.map((c) => ({ id: c.id, name: c.name, role: c.role, active: c.active })),
    integrations: director ? await integrationStatus(env) : undefined,
    today: zoned(new Date(), settings.timezone).date,
  });
}

export async function integrationStatus(env) {
  const db = env.DB;
  const lastEvent = await first(db, 'SELECT id, type, received_at, result FROM stripe_events ORDER BY received_at DESC LIMIT 1');
  const lastCron = await first(db, "SELECT value, updated_at FROM settings WHERE key = 'cron_last_run'");
  const failed = await first(db, "SELECT COUNT(*) AS n FROM notifications WHERE status = 'failed' AND created_at > ?", new Date(Date.now() - 7 * 86400000).toISOString());
  return {
    stripe: {
      webhook: env.STRIPE_WEBHOOK_SECRET ? 'configured' : 'not_configured',
      api: env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured',
      mode: env.STRIPE_SECRET_KEY ? (env.STRIPE_SECRET_KEY.includes('_test_') ? 'test' : 'live') : null,
      last_event: lastEvent,
      webhook_url: (env.API_PUBLIC_URL || '') + '/api/stripe/webhook',
    },
    email: { ...emailStatus(env), failed_last_7_days: failed.n },
    scheduler: { last_run: lastCron ? lastCron.updated_at : null },
  };
}

function validTimezone(tz) {
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true; } catch { return false; }
}

export async function updateSettings(env, req, user) {
  requireDirector(user);
  const db = env.DB;
  const b = await readJson(req);
  const errs = {};
  const num = (k, min, max) => { if (b[k] !== undefined) { const v = Number(b[k]); if (!Number.isFinite(v) || v < min || v > max) errs[k] = `Use ${min}–${max}.`; else b[k] = v; } };
  if (b.timezone !== undefined && !validTimezone(b.timezone)) errs.timezone = 'Unknown time zone.';
  num('defaultDuration', 15, 480); num('sameLocationBuffer', 0, 240); num('travelDefault', 0, 480);
  num('minNoticeHours', 0, 336); num('maxAdvanceDays', 1, 730); num('holdMinutes', 10, 1440);
  if (b.conflictAction !== undefined && !['bump', 'delete'].includes(b.conflictAction)) errs.conflictAction = 'Invalid';
  if (b.travel !== undefined) {
    const t = {};
    for (const [k, v] of Object.entries(b.travel || {})) {
      if (v === '' || v == null) continue;
      const n = Number(v);
      if (!Number.isFinite(n) || n < 0 || n > 480) { errs['travel_' + k] = 'Use 0–480.'; continue; }
      const [x, y] = k.split('|'); t[travelKey(x, y)] = n;
    }
    b.travel = t;
  }
  if (b.payment && !['pay_to_confirm', 'confirm_then_pay'].includes(b.payment.mode)) errs.payment = 'Invalid payment mode.';
  if (b.notifications && b.notifications.reminders) {
    b.notifications.reminders = b.notifications.reminders.filter((r) => Number(r.hoursBefore) > 0 && Number(r.hoursBefore) <= 336).slice(0, 4).map((r) => ({ hoursBefore: Number(r.hoursBefore), enabled: !!r.enabled }));
  }
  if (b.templates) for (const [k, v] of Object.entries(b.templates)) {
    if (!DEFAULT_TEMPLATES[k]) delete b.templates[k];
    else if (!clean(v.subject) || !clean(v.body, 10000)) errs['template_' + k] = 'Subject and body are required.';
  }
  if (Object.keys(errs).length) throw new HttpError(400, 'Please fix the highlighted settings.', { fields: errs });
  // Replace (not merge) list-valued / map-valued keys so removals stick.
  const cur = await getSettings(db);
  if (b.travel) cur.travel = {};
  if (b.registration && b.registration.acknowledgments) cur.registration.acknowledgments = [];
  if (b.cancellation && b.cancellation.policyLines) cur.cancellation.policyLines = [];
  await run(db, "INSERT INTO settings (key, value, updated_at) VALUES ('app', ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at", JSON.stringify(cur), nowIso());
  const next = await saveSettings(db, b);
  await audit(db, user.id, 'update_settings', 'settings', 'app', Object.keys(b));
  return json({ settings: next });
}

export async function resetTemplate(env, req, user, kind) {
  requireDirector(user);
  assert(DEFAULT_TEMPLATES[kind], 404, 'Unknown template.');
  const next = await saveSettings(env.DB, { templates: { [kind]: DEFAULT_TEMPLATES[kind] } });
  return json({ settings: next });
}

/* ---- Coach accounts ---- */
export async function createUser(env, req, user) {
  requireDirector(user);
  const db = env.DB;
  const b = await readJson(req);
  const email = normEmail(b.email);
  assert(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email), 400, 'Enter a valid email.');
  assert(clean(b.name), 400, 'Name is required.');
  validatePassword(b.password);
  const exists = await first(db, 'SELECT id FROM users WHERE email = ?', email);
  assert(!exists, 409, 'A coach with that email already exists.');
  const { hash, salt } = await hashPassword(b.password);
  const id = newUserId();
  await run(db, 'INSERT INTO users (id, email, name, role, pass_hash, pass_salt, active, phone, bio, created_at) VALUES (?,?,?,?,?,?,1,?,?,?)',
    id, email, clean(b.name, 100), b.role === 'director' ? 'director' : 'coach', hash, salt, clean(b.phone, 50) || null, clean(b.bio, 1000) || null, nowIso());
  await audit(db, user.id, 'create_user', 'user', id, { email, role: b.role });
  return json({ id }, 201);
}

export async function updateUser(env, req, user, id) {
  requireDirector(user);
  const db = env.DB;
  const b = await readJson(req);
  const u = await first(db, 'SELECT * FROM users WHERE id = ?', id);
  assert(u, 404, 'Coach not found.');
  if (id === user.id) assert(b.role === undefined || b.role === 'director', 400, "You can't remove your own director access.");
  if (id === user.id) assert(b.active === undefined || b.active, 400, "You can't deactivate yourself.");
  const stmts = [stmt(db, 'UPDATE users SET name = COALESCE(?, name), role = COALESCE(?, role), active = COALESCE(?, active), phone = COALESCE(?, phone), bio = COALESCE(?, bio) WHERE id = ?',
    b.name != null ? clean(b.name, 100) : null, b.role ? (b.role === 'director' ? 'director' : 'coach') : null, b.active === undefined ? null : (b.active ? 1 : 0),
    b.phone != null ? clean(b.phone, 50) : null, b.bio != null ? clean(b.bio, 1000) : null, id)];
  if (b.password) {
    validatePassword(b.password);
    const { hash, salt } = await hashPassword(b.password);
    stmts.push(stmt(db, 'UPDATE users SET pass_hash = ?, pass_salt = ? WHERE id = ?', hash, salt, id));
    stmts.push(stmt(db, 'DELETE FROM auth_sessions WHERE user_id = ?', id));
  }
  if (b.active === false) stmts.push(stmt(db, 'DELETE FROM auth_sessions WHERE user_id = ?', id));
  await db.batch(stmts);
  await audit(db, user.id, 'update_user', 'user', id, { ...b, password: b.password ? '(reset)' : undefined });
  return json({ ok: true });
}

/* ---- One-time import from the old JSONbin data ---- */
const LEGACY_TYPE_MAP = { sg2: 'p2', sg3: 'p3', 'sg4+': 'p4' };
const DOWS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function legacySize(size) {
  const m = /^(\d+)/.exec(size || '');
  const n = m ? parseInt(m[1], 10) : 1;
  if (/\+/.test(size || '')) return { min: n, max: 10 };
  return { min: n, max: n };
}

export async function importLegacy(env, req, user) {
  requireDirector(user);
  const db = env.DB;
  const settings = await getSettings(db);
  const { snapshot } = await readJson(req);
  assert(snapshot && Array.isArray(snapshot.slots) && Array.isArray(snapshot.books), 400, 'That does not look like the old booking data.');
  const t = nowIso();
  const counts = { types: 0, locations: 0, slots: 0, bookings: 0, skipped: 0 };

  for (const [i, ty] of (snapshot.types || []).entries()) {
    const sz = legacySize(ty.size);
    const r = await run(db, `INSERT OR IGNORE INTO session_types (id, name, size, duration, min_participants, max_participants, pricing_basis, pay_link, booking_mode, active, sort, created_at, updated_at)
      VALUES (?,?,?,?,?,?, 'group', ?, 'immediate', 1, ?, ?, ?)`, ty.id, clean(ty.name, 120) || 'Session', clean(ty.size, 40) || '1-on-1', +ty.duration || 60, sz.min, sz.max, ty.payLink || null, i, t, t);
    counts.types += r.meta.changes;
  }
  for (const [i, l] of (snapshot.locs || []).entries()) {
    const r = await run(db, 'INSERT OR IGNORE INTO locations (id, name, active, sort, created_at, updated_at) VALUES (?,?,1,?,?,?)', l.id, clean(l.name, 120) || 'Location', i, t, t);
    counts.locations += r.meta.changes;
  }
  const slotStmts = [];
  for (const s of snapshot.slots) {
    if (!isIsoDate(s.date) || !isHm(s.time) || !s.locId) { counts.skipped++; continue; }
    slotStmts.push(stmt(db, `INSERT OR IGNORE INTO slots (id, date, time, duration, loc_id, status, booking_id, contingent, contingent_on, bump_record, created_at, updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, s.id, s.date, s.time, 60, s.locId, s.status === 'booked' ? 'booked' : 'open', s.bookingId || null, s.contingent ? 1 : 0, s.contingentOn || null,
      s.bumpRecord ? JSON.stringify(s.bumpRecord.map((r) => ({ id: r.id, action: r.action, originalTime: r.originalTime, data: r.data ? { ...r.data, loc_id: r.data.locId, contingent_on: r.data.contingentOn } : null }))) : null, t, t));
  }
  for (let i = 0; i < slotStmts.length; i += 50) {
    const res = await db.batch(slotStmts.slice(i, i + 50));
    counts.slots += res.reduce((n, r) => n + r.meta.changes, 0);
  }

  const locs = Object.fromEntries((await all(db, 'SELECT * FROM locations')).map((l) => [l.id, l]));
  const types = Object.fromEntries((await all(db, 'SELECT * FROM session_types')).map((x) => [x.id, x]));
  for (const bk of snapshot.books) {
    if (!bk || !bk.id) { counts.skipped++; continue; }
    const exists = await first(db, 'SELECT id FROM bookings WHERE id = ?', bk.id);
    if (exists) continue;
    const form = { parent: clean(bk.parent, 200), athlete: clean(bk.athlete, 200), email: clean(bk.email, 200), phone: clean(bk.phone, 50), age: clean(bk.age, 100), focus: clean(bk.focus, 500), notes: clean(bk.notes, 2000) };
    const { familyId, athleteId, stmts } = await resolveFamily(db, form);
    const typeId = LEGACY_TYPE_MAP[bk.typeId] || bk.typeId || null;
    const type = types[typeId] || { name: bk.serviceName || 'Training' };
    const snap = snapshotFor({ ...type, name: bk.serviceName || type.name, stripe_price_cents: null }, locs[bk.locId] || (bk.locId ? { id: bk.locId, name: bk.locId } : null), null, settings);
    const isReq = bk.mode === 'request';
    const row = {
      id: bk.id, kind: isReq ? 'request' : 'dated',
      // The director confirmed all old bookings were paid (any exceptions are
      // corrected per booking afterwards). Requests were never charged.
      status: isReq ? 'requested' : 'confirmed', payment_status: isReq ? 'unpaid' : 'paid',
      family_id: familyId, athlete_id: athleteId, type_id: types[typeId] ? typeId : null, snapshot: snap,
      slot_id: isReq ? null : bk.slotId || null, date: isReq ? null : bk.date, time: isReq ? null : bk.time, duration: 60, loc_id: isReq ? null : bk.locId,
      players: bk.players || null, roster: [{ name: form.athlete, primary: true }, ...(bk.groupMembers || []).map((m) => ({ name: clean(m.name, 200), contact: clean(m.contact, 200) }))],
      request: isReq ? { dow: bk.dow, reqTime: bk.reqTime, day: bk.dow != null ? DOWS[bk.dow] + 's' : null, time: bk.reqTime || null } : null,
      form, legacy: 1, created_at: bk.created || t, updated_at: t,
    };
    const { cols, vals } = bookingInsert(db, row);
    const bs = [...stmts, stmt(db, `INSERT OR IGNORE INTO bookings (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`, ...vals),
      stmt(db, 'INSERT INTO booking_events (id, booking_id, at, actor, type, data) VALUES (?,?,?,?,?,?)', uid(), bk.id, t, user.id, 'imported', JSON.stringify({ legacy_status: bk.status || null, legacy_mode: bk.mode || null, payment: isReq ? null : 'marked paid at import (confirmed by director)' }))];
    if (!isReq && bk.slotId) bs.push(stmt(db, "UPDATE slots SET booking_id = ?, status = 'booked' WHERE id = ? AND (booking_id IS NULL OR booking_id = ?)", bk.id, bk.slotId, bk.id));
    try { await db.batch(bs); counts.bookings++; } catch (e) {
      // A second legacy booking on the same slot would violate the one-live-booking rule; keep it, but unlinked.
      row.slot_id = null;
      row.attention = 'Imported without a linked opening (the old data had two bookings on one slot).';
      const alt = bookingInsert(db, row);
      await db.batch([...stmts, stmt(db, `INSERT OR IGNORE INTO bookings (${alt.cols.join(',')},attention) VALUES (${alt.cols.map(() => '?').join(',')},?)`, ...alt.vals, row.attention)]);
      counts.bookings++;
    }
  }
  const patch = {};
  if (snapshot.conflictBuffer != null) patch.travelDefault = Math.max(0, Number(snapshot.conflictBuffer) - 60);
  if (snapshot.conflictAction) patch.conflictAction = snapshot.conflictAction === 'delete' ? 'delete' : 'bump';
  if (Object.keys(patch).length) await saveSettings(db, patch);
  await audit(db, user.id, 'import_legacy', 'import', null, counts);
  return json({ ok: true, counts, settings_applied: patch });
}
