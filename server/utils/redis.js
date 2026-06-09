const Redis = require('ioredis');

let redis = null;

const connectRedis = () => {
  if (redis) return redis;
  
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    console.warn('REDIS_URL not set, Redis features disabled');
    return null;
  }
  
  try {
    redis = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      showFriendlyErrorStack: true,
    });
    
    redis.on('connect', () => {
      console.log('Redis connected successfully');
    });
    
    redis.on('error', (err) => {
      console.error('Redis error:', err);
    });
    
    return redis;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    return null;
  }
};

const getRedis = () => {
  if (!redis) {
    return connectRedis();
  }
  return redis;
};

const closeRedis = async () => {
  if (redis) {
    await redis.quit();
    redis = null;
  }
};

const isRedisConnected = () => {
  return redis && redis.status === 'ready';
};

module.exports = {
  connectRedis,
  getRedis,
  closeRedis,
  isRedisConnected,
};
