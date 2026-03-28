const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorName: { type: String, required: true, trim: true },
  donorEmail: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, default: 'USD' },
  type: { type: String, enum: ['one-time', 'monthly'], default: 'one-time' },
  message: { type: String, default: '' },
  paymentMethod: { type: String, default: '' },
  paymentId: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  isAnonymous: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);
