const Order = require('../models/Order');

exports.getAll = async (req, res) => {
  try { res.json(await Order.find().populate('items.product').sort({ createdAt: -1 })); }
  catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Not found' });
    res.json(order);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.create = async (req, res) => {
  try { res.status(201).json(await Order.create(req.body)); }
  catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Not found' });
    res.json(order);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getUserOrders = async (req, res) => {
  try { res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 })); }
  catch (error) { res.status(500).json({ message: error.message }); }
};
