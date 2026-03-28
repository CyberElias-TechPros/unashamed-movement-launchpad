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

module.exports = mongoose.model('Testimony', testimonySchema);
