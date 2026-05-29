const Testimony = require('../models/Testimony');

exports.getAll = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isApproved: true };
    if (category && category !== 'All') filter.category = category;
    const testimonies = await Testimony.find(filter).sort({ createdAt: -1 });
    res.json(testimonies);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getById = async (req, res) => {
  try {
    const testimony = await Testimony.findById(req.params.id);
    if (!testimony) return res.status(404).json({ message: 'Not found' });
    res.json(testimony);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.create = async (req, res) => {
  try {
    const { content, text, ...rest } = req.body;
    const testimony = await Testimony.create({
      ...rest,
      text: text || content,
    });
    res.status(201).json(testimony);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getAllForAdmin = async (req, res) => {
  try {
    res.json(await Testimony.find().sort({ createdAt: -1 }));
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.update = async (req, res) => {
  try {
    const testimony = await Testimony.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!testimony) return res.status(404).json({ message: 'Not found' });
    res.json(testimony);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.remove = async (req, res) => {
  try {
    await Testimony.findByIdAndDelete(req.params.id);
    res.json({ message: 'Testimony removed' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
