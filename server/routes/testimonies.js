const router = require('express').Router();
const c = require('../controllers/testimonyController');
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

// Admin routes with pagination
router.get('/manage/all', protect, admin, c.getAllForAdmin);

// Bulk operations
router.post('/bulk-approve', protect, admin, c.bulkApprove);
router.post('/bulk-reject', protect, admin, c.bulkReject);
router.post('/bulk-delete', protect, admin, c.bulkDelete);

// Individual operations
router.get('/:id', c.getById);
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('text').trim().notEmpty().withMessage('Testimony text is required'),
  body('category').optional().isString(),
], validate, c.create);
router.put('/:id', protect, admin, [
  body('isApproved').optional().isBoolean(),
  body('isFeatured').optional().isBoolean(),
  param('id').notEmpty(),
], validate, c.update);
router.delete('/:id', protect, admin, c.remove);

module.exports = router;
