const Product = require('../models/Product');
const BackInStock = require('../models/BackInStock');
const Review = require('../models/Review');
const { sendEmail } = require('../utils/email');
const { paginate, parsePaginationParams, parseSortParams } = require('../utils/pagination');

const attachRatingStats = (products, stats) => {
  const statsById = stats.reduce((acc, stat) => {
    acc[stat._id.toString()] = stat;
    return acc;
  }, {});

  return products.map((product) => {
    const item = product.toObject ? product.toObject() : product;
    const stat = statsById[item._id.toString()];
    return {
      ...item,
      averageRating: stat?.avgRating || 0,
      reviewCount: stat?.count || 0,
    };
  });
};

exports.getAll = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, inStock } = req.query;
    const { page, limit, skip } = parsePaginationParams(req.query);
    const sort = parseSortParams(req.query, { price: true, createdAt: true, name: true }, '-createdAt');
    
    // Build filter
    const filter = { isActive: true };
    if (category && category !== 'all') filter.category = category;
    if (minPrice !== undefined) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice !== undefined) filter.price = { ...filter.price, $lte: Number(maxPrice) };
    if (inStock === 'true') filter.stock = { $gt: 0 };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tag: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Get paginated results
    const result = await paginate(Product, filter, {
      page,
      limit,
      sort,
    });
    
    // Attach rating stats
    const productIds = result.data.map((p) => p._id);
    const ratingStats = productIds.length
      ? await Review.aggregate([
          { $match: { product: { $in: productIds }, approved: true } },
          { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
        ])
      : [];
    
    res.json({
      success: true,
      data: attachRatingStats(result.data, ratingStats),
      pagination: result.pagination,
    });
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};

exports.getAllAdmin = async (req, res) => {
  try {
    const { category, search, isActive } = req.query;
    const { page, limit } = parsePaginationParams(req.query);
    const sort = parseSortParams(req.query, { price: true, createdAt: true, name: true, stock: true }, '-createdAt');
    
    // Build filter for admin (can see all products)
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tag: { $regex: search, $options: 'i' } },
      ];
    }
    
    const result = await paginate(Product, filter, {
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
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Not found' });

    const stats = await Review.aggregate([
      { $match: { product: product._id, approved: true } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const stat = stats[0] || { avgRating: 0, count: 0 };

    res.json({
      ...product.toObject(),
      averageRating: stat.avgRating || 0,
      reviewCount: stat.count || 0,
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('stock');
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json({ stock: product.stock });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.create = async (req, res) => {
  try {
    const p = await Product.create(req.body);
    res.status(201).json(p);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.update = async (req, res) => {
  try {
    const prev = await Product.findById(req.params.id).select('stock name');
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Not found' });

    // If stock increased, notify subscribers
    try {
      const prevStock = prev?.stock ?? null;
      const newStock = product.stock;
      if (prevStock != null && newStock != null && newStock > prevStock) {
        const subs = await BackInStock.find({ product: product._id });
        for (const s of subs) {
          try {
            await sendEmail({
              to: s.email,
              subject: `${product.name} is back in stock!`,
              text: `${product.name} is back in stock. Visit the store to purchase: ${process.env.CLIENT_URL || 'http://localhost:8080'}/shop/${product._id}`,
              html: `<p>${product.name} is back in stock. <a href="${process.env.CLIENT_URL || 'http://localhost:8080'}/shop/${product._id}">Buy now</a></p>`,
            });
          } catch (e) {
            console.warn('Failed to email back-in-stock subscriber', e);
          }
        }
        // remove subscribers after notifying
        await BackInStock.deleteMany({ product: product._id });
      }
    } catch (e) {
      console.warn('Back-in-stock notification failed', e);
    }

    res.json(product);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.subscribeStock = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const productId = req.params.id;
    const sub = await BackInStock.findOneAndUpdate(
      { product: productId, email },
      { product: productId, email },
      { upsert: true, new: true }
    );
    res.json({ message: 'Subscribed', sub });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.remove = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// Bulk operations
exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Array of IDs required' });
    }
    
    const result = await Product.deleteMany({ _id: { $in: ids } });
    res.json({ 
      message: 'Products deleted', 
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
    
    const result = await Product.updateMany(
      { _id: { $in: ids } },
      { isActive }
    );
    
    res.json({
      message: 'Products updated',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};
