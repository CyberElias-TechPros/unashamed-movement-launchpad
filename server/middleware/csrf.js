const crypto = require('crypto');

const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

const generateCsrfToken = (sessionId) => {
  return crypto
    .createHmac('sha256', process.env.CSRF_SECRET || 'csrf-secret-change-in-production')
    .update(sessionId)
    .digest('hex');
};

const verifyCsrfToken = (token, sessionId) => {
  try {
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return false;
    const expected = generateCsrfToken(sessionId);
    return crypto.timingSafeEqual(Buffer.from(token, 'utf8'), Buffer.from(expected, 'utf8'));
  } catch {
    return false;
  }
};

const csrfProtection = (req, res, next) => {
  const method = req.method.toLowerCase();
  if (['get', 'head', 'options'].includes(method)) {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionId = req.cookies?.sessionId;

  if (!csrfToken || !sessionId || !verifyCsrfToken(csrfToken, sessionId)) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  next();
};

const generateSessionId = () => crypto.randomBytes(32).toString('hex');

const setCsrfCookie = (res, sessionId) => {
  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: CSRF_TOKEN_EXPIRY,
    path: '/',
  });
};

const getCsrfToken = (req) => {
  const sessionId = req.cookies?.sessionId;
  if (!sessionId) return null;
  return generateCsrfToken(sessionId);
};

module.exports = {
  csrfProtection,
  generateSessionId,
  setCsrfCookie,
  getCsrfToken,
  generateCsrfToken,
};
