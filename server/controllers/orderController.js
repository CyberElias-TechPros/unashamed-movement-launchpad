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
  try {
    const {
      customerName,
      customerEmail,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
    } = req.body;

    if (!customerName || !customerEmail || !items?.length || totalAmount == null) {
      return res.status(400).json({ message: 'Missing required order fields' });
    }

    const order = await Order.create({
      customerName,
      customerEmail,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || '',
      status: 'pending',
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkout = async (req, res) => {
  try {
    const order = await Order.create({
      ...req.body,
      status: 'pending',
    });
    res.status(201).json({
      orderId: order._id,
      sessionId: `order_${order._id}`,
      url: `${process.env.CLIENT_URL || 'http://localhost:8080'}/order-success?order=${order._id}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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
