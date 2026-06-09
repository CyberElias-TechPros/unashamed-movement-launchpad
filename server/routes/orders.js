const router = require('express').Router();
const c = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};

// Admin routes with pagination
router.get('/', protect, admin, c.getAll);

// User routes with pagination
router.get('/my-orders', protect, c.getUserOrders);

// Checkout and order creation
router.post('/checkout', c.checkout);
router.post('/', validate, c.create);
router.post('/checkout-session', protect, c.createCheckoutSession);

// Bulk operations
router.post('/bulk-update-status', protect, admin, c.bulkUpdateStatus);

// Individual operations
router.get('/:id', protect, c.getById);
router.put('/:id/status', protect, admin, validate, c.updateStatus);
router.patch('/:id/status', protect, admin, validate, c.updateStatus);
router.patch('/:id/stock', protect, admin, c.updateStock);

module.exports = router;
