const Video = require('../models/Video');

exports.getAll = async (req, res) => {
  try { res.json(await Video.find({ isActive: true }).sort({ order: 1 })); }
  catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Not found' });
    res.json(video);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.create = async (req, res) => {
  try { res.status(201).json(await Video.create(req.body)); }
  catch (error) { res.status(500).json({ message: error.message }); }
};

exports.update = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!video) return res.status(404).json({ message: 'Not found' });
    res.json(video);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getFeed = async (req, res) => {
  try { res.json(await Video.find({ isActive: true }).sort({ order: 1 })); }
  catch (error) { res.status(500).json({ message: error.message }); }
};

exports.upload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const ext = req.file.originalname.split('.').pop();
    const fs = require('fs').promises;
    const path = require('path');
    const uploadDir = path.join(__dirname, '../../public/uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    const filename = `video-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    await fs.writeFile(path.join(uploadDir, filename), req.file.buffer);
    const video = await Video.create({
      title: req.body.title || filename,
      description: req.body.description || '',
      url: `/uploads/${filename}`,
      thumbnail: req.body.thumbnail || '',
      isActive: true,
    });
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: 'Video removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
