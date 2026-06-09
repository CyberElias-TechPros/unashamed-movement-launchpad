const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, trim: true },
  email: { type: String, trim: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: { type: String, trim: true },
  body: { type: String, trim: true },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Performance indexes for common queries
reviewSchema.index({ product: 1 }); // Product reviews
reviewSchema.index({ product: 1, approved: 1 }); // Approved product reviews
reviewSchema.index({ product: 1, approved: 1, createdAt: -1 }); // Approved reviews sorted
reviewSchema.index({ approved: 1 }); // Moderation queue
reviewSchema.index({ rating: 1 }); // Rating sorting
reviewSchema.index({ createdAt: -1 }); // Newest reviews
reviewSchema.index({ user: 1 }); // User reviews

module.exports = mongoose.model('Review', reviewSchema);
