const router = require('express').Router();
const c = require('../controllers/contentController');
const { protect, admin } = require('../middleware/auth');

router.get('/', c.getAll);
router.get('/:key', c.getByKey);
router.post('/', protect, admin, c.upsert);
router.put('/:key', protect, admin, c.upsert);
router.delete('/:key', protect, admin, c.remove);

module.exports = router;
