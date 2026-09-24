import { first, run, json, readJson, HttpError, assert, nowIso, audit, normEmail, clean } from '../lib/util.js';
import { hashPassword, verifyPassword, validatePassword, createSession, destroySession, bearer, requireUser, recentFailures, newUserId } from '../lib/auth.js';

export async function login(env, req) {
  const db = env.DB;
  const { email, password } = await readJson(req);
  const e = normEmail(email);
  if ((await recentFailures(db, e)) >= 8) throw new HttpError(429, 'Too many attempts. Wait 15 minutes and try again.');
  const user = await first(db, 'SELECT * FROM users WHERE email = ? AND active = 1', e);
  if (!user || !(await verifyPassword(String(password || ''), user))) {
    await audit(db, 'anonymous', 'login_failed', 'user', e);
    throw new HttpError(401, 'Email or password is incorrect.');
  }
  const { token, expires } = await createSession(db, user.id);
  await audit(db, user.id, 'login', 'user', user.id);
  return json({ token, expires, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}

export async function logout(env, req) {
  await destroySession(env.DB, bearer(req));
  return json({ ok: true });
}

export async function me(env, req) {
  return json({ user: await requireUser(env.DB, req) });
}

/** One-time creation of the first director. Requires the SETUP_TOKEN secret
    and only works while there are no users. */
export async function setup(env, req) {
  const db = env.DB;
  const body = await readJson(req);
  assert(env.SETUP_TOKEN && body.setupToken === env.SETUP_TOKEN, 403, 'Setup token is missing or incorrect.');
  const existing = await first(db, 'SELECT COUNT(*) AS n FROM users');
  assert(existing.n === 0, 409, 'Setup has already been completed. Sign in instead.');
  validatePassword(body.password);
  const email = normEmail(body.email);
  assert(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email), 400, 'Enter a valid email.');
  const { hash, salt } = await hashPassword(body.password);
  const id = newUserId();
  await run(db, 'INSERT INTO users (id, email, name, role, pass_hash, pass_salt, active, created_at) VALUES (?,?,?,?,?,?,1,?)',
    id, email, clean(body.name, 100) || 'Director', 'director', hash, salt, nowIso());
  await audit(db, id, 'setup_director', 'user', id);
  const { token, expires } = await createSession(db, id);
  return json({ token, expires, user: { id, email, name: clean(body.name, 100) || 'Director', role: 'director' } }, 201);
}

export async function setupStatus(env) {
  const r = await first(env.DB, 'SELECT COUNT(*) AS n FROM users');
  return json({ needsSetup: r.n === 0, setupEnabled: !!env.SETUP_TOKEN });
}

export async function changePassword(env, req) {
  const db = env.DB;
  const u = await requireUser(db, req);
  const { current, next } = await readJson(req);
  const row = await first(db, 'SELECT * FROM users WHERE id = ?', u.id);
  if (!(await verifyPassword(String(current || ''), row))) throw new HttpError(400, 'Current password is incorrect.');
  validatePassword(next);
  const { hash, salt } = await hashPassword(next);
  await run(db, 'UPDATE users SET pass_hash = ?, pass_salt = ? WHERE id = ?', hash, salt, u.id);
  await run(db, 'DELETE FROM auth_sessions WHERE user_id = ? AND token_hash != ?', u.id, '');
  const { token, expires } = await createSession(db, u.id);
  await audit(db, u.id, 'password_changed', 'user', u.id);
  return json({ token, expires });
}
