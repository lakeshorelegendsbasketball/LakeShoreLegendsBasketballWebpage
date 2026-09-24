import { all, first, run, stmt, uid, nowIso, json, readJson, HttpError, assert, parseJson, clean, audit, normEmail, bookingEvent } from '../lib/util.js';
import { getSettings } from '../lib/settings.js';
import { zoned } from '../lib/time.js';
import { requireDirector } from '../lib/auth.js';
import { isPaymentLink, paymentLinkPrices } from '../lib/stripe.js';
import { familyPackages } from './admin-bookings.js';
import { addDays } from '../lib/time.js';

const idList = (v) => (Array.isArray(v) && v.length ? JSON.stringify(v.map(String).slice(0, 100)) : null);

/* ---------------- Session types ---------------- */
function validateType(b) {
  const errs = {};
  const name = clean(b.name, 120);
  if (!name) errs.name = 'Name is required.';
  const duration = Number(b.duration);
  if (!Number.isInteger(duration) || duration < 15 || duration > 480) errs.duration = 'Use 15–480 minutes.';
  const min = Number(b.min_participants ?? 1), max = Number(b.max_participants ?? min);
  if (!Number.isInteger(min) || min < 1) errs.min_participants = 'At least 1.';
  if (!Number.isInteger(max) || max < min || max > 50) errs.max_participants = 'Must be ≥ minimum (max 50).';
  const link = clean(b.pay_link, 300);
  if (link && !isPaymentLink(link)) errs.pay_link = 'Use a Stripe Payment Link (https://buy.stripe.com/…).';
  if (Object.keys(errs).length) throw new HttpError(400, 'Please fix the highlighted fields.', { fields: errs });
  return {
    name, size: clean(b.size, 40) || (min === max ? min + '-on-1' : min + '+ players'), duration, min_participants: min, max_participants: max,
    pricing_basis: b.pricing_basis === 'athlete' ? 'athlete' : 'group', pay_link: link || null,
    eligible_loc_ids: idList(b.eligible_loc_ids), coach_ids: idList(b.coach_ids),
    booking_mode: b.booking_mode === 'request' ? 'request' : 'immediate',
    description: clean(b.description, 1000) || null, prep_instructions: clean(b.prep_instructions, 1000) || null,
    active: b.active === false ? 0 : 1,
  };
}

export async function createType(env, req, user) {
  requireDirector(user);
  const db = env.DB;
  const v = validateType(await readJson(req));
  const id = 't' + uid(8), t = nowIso();
  await run(db, `INSERT INTO session_types (id, name, size, duration, min_participants, max_participants, pricing_basis, pay_link, eligible_loc_ids, coach_ids, booking_mode, description, prep_instructions, active, sort, created_at, updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?, (SELECT COALESCE(MAX(sort),0)+1 FROM session_types), ?, ?)`,
    id, v.name, v.size, v.duration, v.min_participants, v.max_participants, v.pricing_basis, v.pay_link, v.eligible_loc_ids, v.coach_ids, v.booking_mode, v.description, v.prep_instructions, v.active, t, t);
  await audit(db, user.id, 'create_type', 'session_type', id, v);
  return json({ id }, 201);
}

export async function updateType(env, req, user, id) {
  requireDirector(user);
  const db = env.DB;
  const cur = await first(db, 'SELECT * FROM session_types WHERE id = ?', id);
  assert(cur, 404, 'Session type not found.');
  const v = validateType(await readJson(req));
  const linkChanged = (cur.pay_link || null) !== v.pay_link;
  await run(db, `UPDATE session_types SET name=?, size=?, duration=?, min_participants=?, max_participants=?, pricing_basis=?, pay_link=?, eligible_loc_ids=?, coach_ids=?, booking_mode=?, description=?, prep_instructions=?, active=?,
    stripe_check_status = CASE WHEN ? THEN NULL ELSE stripe_check_status END, stripe_price_cents = CASE WHEN ? THEN NULL ELSE stripe_price_cents END, updated_at=? WHERE id=?`,
    v.name, v.size, v.duration, v.min_participants, v.max_participants, v.pricing_basis, v.pay_link, v.eligible_loc_ids, v.coach_ids, v.booking_mode, v.description, v.prep_instructions, v.active,
    linkChanged ? 1 : 0, linkChanged ? 1 : 0, nowIso(), id);
  await audit(db, user.id, 'update_type', 'session_type', id, { before: cur, after: v });
  return json({ ok: true });
}

