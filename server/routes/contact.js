const router = require('express').Router();
const c = require('../controllers/contactController');
const { contactLimiter } = require('../middleware/rateLimit');

router.post('/', contactLimiter, c.submit);
router.post('/spam-check', contactLimiter, c.spamCheck);

module.exports = router;
