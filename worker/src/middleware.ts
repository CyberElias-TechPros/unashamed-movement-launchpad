/**
 * Middleware: cookie auth (JWT), CSRF protection, rate limiting (KV), CORS.
 */
import type { Context, Next } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import type { Env, AuthUser } from './types';
import { hmacSha256Hex, parseCookies, safeEqual, serializeCookie, randomHex, signJwt, verifyJwt } from './util';

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export const ACCESS_COOKIE = 'accessToken';
export const REFRESH_COOKIE = 'refreshToken';
export const ROLE_COOKIE = 'userRole';
export const SESSION_COOKIE = 'sessionId';

const ACCESS_TTL = 15 * 60; // 15 minutes
const REFRESH_TTL = 7 * 24 * 60 * 60; // 7 days

export const isSecureRequest = (c: Context<{ Bindings: Env }>): boolean => {
  const proto = c.req.header('x-forwarded-proto');
  if (proto) return proto.split(',')[0].trim() === 'https';
  return new URL(c.req.url).protocol === 'https:';
};

/**
 * Local-dev fallback: `wrangler dev` without a .dev.vars file would otherwise
 * sign/verify JWTs with an empty key and crash (HMAC import rejects length 0).
 * Production sets real secrets via `wrangler secret put`, so this only ever
 * applies to local development.
 */
const DEV_FALLBACK_SECRET = 'ttin-local-dev-secret-not-for-production';
let warnedDevSecret = false;
const envSecret = (value: string | undefined, name: string): string => {
  if (value) return value;
  if (!warnedDevSecret) {
    warnedDevSecret = true;
    console.warn(`[dev] ${name} is not set — using an insecure local fallback. Set it in .dev.vars or with \`wrangler secret put ${name}\`.`);
  }
  return DEV_FALLBACK_SECRET;
};

export const signToken = async (
  _c: Context<{ Bindings: Env }>,
  id: string,
  role: string,
  secret: string,
  ttl: number
): Promise<string> => signJwt({ id, role }, secret, ttl);

/** Signs access + refresh tokens, sets auth cookies, returns the tokens. */
export const awaitSetAuthCookies = async (
  c: Context<{ Bindings: Env }>,
  user: { id: string; role: string }
): Promise<{ accessToken: string; refreshToken: string }> => {
  const secure = isSecureRequest(c);
  const accessToken = await signToken(c, user.id, user.role, envSecret(c.env.JWT_SECRET, 'JWT_SECRET'), ACCESS_TTL);
  const refreshToken = await signToken(c, user.id, user.role, envSecret(c.env.JWT_REFRESH_SECRET || c.env.JWT_SECRET, 'JWT_REFRESH_SECRET'), REFRESH_TTL);

  setCookie(c, ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'Lax',
    path: '/',
    maxAge: ACCESS_TTL,
  });
  setCookie(c, REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'Lax',
    path: '/api/auth', // only ever sent to auth endpoints
    maxAge: REFRESH_TTL,
  });
  // Readable by the SPA so it can short-circuit refresh calls.
  setCookie(c, ROLE_COOKIE, user.role, {
    httpOnly: false,
    secure,
    sameSite: 'Lax',
    path: '/',
    maxAge: REFRESH_TTL,
  });
  return { accessToken, refreshToken };
};

export const clearAuthCookies = (c: Context<{ Bindings: Env }>): void => {
  const secure = isSecureRequest(c);
  deleteCookie(c, ACCESS_COOKIE, { path: '/' });
  deleteCookie(c, REFRESH_COOKIE, { path: '/api/auth' });
  deleteCookie(c, ROLE_COOKIE, { path: '/' });
  void secure;
};

/** Populate c.var.user from the access cookie or Authorization header. Returns null when missing/invalid. */
export const getAuthUser = async (c: Context<{ Bindings: Env }>): Promise<AuthUser | null> => {
  const cookies = parseCookies(c.req.header('cookie'));
  const authHeader = c.req.header('authorization');
  const token = cookies[ACCESS_COOKIE] || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '');
  if (!token) return null;
  const payload = await verifyJwt(token, envSecret(c.env.JWT_SECRET, 'JWT_SECRET'));
  if (!payload) return null;
  return { id: payload.id, role: payload.role };
};

export const requireAuth = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const user = await getAuthUser(c);
  if (!user) return c.json({ message: 'Not authorized, no token' }, 401);
  c.set('user', user);
  await next();
};

