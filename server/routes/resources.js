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

// Public routes with pagination
router.get('/', c.getAll);
router.post('/:id/download', [
  param('id').notEmpty(),
], validate, c.trackDownload);

// Admin routes with pagination
router.get('/admin/all', protect, admin, c.getAllAdmin);

// Bulk operations
router.post('/bulk-delete', protect, admin, c.bulkDelete);
router.post('/bulk-update-status', protect, admin, c.bulkUpdateStatus);

// Individual operations
router.get('/:id', c.getById);
router.post('/', protect, admin, [
  body('title').trim().notEmpty(),
  body('author').optional().trim(),
  body('type').isIn(['book', 'devotional', 'guide', 'article', 'podcast']),
  body('category').optional().isString(),
  body('free').optional().isBoolean(),
], validate, c.create);
router.put('/:id', protect, admin, [
  body('title').optional().trim(),
  body('type').optional().isIn(['book', 'devotional', 'guide', 'article', 'podcast']),
  body('free').optional().isBoolean(),
], validate, c.update);
router.delete('/:id', protect, admin, c.remove);

module.exports = router;
