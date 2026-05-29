const router = require('express').Router();
const c = require('../controllers/testimonyController');
const { protect, admin } = require('../middleware/auth');

router.get('/', c.getAll);
router.get('/manage/all', protect, admin, c.getAllForAdmin);
router.get('/:id', c.getById);
router.post('/', c.create); // Public submission
router.put('/:id', protect, admin, c.update);
router.delete('/:id', protect, admin, c.remove);

module.exports = router;
