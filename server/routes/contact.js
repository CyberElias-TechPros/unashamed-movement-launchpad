const router = require('express').Router();
const c = require('../controllers/contactController');
const { contactLimiter } = require('../middleware/rateLimit');
const { body, validationResult } = require('express-validator');

// NOTE: public contact endpoints intentionally do not use CSRF protection —
// they are unauthenticated forms hardened with rate limiting, input
// sanitization, and validation (mirrors the public testimonies endpoint).
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};

router.post('/', contactLimiter, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
], validate, c.submit);
router.post('/spam-check', contactLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('message').optional().isString(),
], validate, c.spamCheck);

module.exports = router;
