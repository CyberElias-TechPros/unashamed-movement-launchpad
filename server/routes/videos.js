const router = require('express').Router();
const c = require('../controllers/videoController');
const { protect, admin } = require('../middleware/auth');
const { body, validationResult, param } = require('express-validator');
const multer = require('multer');
const upload = multer();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};

router.get('/', c.getAll);
router.get('/feed', c.getFeed);
router.get('/:id', c.getById);
router.post('/', protect, admin, [
  body('title').trim().notEmpty(),
  body('description').optional().trim(),
  body('url').isURL(),
  body('thumbnail').optional().isURL(),
  body('category').optional().isString(),
], validate, c.create);
router.put('/:id', protect, admin, [
  body('title').optional().trim(),
  body('url').optional().isURL(),
], validate, c.update);
router.delete('/:id', protect, admin, c.remove);
router.post('/upload', protect, admin, upload.single('file'), c.upload);

module.exports = router;
