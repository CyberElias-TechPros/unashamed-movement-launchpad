const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendEmail } = require('../utils/email');
const { paginate, parsePaginationParams, parseSortParams } = require('../utils/pagination');

const orderNotification = async ({ to, subject, text, html }) => {
  try {
    await sendEmail({ to, subject, text, html });
  } catch (error) {
    console.warn('Order notification email failed:', error);
  }
};

exports.getAll = async (req, res) => {
  try {
    const { status, search, startDate, endDate } = req.query;
    const { page, limit } = parsePaginationParams(req.query);
    const sort = parseSortParams(req.query, { createdAt: true, totalAmount: true, status: true }, '-createdAt');
    
    // Build filter
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
      ];
    }
    
    const result = await paginate(Order, filter, {
      page,
      limit,
      sort,
      populate: { path: 'items.product', select: 'name images' },
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

    if (!customerName || !customerEmail || !items || !items.length || totalAmount == null) {
      return res.status(400).json({ message: 'Missing required order fields' });
    }

    const reserved = [];
    try {
      for (const item of items) {
        const updated = await Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
        if (!updated) throw new Error(item.name + ' only has insufficient stock');
        reserved.push({ product: item.product, quantity: item.quantity });
      }
    } catch (err) {
      for (const r of reserved) {
        await Product.findByIdAndUpdate(r.product, { $inc: { stock: r.quantity } });
      }
      return res.status(400).json({ message: err.message });
    }

    const order = await Order.create({
      user: req.user && req.user._id,
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
      text: 'Thanks for your order ' + customerName + '. Your order ' + order._id + ' has been received and is pending processing.',
      html: '<p>Thanks for your order, <strong>' + customerName + '</strong>.</p><p>Your order <strong>' + order._id + '</strong> has been received and is pending processing.</p><p>Total: $' + order.totalAmount.toFixed(2) + '</p>',
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkout = async (req, res) => {
  try {
    const { items, customerName, customerEmail, totalAmount, shippingAddress, paymentMethod } = req.body;

    const reserved = [];
    try {
      for (const item of items) {
        const updated = await Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
        if (!updated) throw new Error(item.name + ' only has insufficient stock');
        reserved.push({ product: item.product, quantity: item.quantity });
      }
    } catch (err) {
      for (const r of reserved) {
        await Product.findByIdAndUpdate(r.product, { $inc: { stock: r.quantity } });
      }
      return res.status(400).json({ message: err.message });
    }

    const idempotencyKey = req.headers['x-idempotency-key'];
    if (idempotencyKey) {
      const existing = await Order.findOne({ idempotencyKey });
      if (existing) return res.status(200).json(existing);
    }

    const order = await Order.create({
      user: req.user && req.user._id,
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
      text: 'Thanks for your order ' + customerName + '. Your order ' + order._id + ' has been received and is pending processing.',
      html: '<p>Thanks for your order, <strong>' + customerName + '</strong>.</p><p>Your order <strong>' + order._id + '</strong> has been received and is pending processing.</p><p>Total: $' + order.totalAmount.toFixed(2) + '</p>',
    });

    res.status(201).json({
      orderId: order._id,
      sessionId: 'order_' + order._id,
      url: (process.env.CLIENT_URL || 'http://localhost:8080') + '/order-success?order=' + order._id,
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

    if (['shipped', 'delivered', 'cancelled'].indexOf(status) !== -1) {
      const subject =
        status === 'shipped'
          ? 'Your order ' + order._id + ' is on the way'
          : status === 'delivered'
          ? 'Your order ' + order._id + ' has been delivered'
          : 'Your order ' + order._id + ' has been cancelled';

      if (status === 'cancelled') {
        try {
          for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
          }
        } catch (e) {
          console.warn('Failed to release stock on cancellation', e);
        }
      }

      const html = '<p>Hi ' + order.customerName + ',</p><p>Your order <strong>' + order._id + '</strong> status has been updated to <strong>' + status + '</strong>.</p>';
      const text = 'Hi ' + order.customerName + ',\n\nYour order ' + order._id + ' status has been updated to ' + status + '.';
      orderNotification({ to: order.customerEmail, subject, html, text });
    }

    res.json(order);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getUserOrders = async (req, res) => {
  try {
    const { page, limit } = parsePaginationParams(req.query);
    const sort = parseSortParams(req.query, { createdAt: true, totalAmount: true }, '-createdAt');
    
    const result = await paginate(Order, { user: req.user._id }, {
      page,
      limit,
      sort,
      populate: { path: 'items.product', select: 'name images' },
    });
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};

exports.createCheckoutSession = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const items = req.body.items || [];
    const currency = req.body.currency || 'usd';
    const successUrl = req.body.successUrl || (process.env.CLIENT_URL || 'http://localhost:8080') + '/order-success';
    const cancelUrl = req.body.cancelUrl || process.env.CLIENT_URL || 'http://localhost:8080';
    const Stripe = require('stripe');
    const s = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;
    if (!s) {
      return res.json({ sessionId: 'dev_' + Date.now(), url: successUrl, message: 'Stripe dev mode' });
    }
    var lineItems = [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      lineItems.push({
        price_data: { currency: currency, product_data: { name: item.name }, unit_amount: item.price * 100 },
        quantity: item.quantity,
      });
    }
    const session = await s.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: lineItems,
      client_reference_id: orderId,
    });
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const stock = req.body.stock;
    const order = await Order.findByIdAndUpdate(req.params.id, { stock: stock }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk operations
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Array of order IDs required' });
    }
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    // Get orders before update to send notifications
    const orders = await Order.find({ _id: { $in: ids } });
    
    const result = await Order.updateMany(
      { _id: { $in: ids } },
      { status }
    );
    
    // Send notifications for status changes
    if (['shipped', 'delivered', 'cancelled'].includes(status)) {
      for (const order of orders) {
        const subject =
          status === 'shipped'
            ? `Your order ${order._id} is on the way`
            : status === 'delivered'
            ? `Your order ${order._id} has been delivered`
            : `Your order ${order._id} has been cancelled`;

        if (status === 'cancelled') {
          try {
            for (const item of order.items) {
              await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
            }
          } catch (e) {
            console.warn('Failed to release stock on bulk cancellation for order', order._id, e);
          }
        }
        
        const html = `<p>Hi ${order.customerName},</p><p>Your order <strong>${order._id}</strong> status has been updated to <strong>${status}</strong>.</p>`;
        const text = `Hi ${order.customerName},\n\nYour order ${order._id} status has been updated to ${status}.`;
        orderNotification({ to: order.customerEmail, subject, html, text });
      }
    }
    
    res.json({
      message: 'Orders updated',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) { 
    res.status(500).json({ message: error.message }); 
  }
};
