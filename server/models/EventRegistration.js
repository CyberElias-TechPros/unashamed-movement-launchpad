const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  attendeeName: { type: String, default: '' },
  attendeeEmail: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
