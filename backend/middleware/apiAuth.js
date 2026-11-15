const crypto = require('crypto');
const ApiApplication = require('../models/APIApplication');

const windowMs = 5 * 60 * 1000;
const rateLimitStore = new Map();

const currentWindowBucket = (now) => Math.floor(now / windowMs);

const enforceRateLimit = (appId, now = Date.now()) => {
  const bucket = currentWindowBucket(now);
  const key = `${appId}:${bucket}`;
  const requests = rateLimitStore.get(key) || [];
  const trimmed = requests.filter((timestamp) => now - timestamp < windowMs);
  if (trimmed.length >= 60) {
    rateLimitStore.set(key, trimmed);
    return false;
  }
  trimmed.push(now);
  rateLimitStore.set(key, trimmed);
  return true;
};

const apiAuth = async (req, res, next) => {
  try {
    const apiKey = req.header('x-api-key') || req.query?.api_key || req.body?.apiKey;
    const requestTimestamp = req.header('x-request-timestamp') || req.query?.timestamp;
    const signature = req.header('x-signature') || req.query?.signature;

    if (!apiKey || !requestTimestamp || !signature) {
      return res.status(401).json({ error: 'Missing API credentials' });
    }

    const app = await ApiApplication.findOne({ apiKey, status: 'enabled', revokedAt: null });
    if (!app) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const now = Date.now();
    const parsedTimestamp = Number(requestTimestamp);
    if (!Number.isFinite(parsedTimestamp) || Math.abs(now - parsedTimestamp) > windowMs) {
      return res.status(401).json({ error: 'Expired or invalid request timestamp' });
    }

    if (!enforceRateLimit(String(app._id), now)) {
      return res.status(429).json({ error: 'Rate limit exceeded for this application' });
    }

    const rawBody = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body || {});
    const expectedSignature = crypto.createHmac('sha256', app.apiSecretHash)
      .update(`${requestTimestamp}.${rawBody}`)
      .digest('hex');

    const provided = Buffer.from(String(signature));
    const expected = Buffer.from(String(expectedSignature));
    if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
      return res.status(401).json({ error: 'Invalid API signature' });
    }

    app.lastUsedAt = new Date();
    app.requestCount = (app.requestCount || 0) + 1;
    await app.save({ validateBeforeSave: false });
    req.apiApp = app;
    next();
  } catch (error) {
    console.error('[API_AUTH] Middleware error:', error.message);
    return res.status(500).json({ error: 'API authentication failed' });
  }
};

module.exports = { apiAuth };
