const express = require('express');
const mongoose = require('mongoose');
const router = require('express').Router();
const Stripe = require('stripe');
const crypto = require('crypto');
const Order = require('../models/Order');
const axios = require('axios');

const clientUrl = () => process.env.CLIENT_URL || 'http://localhost:8080';

const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

const verifyWebhookSignature = (body, signature, secret, algorithm = 'sha256') => {
  try {
    if (!signature || !secret) return false;
    const expectedSignature = crypto
      .createHmac(algorithm, secret)
      .update(body, 'utf8')
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
};

const updateOrderStatus = async ({ orderId, status, paymentId, paymentMethod }) => {
  if (!orderId) return null;
  const query = mongoose.Types.ObjectId.isValid(orderId)
    ? { _id: orderId }
    : { $or: [{ idempotencyKey: orderId }, { paymentId: orderId }] };

  const updates = { status };
  if (paymentId) updates.paymentId = paymentId;
  if (paymentMethod) updates.paymentMethod = paymentMethod;
  return Order.findOneAndUpdate(query, updates, { new: true });
};

const stripeInitializeInfo = (req, res) => {
  res.json({ configured: !!stripe, message: stripe ? 'Stripe configured' : 'Stripe dev mode' });
};
router.get('/stripe/initialize', stripeInitializeInfo);
router.post('/stripe/initialize', stripeInitializeInfo);

router.get('/paystack/verify/:reference', async (req, res) => {
  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${req.params.reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    res.json(response.data);
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || 'Verify failed';
    res.status(500).json({ status: false, message });
  }
});

router.get('/flutterwave/verify/:transactionId', async (req, res) => {
  try {
    const response = await axios.get(`https://api.flutterwave.com/v3/transactions/${req.params.transactionId}/verify`, {
      headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` },
    });
    res.json(response.data);
  } catch (error) {
    const message = error?.response?.data?.message || error?.message || 'Verify failed';
    res.status(500).json({ status: false, message });
  }
});

router.post('/stripe/create-session', async (req, res) => {
  try {
    if (!stripe) {
      const successUrl = req.body.successUrl || `${clientUrl()}/order-success`;
      return res.json({
        sessionId: `dev_${Date.now()}`,
        url: successUrl,
        message: 'Stripe dev mode - no key configured',
      });
    }

    const sessionData = {
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: req.body.successUrl || `${clientUrl()}/order-success`,
      cancel_url: req.body.cancelUrl || clientUrl(),
      line_items: req.body.items?.map(item => ({
        price_data: {
          currency: req.body.currency || 'usd',
          product_data: { name: item.name },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })) || [],
    };

    if (req.body.orderId) {
      sessionData.client_reference_id = req.body.orderId;
      sessionData.metadata = { orderId: req.body.orderId };
    }

    const session = await stripe.checkout.sessions.create(sessionData);

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    const message = error?.raw?.message || error?.message || 'Stripe checkout session failed';
    res.status(500).json({ message });
  }
});

router.post('/stripe/webhook', async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(503).json({ message: 'Stripe webhook not configured' });
    }

    let event;
    try {
      const payload = req.rawBody || JSON.stringify(req.body);
      event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.client_reference_id || session.metadata?.orderId;
      await updateOrderStatus({
        orderId,
        status: 'processing',
        paymentId: session.payment_intent || session.id,
        paymentMethod: 'stripe',
      });
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(500).json({ message: 'Stripe webhook processing failed' });
  }
});

router.post('/paystack/initialize', async (req, res) => {
  const successUrl = req.body.callback_url || `${clientUrl()}/order-success`;
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return res.json({
      status: true,
      message: 'Paystack dev mode',
      data: { authorization_url: successUrl, reference: `dev_${Date.now()}` },
    });
  }

  try {
    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
      email: req.body.email,
      amount: req.body.amount,
      callback_url: req.body.callback_url,
      reference: req.body.orderId || req.body.ref,
      metadata: { orderId: req.body.orderId || req.body.ref },
    }, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });
    res.json(response.data);
  } catch (error) {
    const message = error?.response?.data?.message || error?.response?.data?.error || error?.response?.statusText || error.message || 'Paystack initialization failed';
    res.status(500).json({ status: false, message });
  }
});

router.post('/paystack/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;

    const payload = req.rawBody || JSON.stringify(req.body);
    if (!webhookSecret || !verifyWebhookSignature(payload, signature, webhookSecret, 'sha512')) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = req.body;
    const orderId = event?.data?.metadata?.orderId || event?.data?.reference || event?.data?.trx?.reference;
    if (event.event === 'charge.success' && event.data?.status === 'success') {
      await updateOrderStatus({
        orderId,
        status: 'processing',
        paymentId: event.data?.reference,
        paymentMethod: 'paystack',
      });
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    res.status(500).json({ message: 'Paystack webhook processing failed' });
  }
});

router.post('/flutterwave/initialize', async (req, res) => {
  const successUrl = req.body.redirect_url || `${clientUrl()}/order-success`;
  if (!process.env.FLUTTERWAVE_SECRET_KEY) {
    return res.json({
      status: true,
      message: 'Flutterwave dev mode',
      data: { authorization_url: successUrl },
    });
  }

  try {
    const response = await axios.post('https://api.flutterwave.com/v3/payments', {
      tx_ref: req.body.tx_ref,
      amount: req.body.amount,
      currency: req.body.currency || 'USD',
      redirect_url: req.body.redirect_url,
      meta: { email: req.body.email, name: req.body.name, orderId: req.body.orderId },
    }, {
      headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` }
    });
    res.json(response.data);
  } catch (error) {
    const message = error?.response?.data?.message || error?.response?.data?.error || error?.response?.statusText || error.message || 'Flutterwave initialization failed';
    res.status(500).json({ status: false, message });
  }
});

router.post('/flutterwave/webhook', async (req, res) => {
  try {
    const signature = req.headers['verif-hash'];
    const webhookSecret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    const payload = req.rawBody || JSON.stringify(req.body);

    if (!webhookSecret || !verifyWebhookSignature(payload, signature, webhookSecret, 'sha256')) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = req.body;
    const orderId = event?.data?.meta?.orderId || event?.data?.tx_ref || event?.data?.flw_ref;
    const status = event?.data?.status || event?.status;
    if (status === 'successful' || status === 'success' || event.event === 'charge.completed') {
      await updateOrderStatus({
        orderId,
        status: 'processing',
        paymentId: event?.data?.flw_ref || event?.data?.transaction_id || event?.data?.id,
        paymentMethod: 'flutterwave',
      });
    }
    res.json({ received: true });
  } catch (error) {
    console.error('Flutterwave webhook error:', error);
    res.status(500).json({ message: 'Flutterwave webhook processing failed' });
  }
});

module.exports = router;
