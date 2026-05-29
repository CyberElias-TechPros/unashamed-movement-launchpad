const router = require('express').Router();

const clientUrl = () => process.env.CLIENT_URL || 'http://localhost:8080';

router.post('/stripe/create-session', async (req, res) => {
  try {
    const successUrl = req.body.successUrl || `${clientUrl()}/order-success`;
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.json({
        sessionId: `dev_${Date.now()}`,
        url: successUrl,
        message: 'Stripe not configured — using dev checkout redirect',
      });
    }
    res.status(503).json({ message: 'Stripe integration pending — configure STRIPE_SECRET_KEY' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/stripe/initialize', async (req, res) => {
  res.redirect(307, '/api/payments/stripe/create-session');
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
  res.status(503).json({ status: false, message: 'Paystack not configured' });
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
  res.status(503).json({ status: false, message: 'Flutterwave not configured' });
});

const webhookGuard = (provider) => (req, res) => {
  const secretKey = process.env[`${provider.toUpperCase()}_WEBHOOK_SECRET`];
  if (!secretKey) {
    return res.status(503).json({ message: `${provider} webhook not configured` });
  }
  res.json({ received: true, provider });
};

router.post('/stripe/webhook', webhookGuard('stripe'));
router.post('/paystack/webhook', webhookGuard('paystack'));
router.post('/flutterwave/webhook', webhookGuard('flutterwave'));

module.exports = router;
