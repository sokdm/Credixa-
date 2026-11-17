const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const ApiApplication = require('../models/APIApplication');
const APIRequestLog = require('../models/APIRequestLog');
const DeveloperAuditLog = require('../models/DeveloperAuditLog');
const WebhookDelivery = require('../models/WebhookDelivery');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { parseWebhookUrl, enqueueWebhook } = require('../services/webhookDelivery');
const { markdownToPdf } = require('../services/documentExport');

const router = express.Router();
const allowedPermissions = new Set([
  'read:payments',
  'write:payment_intents',
  'write:payment_verification',
  'read:webhooks',
  'read:merchant_accounts',
  'write:sandbox'
]);

const hashSecret = (secret) => crypto.createHash('sha256').update(secret).digest('hex');
const buildCredentials = (environment) => {
  const prefix = environment === 'production' ? 'live' : 'test';
  return {
    apiKey: `ck_${prefix}_${crypto.randomBytes(18).toString('hex')}`,
    secret: `sk_${prefix}_${crypto.randomBytes(32).toString('hex')}`,
    webhookSecret: `whsec_${crypto.randomBytes(32).toString('hex')}`
  };
};
const sanitizeApp = (application) => {
  const data = application.toObject ? application.toObject() : { ...application };
  delete data.apiSecretHash;
  delete data.webhookSecretHash;
  return data;
};
const normalizePermissions = (permissions) => {
  if (!Array.isArray(permissions) || permissions.some((permission) => typeof permission !== 'string')) {
    return { error: 'Permissions must be an array of supported scopes' };
  }
  const normalized = [...new Set(permissions)];
  const unsupported = normalized.filter((permission) => !allowedPermissions.has(permission));
  return unsupported.length
    ? { error: `Unsupported permissions: ${unsupported.join(', ')}` }
    : { permissions: normalized };
};
const parseWebhook = (value) => {
  const webhookUrl = String(value || '').trim();
  if (!webhookUrl) return { webhookUrl: '' };
  const result = parseWebhookUrl(webhookUrl);
  return result.error ? { error: result.error } : { webhookUrl: result.url.toString() };
};
const getCollectionAccount = async (ownerId, requestedId) => {
  if (requestedId && String(requestedId) !== String(ownerId)) {
    return { error: 'Applications can only collect into an account owned by their developer account', status: 403 };
  }
  const account = await User.findById(ownerId)
    .select('_id fullName accountNumber currency currencyCode isLocked isAdmin');
  if (!account || account.isAdmin) return { error: 'Eligible collection account not found', status: 404 };
  if (account.isLocked) return { error: 'Your account is locked and cannot receive application payments', status: 400 };
  return { account };
};
const audit = async (ownerId, applicationId, action, details = {}) => {
  try {
    await DeveloperAuditLog.create({ ownerId, applicationId, action, details });
  } catch (error) {
    console.error('[DEVELOPER_AUDIT] Unable to persist audit event:', error.message);
    return false;
  }
  return true;
};
const ownedApplication = (id, ownerId) => ApiApplication.findOne({ _id: id, ownerId });

router.use(auth);

router.get('/apps', async (req, res) => {
  try {
    const apps = await ApiApplication.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    res.json({ apps: apps.map(sanitizeApp) });
  } catch (error) {
    console.error('[DEVELOPER] App list error:', error.message);
    res.status(500).json({ error: 'Unable to load applications' });
  }
});

router.get('/merchant-accounts', async (req, res) => {
  try {
    const account = await User.findById(req.user._id)
      .select('_id fullName accountNumber currency currencyCode isLocked isAdmin');
    const accounts = account && !account.isAdmin ? [{
      _id: account._id,
      fullName: account.fullName,
      accountNumber: account.accountNumber,
      currency: account.currencyCode || 'USD',
      status: account.isLocked ? 'locked' : 'active',
      accountType: 'personal',
      eligible: !account.isLocked,
      ineligibilityReason: account.isLocked ? 'Locked accounts cannot receive application payments.' : ''
    }] : [];
    res.json({ accounts });
  } catch (error) {
    console.error('[DEVELOPER] Collection account lookup error:', error.message);
    res.status(500).json({ error: 'Unable to load collection accounts' });
  }
});