export async function archiveType(env, req, user, id) {
  requireDirector(user);
  const db = env.DB;
  const { archive } = await readJson(req);
  const t = nowIso();
  await run(db, 'UPDATE session_types SET archived_at = ?, active = ?, updated_at = ? WHERE id = ?', archive ? t : null, archive ? 0 : 1, t, id);
  await audit(db, user.id, archive ? 'archive_type' : 'restore_type', 'session_type', id);
  return json({ ok: true });
}

export async function deleteType(env, req, user, id) {
  requireDirector(user);
  const db = env.DB;
  const used = await first(db, 'SELECT COUNT(*) AS n FROM bookings WHERE type_id = ?', id);
  assert(used.n === 0, 409, `This service has ${used.n} booking(s) on record. Archive it instead so history stays intact.`);
  await run(db, 'DELETE FROM session_types WHERE id = ?', id);
  await audit(db, user.id, 'delete_type', 'session_type', id);
  return json({ ok: true });
}

export async function reorder(env, req, user, table) {
  requireDirector(user);
  const { ids } = await readJson(req);
  assert(Array.isArray(ids), 400, 'ids required');
  const tbl = table === 'locations' ? 'locations' : 'session_types';
  await env.DB.batch(ids.map((id, i) => stmt(env.DB, `UPDATE ${tbl} SET sort = ? WHERE id = ?`, i, id)));
  return json({ ok: true });
}

/** Refresh displayed prices from Stripe. Stripe stays the source of truth. */
export async function verifyPrices(env, req, user) {
  requireDirector(user);
  const db = env.DB;
  const t = nowIso();
  const types = await all(db, 'SELECT id, pay_link FROM session_types WHERE pay_link IS NOT NULL');
  if (!env.STRIPE_SECRET_KEY) {
    await run(db, "UPDATE session_types SET stripe_check_status = 'unavailable', stripe_check_detail = 'Stripe API key not configured', stripe_checked_at = ? WHERE pay_link IS NOT NULL", t);
    return json({ status: 'unavailable', detail: 'Add a Stripe restricted key (read-only Payment Links + Prices) to verify prices.' });
  }
  let map;
  try { map = await paymentLinkPrices(env); } catch (e) {
    await run(db, "UPDATE session_types SET stripe_check_status = 'error', stripe_check_detail = ?, stripe_checked_at = ? WHERE pay_link IS NOT NULL", String(e.message).slice(0, 200), t);
    return json({ status: 'error', detail: e.message }, 502);
  }
  const results = [];
  const stmts = [];
  for (const ty of types) {
    const hit = map[ty.pay_link.trim()];
    let status, detail = null, cents = null, cur = null;
    if (!hit) { status = 'mismatch'; detail = 'Link not found in this Stripe account (or it belongs to test/live mode the key is not for).'; }
    else if (!hit.active) { status = 'mismatch'; detail = 'Payment Link is deactivated in Stripe.'; }
    else { status = 'verified'; cents = hit.price_cents ?? null; cur = hit.currency || null; if (hit.adjustable) detail = 'Customer can adjust quantity at checkout.'; }
    stmts.push(stmt(db, 'UPDATE session_types SET stripe_check_status = ?, stripe_check_detail = ?, stripe_price_cents = ?, stripe_currency = ?, stripe_checked_at = ? WHERE id = ?', status, detail, cents, cur, t, ty.id));
    results.push({ id: ty.id, status, detail, price_cents: cents });
  }
  if (stmts.length) await db.batch(stmts);
  return json({ status: 'ok', results });
}

