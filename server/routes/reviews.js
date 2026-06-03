const router = require('express').Router();
const c = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/auth');

router.get('/product/:productId', c.getByProduct);
router.post('/product/:productId', c.create);

router.get('/', protect, admin, c.getAll);
router.post('/:id/approve', protect, admin, c.approve);
router.delete('/:id', protect, admin, c.remove);

module.exports = router;
