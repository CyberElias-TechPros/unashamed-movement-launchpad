const router = require('express').Router();
const c = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, c.getAll);
router.get('/my-orders', protect, c.getUserOrders);
router.post('/checkout', c.checkout);
router.post('/', c.create);
router.get('/:id', protect, c.getById);
router.put('/:id/status', protect, admin, c.updateStatus);
router.patch('/:id/status', protect, admin, c.updateStatus);

module.exports = router;
