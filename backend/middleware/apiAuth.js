const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const ApiApplication = require('../models/APIApplication');
const APIRequestLog = require('../models/APIRequestLog');

const signatureWindowMs = 5 * 60 * 1000;
const apiLimiter = rateLimit({
  windowMs: signatureWindowMs,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => String(req.apiApp._id),
  handler: (req, res) => res.status(429).json({ error: 'Application rate limit exceeded' })
});

const apiAuth = async (req, res, next) => {
  try {
    const apiKey = req.get('x-api-key');
    const requestTimestamp = req.get('x-request-timestamp');
    const signature = req.get('x-signature');
    if (!apiKey || !requestTimestamp || !signature) {
      return res.status(401).json({ error: 'x-api-key, x-request-timestamp, and x-signature headers are required' });
    }

    const app = await ApiApplication.findOne({ apiKey, status: 'enabled', revokedAt: null });
    if (!app) return res.status(401).json({ error: 'Invalid or revoked API credentials' });

    if (app.credentialVersion >= 2) {
      const expectedPrefix = app.environment === 'production' ? 'ck_live_' : 'ck_test_';
      if (!apiKey.startsWith(expectedPrefix)) {
        return res.status(401).json({ error: 'Credential environment does not match this application' });
      }
    }

    const timestamp = Number(requestTimestamp);
    if (!Number.isSafeInteger(timestamp) || Math.abs(Date.now() - timestamp) > signatureWindowMs) {
      return res.status(401).json({ error: 'Request timestamp is outside the permitted five-minute window' });
    }
    if (!/^[a-f0-9]{64}$/i.test(signature)) {
      return res.status(401).json({ error: 'Invalid request signature format' });
    }

    const rawBody = Buffer.isBuffer(req.rawBody)
      ? req.rawBody.toString('utf8')
      : JSON.stringify(req.body || {});
    if (!/^[a-f0-9]{64}$/i.test(app.apiSecretHash || '')) {
      return res.status(401).json({ error: 'Application API secret is unavailable; rotate credentials' });
    }
    const signingKey = app.credentialVersion >= 2 ? Buffer.from(app.apiSecretHash, 'hex') : app.apiSecretHash;
    const expected = crypto.createHmac('sha256', signingKey)
      .update(`${requestTimestamp}.${rawBody}`).digest();
    const provided = Buffer.from(signature, 'hex');
    if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
      return res.status(401).json({ error: 'Invalid request signature' });
    }

    req.apiApp = app;
    app.lastUsedAt = new Date();
    app.requestCount = (app.requestCount || 0) + 1;
    await app.save({ validateBeforeSave: false });
    return apiLimiter(req, res, () => {
      const startedAt = Date.now();
      res.once('finish', () => {
        APIRequestLog.create({
          applicationId: app._id,
          ownerId: app.ownerId,
          method: req.method,
          path: req.path.slice(0, 200),
          statusCode: res.statusCode,
          durationMs: Date.now() - startedAt
        }).catch((error) => console.error('[API_LOG] Unable to persist request log:', error.message));
      });
      next();
    });
  } catch (error) {
    console.error('[API_AUTH] Middleware error:', error.message);
    return res.status(500).json({ error: 'API authentication failed' });
  }
};

const requireScope = (...requiredScopes) => (req, res, next) => {
  const permissions = req.apiApp?.permissions || [];
  const missing = requiredScopes.filter((scope) => !permissions.includes(scope));
  if (missing.length) {
    return res.status(403).json({ error: 'Application is missing required permission', required: missing });
  }
  next();
};

module.exports = { apiAuth, requireScope };
