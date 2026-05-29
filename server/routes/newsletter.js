const router = require('express').Router();
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const { protect, admin } = require('../middleware/auth');
const { newsletterLimiter } = require('../middleware/rateLimit');

router.get('/', protect, admin, async (req, res) => {
  try {
    const subscribers = await NewsletterSubscriber.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/subscribe', newsletterLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.active) {
        return res.status(400).json({ message: 'Email already subscribed' });
      }
      existing.active = true;
      await existing.save();
      return res.status(200).json({ message: 'Subscribed successfully', subscriber: existing });
    }

    const subscriber = await NewsletterSubscriber.create({ email: email.toLowerCase() });
    res.status(201).json({ message: 'Subscribed successfully', subscriber });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/unsubscribe/:email', async (req, res) => {
  try {
    const subscriber = await NewsletterSubscriber.findOne({ email: req.params.email.toLowerCase() });
    if (subscriber) {
      subscriber.active = false;
      await subscriber.save();
    }
    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
