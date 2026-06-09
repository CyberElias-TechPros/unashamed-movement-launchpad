const Resource = require('../models/Resource');
const { paginate, parsePaginationParams, parseSortParams } = require('../utils/pagination');

exports.getAll = async (req, res) => {
  try {
    const { type, category, search, free } = req.query;
    const { page, limit } = parsePaginationParams(req.query);
    const sort = parseSortParams(req.query, { createdAt: true, downloadCount: true, title: true }, '-createdAt');
    
    const filter = { isActive: true };
    if (type && type !== 'All') filter.type = type;
    if (category && category !== 'All') filter.category = category;
    if (free !== undefined) filter.isFree = free === 'true';
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }
    
    const result = await paginate(Resource, filter, {
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
    const { type, category, search, isActive } = req.query;
    const { page, limit } = parsePaginationParams(req.query);
    const sort = parseSortParams(req.query, { createdAt: true, downloadCount: true, title: true }, '-createdAt');
    
    const filter = {};
    if (type && type !== 'All') filter.type = type;
    if (category && category !== 'All') filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }
    
    const result = await paginate(Resource, filter, {
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

exports.trackDownload = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );
    if (!resource) return res.status(404).json({ message: 'Not found' });
    const downloadUrl = resource.downloadUrl || resource.externalUrl || resource.fileUrl;
    res.json({ downloadUrl, message: 'Download tracked', downloadCount: resource.downloadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Not found' });
    res.json(resource);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.create = async (req, res) => {
  try { res.status(201).json(await Resource.create(req.body)); }
  catch (error) { res.status(500).json({ message: error.message }); }
};

exports.update = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!resource) return res.status(404).json({ message: 'Not found' });
    res.json(resource);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.remove = async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource removed' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// Bulk operations
exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Array of IDs required' });
    }
    
    const result = await Resource.deleteMany({ _id: { $in: ids } });
    res.json({ 
      message: 'Resources deleted', 
      deletedCount: result.deletedCount 
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
    
    const result = await Resource.updateMany(
      { _id: { $in: ids } },
      { isActive }
    );
    
    res.json({
      message: 'Resources updated',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};
