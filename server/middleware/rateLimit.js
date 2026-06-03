const Redis = require('ioredis');

let redis;
try {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  redis.on('error', () => {});
} catch {
  redis = null;
}

const inMemoryBuckets = new Map();

const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => async (req, res, next) => {
  const key = `ratelimit:${req.ip}:${req.baseUrl}${req.path}`;
  const now = Date.now();
  const window = Math.floor(now / windowMs);
  const redisKey = `${key}:${window}`;

  try {
    if (redis && redis.ready) {
      const count = await redis.incr(redisKey);
      if (count === 1) {
        await redis.expire(redisKey, Math.ceil(windowMs / 1000));
      }
      if (count > max) {
        return res.status(429).json({ message: 'Too many requests. Please try again later.' });
      }
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - count);
      return next();
    }

    let entry = inMemoryBuckets.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      inMemoryBuckets.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', max - entry.count);
    next();
  } catch {
    next();
  }
};

const authLimiter = rateLimit(15 * 60 * 1000, 20);
const contactLimiter = rateLimit(60 * 60 * 1000, 10);
const newsletterLimiter = rateLimit(60 * 60 * 1000, 5);

module.exports = { rateLimit, authLimiter, contactLimiter, newsletterLimiter };
