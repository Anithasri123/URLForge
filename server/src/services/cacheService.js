const { redisClient, isRedisReady } = require('../config/redis');

// Predictable cache key format: "url:<shortCode>"
const getCacheKey = (shortCode) => `url:${shortCode}`;

/**
 * Retrieve cached URL data by shortCode
 * @param {string} shortCode 
 * @returns {Promise<object|null>}
 */
const getCachedUrl = async (shortCode) => {
  if (!isRedisReady()) {
    return null;
  }

  try {
    const key = getCacheKey(shortCode);
    const cachedString = await redisClient.get(key);

    if (cachedString) {
      console.log(`[Cache HIT] shortCode: ${shortCode}`);
      return JSON.parse(cachedString);
    }

    console.log(`[Cache MISS] shortCode: ${shortCode}`);
    return null;
  } catch (error) {
    console.warn(`[Cache Error] Failed to read from Redis (${error.message}). Falling back to MongoDB.`);
    return null;
  }
};

/**
 * Store URL redirect payload in Redis cache with atomic TTL
 * @param {string} shortCode 
 * @param {object} payload 
 * @param {number} ttlSeconds 
 * @returns {Promise<boolean>}
 */
const setCachedUrl = async (shortCode, payload, ttlSeconds = 300) => {
  if (!isRedisReady()) {
    return false;
  }

  try {
    const key = getCacheKey(shortCode);
    const value = JSON.stringify({
      originalUrl: payload.originalUrl,
      expiresAt: payload.expiresAt || null
    });

    // Atomic SET key value EX ttl
    await redisClient.set(key, value, { EX: ttlSeconds });
    console.log(`[Cache POPULATED] shortCode: ${shortCode} (TTL: ${ttlSeconds}s)`);
    return true;
  } catch (error) {
    console.warn(`[Cache Error] Failed to populate Redis (${error.message}).`);
    return false;
  }
};

/**
 * Invalidate/remove URL entry from Redis cache
 * @param {string} shortCode 
 * @returns {Promise<boolean>}
 */
const deleteCachedUrl = async (shortCode) => {
  if (!isRedisReady()) {
    return false;
  }

  try {
    const key = getCacheKey(shortCode);
    await redisClient.del(key);
    console.log(`[Cache INVALIDATED] shortCode: ${shortCode}`);
    return true;
  } catch (error) {
    console.warn(`[Cache Error] Failed to invalidate Redis key (${error.message}).`);
    return false;
  }
};

module.exports = {
  getCacheKey,
  getCachedUrl,
  setCachedUrl,
  deleteCachedUrl
};
