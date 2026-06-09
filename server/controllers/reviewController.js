const Review = require('../models/Review');
const { paginate, parsePaginationParams, parseSortParams } = require('../utils/pagination');

exports.getByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page, limit } = parsePaginationParams(req.query);
    const sort = parseSortParams(req.query, { createdAt: true, rating: true }, '-createdAt');
    
    const result = await paginate(Review, { product: productId, approved: true }, {
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

exports.create = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, email, rating, title, body } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating is required (1-5)' });
    const review = await Review.create({ product: productId, name, email, rating, title, body, approved: false });
    res.status(201).json(review);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getAll = async (req, res) => {
  try {
    const { approved, product, rating } = req.query;
    const { page, limit } = parsePaginationParams(req.query);
    const sort = parseSortParams(req.query, { createdAt: true, rating: true }, '-createdAt');
    
    const filter = {};
    if (approved !== undefined) filter.approved = approved === 'true';
    if (product) filter.product = product;
    if (rating) filter.rating = Number(rating);
    
    const result = await paginate(Review, filter, {
      page,
      limit,
      sort,
      populate: { path: 'product', select: 'name' },
    });
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};

exports.approve = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    if (!review) return res.status(404).json({ message: 'Not found' });
    res.json(review);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.remove = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// Bulk operations
exports.bulkApprove = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Array of IDs required' });
    }
    
    const result = await Review.updateMany(
      { _id: { $in: ids } },
      { approved: true }
    );
    
    res.json({
      message: 'Reviews approved',
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
    
    const result = await Review.deleteMany({ _id: { $in: ids } });
    
    res.json({
      message: 'Reviews rejected',
      deletedCount: result.deletedCount,
    });
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};
