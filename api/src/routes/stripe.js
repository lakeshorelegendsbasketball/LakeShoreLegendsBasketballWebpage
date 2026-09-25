/* Stripe webhook. This is the only path that marks an online payment as paid.
   Idempotent: each Stripe event id is recorded once; payments are unique per
   Checkout Session, so redelivered or duplicated events change nothing. */
import { first, run, uid, nowIso, json, bookingEvent, stmt, HttpError, parseJson } from '../lib/util.js';
import { verifyStripeSignature } from '../lib/stripe.js';
import { getSettings } from '../lib/settings.js';
import { confirmBooking, reclaimForLatePayment } from '../lib/bookings.js';
import { addDays, zoned } from '../lib/time.js';
import { coachAlert } from '../lib/notify.js';

export async function stripeWebhook(env, req) {
  const raw = await req.text();
  let event;
  try {
    event = await verifyStripeSignature(raw, req.headers.get('Stripe-Signature'), env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    // Reason only — never log the secret or the payload.
    const sig = req.headers.get('Stripe-Signature') || '';
    console.warn('stripe webhook rejected:', e.message, '| header parts:', sig.split(',').map((p) => p.split('=')[0]).join(','), '| secret prefix ok:', String(env.STRIPE_WEBHOOK_SECRET || '').startsWith('whsec_'), '| secret length:', String(env.STRIPE_WEBHOOK_SECRET || '').length);
    throw e;
  }
  const db = env.DB;
  const ins = await run(db, 'INSERT OR IGNORE INTO stripe_events (id, type, received_at) VALUES (?,?,?)', event.id, event.type, nowIso());
  if (!ins.meta.changes) return json({ received: true, duplicate: true });
  let result;
  try {
    result = await handle(env, db, event);
  } catch (e) {
    // Let Stripe retry: forget the event so the retry is processed.
    await run(db, 'DELETE FROM stripe_events WHERE id = ?', event.id);
    throw e;
  }
  await run(db, 'UPDATE stripe_events SET result = ? WHERE id = ?', result, event.id);
  return json({ received: true, result });
}

async function handle(env, db, event) {
  const obj = event.data.object;
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
    case 'checkout.session.async_payment_failed':
    case 'checkout.session.expired':
      return checkoutEvent(env, db, event.type, obj);
    case 'charge.refunded':
    case 'charge.refund.updated':
      return refundEvent(env, db, obj);
    default:
      return 'ignored';
  }
}

async function checkoutEvent(env, db, type, s) {
  const ref = s.client_reference_id;
  if (!ref) return 'no_reference';
  if (ref.startsWith('fp')) return packageCheckout(env, db, type, s);
  const bk = await first(db, 'SELECT * FROM bookings WHERE checkout_ref = ?', ref);
  const settings = await getSettings(db);
  if (!bk) {
    await coachAlert(env, db, settings, 'Stripe payment could not be matched', `Checkout ${s.id} referenced ${ref}, which matches no booking. Amount: ${(s.amount_total || 0) / 100} ${s.currency}.`, 'unmatched:' + s.id);
    return 'unmatched';
  }
  const t = nowIso();
  if (type === 'checkout.session.expired') {
    await bookingEvent(db, bk.id, 'stripe', 'checkout_expired', { session: s.id }).run();
    return 'expired_noted';
  }
  const paid = s.payment_status === 'paid' || s.payment_status === 'no_payment_required';
  const failed = type === 'checkout.session.async_payment_failed';
  const payStatus = failed ? 'failed' : paid ? 'succeeded' : 'pending';

  // One payment row per Checkout Session; later events update it.
  await run(db, `INSERT INTO payments (id, booking_id, source, kind, amount_cents, currency, method, paid_on, status, stripe_session_id, stripe_payment_intent, created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(stripe_session_id) WHERE kind = 'charge' DO UPDATE SET status = excluded.status, stripe_payment_intent = COALESCE(excluded.stripe_payment_intent, payments.stripe_payment_intent)`,
    uid(), bk.id, 'stripe', 'charge', s.amount_total || 0, s.currency || 'usd', 'card', zoned(new Date(), settings.timezone).date, payStatus, s.id, s.payment_intent || null, t);

  const expected = parseJson(bk.snapshot, {}).price_cents;
  const notes = [];
  if (expected != null && s.amount_total != null && s.amount_total !== expected && parseJson(bk.snapshot, {}).pricing_basis !== 'athlete') {
    notes.push(`Stripe charged ${(s.amount_total / 100).toFixed(2)} but the session price was ${(expected / 100).toFixed(2)}.`);
  }

  if (failed) {
    await db.batch([
      stmt(db, "UPDATE bookings SET payment_status = 'unpaid', attention = ?, hold_expires_at = CASE WHEN status = 'awaiting_payment' THEN ? ELSE hold_expires_at END, updated_at = ? WHERE id = ?",
        'Stripe reported the payment failed.', new Date(Date.now() + settings.holdMinutes * 60000).toISOString(), t, bk.id),
      bookingEvent(db, bk.id, 'stripe', 'payment_failed', { session: s.id }),
    ]);
    return 'payment_failed';
  }
  if (!paid) {
    // Delayed methods (e.g. bank debit): keep the reservation while Stripe confirms.
    await db.batch([
      stmt(db, "UPDATE bookings SET payment_status = 'pending', hold_expires_at = NULL, updated_at = ? WHERE id = ? AND payment_status NOT IN ('paid','refunded','partially_refunded')", t, bk.id),
      bookingEvent(db, bk.id, 'stripe', 'payment_pending', { session: s.id }),
    ]);
    return 'payment_pending';
  }

  await db.batch([
    stmt(db, "UPDATE bookings SET payment_status = 'paid', attention = ?, updated_at = ? WHERE id = ?", notes.length ? notes.join(' ') : null, t, bk.id),
    bookingEvent(db, bk.id, 'stripe', 'payment_succeeded', { session: s.id, amount: s.amount_total }),
  ]);
  const cur = await first(db, 'SELECT * FROM bookings WHERE id = ?', bk.id);
  if (cur.status === 'awaiting_payment') {
    await confirmBooking(env, db, settings, bk.id, 'stripe', 'payment_verified');
    return 'confirmed';
  }
  if (cur.status === 'expired' || (cur.status === 'canceled' && cur.cancel_info && parseJson(cur.cancel_info, {}).reason === 'hold_expired')) {
    if (await reclaimForLatePayment(env, db, settings, cur)) {
      await confirmBooking(env, db, settings, bk.id, 'stripe', 'late_payment_slot_still_free');
      return 'late_confirmed';
    }
    const msg = 'Paid after the reservation expired, and the time was taken. Offer a new time or refund in Stripe.';
    await db.batch([
      stmt(db, 'UPDATE bookings SET attention = ?, updated_at = ? WHERE id = ?', msg, t, bk.id),
      bookingEvent(db, bk.id, 'stripe', 'late_payment_conflict', { session: s.id }),
    ]);
    await coachAlert(env, db, settings, 'Action needed: late payment for a taken slot', msg + ' Booking ' + bk.id, 'late:' + s.id);
    return 'late_conflict';
  }
  if (cur.status === 'canceled' || cur.status === 'declined') {
    const msg = 'Payment received for a canceled booking. Decide on a refund or credit.';
    await run(db, 'UPDATE bookings SET attention = ?, updated_at = ? WHERE id = ?', msg, t, bk.id);
    return 'paid_after_cancel';
  }
  return 'paid';
}

