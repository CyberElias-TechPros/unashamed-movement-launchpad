const Testimony = require('../models/Testimony');
const { paginate, parsePaginationParams, parseSortParams } = require('../utils/pagination');

exports.getAll = async (req, res) => {
  try {
    const { category, search } = req.query;
    const { page, limit } = parsePaginationParams(req.query);
    const sort = parseSortParams(req.query, { createdAt: true, category: true }, '-createdAt');
    
    const filter = { isApproved: true };
    if (category && category !== 'All') filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { text: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }
    
    const result = await paginate(Testimony, filter, {
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
    const testimony = await Testimony.findById(req.params.id);
    if (!testimony) return res.status(404).json({ message: 'Not found' });
    res.json(testimony);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.create = async (req, res) => {
  try {
    const { content, text, ...rest } = req.body;
    const testimony = await Testimony.create({
      ...rest,
      text: text || content,
    });
    res.status(201).json(testimony);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getAllForAdmin = async (req, res) => {
  try {
    const { category, isApproved, search } = req.query;
    const { page, limit } = parsePaginationParams(req.query);
    const sort = parseSortParams(req.query, { createdAt: true, category: true }, '-createdAt');
    
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { text: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }
    
    const result = await paginate(Testimony, filter, {
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

exports.update = async (req, res) => {
  try {
    const testimony = await Testimony.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!testimony) return res.status(404).json({ message: 'Not found' });
    res.json(testimony);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.remove = async (req, res) => {
  try {
    await Testimony.findByIdAndDelete(req.params.id);
    res.json({ message: 'Testimony removed' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// Bulk operations
exports.bulkApprove = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Array of IDs required' });
    }
    
    const result = await Testimony.updateMany(
      { _id: { $in: ids } },
      { isApproved: true }
    );
    
    res.json({
      message: 'Testimonies approved',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};

exports.bulkReject = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Array of IDs required' });
    }
    
    const result = await Testimony.deleteMany({ _id: { $in: ids } });
    
    res.json({
      message: 'Testimonies rejected',
      deletedCount: result.deletedCount,
    });
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};
