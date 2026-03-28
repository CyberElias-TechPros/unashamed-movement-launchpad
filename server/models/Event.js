const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  endDate: { type: Date },
  time: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['conference', 'workshop', 'outreach', 'online'], required: true },
  image: { type: String, default: '' },
  registrationUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  capacity: { type: Number, default: 0 },
  registeredCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
