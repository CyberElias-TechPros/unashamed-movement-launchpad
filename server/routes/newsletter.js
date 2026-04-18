const router = require('express').Router();

let subscribers = [];

// Simulated database - in production, use MongoDB
router.get('/', (req, res) => {
  res.json(subscribers);
});

router.post('/subscribe', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const existing = subscribers.find(s => s.email === email);
  if (existing) {
    return res.status(400).json({ message: 'Email already subscribed' });
  }

  const newSubscriber = {
    id: Date.now().toString(),
    email,
    subscribedAt: new Date().toISOString(),
    active: true
  };

  subscribers.push(newSubscriber);
  
  res.status(201).json({ message: 'Subscribed successfully', subscriber: newSubscriber });
});

router.delete('/unsubscribe/:email', (req, res) => {
  const { email } = req.params;
  
  subscribers = subscribers.filter(s => s.email !== email);
  
  res.json({ message: 'Unsubscribed successfully' });
});

module.exports = router;