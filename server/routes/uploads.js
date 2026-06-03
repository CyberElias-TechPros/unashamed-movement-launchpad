const router = require('express').Router();
const multer = require('multer');
const upload = multer();

router.post('/cloudinary', upload.single('file'), async (req, res) => {
  try {
    // If Cloudinary config present, try to upload using cloudinary SDK
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
          const resu = await cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
            if (error) return res.status(500).json({ message: 'Upload failed', error });
            res.json({ url: result.secure_url, provider: 'cloudinary' });
          });
          // pipe buffer
          const stream = cloudinary.uploader.upload_stream({ resource_type: 'auto' }, () => {});
          stream.end(req.file.buffer);
          return;
        }

        if (req.body.url) {
          // remote fetch
          const result = await cloudinary.uploader.upload(req.body.url, { resource_type: 'auto' });
          return res.json({ url: result.secure_url, provider: 'cloudinary' });
        }
      } catch (e) {
        console.warn('Cloudinary upload failed', e);
      }
    }

    // Fallback: accept provided URL or return not-available
    if (req.body.url) return res.json({ url: req.body.url, provider: 'fallback' });

    return res.status(400).json({ message: 'No upload configured or no file/url provided' });
  } catch (error) {
    console.error('Upload endpoint error', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
