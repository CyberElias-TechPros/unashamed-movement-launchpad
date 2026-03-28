const router = require('express').Router();
const c = require('../controllers/donationController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, c.getAll);
router.get('/:id', protect, admin, c.getById);
router.post('/', c.create);

module.exports = router;
