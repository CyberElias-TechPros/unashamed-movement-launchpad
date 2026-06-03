const Review = require('../models/Review');

exports.getByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, approved: true }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.create = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, email, rating, title, body } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating is required (1-5)' });
    const review = await Review.create({ product: productId, name, email, rating, title, body, approved: false });
    res.status(201).json(review);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getAll = async (req, res) => {
  try { res.json(await Review.find().sort({ createdAt: -1 })); }
  catch (error) { res.status(500).json({ message: error.message }); }
};

exports.approve = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    if (!review) return res.status(404).json({ message: 'Not found' });
    res.json(review);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.remove = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