/* ---------------- Locations ---------------- */
const LOC_PRIVATE = ['facility_name', 'address', 'parking', 'indoor_outdoor', 'weather_notes', 'hours'];

function validateLoc(b) {
  const name = clean(b.name, 120);
  if (!name) throw new HttpError(400, 'Area / town is required.', { fields: { name: 'Required' } });
  const cost = b.rental_cost_cents == null || b.rental_cost_cents === '' ? null : Math.round(Number(b.rental_cost_cents));
  if (cost != null && (!Number.isFinite(cost) || cost < 0)) throw new HttpError(400, 'Rental cost must be a positive amount.', { fields: { rental_cost_cents: 'Invalid' } });
  return {
    name, facility_name: clean(b.facility_name, 200) || null, address: clean(b.address, 300) || null, parking: clean(b.parking, 1000) || null,
    indoor_outdoor: ['indoor', 'outdoor', 'both'].includes(b.indoor_outdoor) ? b.indoor_outdoor : null, weather_notes: clean(b.weather_notes, 1000) || null,
    hours: clean(b.hours, 500) || null, eligible_type_ids: idList(b.eligible_type_ids), rental_cost_cents: cost,
    rental_basis: ['hourly', 'per_session'].includes(b.rental_basis) ? b.rental_basis : null,
  };
}

async function upcomingAt(db, settings, locId) {
  const today = zoned(new Date(), settings.timezone).date;
  const bookings = await all(db, "SELECT id, date, time, form FROM bookings WHERE loc_id = ? AND date >= ? AND status IN ('awaiting_payment','confirmed') ORDER BY date, time", locId, today);
  const open = await first(db, "SELECT COUNT(*) AS n FROM slots WHERE loc_id = ? AND date >= ? AND status = 'open'", locId, today);
  return { bookings: bookings.map((b) => ({ id: b.id, date: b.date, time: b.time, athlete: parseJson(b.form, {}).athlete })), open_slots: open.n };
}

export async function locationImpact(env, req, user, id) {
  requireDirector(user);
  const settings = await getSettings(env.DB);
  return json(await upcomingAt(env.DB, settings, id));
}

export async function createLocation(env, req, user) {
  requireDirector(user);
  const db = env.DB;
  const v = validateLoc(await readJson(req));
  const id = 'l' + uid(8), t = nowIso();
  await run(db, `INSERT INTO locations (id, name, facility_name, address, parking, indoor_outdoor, weather_notes, hours, eligible_type_ids, rental_cost_cents, rental_basis, active, sort, created_at, updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,1,(SELECT COALESCE(MAX(sort),0)+1 FROM locations),?,?)`,
    id, v.name, v.facility_name, v.address, v.parking, v.indoor_outdoor, v.weather_notes, v.hours, v.eligible_type_ids, v.rental_cost_cents, v.rental_basis, t, t);
  await audit(db, user.id, 'create_location', 'location', id, v);
  return json({ id }, 201);
}

