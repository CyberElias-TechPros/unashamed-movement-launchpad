const router = require('express').Router();
const c = require('../controllers/productController');
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
router.get('/:id/stock', c.getStock);
router.post('/:id/subscribe-stock', c.subscribeStock);
router.get('/:id', c.getById);
router.post('/', protect, admin, [
  body('name').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('category').isIn(['merch', 'digital']),
], validate, c.create);
router.put('/:id', protect, admin, [
  body('name').optional().trim(),
  body('price').optional().isFloat({ min: 0 }),
  body('category').optional().isIn(['merch', 'digital']),
], validate, c.update);
router.delete('/:id', protect, admin, c.remove);

module.exports = router;
