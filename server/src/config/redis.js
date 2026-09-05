const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 3) {
        // Stop reconnecting aggressively if Redis is down
        return false;
      }
      return Math.min(retries * 100, 1000);
    }
  }
});

let isReady = false;

redisClient.on('connect', () => {
  console.log('[Redis] Connected to Redis server.');
  isReady = true;
});

redisClient.on('ready', () => {
  isReady = true;
});

redisClient.on('error', (err) => {
  isReady = false;
  // Log error without crashing the Express server
  console.warn(`[Redis Warning] Redis error: ${err.message}`);
});

redisClient.on('end', () => {
  isReady = false;
  console.log('[Redis] Connection closed.');
});

const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    isReady = false;
    console.warn(`[Redis Warning] Failed to connect to Redis (${error.message}). Server will continue using MongoDB as source of truth.`);
  }
};

const isRedisReady = () => isReady && redisClient.isOpen;

module.exports = {
  redisClient,
  connectRedis,
  isRedisReady
};
