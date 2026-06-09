const mongoose = require('mongoose');

const newsletterSubscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

// Performance indexes for common queries
newsletterSubscriberSchema.index({ email: 1 }, { unique: true }); // Email lookups
newsletterSubscriberSchema.index({ active: 1 }); // Active subscribers
newsletterSubscriberSchema.index({ active: 1, createdAt: -1 }); // Active sorted by date
newsletterSubscriberSchema.index({ createdAt: -1 }); // Newest subscribers
newsletterSubscriberSchema.index({ email: 'text' }); // Search by email

module.exports = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
