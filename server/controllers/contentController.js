const SiteContent = require('../models/SiteContent');

const defaultContent = {
  hero: {
    key: 'hero',
    title: 'UNASHAMED',
    content: '"Is your timidity worth someone else\'s eternity?"',
    type: 'hero',
    metadata: {
      blurb: 'A movement for Christians who refuse to stay silent. Be bold. Be unapologetic. Be unashamed.',
    },
  },
};

exports.getAll = async (req, res) => {
  try {
    res.json(await SiteContent.find().sort({ key: 1 }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getByKey = async (req, res) => {
  try {
    const doc = await SiteContent.findOne({ key: req.params.key });
    if (!doc) {
      if (defaultContent[req.params.key]) return res.json(defaultContent[req.params.key]);
      return res.status(404).json({ message: 'Not found' });
    }
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.upsert = async (req, res) => {
  try {
    const { key, title, content, type, metadata } = req.body;
    const doc = await SiteContent.findOneAndUpdate(
      { key },
      { key, title, content, type, metadata },
      { new: true, upsert: true }
    );
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await SiteContent.findOneAndDelete({ key: req.params.key });
    res.json({ message: 'Removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
