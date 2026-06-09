const router = require('express').Router();
const multer = require('multer');
const upload = multer();

router.post('/cloudinary', upload.single('file'), async (req, res) => {
  try {
    if (process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)) {
      try {
        const cloudinary = require('cloudinary').v2;
        if (process.env.CLOUDINARY_URL) cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
        else cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        if (req.file && req.file.buffer) {
          const stream = cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
            if (error) return res.status(500).json({ message: 'Upload failed', error });
            res.json({ url: result.secure_url, provider: 'cloudinary' });
          });
          const bufStream = require('stream').Readable.from(req.file.buffer);
          bufStream.pipe(stream);
          return;
        }

        if (req.body.url) {
          const result = await cloudinary.uploader.upload(req.body.url, { resource_type: 'auto' });
          return res.json({ url: result.secure_url, provider: 'cloudinary' });
        }
      } catch (e) {
        console.warn('Cloudinary upload failed', e);
      }
    }

    if (req.body.url) return res.json({ url: req.body.url, provider: 'fallback' });

    return res.status(400).json({ message: 'No upload configured or no file/url provided' });
  } catch (error) {
    console.error('Upload endpoint error', error);
    res.status(500).json({ message: error.message });
  }
});

const fs = require('fs').promises;
const path = require('path');

router.get('/cloudinary', async (req, res) => {
  try {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    let files = [];
    try { files = await fs.readdir(uploadDir); } catch { files = []; }
    files = files.filter((f) => /\.(jpg|jpeg|png|gif|webp|mp4|webm|ogg)$/i.test(f));
    const items = await Promise.all(
      files.map(async (f) => ({
        id: f,
        url: `/uploads/${f}`,
        publicId: f,
        createdAt: (await fs.stat(path.join(uploadDir, f)).catch(() => ({ mtime: new Date() }))).mtime,
      }))
    );
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
