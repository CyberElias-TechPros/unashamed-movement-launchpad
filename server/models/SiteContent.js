const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  title: { type: String, default: '' },
  content: { type: String, default: '' },
  type: { type: String, enum: ['hero', 'about', 'values', 'cta', 'stats'], default: 'hero' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('SiteContent', siteContentSchema);
