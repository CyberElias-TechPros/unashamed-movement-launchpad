const router = require('express').Router();
const { register, login, getProfile, updateProfile, forgotPassword, resetPassword, sendVerification, verifyEmail } = require('../controllers/authController');
const { protect, setAuthCookies, refreshToken: issueRefreshToken, logout } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const { csrfProtection, setCsrfCookie, getCsrfToken, generateCsrfToken, generateSessionId } = require('../middleware/csrf');
const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};

router.get('/csrf-token', (req, res) => {
  const sessionId = req.cookies?.sessionId || generateSessionId();
  setCsrfCookie(res, sessionId);
  // Derive the token from the session id we just issued — reading it back
  // from req.cookies would return null on a visitor's very first request.
  res.json({ csrfToken: generateCsrfToken(sessionId) });
});

router.post('/register', authLimiter, csrfProtection, [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
], validate, register);

router.post('/login', authLimiter, csrfProtection, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], validate, login);

router.post('/forgot-password', authLimiter, [
  body('email').isEmail().normalizeEmail(),
], validate, forgotPassword);

router.post('/send-verification', authLimiter, [
  body('email').isEmail().normalizeEmail(),
], validate, sendVerification);

router.post('/verify-email', authLimiter, [
  body('token').notEmpty(),
], validate, verifyEmail);

router.post('/reset-password', csrfProtection, [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
], validate, resetPassword);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, csrfProtection, [
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('password').optional().isLength({ min: 8 }),
], validate, updateProfile);

router.post('/refresh', issueRefreshToken);
router.post('/logout', logout);

module.exports = router;