export async function updateLocation(env, req, user, id) {
  requireDirector(user);
  const db = env.DB;
  const settings = await getSettings(db);
  const cur = await first(db, 'SELECT * FROM locations WHERE id = ?', id);
  assert(cur, 404, 'Location not found.');
  const body = await readJson(req);
  const v = validateLoc(body);
  const familyVisibleChanged = v.name !== cur.name || LOC_PRIVATE.some((k) => (v[k] || null) !== (cur[k] || null));
  const impact = familyVisibleChanged ? await upcomingAt(db, settings, id) : { bookings: [] };
  if (impact.bookings.length && body.apply_to_upcoming === undefined) {
    throw new HttpError(409, 'This change affects upcoming appointments. Choose whether their booking details should update.', { needs_decision: true, upcoming: impact.bookings });
  }
  const t = nowIso();
  const stmts = [stmt(db, `UPDATE locations SET name=?, facility_name=?, address=?, parking=?, indoor_outdoor=?, weather_notes=?, hours=?, eligible_type_ids=?, rental_cost_cents=?, rental_basis=?, updated_at=? WHERE id=?`,
    v.name, v.facility_name, v.address, v.parking, v.indoor_outdoor, v.weather_notes, v.hours, v.eligible_type_ids, v.rental_cost_cents, v.rental_basis, t, id)];
  if (body.apply_to_upcoming && impact.bookings.length) {
    const locSnap = { id, name: v.name, facility_name: v.facility_name, address: v.address, parking: v.parking, indoor_outdoor: v.indoor_outdoor, weather_notes: v.weather_notes };
    for (const b of impact.bookings) {
      stmts.push(stmt(db, "UPDATE bookings SET snapshot = json_set(snapshot, '$.location', json(?)), updated_at = ? WHERE id = ?", JSON.stringify(locSnap), t, b.id));
      stmts.push(bookingEvent(db, b.id, user.id, 'location_details_updated', null));
    }
  }
  await db.batch(stmts);
  await audit(db, user.id, 'update_location', 'location', id, { before: cur, after: v, applied_to_upcoming: !!body.apply_to_upcoming });
  return json({ ok: true, updated_bookings: body.apply_to_upcoming ? impact.bookings.length : 0 });
}

export async function archiveLocation(env, req, user, id) {
  requireDirector(user);
  const db = env.DB;
  const settings = await getSettings(db);
  const b = await readJson(req);
  const t = nowIso();
  if (!b.archive) {
    await run(db, 'UPDATE locations SET archived_at = NULL, active = 1, updated_at = ? WHERE id = ?', t, id);
    return json({ ok: true });
  }
  const impact = await upcomingAt(db, settings, id);
  if ((impact.bookings.length && !b.acknowledge_bookings) || (impact.open_slots && !['remove', 'keep'].includes(b.open_slots))) {
    throw new HttpError(409, 'Archiving affects future schedule items. Decide what happens to them first.', { needs_decision: true, ...impact });
  }
  const stmts = [stmt(db, 'UPDATE locations SET archived_at = ?, active = 0, updated_at = ? WHERE id = ?', t, t, id)];
  if (b.open_slots === 'remove') stmts.push(stmt(db, "DELETE FROM slots WHERE loc_id = ? AND date >= ? AND status = 'open'", id, zoned(new Date(), settings.timezone).date));
  await db.batch(stmts);
  await audit(db, user.id, 'archive_location', 'location', id, { open_slots: b.open_slots, upcoming_bookings_kept: impact.bookings.length });
  return json({ ok: true, kept_bookings: impact.bookings.length });
}

export async function deleteLocation(env, req, user, id) {
  requireDirector(user);
  const db = env.DB;
  const used = await first(db, 'SELECT (SELECT COUNT(*) FROM bookings WHERE loc_id = ?) + (SELECT COUNT(*) FROM slots WHERE loc_id = ?) AS n', id, id);
  assert(used.n === 0, 409, 'This location has bookings or openings on record. Archive it instead.');
  await run(db, 'DELETE FROM locations WHERE id = ?', id);
  return json({ ok: true });
}

/* ---------------- Packages ---------------- */
function validatePackage(b) {
  const errs = {};
  const name = clean(b.name, 120);
  if (!name) errs.name = 'Required';
  const price = Math.round(Number(b.price_cents));
  if (!Number.isFinite(price) || price < 0) errs.price_cents = 'Enter a price.';
  const unlimited = b.credits === null || b.credits === 'unlimited';
  const credits = unlimited ? null : Number(b.credits);
  if (!unlimited && (!Number.isInteger(credits) || credits < 1 || credits > 500)) errs.credits = 'Enter a number of sessions, or choose unlimited.';
  const validity = b.validity_days == null || b.validity_days === '' ? null : Number(b.validity_days);
  if (validity != null && (!Number.isInteger(validity) || validity < 1 || validity > 1100)) errs.validity_days = 'Days must be 1–1100.';
  if (unlimited && validity == null) errs.validity_days = 'Unlimited access needs a validity period.';
  const link = clean(b.pay_link, 300);
  if (link && !isPaymentLink(link)) errs.pay_link = 'Use a Stripe Payment Link.';
  if (Object.keys(errs).length) throw new HttpError(400, 'Please fix the highlighted fields.', { fields: errs });
  return { name, price_cents: price, credits, eligible_type_ids: idList(b.eligible_type_ids), validity_days: validity, pay_link: link || null,
    description: clean(b.description, 1000) || null, active: b.active === false ? 0 : 1 };
}

