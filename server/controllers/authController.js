const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { formatUser } = require('../utils/formatUser');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const authPayload = (user) => ({
  token: generateToken(user._id),
  user: formatUser(user),
});

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password });
    res.status(201).json(authPayload(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json(authPayload(user));
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  res.json(formatUser(req.user));
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }
    // Stub: in production, send email with reset token
    res.json({
      message: 'If that email exists, a reset link has been sent.',
      devNote: 'Password reset email integration pending',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) user.password = req.body.password;

    const updatedUser = await user.save();
    res.json(authPayload(updatedUser));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