export const requireAdmin = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const user = await getAuthUser(c);
  if (!user) return c.json({ message: 'Not authorized, no token' }, 401);
  if (user.role !== 'admin') return c.json({ message: 'Not authorized as admin' }, 403);
  c.set('user', user);
  await next();
};

/* ------------------------------------------------------------------ */
/* CSRF — HMAC(sessionId) double-submit, same scheme as the SPA        */
/* ------------------------------------------------------------------ */

export const generateSessionId = (): string => randomHex(32);

export const csrfTokenFor = async (c: Context<{ Bindings: Env }>, sessionId: string): Promise<string> =>
  hmacSha256Hex(c.env.CSRF_SECRET || 'csrf-secret-change-in-production', sessionId);

export const csrfProtection = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const method = c.req.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return next();

  const headerToken = c.req.header('x-csrf-token');
  const cookies = parseCookies(c.req.header('cookie'));
  const sessionId = cookies[SESSION_COOKIE];

  let bodyToken: string | undefined;
  const contentType = c.req.header('content-type') || '';
  if (!headerToken && contentType.includes('application/json')) {
    try {
      const cloned = c.req.raw.clone();
      const body = (await cloned.json()) as Record<string, unknown>;
      if (body && typeof body._csrf === 'string') bodyToken = body._csrf;
    } catch {
      /* body not json — ignore */
    }
  }

  const token = headerToken || bodyToken;
  if (!token || !sessionId) return c.json({ message: 'Invalid CSRF token' }, 403);
  const expected = await csrfTokenFor(c, sessionId);
  if (!safeEqual(token, expected)) return c.json({ message: 'Invalid CSRF token' }, 403);
  await next();
};

export const setCsrfCookie = (c: Context<{ Bindings: Env }>, sessionId: string): void => {
  setCookie(c, SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: isSecureRequest(c),
    sameSite: 'Lax',
    path: '/',
    maxAge: 60 * 60,
  });
};

/* ------------------------------------------------------------------ */
/* Rate limiting — KV counters with in-memory fallback                 */
/* ------------------------------------------------------------------ */

const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

export const getClientIp = (c: Context<{ Bindings: Env }>): string =>
  c.req.header('cf-connecting-ip') ||
  c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
  c.req.header('x-real-ip') ||
  'unknown';

export const parseCookiesSafe = (c: Context<{ Bindings: Env }>): Record<string, string> =>
  parseCookies(c.req.header('cookie'));

export const rateLimit = (windowMs: number, max: number) => {
  const windowSec = Math.ceil(windowMs / 1000);
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const ip = getClientIp(c);
    const bucket = Math.floor(Date.now() / windowMs);
    const key = `rl:${ip}:${c.req.path}:${bucket}`;

    let count = 0;
    try {
      if (c.env.CACHE) {
        const raw = await c.env.CACHE.get(key);
        count = raw ? parseInt(raw, 10) || 0 : 0;
        count += 1;
        await c.env.CACHE.put(key, String(count), { expirationTtl: windowSec });
      } else {
        const now = Date.now();
        const entry = memoryBuckets.get(key);
        if (!entry || now > entry.resetAt) {
          memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
          count = 1;
        } else {
          entry.count += 1;
          count = entry.count;
        }
      }
    } catch {
      return next(); // never block traffic on limiter failure
    }

    if (count > max) {
      return c.json({ message: 'Too many requests. Please try again later.' }, 429);
    }
    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(Math.max(0, max - count)));
    await next();
  };
};

export const authLimiter = rateLimit(15 * 60 * 1000, 25);
export const contactLimiter = rateLimit(60 * 60 * 1000, 10);
export const newsletterLimiter = rateLimit(60 * 60 * 1000, 8);
export const trackLimiter = rateLimit(60 * 1000, 60);

/* ------------------------------------------------------------------ */
/* CORS — only needed when the API is called cross-origin directly     */
/* (the Vercel deployment proxies /api same-origin, so no CORS at all) */
/* ------------------------------------------------------------------ */

export const corsHeaders = (c: Context<{ Bindings: Env }>): Record<string, string> => {
  const origin = c.req.header('origin');
  if (!origin) return {};
  const allowed = (c.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowed.includes(origin) || allowed.includes('*')) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-CSRF-Token,X-Idempotency-Key',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    };
  }
  return {};
};