router.post('/apps', async (req, res) => {
  try {
    const body = req.body || {};
    const name = String(body.name || '').trim();
    const description = String(body.description || '').trim();
    const environment = body.environment || 'sandbox';
    const status = body.status || 'enabled';
    const permissions = normalizePermissions(body.permissions || []);
    const webhook = parseWebhook(body.webhookUrl);

    if (name.length < 2 || name.length > 80) return res.status(400).json({ error: 'Application name must be 2–80 characters' });
    if (description.length > 500) return res.status(400).json({ error: 'Description cannot exceed 500 characters' });
    if (!['sandbox', 'production'].includes(environment)) return res.status(400).json({ error: 'Environment must be sandbox or production' });
    if (!['enabled', 'disabled'].includes(status)) return res.status(400).json({ error: 'Status must be enabled or disabled' });
    if (permissions.error) return res.status(400).json({ error: permissions.error });
    if (environment === 'production' && permissions.permissions.includes('write:sandbox')) {
      return res.status(400).json({ error: 'Production applications cannot be granted write:sandbox' });
    }
    if (environment === 'sandbox' && permissions.permissions.includes('write:payment_verification')) {
      return res.status(400).json({ error: 'Payment verification is available to production applications only' });
    }
    if (webhook.error) return res.status(400).json({ error: webhook.error });

    const result = await getCollectionAccount(req.user._id, body.collectionAccountId);
    if (result.error) return res.status(result.status).json({ error: result.error });

    const keys = buildCredentials(environment);
    const application = await ApiApplication.create({
      ownerId: req.user._id,
      name,
      description,
      environment,
      status,
      permissions: permissions.permissions,
      webhookUrl: webhook.webhookUrl,
      collectionAccountId: result.account._id,
      collectionAccountNumber: result.account.accountNumber || '',
      collectionCurrency: result.account.currencyCode || 'USD',
      apiKey: keys.apiKey,
      apiSecretHash: hashSecret(keys.secret),
      apiSecretLast4: keys.secret.slice(-4),
      webhookSecretHash: hashSecret(keys.webhookSecret),
      webhookSecretLast4: keys.webhookSecret.slice(-4),
      credentialVersion: 2
    });
    await audit(req.user._id, application._id, 'application.created', { environment, permissions: permissions.permissions });
    res.status(201).json({
      app: sanitizeApp(application),
      apiKey: keys.apiKey,
      secret: keys.secret,
      webhookSecret: keys.webhookSecret,
      message: 'Credentials are shown once. Store them securely in your server environment.'
    });
  } catch (error) {
    console.error('[DEVELOPER] App creation error:', error.message);
    res.status(500).json({ error: 'Unable to create application' });
  }
});

router.put('/apps/:id', async (req, res) => {
  try {
    const application = await ownedApplication(req.params.id, req.user._id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    const body = req.body || {};

    if (body.environment !== undefined && body.environment !== application.environment) {
      return res.status(400).json({ error: 'Environment cannot be changed after creation; create a separate application and credentials' });
    }
    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (name.length < 2 || name.length > 80) return res.status(400).json({ error: 'Application name must be 2–80 characters' });
      application.name = name;
    }
    if (body.description !== undefined) {
      const description = String(body.description).trim();
      if (description.length > 500) return res.status(400).json({ error: 'Description cannot exceed 500 characters' });
      application.description = description;
    }
    if (body.status !== undefined) {
      if (!['enabled', 'disabled'].includes(body.status)) return res.status(400).json({ error: 'Status must be enabled or disabled' });
      if (body.status === 'enabled' && application.revokedAt) {
        return res.status(409).json({ error: 'Revoked credentials cannot be re-enabled; rotate the API credentials first' });
      }
      application.status = body.status;
    }
    if (body.permissions !== undefined) {
      const permissions = normalizePermissions(body.permissions);
      if (permissions.error) return res.status(400).json({ error: permissions.error });
      if (application.environment === 'production' && permissions.permissions.includes('write:sandbox')) {
        return res.status(400).json({ error: 'Production applications cannot be granted write:sandbox' });
      }
      if (application.environment === 'sandbox' && permissions.permissions.includes('write:payment_verification')) {
        return res.status(400).json({ error: 'Payment verification is available to production applications only' });
      }
      application.permissions = permissions.permissions;
    }
    if (body.webhookUrl !== undefined) {
      const webhook = parseWebhook(body.webhookUrl);
      if (webhook.error) return res.status(400).json({ error: webhook.error });
      application.webhookUrl = webhook.webhookUrl;
    }
    if (body.collectionAccountId !== undefined) {
      const result = await getCollectionAccount(req.user._id, body.collectionAccountId);
      if (result.error) return res.status(result.status).json({ error: result.error });
      application.collectionAccountId = result.account._id;
      application.collectionAccountNumber = result.account.accountNumber || '';
      application.collectionCurrency = result.account.currencyCode || 'USD';
    }

    await application.save();
    await audit(req.user._id, application._id, 'application.updated', {
      fields: Object.keys(body).filter((key) => ['name', 'description', 'status', 'permissions', 'webhookUrl', 'collectionAccountId'].includes(key))
    });
    res.json({ app: sanitizeApp(application), message: 'Application updated' });
  } catch (error) {
    console.error('[DEVELOPER] App update error:', error.message);
    res.status(500).json({ error: 'Unable to update application' });
  }
});

