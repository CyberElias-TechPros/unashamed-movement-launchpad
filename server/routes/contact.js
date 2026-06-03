const router = require('express').Router();
const c = require('../controllers/contactController');
const { contactLimiter } = require('../middleware/rateLimit');
const { csrfProtection } = require('../middleware/csrf');
const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};

router.post('/', contactLimiter, csrfProtection, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
], validate, c.submit);
router.post('/spam-check', contactLimiter, csrfProtection, [
  body('email').isEmail().normalizeEmail(),
  body('message').optional().isString(),
], validate, c.spamCheck);

module.exports = router;
