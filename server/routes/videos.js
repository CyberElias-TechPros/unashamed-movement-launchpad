const router = require('express').Router();
const c = require('../controllers/videoController');
const { protect, admin } = require('../middleware/auth');
const { body, validationResult, param } = require('express-validator');
const multer = require('multer');
const upload = multer({ storage: multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      await fs.mkdir(path.join(__dirname, '../../public/uploads'), { recursive: true });
      cb(null, path.join(__dirname, '../../public/uploads'));
    } catch (e) {
      cb(e);
    }
  },
  filename: (req, file, cb) => {
    const path = require('path');
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '');
    cb(null, `${base}-${Date.now()}${ext}`);
  },
})});

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};

// Public routes with pagination
router.get('/', c.getAll);
router.get('/feed', c.getFeed);

// Admin routes with pagination
router.get('/admin/all', protect, admin, c.getAllAdmin);

// Bulk operations
router.post('/bulk-delete', protect, admin, c.bulkDelete);
router.post('/bulk-update', protect, admin, c.bulkUpdate);
router.post('/bulk-update-status', protect, admin, c.bulkUpdateStatus);

// Individual operations
router.get('/:id', c.getById);
router.post('/', protect, admin, [
  body('title').trim().notEmpty(),
  body('description').optional().trim(),
  body('youtubeUrl').isURL(),
  body('thumbnailUrl').optional().isURL(),
  body('episode').optional().isString(),
  body('duration').optional().isString(),
], validate, c.create);
router.put('/:id', protect, admin, [
  body('title').optional().trim(),
  body('youtubeUrl').optional().isURL(),
], validate, c.update);
router.delete('/:id', protect, admin, c.remove);
router.post('/upload', protect, admin, upload.fields([{ name: 'file', maxCount: 1 }, { name: 'video', maxCount: 1 }]), c.upload);

module.exports = router;
