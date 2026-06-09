const router = require('express').Router();
const c = require('../controllers/donationController');
const { protect, admin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};

router.get('/', protect, admin, c.getAll);
router.get('/:id', protect, admin, c.getById);
router.post('/', [
  body('donorName').optional().trim(),
  body('donorEmail').optional().isEmail().normalizeEmail(),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
  body('type').isIn(['one-time', 'monthly']),
], validate, c.create);

router.post('/checkout', c.createCheckout);
router.get('/verify/:paymentIntentId', c.verifyPayment);

module.exports = router;
