const router = require('express').Router();
const c = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, c.getAll);
router.get('/my-orders', protect, c.getUserOrders);
router.get('/:id', protect, c.getById);
router.post('/', c.create);
router.put('/:id/status', protect, admin, c.updateStatus);

module.exports = router;
