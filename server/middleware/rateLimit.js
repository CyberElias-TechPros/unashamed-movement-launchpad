const buckets = new Map();

const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => (req, res, next) => {
  const key = `${req.ip}:${req.baseUrl}${req.path}`;
  const now = Date.now();
  let entry = buckets.get(key);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    buckets.set(key, entry);
  }

  entry.count += 1;

  if (entry.count > max) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }

  next();
};

const authLimiter = rateLimit(15 * 60 * 1000, 20);
const contactLimiter = rateLimit(60 * 60 * 1000, 10);
const newsletterLimiter = rateLimit(60 * 60 * 1000, 5);

module.exports = { rateLimit, authLimiter, contactLimiter, newsletterLimiter };
