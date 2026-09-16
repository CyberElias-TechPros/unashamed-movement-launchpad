const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');

exports.getAll = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { isActive: true };
    if (type && type !== 'all') filter.type = type;
    res.json(await Event.find(filter).sort({ date: 1 }));
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Not found' });
    res.json(event);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.create = async (req, res) => {
  try { res.status(201).json(await Event.create(req.body)); }
  catch (error) { res.status(500).json({ message: error.message }); }
};

exports.update = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ message: 'Not found' });
    res.json(event);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.remove = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event removed' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.register = async (req, res) => {
  try {
    const { eventId, attendeeEmail, attendeeName } = req.body;
    if (!eventId) {
      return res.status(400).json({ message: 'eventId is required' });
    }
    if (!require('mongoose').isValidObjectId(eventId)) {
      return res.status(400).json({ message: 'Invalid eventId' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.capacity > 0 && event.registeredCount >= event.capacity) {
      return res.status(400).json({ message: 'Event is full', waitlist: true });
    }

    await EventRegistration.create({
      event: eventId,
      attendeeEmail: attendeeEmail || '',
      attendeeName: attendeeName || '',
    });

    event.registeredCount += 1;
    await event.save();

    res.status(201).json({ success: true, message: 'Registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRegistrationCount = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Not found' });
    res.json({ count: event.registeredCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
