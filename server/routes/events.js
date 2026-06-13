const router = require('express').Router();
const c = require('../controllers/eventController');
const { protect, admin } = require('../middleware/auth');
const { body, validationResult, param } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};

router.get('/', c.getAll);
router.post('/register', [
  body('attendeeName').trim().notEmpty(),
  body('attendeeEmail').isEmail().normalizeEmail(),
  body('eventId').notEmpty(),
], validate, c.register);
router.get('/:id/registrations', c.getRegistrationCount);
router.get('/:id', c.getById);
router.post('/', protect, admin, [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('date').isISO8601(),
  body('location').optional().isString(),
], validate, c.create);
router.put('/:id', protect, admin, [
  body('title').optional().trim(),
  body('description').optional().trim(),
  body('date').optional().isISO8601(),
], validate, c.update);
router.delete('/:id', protect, admin, c.remove);

module.exports = router;
