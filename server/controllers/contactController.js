const Contact = require('../models/Contact');

exports.submit = async (req, res) => {
  try {
    const { name, email, message, website } = req.body;

    if (website) {
      return res.status(400).json({ message: 'Spam detected' });
    }

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    const contact = await Contact.create({
      name,
      email,
      message,
      ip: req.ip || '',
      userAgent: req.get('user-agent') || '',
    });

    res.status(201).json({ message: 'Message received', id: contact._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.spamCheck = async (req, res) => {
  const { website, honeypot } = req.body;
  const isSpam = Boolean(website || honeypot);
  res.json({ isSpam });
};
