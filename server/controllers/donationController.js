const Donation = require('../models/Donation');

const successUrl = () => (process.env.CLIENT_URL || 'http://localhost:8080') + '/donate?status=success';
const cancelUrl = () => (process.env.CLIENT_URL || 'http://localhost:8080') + '/donate?status=cancelled';

exports.getAll = async (req, res) => {
  try { res.json(await Donation.find().sort({ createdAt: -1 })); }
  catch (error) { res.status(500).json({ message: error.message }); }
};

exports.create = async (req, res) => {
  try { res.status(201).json(await Donation.create(req.body)); }
  catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Not found' });
    res.json(donation);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createCheckout = async (req, res) => {
  try {
    const amount = req.body.amount;
    const email = req.body.email;
    const Stripe = require('stripe');
    const s = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;
    if (!s) {
      return res.json({ sessionId: 'dev_' + Date.now(), url: process.env.CLIENT_URL || 'http://localhost:8080/donate' });
    }
    const session = await s.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: successUrl(),
      cancel_url: cancelUrl(),
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Donation' },
            unit_amount: Math.round((amount || 10) * 100),
          },
          quantity: 1,
        },
      ],
    });
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const Stripe = require('stripe');
    const s = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;
    if (!s) return res.json({ status: 'completed', amount: 0 });
    const session = await s.checkout.sessions.retrieve(req.params.paymentIntentId);
    const amt = session.amount_total ? session.amount_total / 100 : 0;
    res.json({ status: session.payment_status, amount: amt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