async function packageCheckout(env, db, type, s) {
  const fp = await first(db, 'SELECT * FROM family_packages WHERE checkout_ref = ?', s.client_reference_id);
  if (!fp) return 'package_unmatched';
  if (type !== 'checkout.session.completed' && type !== 'checkout.session.async_payment_succeeded') return 'package_' + type;
  if (s.payment_status !== 'paid') return 'package_pending';
  const settings = await getSettings(db);
  const t = nowIso();
  const snap = parseJson(fp.snapshot, {});
  const today = zoned(new Date(), settings.timezone).date;
  const expires = snap.validity_days ? addDays(today, snap.validity_days) : null;
  await db.batch([
    stmt(db, `INSERT INTO payments (id, family_package_id, source, kind, amount_cents, currency, method, paid_on, status, stripe_session_id, stripe_payment_intent, created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(stripe_session_id) WHERE kind = 'charge' DO NOTHING`,
      uid(), fp.id, 'stripe', 'charge', s.amount_total || 0, s.currency || 'usd', 'card', today, 'succeeded', s.id, s.payment_intent || null, t),
    stmt(db, "UPDATE family_packages SET status = 'active', purchased_at = ?, expires_on = ? WHERE id = ? AND status = 'pending_payment'", t, expires, fp.id),
    stmt(db, 'INSERT OR IGNORE INTO credit_ledger (id, family_package_id, delta, reason, idem_key, actor, at) VALUES (?,?,?,?,?,?,?)',
      uid(), fp.id, fp.credits_total || 0, 'purchase', 'purchase:' + fp.id, 'stripe', t),
  ]);
  return 'package_activated';
}

async function refundEvent(env, db, charge) {
  const pi = charge.payment_intent;
  if (!pi) return 'no_payment_intent';
  const pay = await first(db, "SELECT * FROM payments WHERE stripe_payment_intent = ? AND kind = 'charge'", pi);
  if (!pay || !pay.booking_id) return 'refund_unmatched';
  const refunded = charge.amount_refunded || 0;
  const status = refunded >= charge.amount ? 'refunded' : refunded > 0 ? 'partially_refunded' : null;
  if (!status) return 'no_refund';
  const t = nowIso();
  await db.batch([
    stmt(db, `INSERT INTO payments (id, booking_id, source, kind, amount_cents, currency, method, status, stripe_payment_intent, note, created_at)
      SELECT ?,?,?,?,?,?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM payments WHERE kind = 'refund' AND stripe_payment_intent = ? AND amount_cents = ?)`,
      uid(), pay.booking_id, 'stripe', 'refund', refunded, charge.currency, 'card', 'succeeded', pi, 'Cumulative refunded amount reported by Stripe', t, pi, refunded),
    stmt(db, 'UPDATE bookings SET payment_status = ?, updated_at = ? WHERE id = ?', status, t, pay.booking_id),
    bookingEvent(db, pay.booking_id, 'stripe', 'refund', { amount_refunded: refunded, status }),
  ]);
  return status;
}

export function assertStripeConfigured(env) {
  if (!env.STRIPE_WEBHOOK_SECRET) throw new HttpError(503, 'Stripe webhook not configured.');
}
