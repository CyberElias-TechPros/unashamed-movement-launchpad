const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['devotional', 'guide', 'article', 'podcast'], required: true },
  fileUrl: { type: String, default: '' },
  externalUrl: { type: String, default: '' },
  image: { type: String, default: '' },
  isFree: { type: Boolean, default: true },
  price: { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
