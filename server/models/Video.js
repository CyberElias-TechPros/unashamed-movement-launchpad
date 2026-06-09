const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  episode: { type: String, required: true },
  duration: { type: String, default: '' },
  youtubeUrl: { type: String, required: true },
  thumbnailUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

// Performance indexes for common queries
videoSchema.index({ isActive: 1, order: 1 }); // Active videos sorted
videoSchema.index({ isActive: 1, createdAt: -1 }); // Active by date
videoSchema.index({ order: 1 }); // Sort by order
videoSchema.index({ createdAt: -1 }); // Newest videos
videoSchema.index({ title: 'text', description: 'text' }); // Search

module.exports = mongoose.model('Video', videoSchema);