router.post('/apps/:id/regenerate', async (req, res) => {
  try {
    const application = await ownedApplication(req.params.id, req.user._id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    const keys = buildCredentials(application.environment);
    application.apiKey = keys.apiKey;
    application.apiSecretHash = hashSecret(keys.secret);
    application.apiSecretLast4 = keys.secret.slice(-4);
    application.credentialVersion = 2;
    application.revokedAt = null;
    await application.save();
    await audit(req.user._id, application._id, 'credentials.rotated');
    res.json({
      app: sanitizeApp(application),
      apiKey: keys.apiKey,
      secret: keys.secret,
      message: 'API credentials rotated. The previous credentials are no longer valid.'
    });
  } catch (error) {
    console.error('[DEVELOPER] Credential rotation error:', error.message);
    res.status(500).json({ error: 'Unable to rotate API credentials' });
  }
});

router.post('/apps/:id/webhook-secret/rotate', async (req, res) => {
  try {
    const application = await ownedApplication(req.params.id, req.user._id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    const webhookSecret = `whsec_${crypto.randomBytes(32).toString('hex')}`;
    application.webhookSecretHash = hashSecret(webhookSecret);
    application.webhookSecretLast4 = webhookSecret.slice(-4);
    await application.save();
    await audit(req.user._id, application._id, 'webhook_secret.rotated');
    res.json({ webhookSecret, message: 'Webhook signing secret rotated. Update your receiver; the old secret is no longer valid.' });
  } catch (error) {
    console.error('[DEVELOPER] Webhook secret rotation error:', error.message);
    res.status(500).json({ error: 'Unable to rotate webhook signing secret' });
  }
});

router.post('/apps/:id/revoke', async (req, res) => {
  try {
    const application = await ownedApplication(req.params.id, req.user._id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    application.status = 'disabled';
    application.revokedAt = new Date();
    await application.save();
    await audit(req.user._id, application._id, 'application.revoked');
    res.json({ app: sanitizeApp(application), message: 'Application credentials revoked' });
  } catch (error) {
    console.error('[DEVELOPER] Credential revoke error:', error.message);
    res.status(500).json({ error: 'Unable to revoke application credentials' });
  }
});

router.post('/apps/:id/webhooks/test', async (req, res) => {
  try {
    const application = await ownedApplication(req.params.id, req.user._id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    if (!application.webhookUrl) return res.status(400).json({ error: 'Configure an HTTPS webhook endpoint first' });
    const delivery = await enqueueWebhook(application, 'developer.webhook_test', {
      message: 'Credixa webhook test event',
      application_id: String(application._id)
    });
    await audit(req.user._id, application._id, 'webhook.test_requested', { eventId: delivery.eventId });
    res.status(202).json({ delivery, message: 'Test webhook queued; check delivery logs for the receiver response.' });
  } catch (error) {
    console.error('[DEVELOPER] Webhook test error:', error.message);
    res.status(500).json({ error: 'Unable to queue webhook test' });
  }
});

router.get('/webhooks', async (req, res) => {
  try {
    const apps = await ApiApplication.find({ ownerId: req.user._id }).select('_id');
    const deliveries = await WebhookDelivery.find({ applicationId: { $in: apps.map((app) => app._id) } })
      .sort({ createdAt: -1 }).limit(50);
    res.json({ deliveries });
  } catch (error) {
    console.error('[DEVELOPER] Webhook log error:', error.message);
    res.status(500).json({ error: 'Unable to load webhook deliveries' });
  }
});

router.get('/apps/:id/logs', async (req, res) => {
  try {
    const application = await ownedApplication(req.params.id, req.user._id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    const logs = await WebhookDelivery.find({ applicationId: application._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ logs });
  } catch (error) {
    console.error('[DEVELOPER] App webhook log error:', error.message);
    res.status(500).json({ error: 'Unable to load application deliveries' });
  }
});

router.get('/apps/:id/request-logs', async (req, res) => {
  try {
    const application = await ownedApplication(req.params.id, req.user._id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    const logs = await APIRequestLog.find({ applicationId: application._id, ownerId: req.user._id })
      .sort({ createdAt: -1 }).limit(100);
    res.json({ logs });
  } catch (error) {
    console.error('[DEVELOPER] API request log error:', error.message);
    res.status(500).json({ error: 'Unable to load API request logs' });
  }
});

router.post('/apps/:id/webhooks/:deliveryId/retry', async (req, res) => {
  try {
    const application = await ownedApplication(req.params.id, req.user._id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    const delivery = await WebhookDelivery.findOne({
      _id: req.params.deliveryId,
      applicationId: application._id,
      status: 'failed'
    });
    if (!delivery) return res.status(404).json({ error: 'Failed delivery not found for this application' });
    delivery.status = 'queued';
    delivery.attempts = 0;
    delivery.lastError = '';
    delivery.nextAttemptAt = new Date();
    await delivery.save();
    await audit(req.user._id, application._id, 'webhook.delivery_retry_requested', { eventId: delivery.eventId });
    res.status(202).json({ delivery, message: 'Webhook delivery queued for retry.' });
  } catch (error) {
    console.error('[DEVELOPER] Webhook retry error:', error.message);
    res.status(500).json({ error: 'Unable to retry webhook delivery' });
  }
});

const docsDirectory = path.join(__dirname, '..', 'docs');
const sendDocument = (res, filename, contentType, downloadName = filename) => {
  const filePath = path.join(docsDirectory, filename);
  res.type(contentType);
  return res.download(filePath, downloadName);
};

router.get('/docs/api-v1', (req, res) => {
  try {
    res.json({
      version: 'v1',
      apiVersion: '2026-11-17',
      lastUpdated: '2026-11-17',
      markdown: fs.readFileSync(path.join(docsDirectory, 'api-v1.md'), 'utf8')
    });
  } catch (error) {
    console.error('[DEVELOPER] Documentation read error:', error.message);
    res.status(500).json({ error: 'Unable to load API documentation' });
  }
});

router.get('/docs/api-v1.md', (req, res) => sendDocument(res, 'api-v1.md', 'text/markdown; charset=utf-8'));
router.get('/docs/openapi-v1.json', (req, res) => sendDocument(res, 'openapi-v1.json', 'application/vnd.oai.openapi+json;version=3.1'));
router.get('/docs/changelog.md', (req, res) => sendDocument(res, 'changelog.md', 'text/markdown; charset=utf-8'));
router.get('/docs/examples/node-payment-example.js', (req, res) => sendDocument(res, path.join('examples', 'node-payment-example.js'), 'text/javascript; charset=utf-8'));
router.get('/docs/examples/node-webhook-example.js', (req, res) => sendDocument(res, path.join('examples', 'node-webhook-example.js'), 'text/javascript; charset=utf-8'));
router.get('/docs/api-v1.pdf', (req, res) => {
  try {
    const markdown = fs.readFileSync(path.join(docsDirectory, 'api-v1.md'), 'utf8');
    res.type('application/pdf');
    res.set('Content-Disposition', 'attachment; filename="credixa-api-v1.pdf"');
    res.send(markdownToPdf(markdown));
  } catch (error) {
    console.error('[DEVELOPER] PDF export error:', error.message);
    res.status(500).json({ error: 'Unable to generate API documentation PDF' });
  }
});

router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await DeveloperAuditLog.find({ ownerId: req.user._id }).sort({ createdAt: -1 }).limit(100);
    res.json({ logs });
  } catch (error) {
    console.error('[DEVELOPER] Audit log error:', error.message);
    res.status(500).json({ error: 'Unable to load developer audit logs' });
  }
});

module.exports = router;
