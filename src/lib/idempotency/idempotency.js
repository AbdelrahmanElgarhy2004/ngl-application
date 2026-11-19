import { cacheProvider } from "../cache/init.js";

export function idempotency(ttl = 3600) {
  return async function (req, res, next) {
    const idempotency = req.headers['idempotency-key'];
    if (!idempotency) {
      throw new Error('idempotency-key missing');
    }
    const key = `${req.method}:${req.originalUrl}:${idempotency}`;
    const cached = await cacheProvider.get(key);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(JSON.parse(cached));
    }
    const originalJson = res.json.bind(res);
    res.json = ((body) => {
      cacheProvider.set(key, JSON.stringify(body), ttl);
      return originalJson(body);
    });
    next();
  }
}