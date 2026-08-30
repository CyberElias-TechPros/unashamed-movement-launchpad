/**
 * Core helpers: ids, crypto (PBKDF2 passwords, JWT, HMAC/CSRF), cookies, time.
 * Everything uses WebCrypto — no Node APIs, so it runs on Cloudflare Workers as-is.
 */

export const nowIso = (): string => new Date().toISOString();

/** Mongo-ObjectId-shaped 24-char hex id (keeps the frontend contract familiar). */
export const oid = (): string => {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export const randomHex = (bytes = 32): string => {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

/* ------------------------------------------------------------------ */
/* Encoding helpers                                                    */
/* ------------------------------------------------------------------ */

const enc = new TextEncoder();

export const toHex = (buf: ArrayBuffer): string =>
  Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

export const toBase64 = (buf: ArrayBuffer): string => {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
};

export const fromBase64 = (b64: string): Uint8Array => {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

/* ------------------------------------------------------------------ */
/* Constant-time compare                                               */
/* ------------------------------------------------------------------ */

export const safeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

/* ------------------------------------------------------------------ */
/* Passwords — PBKDF2-SHA256 (FIPS-approved; Workers has no bcrypt)    */
/* Stored format: pbkdf2$<iterations>$<saltB64>$<hashB64>              */
/* ------------------------------------------------------------------ */

export const PBKDF2_ITERATIONS = 100_000;

export const hashPassword = async (password: string): Promise<string> => {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const bits = await deriveBits(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toBase64(salt.buffer as ArrayBuffer)}$${toBase64(bits)}`;
};

export const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
  try {
    const [scheme, iterRaw, saltB64, hashB64] = stored.split('$');
    if (scheme !== 'pbkdf2') return false;
    const iterations = Math.min(Math.max(parseInt(iterRaw, 10) || 0, 10_000), 1_000_000);
    const salt = fromBase64(saltB64);
    const expected = fromBase64(hashB64);
    const bits = new Uint8Array(await deriveBits(password, salt, iterations));
    if (bits.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < bits.length; i++) diff |= bits[i] ^ expected[i];
    return diff === 0;
  } catch {
    return false;
  }
};

const deriveBits = async (
  password: string,
  salt: Uint8Array,
  iterations: number
): Promise<ArrayBuffer> => {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
    key,
    256
  );
};

/** Hash a password with a provided salt (used by the seed script, matches hashPassword format). */
export const hashPasswordWithSalt = async (
  password: string,
  saltB64: string,
  iterations = PBKDF2_ITERATIONS
): Promise<string> => {
  const bits = await deriveBits(password, fromBase64(saltB64), iterations);
  return `pbkdf2$${iterations}$${saltB64}$${toBase64(bits)}`;
};

/* ------------------------------------------------------------------ */
/* HMAC / JWT                                                          */
/* ------------------------------------------------------------------ */

const hmacKey = async (secret: string): Promise<CryptoKey> =>
  crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);

export const hmacSha256Hex = async (secret: string, message: string): Promise<string> => {
  const key = await hmacKey(secret);
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(message)));
};

export const hmacSha256B64Url = async (secret: string, message: string): Promise<string> => {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return toBase64(sig).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const hmacSha512Hex = async (secret: string, message: string): Promise<string> => {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(message)));
};

export interface JwtPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export const signJwt = async (
  payload: { id: string; role: string },
  secret: string,
  ttlSeconds: number
): Promise<string> => {
  const iat = Math.floor(Date.now() / 1000);
  const body: JwtPayload = { ...payload, iat, exp: iat + ttlSeconds };
  const head = toBase64(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).buffer as ArrayBuffer)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const data = `${head}.${toBase64(enc.encode(JSON.stringify(body)).buffer as ArrayBuffer)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')}`;
  const sig = await hmacSha256B64Url(secret, data);
  return `${data}.${sig}`;
};

export const verifyJwt = async (token: string, secret: string): Promise<JwtPayload | null> => {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [head, body, sig] = parts;
  const expected = await hmacSha256B64Url(secret, `${head}.${body}`);
  if (!safeEqual(sig, expected)) return null;
  try {
    const json = atob(body.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json) as JwtPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!payload.id) return null;
    return payload;
  } catch {
    return null;
  }
};

/* ------------------------------------------------------------------ */
/* Cookies                                                             */
/* ------------------------------------------------------------------ */

export const parseCookies = (header: string | null | undefined): Record<string, string> => {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
};

export interface CookieOptions {
  maxAge?: number;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export const serializeCookie = (name: string, value: string, opts: CookieOptions = {}): string => {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${opts.path ?? '/'}`);
  if (opts.maxAge !== undefined) parts.push(`Max-Age=${Math.floor(opts.maxAge)}`);
  if (opts.httpOnly) parts.push('HttpOnly');
  if (opts.secure) parts.push('Secure');
  parts.push(`SameSite=${opts.sameSite ?? 'Lax'}`);
  return parts.join('; ');
};

export const clearCookie = (name: string, path = '/'): string =>
  `${name}=; Path=${path}; Max-Age=0; HttpOnly; SameSite=Lax`;

/* ------------------------------------------------------------------ */
/* Misc                                                               */
/* ------------------------------------------------------------------ */

/** Escape a user string for use inside a SQL LIKE pattern. */
export const escapeLike = (input: string): string =>
  input.replace(/[\\%_]/g, (c) => `\\${c}`);

export const isEmail = (v: unknown): v is string =>
  typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) && v.length <= 254;
