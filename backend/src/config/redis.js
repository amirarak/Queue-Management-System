const logger = require('../utils/logger');

let isConnected = false;
let redisClient = null;

async function tryConnectRedis() {
  try {
    const redis = require('redis');
    const client = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        connectTimeout: 3000
      },
      password: process.env.REDIS_PASSWORD || undefined
    });

    client.on('error', (err) => {
      if (isConnected) {
        logger.warn('Redis connection lost:', err.message);
        isConnected = false;
      }
    });

    await client.connect();
    redisClient = client;
    isConnected = true;
    logger.info(' Redis connected successfully');
    return client;
  } catch (err) {
    logger.warn(' Redis not available, running without cache:', err.message);
    isConnected = false;
    return null;
  }
}

const redisHelper = {
  async set(key, value, ttl = 3600) {
    if (!isConnected || !redisClient) return null;
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
    } catch (e) {
      logger.warn('Redis set error:', e.message);
    }
  },

  async get(key) {
    if (!isConnected || !redisClient) return null;
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      logger.warn('Redis get error:', e.message);
      return null;
    }
  },

  async del(key) {
    if (!isConnected || !redisClient) return null;
    try {
      await redisClient.del(key);
    } catch (e) {
      logger.warn('Redis del error:', e.message);
    }
  },

  async lpush(key, value) {
    if (!isConnected || !redisClient) return null;
    try {
      await redisClient.lPush(key, JSON.stringify(value));
    } catch (e) {
      logger.warn('Redis lpush error:', e.message);
    }
  },

  async lrange(key, start, stop) {
    if (!isConnected || !redisClient) return [];
    try {
      const data = await redisClient.lRange(key, start, stop);
      return data.map(item => JSON.parse(item));
    } catch (e) {
      return [];
    }
  },

  async llen(key) {
    if (!isConnected || !redisClient) return 0;
    try {
      return await redisClient.lLen(key);
    } catch (e) {
      return 0;
    }
  },

  async flushAll() {
    if (!isConnected || !redisClient) return;
    try {
      if (process.env.NODE_ENV === 'development') {
        await redisClient.flushAll();
      }
    } catch (e) {}
  }
};

const redisClientProxy = {
  connect: tryConnectRedis,
  quit: async () => {
    if (redisClient) {
      try { await redisClient.quit(); } catch (e) {}
    }
  }
};

module.exports = { redisClient: redisClientProxy, redisHelper };