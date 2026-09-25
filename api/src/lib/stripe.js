/* Minimal Stripe client: webhook signature verification and read-only price
   lookups for Payment Links. Secrets live only in Worker secrets. */
import { HttpError } from './util.js';

const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export async function verifyStripeSignature(rawBody, header, secret, toleranceSec = 300) {
  if (!secret) throw new HttpError(503, 'Stripe webhook secret is not configured.');
  const parts = Object.fromEntries((header || '').split(',').map((kv) => { const i = kv.indexOf('='); return [kv.slice(0, i), kv.slice(i + 1)]; }));
  const sigs = (header || '').split(',').filter((kv) => kv.startsWith('v1=')).map((kv) => kv.slice(3));
  const t = parts.t;
  if (!t || !sigs.length) throw new HttpError(400, 'Missing Stripe signature.');
  if (Math.abs(Date.now() / 1000 - Number(t)) > toleranceSec) throw new HttpError(400, 'Stripe signature timestamp outside tolerance.');
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = hex(await crypto.subtle.sign('HMAC', key, enc.encode(t + '.' + rawBody)));
  if (!sigs.some((s) => s.length === expected.length && [...s].every((c, i) => c === expected[i]))) {
    throw new HttpError(400, 'Invalid Stripe signature.');
  }
  return JSON.parse(rawBody);
}

export async function stripeGet(env, path, params = {}) {
  if (!env.STRIPE_SECRET_KEY) throw new HttpError(503, 'Stripe API key is not configured.');
  const qs = new URLSearchParams(params).toString();
  const res = await fetch('https://api.stripe.com/v1/' + path + (qs ? '?' + qs : ''), {
    headers: { Authorization: 'Bearer ' + env.STRIPE_SECRET_KEY },
  });
  const body = await res.json();
  if (!res.ok) throw new HttpError(502, 'Stripe: ' + ((body.error && body.error.message) || res.status));
  return body;
}

/** Map Payment Link URL -> {id, active, price_cents, currency}. */
export async function paymentLinkPrices(env) {
  const out = {};
  let startingAfter = null;
  for (let page = 0; page < 5; page++) {
    const params = { limit: '100' };
    if (startingAfter) params.starting_after = startingAfter;
    const list = await stripeGet(env, 'payment_links', params);
    for (const pl of list.data) out[pl.url] = { id: pl.id, active: pl.active };
    if (!list.has_more || !list.data.length) break;
    startingAfter = list.data[list.data.length - 1].id;
  }
  for (const url of Object.keys(out)) {
    const items = await stripeGet(env, 'payment_links/' + out[url].id + '/line_items', { limit: '10' });
    const li = items.data[0];
    if (li && li.price) {
      out[url].price_cents = li.price.unit_amount;
      out[url].currency = li.price.currency;
      out[url].adjustable = !!(li.adjustable_quantity && li.adjustable_quantity.enabled);
    }
  }
  return out;
}

export const isPaymentLink = (u) => typeof u === 'string' && /^https:\/\/(buy\.stripe\.com|checkout\.stripe\.com)\/[A-Za-z0-9_\/-]+$/.test(u.trim());

/** Payment Links accept client_reference_id, which Stripe echoes back on the
    Checkout Session — that is how a payment is matched to its booking. */
export function checkoutUrl(payLink, ref, email) {
  const u = new URL(payLink);
  u.searchParams.set('client_reference_id', ref);
  if (email) u.searchParams.set('prefilled_email', email);
  return u.toString();
}
