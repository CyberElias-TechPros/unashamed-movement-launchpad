const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { formatUser } = require('../utils/formatUser');
const { setAuthCookies } = require('../middleware/auth');
const crypto = require('crypto');
const { sendEmail } = require('../utils/email');

const authPayload = (user) => ({
  user: formatUser(user),
});

const createToken = () => crypto.randomBytes(32).toString('hex');

const setVerificationToken = (user) => {
  user.emailVerificationToken = createToken();
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  return user.emailVerificationToken;
};

const setResetPasswordToken = (user) => {
  user.resetPasswordToken = createToken();
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
  return user.resetPasswordToken;
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, emailVerified: false });
    const verificationToken = setVerificationToken(user);
    await user.save();
    const accessToken = setAuthCookies(res, user);
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:8080'}/verify-email?token=${verificationToken}`;
    // send verification email (best-effort)
    try {
      await sendEmail({
        to: user.email,
        subject: 'Verify your email',
        text: `Please verify your email by visiting: ${verificationUrl}`,
        html: `<p>Please verify your email by clicking <a href="${verificationUrl}">this link</a>.</p>`,
      });
    } catch (err) {
      console.warn('Failed to send verification email', err);
    }

    res.status(201).json({
      ...authPayload(user),
      verificationUrl,
      devNote: 'Email verification message sent (or logged)',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      const accessToken = setAuthCookies(res, user);
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
    const token = setResetPasswordToken(user);
    await user.save();
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:8080'}/reset-password?token=${token}`;
    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset your password',
        text: `Reset your password here: ${resetUrl}`,
        html: `<p>Reset your password by clicking <a href="${resetUrl}">this link</a>.</p>`,
      });
    } catch (err) {
      console.warn('Failed to send reset email', err);
    }

    res.json({
      message: 'If that email exists, a reset link has been sent.',
      resetUrl,
      devNote: 'Password reset email sent (or logged)',
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
    if (req.body.email && req.body.email !== user.email) {
      user.email = req.body.email;
      user.emailVerified = false;
      setVerificationToken(user);
    }
    if (req.body.password) user.password = req.body.password;

    const updatedUser = await user.save();
    res.json(authPayload(updatedUser));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.emailVerified = true;
    await user.save();

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password changed',
        text: 'Your password was changed successfully. If this was not you, please contact support.',
        html: '<p>Your password was changed successfully. If this was not you, please contact support.</p>',
      });
    } catch (err) {
      console.warn('Failed to send password change email', err);
    }

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'Verification email sent if account exists.' });

    if (user.emailVerified) {
      return res.status(200).json({ message: 'Email already verified.' });
    }

    const token = setVerificationToken(user);
    await user.save();
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:8080'}/verify-email?token=${token}`;
    // Send verification email (best-effort)
    try {
      await sendEmail({
        to: user.email,
        subject: 'Verify your email',
        text: `Please verify your email by visiting: ${verificationUrl}`,
        html: `<p>Please verify your email by clicking <a href="${verificationUrl}">this link</a>.</p>`,
      });
    } catch (err) {
      console.warn('Failed to send verification email', err);
    }

    res.json({
      message: 'Verification email sent.',
      verificationUrl,
      devNote: 'Email verification attempted (sent or logged)',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Verification token is required' });

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Send confirmation email (best-effort)
    try {
      await sendEmail({
        to: user.email,
        subject: 'Email verified',
        text: 'Your email has been verified. Thank you!',
        html: '<p>Your email has been verified. Thank you!</p>',
      });
    } catch (err) {
      console.warn('Failed to send verification confirmation email', err);
    }

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
