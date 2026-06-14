const router = require('express').Router();
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const { protect, admin } = require('../middleware/auth');

const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      cb(null, UPLOAD_DIR);
    } catch (e) {
      cb(e);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '');
    const safeName = `${base}-${Date.now()}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({ storage });

router.post('/cloudinary', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const url = `/uploads/${req.file.filename}`;
    return res.json({ url, filename: req.file.filename });
  } catch (error) {
    console.error('Upload endpoint error', error);
    if (!res.headersSent) res.status(500).json({ message: error.message });
  }
});

router.get('/cloudinary', protect, admin, async (req, res) => {
  try {
    let files = [];
    try { files = await fs.readdir(UPLOAD_DIR); } catch { files = []; }
    files = files.filter((f) => /\.(jpg|jpeg|png|gif|webp|mp4|webm|ogg)$/i.test(f));
    const items = await Promise.all(
      files.map(async (f) => ({
        id: f,
        url: `/uploads/${f}`,
        publicId: f,
        createdAt: (await fs.stat(path.join(UPLOAD_DIR, f)).catch(() => ({ mtime: new Date() }))).mtime,
      }))
    );
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/cloudinary/:filename', async (req, res) => {
  try {
    const target = path.join(UPLOAD_DIR, req.params.filename);
    await fs.unlink(target);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
