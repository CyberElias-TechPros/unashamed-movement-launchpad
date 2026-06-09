const mongoose = require('mongoose');

const testimonySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  text: { type: String, required: true },
  category: { type: String, enum: ['Evangelism', 'Youth', 'Apologetics', 'Lifestyle', 'Workplace', 'Other'], default: 'Other' },
  image: { type: String, default: '' },
  isApproved: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

// Performance indexes for common queries
testimonySchema.index({ isApproved: 1, createdAt: -1 }); // Public testimonies sorted
testimonySchema.index({ isApproved: 1, isFeatured: 1, createdAt: -1 }); // Featured testimonies
testimonySchema.index({ category: 1, isApproved: 1 }); // Category filtering
testimonySchema.index({ location: 1 }); // Location filtering
testimonySchema.index({ isFeatured: 1 }); // Featured queries
testimonySchema.index({ createdAt: -1 }); // Sort by newest
testimonySchema.index({ name: 'text', text: 'text', location: 'text' }); // Search functionality

module.exports = mongoose.model('Testimony', testimonySchema);
