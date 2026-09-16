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
  requireAdmin,
  requireAuth,
  setCsrfCookie,
  SESSION_COOKIE,
} from '../middleware';
import { orderBy, paginateQuery, parsePageParams, searchGroup, updateRow } from '../db';
import { hashPassword, isEmail, nowIso, oid, randomHex, verifyJwt, verifyPassword } from '../util';
import { sendEmail, wrapHtml } from '../email';

type App = Hono<{ Bindings: Env }>;

/**
 * Security: verification/reset URLs are only ever returned in the HTTP
 * response when no real mail provider is configured (local dev). In
 * production they go out by email only — otherwise anyone could reset
 * any account by reading the response.
 */
const isDevMode = (env: Env): boolean => !env.RESEND_API_KEY;

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

const getSettingBool = async (env: Env, column: string): Promise<boolean> => {
  try {
    const row = await env.DB.prepare(`SELECT ${column} AS v FROM site_settings WHERE id = 1`).first<{ v: number }>();
    return Number(row?.v ?? 0) === 1;
  } catch {
    return true; // fail open on schema issues — never lock everyone out
  }
};

export const authRoutes = (/* app: App */) => {
  const router = new Hono<{ Bindings: Env }>();

  router.get('/csrf-token', async (c) => {
    const cookies = parseCookiesSafe(c);
    const sessionId = cookies[SESSION_COOKIE] || generateSessionId();
    setCsrfCookie(c, sessionId);
    return c.json({ csrfToken: await csrfTokenFor(c, sessionId) });
  });

  router.post('/register', authLimiter, csrfProtection, async (c) => {
    // Respect the "allow registration" site setting (admin can close signups).
    if (!(await getSettingBool(c.env, 'allow_registration'))) {
      return c.json({ message: 'Registration is currently closed. Please check back soon.' }, 403);
    }

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

    const verificationUrl = `${c.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    void sendEmail(c.env, {
      to: email,
      subject: 'Verify your email',
      text: `Welcome to TTIN! Please verify your email by visiting: ${verificationUrl}`,
      html: wrapHtml(
        'Welcome to the movement',
        `<p>Hi <strong>${name}</strong>,</p>
         <p>Welcome to <strong>The Time Is Now</strong>. Confirm your email address to unlock your account, order history and more.</p>
         <p>This link expires in 24 hours.</p>`,
        { label: 'Verify my email', url: verificationUrl }
      ),
    });

    return c.json(
      {
        user: publicUser(row),
        ...(isDevMode(c.env) ? { verificationUrl, devNote: 'Dev mode: email provider not configured, URL returned inline' } : {}),
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
      text: `Reset your TTIN password here (valid for 1 hour): ${resetUrl}`,
      html: wrapHtml(
        'Reset your password',
        `<p>Hi,</p>
         <p>Someone (hopefully you) requested a password reset for your TTIN account.</p>
         <p>This link expires in <strong>1 hour</strong>. If you didn’t request it, you can safely ignore this email.</p>`,
        { label: 'Reset password', url: resetUrl }
      ),
    });
    return c.json({
      ...generic,
      ...(isDevMode(c.env) ? { resetUrl, devNote: 'Dev mode: email provider not configured, URL returned inline' } : {}),
    });
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
      html: wrapHtml(
        'Verify your email',
        `<p>Please confirm your email address for <strong>The Time Is Now</strong>.</p>
         <p>This link expires in 24 hours.</p>`,
        { label: 'Verify my email', url: verificationUrl }
      ),
    });
    return c.json({
      message: 'Verification email sent.',
      ...(isDevMode(c.env) ? { verificationUrl, devNote: 'Dev mode: email provider not configured, URL returned inline' } : {}),
    });
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

  /* ---------------------------------------------------------------- */
  /* Change password (authenticated user, with current password)        */
  /* ---------------------------------------------------------------- */
  router.post('/change-password', requireAuth, csrfProtection, async (c) => {
    const user = c.get('user')!;
    const body = await readJson(c);
    const currentPassword = String(body.currentPassword || '');
    const newPassword = String(body.newPassword || '');
    if (!currentPassword || newPassword.length < 8) {
      return c.json({ message: 'Current password and a new password of at least 8 characters are required' }, 400);
    }
    const row = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(user.id).first();
    if (!row) return c.json({ message: 'User not found' }, 404);
    const ok = await verifyPassword(currentPassword, String(row.password_hash));
    if (!ok) return c.json({ message: 'Current password is incorrect' }, 401);

    const passwordHash = await hashPassword(newPassword);
    await c.env.DB.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
      .bind(passwordHash, nowIso(), user.id)
      .run();
    void sendEmail(c.env, {
      to: String(row.email),
      subject: 'Your TTIN password was changed',
      text: 'Your password was changed successfully. If this was not you, please reset it immediately or contact support.',
      html: wrapHtml(
        'Password changed',
        `<p>Hi <strong>${row.name}</strong>,</p>
         <p>Your password was just changed. If this was <strong>not you</strong>, reset it immediately from the “Forgot password” page or contact us.</p>`
      ),
    });
    return c.json({ message: 'Password updated successfully' });
  });

  /* ---------------------------------------------------------------- */
  /* Admin: user management                                            */
  /* ---------------------------------------------------------------- */
  router.get('/admin/users', requireAdmin, async (c) => {
    const q = new URL(c.req.url).searchParams;
    const { page, limit, offset } = parsePageParams(q);
    const clauses: string[] = [];
    const params: unknown[] = [];
    const role = q.get('role');
    if (role === 'admin' || role === 'user') {
      clauses.push('role = ?');
      params.push(role);
    }
    const active = q.get('active');
    if (active !== null && active !== '') {
      clauses.push('is_active = ?');
      params.push(active === 'true' ? 1 : 0);
    }
    const verified = q.get('verified');
    if (verified !== null && verified !== '') {
      clauses.push('email_verified = ?');
      params.push(verified === 'true' ? 1 : 0);
    }
    const search = searchGroup(q.get('search') || '', ['name', 'email']);
    if (search.sql) {
      clauses.push(search.sql);
      params.push(...search.params);
    }
    const order = orderBy(q, { createdAt: 'created_at' }, 'created_at DESC');
    const result = await paginateQuery(
      c.env.DB,
      { sql: clauses.join(' AND '), params },
      'SELECT id, name, email, role, avatar, is_active, email_verified, created_at, updated_at FROM users',
      order,
      page,
      limit,
      offset
    );
    return c.json({ success: true, data: result.data.map(publicUser), pagination: result.pagination });
  });

  router.patch('/admin/users/:id', requireAdmin, csrfProtection, async (c) => {
    const targetId = c.req.param('id');
    const admin = c.get('user')!;
    const body = await readJson(c);
    const row = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(targetId).first();
    if (!row) return c.json({ message: 'User not found' }, 404);

    // Guardrails: an admin can never deactivate or demote themselves.
    if (targetId === admin.id) {
      if (body.role !== undefined && body.role !== 'admin') return c.json({ message: 'You cannot demote your own account' }, 400);
      if (body.isActive === false) return c.json({ message: 'You cannot deactivate your own account' }, 400);
    }
    if (body.role !== undefined && !['user', 'admin'].includes(String(body.role))) {
      return c.json({ message: 'Invalid role' }, 400);
    }

    const fields: Record<string, unknown> = {};
    if (body.role !== undefined) fields.role = String(body.role);
    if (body.isActive !== undefined) fields.is_active = body.isActive === true ? 1 : 0;
    const upd = updateRow('users', fields, 'id = ?', [targetId]);
    if (upd) await c.env.DB.prepare(upd.sql).bind(...upd.params).run();

    const updated = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(targetId).first();
    return c.json({ user: publicUser(updated!) });
  });

  router.post('/admin/users/:id/resend-verification', requireAdmin, async (c) => {
    const row = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(c.req.param('id')).first();
    if (!row) return c.json({ message: 'User not found' }, 404);
    if (row.email_verified === 1) return c.json({ message: 'Email already verified' }, 400);

    const token = randomHex(32);
    await c.env.DB.prepare(
      'UPDATE users SET email_verification_token = ?, email_verification_expires = ?, updated_at = ? WHERE id = ?'
    )
      .bind(token, Date.now() + 24 * 3600 * 1000, nowIso(), row.id)
      .run();

    const verificationUrl = `${c.env.CLIENT_URL}/verify-email?token=${token}`;
    void sendEmail(c.env, {
      to: String(row.email),
      subject: 'Verify your email',
      text: `Please verify your email by visiting: ${verificationUrl}`,
      html: wrapHtml(
        'Verify your email',
        `<p>Please confirm your email address for <strong>The Time Is Now</strong>.</p>`,
        { label: 'Verify my email', url: verificationUrl }
      ),
    });
    return c.json({
      message: 'Verification email sent',
      ...(isDevMode(c.env) ? { verificationUrl, devNote: 'Dev mode: URL returned inline' } : {}),
    });
  });

  router.post('/refresh', async (c) => {
    const cookies = parseCookiesSafe(c);
    const refresh = cookies['refreshToken'];
    if (!refresh) return c.json({ message: 'No refresh token' }, 401);
    const payload = await verifyJwt(refresh, c.env.JWT_REFRESH_SECRET || c.env.JWT_SECRET || 'ttin-local-dev-secret-not-for-production');
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

