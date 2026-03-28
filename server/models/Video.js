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

module.exports = mongoose.model('Video', videoSchema);
