const Donation = require('../models/Donation');

exports.getAll = async (req, res) => {
  try { res.json(await Donation.find().sort({ createdAt: -1 })); }
  catch (error) { res.status(500).json({ message: error.message }); }
};

exports.create = async (req, res) => {
  try { res.status(201).json(await Donation.create(req.body)); }
  catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Not found' });
    res.json(donation);
  } catch (error) { res.status(500).json({ message: error.message }); }
};
