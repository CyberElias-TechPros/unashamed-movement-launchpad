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

dotenv.config();

const app = express();

connectDB();

app.use(helmet());
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

// Routes
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'TTIN API is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  const message = process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message;
  res.status(500).json({ message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`TTIN Server running on port ${PORT}`);
});
