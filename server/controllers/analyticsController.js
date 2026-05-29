const AnalyticsEvent = require('../models/AnalyticsEvent');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const Testimony = require('../models/Testimony');
const Resource = require('../models/Resource');

exports.track = async (req, res) => {
  try {
    const { category, action, label, value } = req.body;
    if (!category || !action) {
      return res.status(400).json({ message: 'category and action are required' });
    }
    await AnalyticsEvent.create({ category, action, label: label || '', value: value || 0 });
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.timeseries = async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days, 10) || 30, 90);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const events = await AnalyticsEvent.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(events.map((e) => ({ date: e._id, count: e.count })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.dashboard = async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [pageViews, subscribers, testimonies, downloads] = await Promise.all([
      AnalyticsEvent.countDocuments({ category: 'page', createdAt: { $gte: since } }),
      NewsletterSubscriber.countDocuments({ active: true }),
      Testimony.countDocuments({ isApproved: true }),
      Resource.aggregate([{ $group: { _id: null, total: { $sum: '$downloadCount' } } }]),
    ]);

    res.json({
      totalViews: pageViews,
      totalSubscribers: subscribers,
      totalTestimonials: testimonies,
      totalDownloads: downloads[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
