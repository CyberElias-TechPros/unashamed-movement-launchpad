const { getRedis, isRedisConnected } = require('../utils/redis');

// Default rate limits
const DEFAULTS = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  keyPrefix: 'ratelimit:',
};

// Specific endpoint limits
const ENDPOINT_LIMITS = {
  // Authentication endpoints - strict limits
  'POST:/api/auth/login': { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  'POST:/api/auth/register': { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  'POST:/api/auth/forgot-password': { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  
  // Contact form - moderate limits
  'POST:/api/contact': { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  
  // Newsletter - moderate limits
  'POST:/api/newsletter': { windowMs: 60 * 60 * 1000, maxRequests: 5 },
  
  // Checkout - strict limits
  'POST:/api/orders/checkout': { windowMs: 60 * 60 * 1000, maxRequests: 10 },
  
  // Testimony submission - moderate limits
  'POST:/api/testimonies': { windowMs: 60 * 60 * 1000, maxRequests: 5 },
  
  // Reviews - moderate limits
  'POST:/api/reviews': { windowMs: 60 * 60 * 1000, maxRequests: 10 },
};

/**
 * Get rate limit configuration for a specific endpoint
 */
const getLimitConfig = (method, path) => {
  const key = `${method}:${path}`;
  return ENDPOINT_LIMITS[key] || DEFAULTS;
};

/**
 * Generate rate limit key for a request
 */
const getRateLimitKey = (req, prefix) => {
  const identifier = req.ip || req.connection.remoteAddress || 'unknown';
  const userId = req.user?._id ? `:${req.user._id}` : '';
  return `${prefix}${identifier}${userId}`;
};

/**
 * Redis-based rate limiting middleware
 * Uses sliding window algorithm for accurate rate limiting
 */
const rateLimit = (options = {}) => {
  return async (req, res, next) => {
    // Skip if Redis is not available (fallback to memory limiter in main middleware)
    if (!isRedisConnected()) {
      return next();
    }
    
    const redis = getRedis();
    if (!redis) {
      return next();
    }
    
    const method = req.method;
    const path = req.route?.path || req.path;
    const config = { ...DEFAULTS, ...getLimitConfig(method, path), ...options };
    
    const key = getRateLimitKey(req, config.keyPrefix);
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    try {
      // Use Redis sorted set for sliding window
      // Remove old entries outside the window
      await redis.zremrangebyscore(key, 0, windowStart);
      
      // Count current requests in window
      const currentCount = await redis.zcard(key);
      
      // Check if limit exceeded
      if (currentCount >= config.maxRequests) {
        // Get reset time (oldest request + window)
        const oldestRequest = await redis.zrange(key, 0, 0, 'WITHSCORES');
        const resetTime = oldestRequest.length > 0 
          ? parseInt(oldestRequest[1]) + config.windowMs 
          : now + config.windowMs;
        
        const retryAfter = Math.ceil((resetTime - now) / 1000);
        
        // Set rate limit headers
        res.setHeader('Retry-After', retryAfter);
        res.setHeader('X-RateLimit-Limit', config.maxRequests);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000));
        
        return res.status(429).json({
          message: 'Too many requests, please try again later.',
          retryAfter,
        });
      }
      
      // Add current request to window
      await redis.zadd(key, now, `${now}-${Math.random()}`);
      
      // Set expiry on key
      await redis.pexpire(key, config.windowMs);
      
      // Set rate limit headers
      const remaining = config.maxRequests - currentCount - 1;
      const resetTime = now + config.windowMs;
      
      res.setHeader('X-RateLimit-Limit', config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));
      res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000));
      
      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Fail open - allow request if Redis fails
      next();
    }
  };
};

/**
 * Skip rate limiting for certain conditions
 */
const skipRateLimit = (req) => {
  // Skip for health checks
  if (req.path === '/api/health') return true;
  
  // Skip for authenticated admin users (optional)
  if (req.user?.role === 'admin' && process.env.RATE_LIMIT_SKIP_ADMIN === 'true') {
    return true;
  }
  
  return false;
};

/**
 * Combined rate limiter with fallback
 */
const createRateLimiter = (options = {}) => {
  return async (req, res, next) => {
    if (skipRateLimit(req)) {
      return next();
    }
    
    // Try Redis first
    if (isRedisConnected()) {
      return rateLimit(options)(req, res, next);
    }
    
    // Fallback to next (memory limiter will handle it)
    next();
  };
};

module.exports = {
  rateLimit,
  createRateLimiter,
  getLimitConfig,
  DEFAULTS,
  ENDPOINT_LIMITS,
};
