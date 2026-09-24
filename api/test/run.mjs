/* End-to-end tests against a local `wrangler dev --env dev --local` server.
   Uses only fake test data; nothing is sent to Stripe or to real families.
   Run: npm run migrate:local && npm run dev   (in one terminal)
        npm test                                (in another) */
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { localToInstant, zoned, addDays } from '../src/lib/time.js';

const API = process.env.API || 'http://localhost:8787';
const WHSEC = 'whsec_localtest123';
const SETUP = 'local-setup-token';
const TZ = 'America/Chicago';

let pass = 0, fail = 0;
const results = [];
function ok(cond, name, extra) {
  if (cond) { pass++; results.push('  ✓ ' + name); }
  else { fail++; results.push('  ✗ ' + name + (extra ? '  → ' + JSON.stringify(extra).slice(0, 400) : '')); }
}
function section(name) { results.push('\n' + name); }

let token = null;
async function call(method, path, body, tok = token) {
  const res = await fetch(API + path, {
    method, headers: { 'Content-Type': 'application/json', ...(tok ? { Authorization: 'Bearer ' + tok } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data = null;
  try { data = await res.json(); } catch {}
  return { status: res.status, data };
}
const get = (p, t) => call('GET', p, undefined, t);
const post = (p, b, t) => call('POST', p, b ?? {}, t);

function sql(command) {
  const out = execSync(`npx wrangler d1 execute lsl-booking-dev --env dev --local --json --command "${command.replace(/"/g, '\\"')}"`, { cwd: new URL('..', import.meta.url), stdio: ['ignore', 'pipe', 'pipe'] }).toString();
  return JSON.parse(out)[0].results;
}

async function webhook(event) {
  const body = JSON.stringify(event);
  const t = Math.floor(Date.now() / 1000);
  const sig = crypto.createHmac('sha256', WHSEC).update(t + '.' + body).digest('hex');
  const res = await fetch(API + '/api/stripe/webhook', { method: 'POST', headers: { 'Stripe-Signature': `t=${t},v1=${sig}`, 'Content-Type': 'application/json' }, body });
  return { status: res.status, data: await res.json().catch(() => null) };
}
const session = (id, ref, extra = {}) => ({ id: 'evt_' + crypto.randomUUID().slice(0, 8), type: 'checkout.session.completed',
  data: { object: { id, client_reference_id: ref, payment_status: 'paid', amount_total: 9000, currency: 'usd', payment_intent: 'pi_' + id, ...extra } } });

const today = zoned(new Date(), TZ).date;
const D = (n) => addDays(today, n);
const family = (n) => ({ parent: 'Test Parent ' + n, athlete: 'Test Athlete ' + n, email: `test${n}@example.test`, phone: '555-0100', age: '7th' });

function resetDb() {
  const tables = ['auth_sessions', 'audit_log', 'booking_events', 'notifications', 'payments', 'stripe_events', 'credit_ledger', 'family_packages', 'packages',
    'bookings', 'athletes', 'families', 'slots', 'availability_series', 'blocks', 'settings', 'users', 'session_types', 'locations'];
  sql(tables.map((t) => `DELETE FROM ${t}`).join('; '));
  execSync('npx wrangler d1 execute lsl-booking-dev --env dev --local --file migrations/0002_seed_defaults.sql', { cwd: new URL('..', import.meta.url), stdio: 'ignore' });
}

async function main() {
  resetDb();
  section('Time zone / DST');
  // US DST ends 2026-11-01. 4:00 PM local must stay 4:00 PM on both sides.
  const before = localToInstant('2026-10-26', '16:00', TZ), after = localToInstant('2026-11-02', '16:00', TZ);
  ok(before.toISOString() === '2026-10-26T21:00:00.000Z', 'CDT 4:00 PM = 21:00Z', before.toISOString());
  ok(after.toISOString() === '2026-11-02T22:00:00.000Z', 'CST 4:00 PM = 22:00Z', after.toISOString());
  ok(zoned(after, TZ).time === '16:00', 'round-trips to 16:00 local');
  const gap = localToInstant('2027-03-14', '02:30', TZ);
  ok(!isNaN(gap.getTime()), 'nonexistent spring-forward time resolves');

  section('Auth & setup');
  ok((await get('/api/health')).status === 200, 'health');
  let r = await get('/api/admin/bootstrap');
  ok(r.status === 401, 'admin API rejects anonymous');
  r = await post('/api/auth/setup', { setupToken: 'wrong', email: 'dir@example.test', name: 'Director', password: 'correct horse battery' });
  ok(r.status === 403, 'setup rejects wrong token');
  r = await post('/api/auth/setup', { setupToken: SETUP, email: 'dir@example.test', name: 'Test Director', password: 'correct horse battery' });
  if (r.status === 409) r = await post('/api/auth/login', { email: 'dir@example.test', password: 'correct horse battery' });
  ok(!!r.data?.token, 'director signed in', r);
  token = r.data.token;
  r = await post('/api/auth/setup', { setupToken: SETUP, email: 'x@example.test', name: 'X', password: 'correct horse battery' });
  ok(r.status === 409, 'setup cannot run twice');
  r = await post('/api/auth/login', { email: 'dir@example.test', password: 'nope' }, null);
  ok(r.status === 401, 'bad password rejected');
  r = await get('/api/admin/bootstrap');
  ok(r.status === 200 && r.data.types.length >= 4 && r.data.locations.length >= 2, 'bootstrap has seeded types & locations');
  ok(r.data.settings.timezone === TZ, 'default time zone America/Chicago');

  section('Legacy import (fake data in the old JSONbin shape)');
  const legacy = {
    slots: [
      { id: 'lgs1', date: D(-10), time: '18:00', locId: 'pr', status: 'booked', bookingId: 'lgb1' },
      { id: 'lgs2', date: D(20), time: '11:30', locId: 'mun', status: 'booked', bookingId: 'lgb2' },
      { id: 'lgs3', date: D(21), time: '10:00', locId: 'mun', status: 'open' },
    ],
    types: [{ id: 'p1', name: '60 Minute Private Training', size: '1-on-1', duration: 60, payLink: 'https://buy.stripe.com/00w9AM0rxcFigGc4M10Jq01' }],
    locs: [{ id: 'pr', name: 'Park Ridge, IL' }, { id: 'mun', name: 'Mundelein, IL' }],
    books: [
      { id: 'lgb1', mode: 'dated', typeId: 'p1', serviceName: '1-on-1 Private Training Session', slotId: 'lgs1', date: D(-10), time: '18:00', locId: 'pr', parent: 'Legacy Parent', athlete: 'Legacy Kid', email: 'legacy@example.test', phone: '555', status: 'awaiting_payment', created: '2026-07-01T00:00:00Z' },
      { id: 'lgb2', mode: 'dated', typeId: 'p1', serviceName: '1-on-1 Private Training Session', slotId: 'lgs2', date: D(20), time: '11:30', locId: 'mun', parent: 'Legacy Parent', athlete: 'Legacy Kid', email: 'LEGACY@example.test', phone: '555', status: 'awaiting_payment' },
      { id: 'lgb3', mode: 'request', serviceName: 'Small Group Training Session', players: '5', dow: 0, reqTime: '09:00', parent: 'Legacy Parent', athlete: 'Other Kid', email: 'legacy@example.test', phone: '555', status: 'requested' },
      { id: 'lgb4', mode: 'dated', typeId: 'sg2', serviceName: 'Small Group', slotId: 'gone', date: D(-30), time: '10:00', locId: 'pr', parent: 'Same Name', athlete: 'Legacy Kid', email: 'different@example.test', phone: '1' },
    ],
    conflictBuffer: 120, conflictAction: 'bump',
  };
  r = await post('/api/admin/import-legacy', { snapshot: legacy });
  ok(r.status === 200 && r.data.counts.bookings === 4, 'imports 4 bookings', r.data);
  ok(r.data.settings_applied.travelDefault === 60, 'old 120-min gap → 60-min travel buffer');
  r = await post('/api/admin/import-legacy', { snapshot: legacy });
  ok(r.status === 200 && r.data.counts.bookings === 0 && r.data.counts.slots === 0, 're-import is idempotent', r.data);
  r = await get('/api/admin/bookings');
  const lg = Object.fromEntries(r.data.bookings.filter((b) => b.legacy).map((b) => [b.id, b]));
  ok(lg.lgb1?.payment_status === 'paid' && lg.lgb1?.status === 'confirmed', 'legacy booking: confirmed + Paid (director confirmed old bookings were paid)');
  ok(lg.lgb3?.payment_status === 'unpaid', 'legacy request is not marked paid');
  r = await call('PATCH', '/api/admin/bookings/lgb4', { payment_status: 'unpaid' });
  ok(r.status === 400, 'payment correction requires a reason');
  r = await call('PATCH', '/api/admin/bookings/lgb4', { payment_status: 'unpaid', payment_reason: 'never paid' });
  const lg4 = await get('/api/admin/bookings/lgb4');
  ok(lg4.data.booking.payment_status === 'unpaid' && lg4.data.events.some((e) => e.type === 'payment_status_corrected'), 'director can correct an imported booking to Unpaid, with audit event');
  ok(lg.lgb1?.family.id === lg.lgb2?.family.id, 'same email (case-insensitive) → same family');
  ok(lg.lgb4?.family.id !== lg.lgb1?.family.id, 'same athlete name but different email → NOT merged');
  ok(lg.lgb3?.status === 'requested' && lg.lgb3?.request?.day === 'Sundays', 'legacy group request preserved');
  ok(lg.lgb4?.type_id === 'p2', 'legacy sg2 → 2-on-1 type');

  section('Availability: single, duplicate, bulk, copy');
  const d3 = D(3), d4 = D(4);
  r = await post('/api/admin/slots', { date: d3, time: '16:00', loc_id: 'pr' });
  ok(r.status === 201, 'create opening', r);
  r = await post('/api/admin/slots', { date: d3, time: '16:00', loc_id: 'pr' });
  ok(r.status === 409 && r.data.reason === 'duplicate', 'duplicate rejected');
  r = await post('/api/admin/slots', { date: d3, time: '16:30', loc_id: 'pr' });
  ok(r.status === 409 && r.data.reason === 'overlap', 'overlapping opening rejected (same coach)');
  r = await post('/api/admin/slots/generate', { mode: 'range', dates: [d4], start: '09:00', end: '12:00', duration: 60, buffer: 15, loc_id: 'pr', dryRun: true });
  ok(r.data.preview && r.data.create.length === 2 && r.data.create.map((x) => x.time).join() === '09:00,10:15', 'bulk preview 60+15 in 9–12 → 9:00, 10:15', r.data);
  r = await post('/api/admin/slots/generate', { mode: 'range', dates: [d4], start: '09:00', end: '12:00', duration: 60, buffer: 15, loc_id: 'pr' });
  ok(r.status === 201 && r.data.created === 2, 'bulk create');
  r = await post('/api/admin/slots/generate', { mode: 'copy_day', from: d4, to: D(5) });
  ok(r.status === 201 && r.data.created === 2, 'copy day', r.data);
  r = await post('/api/admin/slots/generate', { mode: 'copy_day', from: d4, to: D(5) });
  ok(r.data.created === 0 && r.data.skipped.every((s) => s.reason === 'duplicate'), 'copy again → all duplicates detected');

  section('Recurring availability across DST');
  r = await post('/api/admin/slots/generate', { mode: 'series', weekdays: [1], start: '16:00', end: '17:00', duration: 60, loc_id: 'mun', start_date: '2026-10-19', end_date: '2026-11-09' });
  ok(r.status === 201 && r.data.created === 4, 'Mondays Oct 19 – Nov 9 → 4 openings', r.data);
  const seriesId = r.data.series_id;
  r = await get('/api/admin/schedule?from=2026-10-19&to=2026-11-09');
  const ser = r.data.slots.filter((s) => s.series_id === seriesId);
  ok(ser.every((s) => s.time === '16:00'), 'all stay 4:00 PM local across the DST change');

  section('Public booking, hold, and capacity');
  r = await get('/api/public/catalog', null);
  ok(r.status === 200 && r.data.settings.timezone === TZ, 'public catalog');
  ok(r.data.settings.minNoticeHours === 24 && r.data.settings.holdMinutes === 10, '24-hour notice and 10-minute hold by default');
  const soon = new Date(Date.now() + 18 * 3600000), soonLocal = zoned(soon, TZ);
  const soonTime = soonLocal.time.slice(0, 3) + '00';
  const mk = await post('/api/admin/slots', { date: soonLocal.date, time: soonTime, loc_id: 'mun', duration: 30 });
  const cat18 = await get('/api/public/catalog', null);
  ok(mk.status === 201 && !cat18.data.slots.some((s) => s.date === soonLocal.date && s.time === soonTime), 'an opening ~18 hours out is hidden (24-hour notice)', mk.data);
  const pubSlot = r.data.slots.find((s) => s.date === d3 && s.time === '16:00');
  ok(pubSlot && pubSlot.status === 'open', 'opening visible publicly');
  ok(!JSON.stringify(r.data).includes('legacy@example.test'), 'public catalog exposes no family data');
  // Cross-location opening close to it, to exercise conflict resolution.
  r = await post('/api/admin/slots', { date: d3, time: '17:30', loc_id: 'mun' });
  ok(r.status === 201 && r.data.warnings.length === 1 && r.data.warnings[0].reason === 'travel', 'insufficient travel time flagged as warning', r.data);
  // Five families try the same opening at once.
  const attempts = await Promise.all([1, 2, 3, 4, 5].map((n) => post('/api/public/bookings', { slotId: pubSlot.id, typeId: 'p1', form: family(n), acks: ['policy'] }, null)));
  const wins = attempts.filter((a) => a.status === 201);
  ok(wins.length === 1, 'exactly one of 5 simultaneous bookings wins', attempts.map((a) => a.status));
  ok(attempts.filter((a) => a.status === 409).length === 4, 'the other four get "just taken"');
  const win = wins[0].data;
  ok(win.booking.status === 'awaiting_payment' && !!win.booking.hold_expires_at, 'winner is a temporary hold awaiting payment');
  ok(win.checkoutUrl.includes('client_reference_id=' + win.booking.id), 'checkout URL carries booking id as client_reference_id');
  r = await post('/api/public/bookings', { slotId: pubSlot.id, typeId: 'p1', form: family(9) }, null);
  ok(r.status === 400 && r.data.fields?.ack_policy, 'required acknowledgment enforced');
  r = await get('/api/admin/schedule?from=' + d3 + '&to=' + d3);
  const munSlot = r.data.slots.find((s) => s.loc_id === 'mun');
  ok(munSlot && munSlot.time === '18:00', 'conflicting Mundelein opening bumped 5:30 → 6:00 (end + 60 min travel)', munSlot);
  r = await get('/api/public/catalog', null);
  ok(r.data.slots.find((s) => s.id === pubSlot.id).status === 'booked', 'held slot shows as taken publicly');
  r = await post('/api/public/bookings', { slotId: pubSlot.id, typeId: 'p2', players: 5, form: family(8), acks: ['policy'] }, null);
  ok(r.status === 400 || r.status === 409, 'capacity/availability enforced server-side');

  section('Stripe webhook: verification, matching, idempotency');
  const bad = await fetch(API + '/api/stripe/webhook', { method: 'POST', headers: { 'Stripe-Signature': 't=1,v1=deadbeef' }, body: '{}' });
  ok(bad.status === 400, 'unsigned/forged webhook rejected');
  let bkd = await get('/api/admin/bookings/' + win.booking.id);
  ok(bkd.data.booking.payment_status === 'unpaid', 'no payment assumed from form submission');
  const ev = session('cs_test_1', win.booking.id);
  r = await webhook(ev);
  ok(r.status === 200 && r.data.result === 'confirmed', 'checkout.session.completed → confirmed', r.data);
  r = await webhook(ev);
  ok(r.data.duplicate === true, 'same event redelivered → ignored');
  r = await webhook({ ...ev, id: 'evt_other' });
  ok(r.status === 200, 'second event for same session accepted');
  bkd = await get('/api/admin/bookings/' + win.booking.id);
  ok(bkd.data.booking.status === 'confirmed' && bkd.data.booking.payment_status === 'paid', 'booking confirmed + paid');
  ok(bkd.data.payments.length === 1, 'exactly one payment row despite repeats', bkd.data.payments.length);
  ok(bkd.data.notifications.filter((n) => n.kind === 'confirmation').length === 1, 'confirmation queued once');
  ok(bkd.data.notifications[0].status === 'skipped', 'email not configured → recorded as skipped, not "sent"');
  r = await webhook(session('cs_unknown', 'bknotreal'));
  ok(r.data.result === 'unmatched', 'unknown reference → unmatched, nothing changed');

  section('Hold expiry and late payment');
  r = await post('/api/admin/slots', { date: d4, time: '14:00', loc_id: 'pr' });
  let cat = await get('/api/public/catalog', null);
  const s2 = cat.data.slots.find((s) => s.date === d4 && s.time === '14:00');
  const hold = await post('/api/public/bookings', { slotId: s2.id, typeId: 'p1', form: family(20), acks: ['policy'] }, null);
  ok(hold.status === 201, 'second hold created');
  sql(`UPDATE bookings SET hold_expires_at = '2000-01-01T00:00:00Z' WHERE id = '${hold.data.booking.id}'`);
  await fetch(API + '/__scheduled?cron=*/10+*+*+*+*');
  bkd = await get('/api/admin/bookings/' + hold.data.booking.id);
  ok(bkd.data.booking.status === 'expired', 'abandoned checkout expires');
  cat = await get('/api/public/catalog', null);
  ok(cat.data.slots.find((s) => s.id === s2.id)?.status === 'open', 'slot released back to open');
  r = await webhook(session('cs_late', hold.data.booking.id));
  ok(r.data.result === 'late_confirmed', 'late payment re-takes a still-free slot', r.data);
  // Late payment when the slot was taken meanwhile.
  r = await post('/api/admin/slots', { date: d4, time: '19:00', loc_id: 'pr' });
  cat = await get('/api/public/catalog', null);
  const s3 = cat.data.slots.find((s) => s.date === d4 && s.time === '19:00');
  const h3 = await post('/api/public/bookings', { slotId: s3.id, typeId: 'p1', form: family(30), acks: ['policy'] }, null);
  sql(`UPDATE bookings SET hold_expires_at = '2000-01-01T00:00:00Z' WHERE id = '${h3.data.booking.id}'`);
  await fetch(API + '/__scheduled?cron=*/10+*+*+*+*');
  const taker = await post('/api/public/bookings', { slotId: s3.id, typeId: 'p1', form: family(31), acks: ['policy'] }, null);
  ok(taker.status === 201, 'another family books the released slot');
  r = await webhook(session('cs_late2', h3.data.booking.id));
  ok(r.data.result === 'late_conflict', 'late payment for a taken slot → flagged, no overbooking', r.data);
  bkd = await get('/api/admin/bookings/' + h3.data.booking.id);
  ok(bkd.data.booking.payment_status === 'paid' && !!bkd.data.booking.attention && bkd.data.booking.status === 'expired', 'paid but needs attention; slot not double-booked');

  section('Async payment + refund');
  r = await post('/api/admin/slots', { date: D(6), time: '10:00', loc_id: 'pr' });
  cat = await get('/api/public/catalog', null);
  const s4 = cat.data.slots.find((s) => s.date === D(6) && s.time === '10:00');
  const h4 = await post('/api/public/bookings', { slotId: s4.id, typeId: 'p1', form: family(40), acks: ['policy'] }, null);
  r = await webhook(session('cs_ach', h4.data.booking.id, { payment_status: 'unpaid' }));
  ok(r.data.result === 'payment_pending', 'delayed payment → pending, hold kept');
  sql(`UPDATE bookings SET created_at = created_at WHERE id = '${h4.data.booking.id}'`);
  await fetch(API + '/__scheduled?cron=*/10+*+*+*+*');
  bkd = await get('/api/admin/bookings/' + h4.data.booking.id);
  ok(bkd.data.booking.status === 'awaiting_payment' && bkd.data.booking.payment_status === 'pending', 'pending payment is not expired by the scheduler');
  r = await webhook({ id: 'evt_async_ok', type: 'checkout.session.async_payment_succeeded', data: { object: { id: 'cs_ach', client_reference_id: h4.data.booking.id, payment_status: 'paid', amount_total: 9000, currency: 'usd', payment_intent: 'pi_cs_ach' } } });
  ok(r.data.result === 'confirmed', 'async success → confirmed');
  r = await webhook({ id: 'evt_refund_1', type: 'charge.refunded', data: { object: { payment_intent: 'pi_cs_ach', amount: 9000, amount_refunded: 4500, currency: 'usd' } } });
  ok(r.data.result === 'partially_refunded', 'partial refund recorded');
  r = await webhook({ id: 'evt_refund_2', type: 'charge.refunded', data: { object: { payment_intent: 'pi_cs_ach', amount: 9000, amount_refunded: 9000, currency: 'usd' } } });
  ok(r.data.result === 'refunded', 'full refund recorded');

  section('Cancel, reschedule, attendance, offline payment');
  r = await get('/api/admin/bookings/' + win.booking.id + '/cancel');
  ok(r.status === 200 && r.data.policy.rule, 'cancel preview shows the policy rule');
  // Reschedule the paid booking to a new time first.
  r = await post('/api/admin/bookings/' + win.booking.id + '/reschedule', { date: D(7), time: '15:00', loc_id: 'pr', notify: true });
  ok(r.status === 200 && r.data.notice.status === 'skipped', 'reschedule to a new time (notice recorded as skipped: no email)', r.data);
  bkd = await get('/api/admin/bookings/' + win.booking.id);
  ok(bkd.data.booking.date === D(7) && bkd.data.events.some((e) => e.type === 'rescheduled' && e.data.from.date === d3), 'reschedule keeps history of the old time');
  cat = await get('/api/public/catalog', null);
  ok(cat.data.slots.find((s) => s.id === pubSlot.id)?.status === 'open', 'old time reopened');
  r = await post('/api/admin/bookings/' + win.booking.id + '/cancel', { reopen: true, notify: false, payment_outcome: 'refund_pending', reason: 'family sick' });
  ok(r.status === 200, 'cancel with refund pending');
  bkd = await get('/api/admin/bookings/' + win.booking.id);
  ok(bkd.data.booking.status === 'canceled' && bkd.data.booking.payment_status === 'paid' && /Refund to issue/.test(bkd.data.booking.attention), 'cancel does NOT silently refund: still paid, flagged');
  ok(bkd.data.booking.snapshot.service_name === '60 Minute Private Training', 'history keeps service name snapshot');
  r = await post('/api/admin/bookings/lgb2/payments', { amount_cents: 9000, method: 'venmo', paid_on: today, note: 'test' });
  ok(r.status === 200 && r.data.payment_status === 'paid', 'offline payment recorded');
  bkd = await get('/api/admin/bookings/lgb2');
  ok(bkd.data.payments[0].recorded_by && bkd.data.events.some((e) => e.type === 'offline_payment'), 'offline payment has audit trail');
  r = await post('/api/admin/bookings/lgb1/attendance', { attendance: 'present' });
  ok(r.data.status === 'completed', 'attendance on a past session → completed');

  section('Requests: approve / offer / decline');
  r = await post('/api/public/requests', { form: family(50), request: { serviceName: 'Small Group', players: '6', day: 'Mondays', time: '4:00 PM', location: 'Park Ridge' } }, null);
  ok(r.status === 201 && r.data.booking.status === 'requested', 'training request stored');
  const reqId = r.data.booking.id;
  r = await post('/api/admin/bookings/' + reqId + '/offer', { options: [{ date: D(8), time: '16:00', loc_id: 'pr' }], message: 'hi' });
  ok(r.status === 200, 'offer times');
  r = await post('/api/admin/bookings/' + reqId + '/approve', { type_id: 'p4', date: D(8), time: '16:00', loc_id: 'pr' });
  ok(r.status === 200 && r.data.checkout_url.includes(reqId), 'approve → booking + payment link', r.data);
  bkd = await get('/api/admin/bookings/' + reqId);
  ok(bkd.data.booking.kind === 'dated' && bkd.data.booking.status === 'awaiting_payment' && bkd.data.booking.request.day === 'Mondays', 'approved request keeps submitted info');
  r = await post('/api/public/requests', { form: family(51), request: { serviceName: 'Private', day: 'Fri' } }, null);
  r = await post('/api/admin/bookings/' + r.data.booking.id + '/decline', { reason: 'full', notify: true });
  ok(r.status === 200, 'decline');

  section('Packages & credits');
  r = await post('/api/admin/packages', { name: 'Test 5-Pack', price_cents: 40000, credits: 5, validity_days: 90, eligible_type_ids: ['p1'] });
  ok(r.status === 201, 'create package');
  const pkgId = r.data.id;
  r = await post('/api/admin/packages', { name: 'Bad', price_cents: 100, credits: null });
  ok(r.status === 400, 'unlimited without validity rejected');
  const fam = (await get('/api/admin/bookings/lgb2')).data.booking.family_id;
  r = await post('/api/admin/families/' + fam + '/packages', { package_id: pkgId, payment: { amount_cents: 40000, method: 'check' } });
  ok(r.status === 201, 'package granted to family');
  const fpId = r.data.id;
  // New booking for the same family to redeem against.
  r = await post('/api/admin/slots', { date: D(9), time: '09:00', loc_id: 'pr' });
  cat = await get('/api/public/catalog', null);
  const s5 = cat.data.slots.find((s) => s.date === D(9) && s.time === '09:00');
  const pb = await post('/api/public/bookings', { slotId: s5.id, typeId: 'p1', form: { ...family(60), email: 'legacy@example.test' }, acks: ['policy'] }, null);
  r = await post('/api/admin/bookings/' + pb.data.booking.id + '/redeem', { family_package_id: fpId });
  ok(r.status === 200, 'redeem credit');
  const both = await Promise.all([1, 2].map(() => post('/api/admin/bookings/' + pb.data.booking.id + '/redeem', { family_package_id: fpId })));
  ok(both.every((x) => x.status === 409), 'double redemption prevented');
  let famd = await get('/api/admin/families/' + fam);
  ok(famd.data.packages.find((p) => p.id === fpId).balance === 4, 'balance 5 → 4');
  bkd = await get('/api/admin/bookings/' + pb.data.booking.id);
  ok(bkd.data.booking.status === 'confirmed' && bkd.data.booking.payment_status === 'package_credit', 'credit confirms the booking');
  r = await post('/api/admin/bookings/' + pb.data.booking.id + '/cancel', { reopen: true, payment_outcome: 'restore_credit' });
  ok(r.status === 200, 'cancel ≥48h ahead restores credit');
  famd = await get('/api/admin/families/' + fam);
  ok(famd.data.packages.find((p) => p.id === fpId).balance === 5, 'balance back to 5');
  ok(famd.data.ledger.filter((l) => l.booking_id === pb.data.booking.id).length === 2, 'ledger shows redeem + restore');

  section('Blocks');
  r = await post('/api/admin/blocks', { date: d4, reason: 'tournament', dryRun: true });
  ok(r.data.preview && r.data.impact.open.length >= 1 && r.data.impact.booked.length >= 1, 'block preview lists open and booked impact', r.data.impact);
  r = await post('/api/admin/blocks', { date: D(5), start_time: '09:00', end_time: '11:00', reason: 'practice', removeOpen: false });
  ok(r.status === 201, 'block created');
  cat = await get('/api/public/catalog', null);
  ok(!cat.data.slots.some((s) => s.date === D(5) && s.time === '09:00'), 'blocked opening hidden from families');
  await post('/api/admin/blocks', { date: D(11), start_time: '12:00', end_time: '14:00', reason: 'vacation' });
  r = await post('/api/admin/slots', { date: D(11), time: '12:30', loc_id: 'mun' });
  ok(r.status === 409 && r.data.reason === 'blocked', 'cannot add an opening inside a block', r.data);

  section('Recurring edit: this & future');
  r = await get('/api/admin/schedule?from=2026-10-19&to=2026-11-09');
  const occ = r.data.slots.filter((s) => s.series_id === seriesId).sort((a, b) => a.date.localeCompare(b.date));
  r = await call('PATCH', '/api/admin/slots/' + occ[0].id, { time: '15:00', scope: 'one' });
  ok(r.data.updated === 1, 'edit one occurrence');
  r = await call('PATCH', '/api/admin/slots/' + occ[2].id, { time: '17:00', scope: 'future' });
  r = await get('/api/admin/schedule?from=2026-10-19&to=2026-11-09');
  const after2 = Object.fromEntries(r.data.slots.filter((s) => s.series_id === seriesId).map((s) => [s.date, s.time]));
  ok(after2['2026-10-19'] === '15:00' && after2['2026-10-26'] === '16:00' && after2['2026-11-02'] === '17:00' && after2['2026-11-09'] === '17:00', 'one vs future edits applied correctly', after2);

  section('Locations & session types');
  r = await call('PUT', '/api/admin/locations/mun', { name: 'Mundelein, IL', address: '1 Test Way' });
  ok(r.status === 409 && r.data.needs_decision, 'address change with upcoming bookings requires a decision', r.data);
  r = await call('PUT', '/api/admin/locations/mun', { name: 'Mundelein, IL', address: '1 Test Way', apply_to_upcoming: false });
  ok(r.status === 200, 'saved with explicit decision');
  r = await post('/api/admin/locations/mun/archive', { archive: true });
  ok(r.status === 409 && r.data.needs_decision, 'archive with future items requires a decision');
  r = await call('DELETE', '/api/admin/types/p1');
  ok(r.status === 409, 'service with bookings cannot be deleted (archive instead)');
  r = await call('PUT', '/api/admin/types/p1', { name: 'X', duration: 5, min_participants: 2, max_participants: 1, pay_link: 'https://evil.example' });
  ok(r.status === 400 && r.data.fields.duration && r.data.fields.max_participants && r.data.fields.pay_link, 'duration/capacity/link validation');
  r = await post('/api/admin/types/verify-prices');
  ok(r.data.status === 'unavailable', 'price check reports unavailable without a Stripe key');

  section('Roles');
  r = await post('/api/admin/users', { email: 'coach@example.test', name: 'Test Coach', role: 'coach', password: 'coach password 1' });
  ok(r.status === 201 || r.status === 409, 'create coach');
  const cl = await post('/api/auth/login', { email: 'coach@example.test', password: 'coach password 1' }, null);
  const ct = cl.data.token;
  r = await call('PUT', '/api/admin/settings', { minNoticeHours: 1 }, ct);
  ok(r.status === 403, 'coach cannot change settings');
  r = await get('/api/admin/bookings', ct);
  ok(r.status === 200 && r.data.bookings.length === 0, 'coach sees only assigned bookings (none)');
  r = await get('/api/admin/bookings/lgb2', ct);
  ok(r.status === 403, 'coach blocked from another coach\'s booking');
  r = await get('/api/admin/payments', ct);
  ok(r.status === 403, 'coach cannot see payment records');
  r = await get('/api/admin/bootstrap', ct);
  ok(!r.data.integrations && r.data.settings.templates === undefined, 'coach bootstrap hides integrations/templates');

  section('Settings & notifications');
  r = await call('PUT', '/api/admin/settings', { timezone: 'Mars/Base' });
  ok(r.status === 400, 'invalid time zone rejected');
  r = await call('PUT', '/api/admin/settings', { travel: { 'mun|pr': 45 }, notifications: { reminders: [{ hoursBefore: 24, enabled: true }, { hoursBefore: 2, enabled: true }] } });
  ok(r.status === 200 && r.data.settings.travel['mun|pr'] === 45, 'per-pair travel buffer saved');
  r = await post('/api/admin/templates/preview', { kind: 'confirmation' });
  ok(r.status === 200 && r.data.body.includes('Alex Sample') && r.data.body.includes('America/Chicago'), 'template preview uses sample data + time zone');
  r = await post('/api/admin/templates/preview', { kind: 'confirmation', send_test: true });
  ok(r.data.test.status === 'skipped', 'test send reports "skipped" when email is not configured');

  console.log(results.join('\n'));
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.log(results.join('\n')); console.error(e); process.exit(1); });
