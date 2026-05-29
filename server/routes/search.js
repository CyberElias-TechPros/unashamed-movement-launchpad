const router = require('express').Router();
const Product = require('../models/Product');
const Resource = require('../models/Resource');
const Testimony = require('../models/Testimony');

router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.json({ products: [], resources: [], testimonies: [] });
    }

    const regex = new RegExp(q, 'i');
    const [products, resources, testimonies] = await Promise.all([
      Product.find({ isActive: true, $or: [{ name: regex }, { description: regex }] }).limit(10),
      Resource.find({ isActive: true, $or: [{ title: regex }, { description: regex }] }).limit(10),
      Testimony.find({ isApproved: true, $or: [{ text: regex }, { name: regex }] }).limit(10),
    ]);

    res.json({ products, resources, testimonies });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
