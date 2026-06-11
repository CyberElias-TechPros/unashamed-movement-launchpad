const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const corsMiddleware = require('./middleware/corsConfig');
const { sanitizeInput } = require('./middleware/sanitize');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

dotenv.config();

connectDB();

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://www.youtube.com",
        "https://s.ytimg.com",
        "https://www.google-analytics.com",
        "https://www.googletagmanager.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:",
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:",
        "https://res.cloudinary.com",
        "https://img.youtube.com",
        "https://i.ytimg.com",
      ],
      mediaSrc: ["'self'", "https:"],
      connectSrc: [
        "'self'",
        "https://api.paystack.co",
        "https://api.flutterwave.com",
        "https://api.stripe.com",
        "https://www.google-analytics.com",
        "https://res.cloudinary.com",
      ],
      frameSrc: [
        "'self'",
        "https://www.youtube.com",
        "https://youtube.com",
        "https://www.youtube-nocookie.com",
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permissionsPolicy: {
    features: {
      camera: ["'self'"],
      microphone: ["'self'"],
      geolocation: ["'self'"],
      payment: ["'self'"],
    },
  },
}));
app.use(compression());
app.use(morgan('combined'));
app.use(corsMiddleware);
app.use(cookieParser());
app.use(express.json({
  limit: '2mb',
  verify: (req, res, buf) => {
    const signatureHeader = req.headers['stripe-signature'] || req.headers['x-paystack-signature'] || req.headers['verif-hash'];
    if (signatureHeader) {
      req.rawBody = buf.toString('utf8');
    }
  },
}));
app.use(sanitizeInput);
app.use(express.urlencoded({ extended: true }));

const DIST_DIR = path.join(__dirname, '..', 'dist');
app.use(express.static(DIST_DIR, { immutable: true, maxAge: '1y' }));
app.use('/resources', express.static(path.join(__dirname, '..', 'public', 'resources'), { immutable: true, maxAge: '1y' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/testimonies', require('./routes/testimonies'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/events', require('./routes/events'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/search', require('./routes/search'));
app.use('/api/countries', require('./routes/countries'));
app.use('/api/content', require('./routes/content'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/settings', require('./routes/settings'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'TTIN API is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`TTIN Server running on port ${PORT}`);
});
