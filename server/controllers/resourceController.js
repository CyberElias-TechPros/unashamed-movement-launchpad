const Resource = require('../models/Resource');

exports.getAll = async (req, res) => {
  try {
    const { type, category } = req.query;
    const filter = { isActive: true };
    if (type && type !== 'All') filter.type = type;
    if (category && category !== 'All') filter.category = category;
    res.json(await Resource.find(filter).sort({ createdAt: -1 }));
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.trackDownload = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );
    if (!resource) return res.status(404).json({ message: 'Not found' });
    const downloadUrl = resource.downloadUrl || resource.externalUrl || resource.fileUrl;
    res.json({ downloadUrl, message: 'Download tracked', downloadCount: resource.downloadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Not found' });
    res.json(resource);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.create = async (req, res) => {
  try { res.status(201).json(await Resource.create(req.body)); }
  catch (error) { res.status(500).json({ message: error.message }); }
};

exports.update = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!resource) return res.status(404).json({ message: 'Not found' });
    res.json(resource);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.remove = async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource removed' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
