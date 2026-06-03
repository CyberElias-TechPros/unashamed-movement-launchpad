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

reviewSchema.index({ product: 1 });

module.exports = mongoose.model('Review', reviewSchema);
