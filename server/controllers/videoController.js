const Video = require('../models/Video');
const { paginate, parsePaginationParams, parseSortParams } = require('../utils/pagination');

exports.getAll = async (req, res) => {
  try {
    const { search } = req.query;
    const { page, limit } = parsePaginationParams(req.query);
    const sort = parseSortParams(req.query, { order: true, createdAt: true, title: true }, 'order');
    
    const filter = { isActive: true };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { episode: { $regex: search, $options: 'i' } },
      ];
    }
    
    const result = await paginate(Video, filter, {
      page,
      limit,
      sort,
    });
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};

exports.getAllAdmin = async (req, res) => {
  try {
    const { search, isActive } = req.query;
    const { page, limit } = parsePaginationParams(req.query);
    const sort = parseSortParams(req.query, { order: true, createdAt: true, title: true }, 'order');
    
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { episode: { $regex: search, $options: 'i' } },
      ];
    }
    
    const result = await paginate(Video, filter, {
      page,
      limit,
      sort,
    });
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
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
  try { 
    res.json(await Video.find({ isActive: true }).sort({ order: 1 })); 
  }
  catch (error) { res.status(500).json({ message: error.message }); }
};

exports.upload = async (req, res) => {
  try {
    const uploadedFile = req.file || req.files?.file?.[0] || req.files?.video?.[0];
    if (!uploadedFile) return res.status(400).json({ message: 'No file uploaded' });
    const ext = uploadedFile.originalname.split('.').pop();
    const fs = require('fs').promises;
    const path = require('path');
    const uploadDir = path.join(__dirname, '../../public/uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    const filename = `video-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    await fs.writeFile(path.join(uploadDir, filename), uploadedFile.buffer);
    const video = await Video.create({
      title: req.body.title || filename,
      description: req.body.description || '',
      youtubeUrl: `/uploads/${filename}`,
      thumbnailUrl: req.body.thumbnail || '',
      episode: req.body.episode || '',
      duration: req.body.duration || '',
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

// Bulk operations
exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Array of IDs required' });
    }
    
    const result = await Video.deleteMany({ _id: { $in: ids } });
    res.json({ 
      message: 'Videos deleted', 
      deletedCount: result.deletedCount 
    });
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};

// Applies arbitrary whitelisted field updates to many videos at once.
exports.bulkUpdate = async (req, res) => {
  try {
    const { ids, data } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Array of IDs required' });
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({ message: 'data object required' });
    }
    const allowed = ['title', 'description', 'category', 'type', 'isActive', 'isPublished', 'order', 'episode', 'duration'];
    const update = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(data, key)) update[key] = data[key];
    }
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: 'No updatable fields provided' });
    }

    const result = await Video.updateMany({ _id: { $in: ids } }, { $set: update });
    res.json({
      message: 'Videos updated',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, isActive } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Array of IDs required' });
    }
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive boolean required' });
    }

    const result = await Video.updateMany(
      { _id: { $in: ids } },
      { isActive }
    );
    
    res.json({
      message: 'Videos updated',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};
