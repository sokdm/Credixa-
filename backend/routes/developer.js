const express = require('express');
const crypto = require('crypto');
const ApiApplication = require('../models/APIApplication');
const WebhookDelivery = require('../models/WebhookDelivery');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

const sanitizeApp = (app) => {
  const data = app.toObject ? app.toObject() : { ...app };
  delete data.apiSecretHash;
  return data;
};

const buildKeyPair = () => {
  const apiKey = `ck_${crypto.randomBytes(18).toString('hex')}`;
  const secret = `sk_${crypto.randomBytes(32).toString('hex')}`;
  return { apiKey, secret };
};

router.get('/apps', auth, async (req, res) => {
  try {
    const apps = await ApiApplication.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    res.json({ apps: apps.map(sanitizeApp) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/merchant-accounts', auth, async (req, res) => {
  try {
    const accounts = await User.find({
      $or: [
        { _id: req.user._id },
        { isAdmin: false }
      ]
    }).select('fullName accountNumber balance currency email isLocked').sort({ fullName: 1 });

    res.json({
      accounts: accounts.map((account) => ({
        _id: account._id,
        fullName: account.fullName,
        accountNumber: account.accountNumber,
        balance: account.balance,
        currency: account.currency,
        email: account.email,
        isLocked: account.isLocked
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/apps', auth, async (req, res) => {
  try {
    const {
      name,
      description = '',
      environment = 'sandbox',
      status = 'enabled',
      permissions = ['read:payments', 'write:payment_intents', 'read:webhooks'],
      webhookUrl = '',
      collectionAccountId = null
    } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Application name is required' });
    }

    const selectedAccount = collectionAccountId ? await User.findById(collectionAccountId) : req.user;
    if (!selectedAccount) {
      return res.status(404).json({ error: 'Collection account not found' });
    }

    const keys = buildKeyPair();
    const application = await ApiApplication.create({
      ownerId: req.user._id,
      name: String(name).trim(),
      description: String(description).trim(),
      environment,
      status,
      permissions: Array.isArray(permissions) ? permissions : [String(permissions)],
      webhookUrl: String(webhookUrl || '').trim(),
      collectionAccountId: selectedAccount._id,
      collectionAccountNumber: selectedAccount.accountNumber || '',
      collectionCurrency: selectedAccount.currency || 'USD',
      apiKey: keys.apiKey,
      apiSecretHash: crypto.createHash('sha256').update(keys.secret).digest('hex'),
      apiSecretLast4: keys.secret.slice(-6)
    });

    const appResponse = sanitizeApp(application);
    res.status(201).json({
      app: appResponse,
      apiKey: keys.apiKey,
      secret: keys.secret,
      message: 'Secret displayed once. Store it in your server-side environment.'
    });
  } catch (error) {
    console.error('[DEVELOPER] App creation error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.put('/apps/:id', auth, async (req, res) => {
  try {
    const app = await ApiApplication.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!app) return res.status(404).json({ error: 'Application not found' });

    if (req.body.name) app.name = String(req.body.name).trim();
    if (req.body.description !== undefined) app.description = String(req.body.description).trim();
    if (req.body.environment) app.environment = req.body.environment;
    if (req.body.status) app.status = req.body.status;
    if (req.body.permissions) app.permissions = Array.isArray(req.body.permissions) ? req.body.permissions : [String(req.body.permissions)];
    if (req.body.webhookUrl !== undefined) app.webhookUrl = String(req.body.webhookUrl || '').trim();
    if (req.body.collectionAccountId) {
      const collectionAccount = await User.findById(req.body.collectionAccountId);
      if (!collectionAccount) return res.status(404).json({ error: 'Collection account not found' });
      app.collectionAccountId = collectionAccount._id;
      app.collectionAccountNumber = collectionAccount.accountNumber || '';
      app.collectionCurrency = collectionAccount.currency || 'USD';
    }

    await app.save();
    res.json({ app: sanitizeApp(app), message: 'Application updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/apps/:id/regenerate', auth, async (req, res) => {
  try {
    const app = await ApiApplication.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!app) return res.status(404).json({ error: 'Application not found' });

    const keys = buildKeyPair();
    app.apiKey = keys.apiKey;
    app.apiSecretHash = crypto.createHash('sha256').update(keys.secret).digest('hex');
    app.apiSecretLast4 = keys.secret.slice(-6);
    app.revokedAt = null;
    app.status = 'enabled';
    await app.save();

    res.json({
      app: sanitizeApp(app),
      apiKey: keys.apiKey,
      secret: keys.secret,
      message: 'Credentials rotated successfully. Store the new secret securely.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/apps/:id/revoke', auth, async (req, res) => {
  try {
    const app = await ApiApplication.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!app) return res.status(404).json({ error: 'Application not found' });

    app.status = 'disabled';
    app.revokedAt = new Date();
    await app.save();

    res.json({ app: sanitizeApp(app), message: 'Application revoked' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/webhooks', auth, async (req, res) => {
  try {
    const apps = await ApiApplication.find({ ownerId: req.user._id }).select('_id');
    const appIds = apps.map((app) => app._id);
    const deliveries = await WebhookDelivery.find({ applicationId: { $in: appIds } }).sort({ createdAt: -1 }).limit(50);
    res.json({ deliveries });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/apps/:id/logs', auth, async (req, res) => {
  try {
    const app = await ApiApplication.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!app) return res.status(404).json({ error: 'Application not found' });

    const logs = await WebhookDelivery.find({ applicationId: app._id }).sort({ createdAt: -1 }).limit(20);
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/apps/:id/webhooks/retry', auth, async (req, res) => {
  try {
    const app = await ApiApplication.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!app) return res.status(404).json({ error: 'Application not found' });

    const failedDelivery = await WebhookDelivery.findOne({ applicationId: app._id, status: 'failed' }).sort({ createdAt: -1 });
    if (!failedDelivery) {
      return res.status(404).json({ error: 'No failed webhook deliveries to retry' });
    }

    const payload = failedDelivery.payload || {};
    const timestamp = String(Date.now());
    const signature = crypto.createHmac('sha256', app.apiSecretHash)
      .update(`${timestamp}.${JSON.stringify(payload)}`)
      .digest('hex');

    const response = await fetch(app.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-request-timestamp': timestamp,
        'x-signature': signature,
        'x-api-key': app.apiKey
      },
      body: JSON.stringify(payload)
    });

    const responseBody = await response.text();
    failedDelivery.status = response.ok ? 'sent' : 'failed';
    failedDelivery.responseStatus = response.status;
    failedDelivery.responseBody = responseBody;
    failedDelivery.attempts = (failedDelivery.attempts || 0) + 1;
    failedDelivery.updatedAt = new Date();
    await failedDelivery.save();

    res.json({ delivery: failedDelivery, success: response.ok });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
