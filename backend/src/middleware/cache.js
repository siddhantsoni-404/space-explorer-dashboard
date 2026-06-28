const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: process.env.CACHE_TTL || 3600 });

const cacheMiddleware = (ttl) => (req, res, next) => {
  const key = req.originalUrl || req.url;
  const cachedResponse = cache.get(key);

  if (cachedResponse) {
    return res.status(200).json(cachedResponse);
  }

  // Override res.json to store the response in cache before sending it
  const originalJson = res.json;
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cache.set(key, body, ttl);
    }
    return originalJson.call(res, body);
  };
  next();
};

module.exports = {
  cache,
  cacheMiddleware
};
