/**
 * Auth routes — register, login, JWT cookie session, refresh, logout,
 * email verification, password reset, profile.
 */
import { Hono } from 'hono';
import type { Env } from '../types';
import { readJson } from '../types';
import {
  authLimiter,
  awaitSetAuthCookies,
  clearAuthCookies,
  csrfProtection,
  csrfTokenFor,
  generateSessionId,
  parseCookiesSafe,
  requireAuth,
  setCsrfCookie,
  SESSION_COOKIE,
} from '../middleware';
import { hashPassword, isEmail, nowIso, oid, randomHex, verifyPassword } from '../util';
import { sendEmail } from '../email';

type App = Hono<{ Bindings: Env }>;

const publicUser = (row: Record<string, unknown>) => ({
  id: row.id,
  _id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  avatar: row.avatar || '',
  emailVerified: row.email_verified === 1 || row.email_verified === true,
  isActive: row.is_active !== 0,
  createdAt: row.created_at,
});

export const authRoutes = (/* app: App */) => {
  const router = new Hono<{ Bindings: Env }>();

  router.get('/csrf-token', async (c) => {
    const cookies = parseCookiesSafe(c);
    const sessionId = cookies[SESSION_COOKIE] || generateSessionId();
    setCsrfCookie(c, sessionId);
    return c.json({ csrfToken: await csrfTokenFor(c, sessionId) });
  });

  router.post('/register', authLimiter, csrfProtection, async (c) => {
    const body = await readJson(c);
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!name || !isEmail(email) || password.length < 8) {
      return c.json({ message: 'Name, valid email and a password of at least 8 characters are required' }, 400);
    }
    const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    if (existing) return c.json({ message: 'User already exists' }, 400);

    const id = oid();
    const passwordHash = await hashPassword(password);
    const verificationToken = randomHex(32);
    await c.env.DB.prepare(
      `INSERT INTO users (id, name, email, password_hash, role, email_verified, email_verification_token, email_verification_expires, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'user', 0, ?, ?, ?, ?)`
    )
      .bind(id, name, email, passwordHash, verificationToken, Date.now() + 24 * 3600 * 1000, nowIso(), nowIso())
      .run();

    const row = (await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first())!;
    await awaitSetAuthCookies(c, { id, role: 'user' });

    const clientUrl = c.env.CLIENT_URL;
    const verificationUrl = `${clientUrl}/verify-email?token=${verificationToken}`;
    void sendEmail(c.env, {
      to: email,
      subject: 'Verify your email',
      text: `Please verify your email by visiting: ${verificationUrl}`,
      html: `<p>Please verify your email by clicking <a href="${verificationUrl}">this link</a>.</p>`,
    });

    return c.json(
      {
        user: publicUser(row),
        verificationUrl,
        devNote: 'Email verification message sent (or logged)',
      },
      201
    );
  });

  router.post('/login', authLimiter, csrfProtection, async (c) => {
    const body = await readJson(c);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!isEmail(email) || !password) return c.json({ message: 'Invalid email or password' }, 401);

    const row = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    if (!row || row.is_active === 0) return c.json({ message: 'Invalid email or password' }, 401);
    const ok = await verifyPassword(password, String(row.password_hash));
    if (!ok) return c.json({ message: 'Invalid email or password' }, 401);

    await awaitSetAuthCookies(c, { id: String(row.id), role: String(row.role) });
    return c.json({ user: publicUser(row) });
  });

  router.post('/forgot-password', authLimiter, async (c) => {
    const body = await readJson(c);
    const email = String(body.email || '').trim().toLowerCase();
    if (!isEmail(email)) return c.json({ message: 'Email is required' }, 400);

    const generic = { message: 'If that email exists, a reset link has been sent.' };
    const row = await c.env.DB.prepare('SELECT id, email FROM users WHERE email = ?').bind(email).first();
    if (!row) return c.json(generic);

    const token = randomHex(32);
    await c.env.DB.prepare('UPDATE users SET reset_password_token = ?, reset_password_expires = ?, updated_at = ? WHERE id = ?')
      .bind(token, Date.now() + 60 * 60 * 1000, nowIso(), row.id)
      .run();

    const resetUrl = `${c.env.CLIENT_URL}/reset-password?token=${token}`;
    void sendEmail(c.env, {
      to: email,
      subject: 'Reset your password',
      text: `Reset your password here: ${resetUrl}`,
      html: `<p>Reset your password by clicking <a href="${resetUrl}">this link</a>.</p>`,
    });
    return c.json({ ...generic, resetUrl, devNote: 'Password reset email sent (or logged)' });
  });

  router.post('/send-verification', authLimiter, async (c) => {
    const body = await readJson(c);
    const email = String(body.email || '').trim().toLowerCase();
    if (!isEmail(email)) return c.json({ message: 'Email is required' }, 400);

    const row = await c.env.DB.prepare('SELECT id, email, email_verified FROM users WHERE email = ?').bind(email).first();
    if (!row) return c.json({ message: 'Verification email sent if account exists.' });
    if (row.email_verified === 1) return c.json({ message: 'Email already verified.' });

    const token = randomHex(32);
    await c.env.DB.prepare('UPDATE users SET email_verification_token = ?, email_verification_expires = ?, updated_at = ? WHERE id = ?')
      .bind(token, Date.now() + 24 * 3600 * 1000, nowIso(), row.id)
      .run();

    const verificationUrl = `${c.env.CLIENT_URL}/verify-email?token=${token}`;
    void sendEmail(c.env, {
      to: email,
      subject: 'Verify your email',
      text: `Please verify your email by visiting: ${verificationUrl}`,
      html: `<p>Please verify your email by clicking <a href="${verificationUrl}">this link</a>.</p>`,
    });
    return c.json({ message: 'Verification email sent.', verificationUrl, devNote: 'Email verification attempted (sent or logged)' });
  });

  router.post('/verify-email', authLimiter, async (c) => {
    const body = await readJson(c);
    const token = String(body.token || '');
    if (!token) return c.json({ message: 'Verification token is required' }, 400);

    const row = await c.env.DB.prepare(
      'SELECT id, email FROM users WHERE email_verification_token = ? AND email_verification_expires > ?'
    )
      .bind(token, Date.now())
      .first();
    if (!row) return c.json({ message: 'Invalid or expired token' }, 400);

    await c.env.DB.prepare(
      'UPDATE users SET email_verified = 1, email_verification_token = NULL, email_verification_expires = NULL, updated_at = ? WHERE id = ?'
    )
      .bind(nowIso(), row.id)
      .run();

    void sendEmail(c.env, {
      to: String(row.email),
      subject: 'Email verified',
      text: 'Your email has been verified. Thank you!',
      html: '<p>Your email has been verified. Thank you!</p>',
    });
    return c.json({ message: 'Email verified successfully' });
  });

  router.post('/reset-password', csrfProtection, async (c) => {
    const body = await readJson(c);
    const token = String(body.token || '');
    const password = String(body.password || '');
    if (!token || password.length < 8) return c.json({ message: 'Invalid or expired token' }, 400);

    const row = await c.env.DB.prepare(
      'SELECT id, email FROM users WHERE reset_password_token = ? AND reset_password_expires > ?'
    )
      .bind(token, Date.now())
      .first();
    if (!row) return c.json({ message: 'Invalid or expired token' }, 400);

    const passwordHash = await hashPassword(password);
    await c.env.DB.prepare(
      'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL, email_verified = 1, updated_at = ? WHERE id = ?'
    )
      .bind(passwordHash, nowIso(), row.id)
      .run();

    void sendEmail(c.env, {
      to: String(row.email),
      subject: 'Password changed',
      text: 'Your password was changed successfully. If this was not you, please contact support.',
      html: '<p>Your password was changed successfully. If this was not you, please contact support.</p>',
    });
    return c.json({ message: 'Password reset successful' });
  });

  router.get('/profile', requireAuth, async (c) => {
    const user = c.get('user')!;
    const row = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(user.id).first();
    if (!row) return c.json({ message: 'Not authorized, user not found' }, 401);
    return c.json(publicUser(row));
  });

  router.put('/profile', requireAuth, csrfProtection, async (c) => {
    const user = c.get('user')!;
    const body = await readJson(c);
    const row = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(user.id).first();
    if (!row) return c.json({ message: 'User not found' }, 404);

    const name = body.name !== undefined ? String(body.name).trim() || String(row.name) : row.name;
    let email = String(row.email);
    let emailVerified = row.email_verified;
    let verificationToken: string | null = null;

    if (body.email !== undefined && isEmail(String(body.email)) && String(body.email).toLowerCase() !== email) {
      email = String(body.email).trim().toLowerCase();
      const taken = await c.env.DB.prepare('SELECT id FROM users WHERE email = ? AND id != ?').bind(email, user.id).first();
      if (taken) return c.json({ message: 'Email already in use' }, 400);
      emailVerified = 0;
      verificationToken = randomHex(32);
    }

    let passwordHash = row.password_hash;
    if (body.password !== undefined) {
      const pw = String(body.password);
      if (pw.length < 8) return c.json({ message: 'Password must be at least 8 characters' }, 400);
      passwordHash = await hashPassword(pw);
    }

    await c.env.DB.prepare(
      'UPDATE users SET name = ?, email = ?, password_hash = ?, email_verified = ?, email_verification_token = ?, email_verification_expires = ?, updated_at = ? WHERE id = ?'
    )
      .bind(
        name,
        email,
        passwordHash,
        emailVerified,
        verificationToken,
        verificationToken ? Date.now() + 24 * 3600 * 1000 : row.email_verification_expires,
        nowIso(),
        user.id
      )
      .run();

    const updated = (await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(user.id).first())!;
    return c.json({ user: publicUser(updated) });
  });

  router.post('/refresh', async (c) => {
    const cookies = parseCookiesSafe(c);
    const refresh = cookies['refreshToken'];
    if (!refresh) return c.json({ message: 'No refresh token' }, 401);
    const { verifyJwt } = await import('../util');
    const payload = await verifyJwt(refresh, c.env.JWT_REFRESH_SECRET || c.env.JWT_SECRET);
    if (!payload) return c.json({ message: 'Invalid refresh token' }, 401);

    const row = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(payload.id).first();
    if (!row) return c.json({ message: 'User not found' }, 401);

    await awaitSetAuthCookies(c, { id: String(row.id), role: String(row.role) });
    // Return both shapes so old and new clients keep working.
    return c.json({ accessToken: '', user: { ...publicUser(row) } });
  });

  router.post('/logout', (c) => {
    clearAuthCookies(c);
    return c.json({ message: 'Logged out successfully' });
  });

  return router;
};