export async function listPackages(env, req, user) {
  requireDirector(user);
  const rows = await all(env.DB, "SELECT p.*, (SELECT COUNT(*) FROM family_packages f WHERE f.package_id = p.id AND f.status != 'pending_payment') AS sold FROM packages p WHERE p.id != 'pkg_credit' ORDER BY p.created_at");
  return json({ packages: rows.map((p) => ({ ...p, eligible_type_ids: parseJson(p.eligible_type_ids, null) })) });
}

export async function savePackage(env, req, user, id) {
  requireDirector(user);
  const db = env.DB;
  const v = validatePackage(await readJson(req));
  const t = nowIso();
  if (id) {
    await run(db, 'UPDATE packages SET name=?, price_cents=?, credits=?, eligible_type_ids=?, validity_days=?, pay_link=?, description=?, active=?, updated_at=? WHERE id=?',
      v.name, v.price_cents, v.credits, v.eligible_type_ids, v.validity_days, v.pay_link, v.description, v.active, t, id);
    return json({ id });
  }
  const nid = 'pk' + uid(8);
  await run(db, "INSERT INTO packages (id, name, price_cents, credits, eligible_type_ids, validity_days, billing, pay_link, description, active, created_at, updated_at) VALUES (?,?,?,?,?,?,'one_time',?,?,?,?,?)",
    nid, v.name, v.price_cents, v.credits, v.eligible_type_ids, v.validity_days, v.pay_link, v.description, v.active, t, t);
  return json({ id: nid }, 201);
}

export async function archivePackage(env, req, user, id) {
  requireDirector(user);
  const { archive } = await readJson(req);
  const t = nowIso();
  await run(env.DB, 'UPDATE packages SET archived_at = ?, active = ?, updated_at = ? WHERE id = ?', archive ? t : null, archive ? 0 : 1, t, id);
  return json({ ok: true });
}

export async function deletePackage(env, req, user, id) {
  requireDirector(user);
  const used = await first(env.DB, 'SELECT COUNT(*) AS n FROM family_packages WHERE package_id = ?', id);
  assert(used.n === 0, 409, 'Families have purchased this package. Archive it instead.');
  await run(env.DB, 'DELETE FROM packages WHERE id = ?', id);
  return json({ ok: true });
}

/* ---------------- Families & athletes ---------------- */
async function assertFamilyAccess(db, user, familyId) {
  if (user.role === 'director') return;
  const r = await first(db, 'SELECT 1 AS ok FROM bookings WHERE family_id = ? AND coach_id = ? LIMIT 1', familyId, user.id);
  assert(r, 403, 'You can only view families you coach.');
}

export async function searchFamilies(env, req, user, url) {
  const db = env.DB;
  const q = '%' + clean(url.searchParams.get('q'), 100).toLowerCase() + '%';
  const scope = user.role === 'director' ? '' : 'AND f.id IN (SELECT family_id FROM bookings WHERE coach_id = ?)';
  const rows = await all(db, `SELECT f.id, f.parent_name, f.email, f.phone, (SELECT group_concat(name, ', ') FROM athletes a WHERE a.family_id = f.id) AS athletes
    FROM families f WHERE (lower(f.parent_name) LIKE ? OR lower(f.email) LIKE ? OR f.id IN (SELECT family_id FROM athletes WHERE lower(name) LIKE ?)) ${scope} ORDER BY f.parent_name LIMIT 50`,
    q, q, q, ...(scope ? [user.id] : []));
  return json({ families: rows });
}

