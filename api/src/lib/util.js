export class HttpError extends Error {
  constructor(status, message, extra) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
export function uid(len = 12) {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  let out = '';
  for (const b of bytes) out += ALPHABET[b % 36];
  return out;
}

export const nowIso = () => new Date().toISOString();

export function parseJson(s, def = null) {
  if (s == null || s === '') return def;
  try { return JSON.parse(s); } catch { return def; }
}

export const normEmail = (e) => (e || '').trim().toLowerCase();
export const clean = (s, max = 2000) => (s == null ? '' : String(s).trim().slice(0, max));

export const isIsoDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
export const isHm = (s) => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

export function assert(cond, status, message, extra) {
  if (!cond) throw new HttpError(status, message, extra);
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

export async function readJson(req) {
  try { return await req.json(); } catch { throw new HttpError(400, 'Request body must be JSON.'); }
}

/* ---- D1 helpers ---- */
export const all = async (db, sql, ...args) => (await db.prepare(sql).bind(...args).all()).results || [];
export const first = (db, sql, ...args) => db.prepare(sql).bind(...args).first();
export const run = (db, sql, ...args) => db.prepare(sql).bind(...args).run();
export const stmt = (db, sql, ...args) => db.prepare(sql).bind(...args);

export async function audit(db, actor, action, entity, entityId, data) {
  await run(db, 'INSERT INTO audit_log (id, at, actor, action, entity, entity_id, data) VALUES (?,?,?,?,?,?,?)',
    uid(), nowIso(), actor || 'system', action, entity || null, entityId || null, data ? JSON.stringify(data) : null);
}

export function bookingEvent(db, bookingId, actor, type, data) {
  return stmt(db, 'INSERT INTO booking_events (id, booking_id, at, actor, type, data) VALUES (?,?,?,?,?,?)',
    uid(), bookingId, nowIso(), actor || 'system', type, data ? JSON.stringify(data) : null);
}

export const money = (cents) => (cents == null ? '' : '$' + (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2));
