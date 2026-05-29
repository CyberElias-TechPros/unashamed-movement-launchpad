const router = require('express').Router();
const c = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/auth');

router.post('/', c.track);
router.get('/dashboard', protect, admin, c.dashboard);
router.get('/timeseries', protect, admin, c.timeseries);

module.exports = router;