export async function getFamily(env, req, user, id) {
  const db = env.DB;
  await assertFamilyAccess(db, user, id);
  const fam = await first(db, 'SELECT * FROM families WHERE id = ?', id);
  assert(fam, 404, 'Family not found.');
  const athletes = await all(db, 'SELECT * FROM athletes WHERE family_id = ? ORDER BY name', id);
  const scope = user.role === 'director' ? '' : 'AND coach_id = ?';
  const bookings = await all(db, `SELECT id, kind, status, attendance, payment_status, athlete_id, date, time, snapshot, created_at, private_notes FROM bookings WHERE family_id = ? ${scope} ORDER BY COALESCE(date, substr(created_at,1,10)) DESC`, id, ...(scope ? [user.id] : []));
  const packages = user.role === 'director' ? await familyPackages(db, id) : [];
  const ledger = user.role === 'director' ? await all(db, 'SELECT l.* FROM credit_ledger l JOIN family_packages fp ON fp.id = l.family_package_id WHERE fp.family_id = ? ORDER BY l.at DESC', id) : [];
  return json({
    family: fam, athletes,
    bookings: bookings.map((b) => ({ ...b, snapshot: parseJson(b.snapshot, {}) })),
    packages, ledger,
  });
}

export async function patchFamily(env, req, user, id) {
  const db = env.DB;
  await assertFamilyAccess(db, user, id);
  const b = await readJson(req);
  const t = nowIso();
  await run(db, 'UPDATE families SET parent_name = COALESCE(?, parent_name), email = COALESCE(?, email), email_norm = COALESCE(?, email_norm), phone = COALESCE(?, phone), notes_private = COALESCE(?, notes_private), updated_at = ? WHERE id = ?',
    b.parent_name != null ? clean(b.parent_name, 200) : null, b.email != null ? clean(b.email, 200) : null, b.email != null ? normEmail(b.email) : null,
    b.phone != null ? clean(b.phone, 50) : null, b.notes_private != null ? clean(b.notes_private, 5000) : null, t, id);
  await audit(db, user.id, 'update_family', 'family', id, Object.keys(b));
  return json({ ok: true });
}

export async function patchAthlete(env, req, user, id) {
  const db = env.DB;
  const a = await first(db, 'SELECT * FROM athletes WHERE id = ?', id);
  assert(a, 404, 'Athlete not found.');
  await assertFamilyAccess(db, user, a.family_id);
  const b = await readJson(req);
  await run(db, 'UPDATE athletes SET name = COALESCE(?, name), grade = COALESCE(?, grade), goals = COALESCE(?, goals), notes_private = COALESCE(?, notes_private), updated_at = ? WHERE id = ?',
    b.name != null ? clean(b.name, 200) : null, b.grade != null ? clean(b.grade, 100) : null, b.goals != null ? clean(b.goals, 1000) : null,
    b.notes_private != null ? clean(b.notes_private, 5000) : null, nowIso(), id);
  return json({ ok: true });
}

/** Explicit, coach-initiated merges only. */
export async function mergeAthlete(env, req, user, id) {
  requireDirector(user);
  const db = env.DB;
  const { into_id } = await readJson(req);
  const a = await first(db, 'SELECT * FROM athletes WHERE id = ?', id), into = await first(db, 'SELECT * FROM athletes WHERE id = ?', into_id);
  assert(a && into && a.id !== into.id, 400, 'Pick two different athletes.');
  assert(a.family_id === into.family_id, 400, 'Athletes must be in the same family. Merge the families first.');
  await db.batch([
    stmt(db, 'UPDATE bookings SET athlete_id = ? WHERE athlete_id = ?', into.id, a.id),
    stmt(db, 'DELETE FROM athletes WHERE id = ?', a.id),
  ]);
  await audit(db, user.id, 'merge_athlete', 'athlete', into.id, { merged: a });
  return json({ ok: true });
}

