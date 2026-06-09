const SiteSettings = require('../models/SiteSettings');

exports.getAll = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({
        siteName: 'The Time Is Now',
        tagline: 'Bold faith for today\'s generation',
        siteUrl: 'https://thetimeisnow.org',
        allowRegistration: false,
        moderateReviews: true,
        moderateTestimonials: true,
        maintenanceMode: false,
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const settings = await SiteSettings.findOneAndUpdate(
      {},
      { $set: req.body, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
