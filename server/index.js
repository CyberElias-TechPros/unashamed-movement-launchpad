const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const corsMiddleware = require('./middleware/corsConfig');
const { sanitizeInput } = require('./middleware/sanitize');

dotenv.config();

const app = express();

connectDB();

app.use(corsMiddleware);
app.use(express.json({ limit: '2mb' }));
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'TTIN API is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`TTIN Server running on port ${PORT}`);
});
