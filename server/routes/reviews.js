const router = require('express').Router();
const c = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/auth');

// Public routes with pagination
router.get('/product/:productId', c.getByProduct);
router.post('/product/:productId', c.create);

// Admin routes with pagination and bulk operations
router.get('/', protect, admin, c.getAll);
router.post('/bulk-approve', protect, admin, c.bulkApprove);
router.post('/bulk-reject', protect, admin, c.bulkReject);
router.post('/:id/approve', protect, admin, c.approve);
router.delete('/:id', protect, admin, c.remove);

module.exports = router;
