const router = require('express').Router();
const c = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/auth');

router.get('/', c.getAll);
router.put('/', protect, admin, c.update);

module.exports = router;