export async function mergeFamily(env, req, user, id) {
  requireDirector(user);
  const db = env.DB;
  const { other_id } = await readJson(req);
  const a = await first(db, 'SELECT * FROM families WHERE id = ?', id), o = await first(db, 'SELECT * FROM families WHERE id = ?', other_id);
  assert(a && o && a.id !== o.id, 400, 'Pick two different families.');
  await db.batch([
    stmt(db, 'UPDATE athletes SET family_id = ? WHERE family_id = ?', a.id, o.id),
    stmt(db, 'UPDATE bookings SET family_id = ? WHERE family_id = ?', a.id, o.id),
    stmt(db, 'UPDATE family_packages SET family_id = ? WHERE family_id = ?', a.id, o.id),
    stmt(db, 'DELETE FROM families WHERE id = ?', o.id),
  ]);
  await audit(db, user.id, 'merge_family', 'family', a.id, { merged: o });
  return json({ ok: true });
}

/** Record a package sold outside the website (or comp one). */
export async function grantPackage(env, req, user, familyId) {
  requireDirector(user);
  const db = env.DB;
  const settings = await getSettings(db);
  const b = await readJson(req);
  const pkg = await first(db, 'SELECT * FROM packages WHERE id = ?', b.package_id);
  assert(pkg, 400, 'Pick a package.');
  const fam = await first(db, 'SELECT id FROM families WHERE id = ?', familyId);
  assert(fam, 404, 'Family not found.');
  const today = zoned(new Date(), settings.timezone).date;
  const fpId = 'fp' + uid(10), t = nowIso();
  const stmts = [
    stmt(db, "INSERT INTO family_packages (id, family_id, package_id, snapshot, status, credits_total, purchased_at, expires_on, created_by, created_at) VALUES (?,?,?,?, 'active', ?, ?, ?, ?, ?)",
      fpId, familyId, pkg.id, JSON.stringify({ ...pkg, eligible_type_ids: parseJson(pkg.eligible_type_ids, null) }), pkg.credits, t, pkg.validity_days ? addDays(today, pkg.validity_days) : null, user.id, t),
    stmt(db, 'INSERT INTO credit_ledger (id, family_package_id, delta, reason, idem_key, actor, note, at) VALUES (?,?,?,?,?,?,?,?)',
      uid(), fpId, pkg.credits || 0, 'purchase', 'purchase:' + fpId, user.id, clean(b.note, 300) || null, t),
  ];
  if (b.payment && Number(b.payment.amount_cents) > 0) {
    stmts.push(stmt(db, "INSERT INTO payments (id, family_package_id, source, kind, amount_cents, method, paid_on, status, note, recorded_by, created_at) VALUES (?,?, 'offline', 'charge', ?, ?, ?, 'succeeded', ?, ?, ?)",
      'py' + uid(10), fpId, Math.round(Number(b.payment.amount_cents)), clean(b.payment.method, 20) || 'other', b.payment.paid_on || today, clean(b.note, 300) || null, user.id, t));
  }
  await db.batch(stmts);
  await audit(db, user.id, 'grant_package', 'family_package', fpId, { package: pkg.id, family: familyId });
  return json({ id: fpId }, 201);
}

export async function adjustCredits(env, req, user, fpId) {
  requireDirector(user);
  const db = env.DB;
  const b = await readJson(req);
  const delta = Math.round(Number(b.delta));
  assert(Number.isInteger(delta) && delta !== 0 && Math.abs(delta) <= 100, 400, 'Enter a whole number of credits.');
  assert(clean(b.note), 400, 'Add a note explaining the adjustment.');
  const fp = await first(db, 'SELECT * FROM family_packages WHERE id = ?', fpId);
  assert(fp && fp.credits_total != null, 400, 'Only counted packages can be adjusted.');
  await run(db, 'INSERT INTO credit_ledger (id, family_package_id, delta, reason, idem_key, actor, note, at) VALUES (?,?,?,?,?,?,?,?)',
    uid(), fpId, delta, 'adjust', 'adjust:' + fpId + ':' + Date.now(), user.id, clean(b.note, 300), nowIso());
  return json({ ok: true });
}
