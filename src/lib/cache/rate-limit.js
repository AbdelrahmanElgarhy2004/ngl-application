import { cacheProvider } from "./init.js";

export function cacheRateLimit(ttl = 180) {
  return async (req, res, next) => {
    let key = `${req.originalUrl}:${req.user.id}`;
    const cached = await cacheProvider.get(key);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(JSON.parse(cached));
    }
    const originalJson = res.json.bind(res);
    res.json = (async (body) => {
      res.setHeader('X-Cache', 'MISS');
      await cacheProvider.set(key, JSON.stringify(body), ttl);
      return originalJson(body);
    });
    next();
  }
}
