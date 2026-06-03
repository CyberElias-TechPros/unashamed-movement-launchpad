const router = require('express').Router();
const c = require('../controllers/resourceController');
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
router.post('/:id/download', [
  param('id').notEmpty(),
], validate, c.trackDownload);
router.get('/:id', c.getById);
router.post('/', protect, admin, [
  body('title').trim().notEmpty(),
  body('author').optional().trim(),
  body('type').isIn(['book', 'devotional', 'guide', 'sermon', 'other']),
  body('category').optional().isString(),
  body('free').optional().isBoolean(),
], validate, c.create);
router.put('/:id', protect, admin, [
  body('title').optional().trim(),
  body('type').optional().isIn(['book', 'devotional', 'guide', 'sermon', 'other']),
  body('free').optional().isBoolean(),
], validate, c.update);
router.delete('/:id', protect, admin, c.remove);

module.exports = router;
