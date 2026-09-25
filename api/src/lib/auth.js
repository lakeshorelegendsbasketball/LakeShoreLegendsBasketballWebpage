import { HttpError, first, run, uid, nowIso, all } from './util.js';

const ITER = 100000; // Workers caps PBKDF2 at 100k iterations
const enc = new TextEncoder();
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export async function hashPassword(password, saltB64) {
  const salt = saltB64 ? Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0)) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITER }, key, 256);
  return { hash: b64(bits), salt: b64(salt) };
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function verifyPassword(password, user) {
  const { hash } = await hashPassword(password, user.pass_salt);
  return timingSafeEqual(hash, user.pass_hash);
}

export function validatePassword(p) {
  if (typeof p !== 'string' || p.length < 10) throw new HttpError(400, 'Password must be at least 10 characters.');
}

const sha256 = async (s) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));

export async function createSession(db, userId) {
  const token = hex(crypto.getRandomValues(new Uint8Array(32)));
  const expires = new Date(Date.now() + 30 * 86400000).toISOString();
  await run(db, 'INSERT INTO auth_sessions (token_hash, user_id, expires_at, created_at) VALUES (?,?,?,?)', await sha256(token), userId, expires, nowIso());
  return { token, expires };
}

export async function destroySession(db, token) {
  if (token) await run(db, 'DELETE FROM auth_sessions WHERE token_hash = ?', await sha256(token));
}

export function bearer(req) {
  const h = req.headers.get('Authorization') || '';
  return h.startsWith('Bearer ') ? h.slice(7).trim() : '';
}

export async function currentUser(db, req) {
  const token = bearer(req);
  if (!token) return null;
  const row = await first(db,
    `SELECT u.id, u.email, u.name, u.role, u.active, s.expires_at FROM auth_sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?`,
    await sha256(token));
  if (!row || !row.active || row.expires_at < nowIso()) return null;
  return { id: row.id, email: row.email, name: row.name, role: row.role };
}

export async function requireUser(db, req) {
  const u = await currentUser(db, req);
  if (!u) throw new HttpError(401, 'Please sign in again.');
  return u;
}

export function requireDirector(user) {
  if (user.role !== 'director') throw new HttpError(403, 'Only a director can make this change.');
}

export async function recentFailures(db, email) {
  const since = new Date(Date.now() - 15 * 60000).toISOString();
  const rows = await all(db, "SELECT id FROM audit_log WHERE action = 'login_failed' AND entity_id = ? AND at > ?", email, since);
  return rows.length;
}

export const newUserId = () => 'u_' + uid(10);
