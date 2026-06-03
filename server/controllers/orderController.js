const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendEmail } = require('../utils/email');

const orderNotification = async ({ to, subject, text, html }) => {
  try {
    await sendEmail({ to, subject, text, html });
  } catch (error) {
    console.warn('Order notification email failed:', error);
  }
};

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

    // Reserve stock atomically
    const reserved = [];
    try {
      for (const item of items) {
        const updated = await Product.findOneAndUpdate(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
        if (!updated) throw new Error(`${item.name} only has insufficient stock`);
        reserved.push({ productId: item.productId, quantity: item.quantity });
      }
    } catch (err) {
      // rollback
      for (const r of reserved) {
        await Product.findByIdAndUpdate(r.productId, { $inc: { stock: r.quantity } });
      }
      return res.status(400).json({ message: err.message });
    }

    const order = await Order.create({
      user: req.user?._id,
      customerName,
      customerEmail,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || '',
      status: 'pending',
    });

    orderNotification({
      to: customerEmail,
      subject: 'Order received',
      text: `Thanks for your order ${customerName}. Your order ${order._id} has been received and is pending processing.`,
      html: `<p>Thanks for your order, <strong>${customerName}</strong>.</p><p>Your order <strong>${order._id}</strong> has been received and is pending processing.</p><p>Total: $${order.totalAmount.toFixed(2)}</p>`,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkout = async (req, res) => {
  try {
    const { items, customerName, customerEmail, totalAmount, shippingAddress, paymentMethod } = req.body;

    // Reserve stock atomically
    const reserved = [];
    try {
      for (const item of items) {
        const updated = await Product.findOneAndUpdate(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
        if (!updated) throw new Error(`${item.name} only has insufficient stock`);
        reserved.push({ productId: item.productId, quantity: item.quantity });
      }
    } catch (err) {
      // rollback
      for (const r of reserved) {
        await Product.findByIdAndUpdate(r.productId, { $inc: { stock: r.quantity } });
      }
      return res.status(400).json({ message: err.message });
    }

    const idempotencyKey = req.headers['x-idempotency-key'];
    if (idempotencyKey) {
      const existing = await Order.findOne({ idempotencyKey });
      if (existing) return res.status(200).json(existing);
    }

    const order = await Order.create({
      user: req.user?._id,
      customerName,
      customerEmail,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || '',
      idempotencyKey,
      status: 'pending',
    });

    orderNotification({
      to: customerEmail,
      subject: 'Order received',
      text: `Thanks for your order ${customerName}. Your order ${order._id} has been received and is pending processing.`,
      html: `<p>Thanks for your order, <strong>${customerName}</strong>.</p><p>Your order <strong>${order._id}</strong> has been received and is pending processing.</p><p>Total: $${order.totalAmount.toFixed(2)}</p>`,
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
    const status = req.body.status;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Not found' });

    if (['shipped', 'delivered', 'cancelled'].includes(status)) {
      const subject =
        status === 'shipped'
          ? `Your order ${order._id} is on the way`
          : status === 'delivered'
          ? `Your order ${order._id} has been delivered`
          : `Your order ${order._id} has been cancelled`;

      // On cancellation, release reserved stock
      if (status === 'cancelled') {
        try {
          for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
          }
        } catch (e) {
          console.warn('Failed to release stock on cancellation', e);
        }
      }

      const html = `<p>Hi ${order.customerName},</p><p>Your order <strong>${order._id}</strong> status has been updated to <strong>${status}</strong>.</p>`;
      const text = `Hi ${order.customerName},\n\nYour order ${order._id} status has been updated to ${status}.`;
      orderNotification({ to: order.customerEmail, subject, html, text });
    }

    res.json(order);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getUserOrders = async (req, res) => {
  try { res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 })); }
  catch (error) { res.status(500).json({ message: error.message }); }
};
