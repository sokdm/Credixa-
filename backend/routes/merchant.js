const express = require('express');
const crypto = require('crypto');
const ApiApplication = require('../models/APIApplication');
const PaymentIntent = require('../models/PaymentIntent');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const WebhookDelivery = require('../models/WebhookDelivery');
const { apiAuth, requireScope } = require('../middleware/apiAuth');
const { enqueueWebhook } = require('../services/webhookDelivery');

const router = express.Router();
router.use(apiAuth);

const serializeIntent = (intent) => ({
  reference: intent.reference,
  amount: intent.amount,
  currency: intent.currency,
  merchantName: intent.merchantName,
  status: intent.status,
  environment: intent.environment,
  simulated: Boolean(intent.isSimulation),
  createdAt: intent.createdAt,
  expiresAt: intent.expiresAt,
  completedAt: intent.completedAt,
  transferReference: intent.transferReference || null,
  metadata: intent.metadata || {}
});

const findIntent = async (application, reference) => {
  let intent = await PaymentIntent.findOne({
    applicationId: application._id,
    reference: String(reference || '').slice(0, 100)
  });
  if (!intent) return null;
  if (intent.status === 'pending' && intent.expiresAt && intent.expiresAt <= new Date()) {
    const now = new Date();
    const expiredIntent = await PaymentIntent.findOneAndUpdate(
      { _id: intent._id, status: 'pending', expiresAt: { $lte: now } },
      { $set: { status: 'expired', updatedAt: now } },
      { new: true }
    );
    if (expiredIntent) {
      intent = expiredIntent;
      await enqueueWebhook(application, 'payment_intent.expired', { payment_intent: serializeIntent(intent) });
    } else {
      intent = await PaymentIntent.findById(intent._id);
    }
  }
  return intent;
};

const getCollectionAccount = async (application) => {
  if (!application.collectionAccountId ||
      String(application.collectionAccountId) !== String(application.ownerId)) return null;
  const account = await User.findOne({ _id: application.ownerId, isLocked: { $ne: true }, isAdmin: { $ne: true } })
    .select('_id fullName accountNumber currencyCode');
  if (!account) return null;
  const accountCurrency = account.currencyCode || 'USD';
  if (!/^[A-Z]{3}$/.test(application.collectionCurrency || '')) {
    application.collectionCurrency = accountCurrency;
    await application.save();
  }
  if (accountCurrency !== application.collectionCurrency) return null;
  return account;
};

const verifyInternalTransfer = async (application, intent, transferReference) => {
  const transaction = await Transaction.findOne({
    reference: String(transferReference),
    receiverId: application.collectionAccountId,
    type: 'internal',
    status: 'completed',
    isSimulation: { $ne: true }
  }).select('reference amount currency createdAt senderId receiverId');
  if (!transaction || transaction.createdAt < intent.createdAt ||
      (intent.expiresAt && transaction.createdAt > intent.expiresAt) ||
      Number(transaction.amount) !== Number(intent.amount)) return null;

  const sender = await User.findById(transaction.senderId).select('currencyCode');
  if (!sender || (sender.currencyCode || 'USD') !== intent.currency) return null;
  return transaction;
};

router.get('/collection-account', requireScope('read:merchant_accounts'), async (req, res) => {
  try {
    const application = req.apiApp;
    const account = await getCollectionAccount(application);
    if (!account) return res.status(404).json({ error: 'Eligible collection account is unavailable or no longer active' });
    res.json({
      collectionAccount: {
        id: String(account._id),
        name: account.fullName,
        identifier: account.accountNumber,
        currency: account.currencyCode || 'USD',
        type: 'personal',
        status: 'active'
      }
    });
  } catch (error) {
    console.error('[MERCHANT] Collection account lookup error:', error.message);
    res.status(500).json({ error: 'Unable to retrieve collection account' });
  }
});

router.post('/payment-intent', requireScope('write:payment_intents'), async (req, res) => {
  try {
    const application = req.apiApp;
    const amount = Number(req.body?.amount);
    const currency = String(req.body?.currency || application.collectionCurrency || '').toUpperCase();
    const idempotencyKey = req.get('idempotency-key');
    const metadata = req.body?.metadata === undefined ? {} : req.body.metadata;
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000 || Math.round(amount * 100) !== amount * 100) {
      return res.status(400).json({ error: 'amount must be a positive number with no more than two decimal places' });
    }
    if (!/^[A-Z]{3}$/.test(currency)) return res.status(400).json({ error: 'currency must be a three-letter ISO code' });
    if (currency !== application.collectionCurrency) {
      return res.status(400).json({ error: 'Payment currency must match the configured collection account currency' });
    }
    if (idempotencyKey && (idempotencyKey.length > 128 || !/^[\x21-\x7E]+$/.test(idempotencyKey))) {
      return res.status(400).json({ error: 'Idempotency-Key must be 1–128 printable ASCII characters' });
    }
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata) ||
        Buffer.byteLength(JSON.stringify(metadata)) > 4096) {
      return res.status(400).json({ error: 'metadata must be an object no larger than 4 KB' });
    }

    const collectionAccount = await getCollectionAccount(application);
    if (!collectionAccount) return res.status(409).json({ error: 'Configured collection account is not eligible or currency has changed' });

    if (idempotencyKey) {
      const existing = await PaymentIntent.findOne({ applicationId: application._id, idempotencyKey });
      if (existing) {
        const sameRequest = Number(existing.amount) === amount && existing.currency === currency;
        if (!sameRequest) return res.status(409).json({ error: 'Idempotency-Key was already used with different payment parameters' });
        return res.status(200).json({ success: true, replayed: true, paymentIntent: serializeIntent(existing) });
      }
    }

    const intent = await PaymentIntent.create({
      applicationId: application._id,
      ownerId: application.ownerId,
      reference: `pi_${crypto.randomBytes(18).toString('hex')}`,
      merchantName: application.name,
      amount,
      currency,
      environment: application.environment,
      isSimulation: application.environment === 'sandbox',
      merchantCollectionAccountId: collectionAccount._id,
      merchantCollectionAccountNumber: collectionAccount.accountNumber || '',
      customerName: String(req.body?.customerName || '').trim().slice(0, 120),
      status: 'pending',
      webhookUrl: application.webhookUrl,
      idempotencyKey: idempotencyKey || null,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      metadata
    });
    await enqueueWebhook(application, 'payment_intent.created', { payment_intent: serializeIntent(intent) });
    await enqueueWebhook(application, 'payment_intent.pending', { payment_intent: serializeIntent(intent) });
    res.status(201).json({
      success: true,
      paymentIntent: serializeIntent(intent),
      testMode: application.environment === 'sandbox',
      message: application.environment === 'sandbox'
        ? 'Sandbox payment intent created. It does not move or reserve real funds.'
        : 'Payment intent created. No funds are moved until a completed Credixa transfer is verified.'
    });
  } catch (error) {
    if (error.code === 11000 && req.get('idempotency-key')) {
      try {
        const existing = await PaymentIntent.findOne({
          applicationId: req.apiApp._id,
          idempotencyKey: req.get('idempotency-key')
        });
        if (existing) {
          if (Number(existing.amount) !== Number(req.body?.amount) ||
              existing.currency !== String(req.body?.currency || req.apiApp.collectionCurrency || '').toUpperCase()) {
            return res.status(409).json({ error: 'Idempotency-Key was already used with different payment parameters' });
          }
          return res.status(200).json({ success: true, replayed: true, paymentIntent: serializeIntent(existing) });
        }
      } catch (lookupError) {
        console.error('[MERCHANT] Idempotency recovery error:', lookupError.message);
      }
    }
    console.error('[MERCHANT] Payment intent creation error:', error.message);
    res.status(500).json({ error: 'Unable to create payment intent' });
  }
});

router.get('/payment-intent/:reference/status', requireScope('read:payments'), async (req, res) => {
  try {
    const intent = await findIntent(req.apiApp, req.params.reference);
    if (!intent) return res.status(404).json({ error: 'Payment intent not found' });
    res.json({ reference: intent.reference, status: intent.status, environment: intent.environment, simulated: intent.isSimulation, expiresAt: intent.expiresAt });
  } catch (error) {
    console.error('[MERCHANT] Payment status lookup error:', error.message);
    res.status(500).json({ error: 'Unable to retrieve payment status' });
  }
});

router.get('/payment-intent/:reference', requireScope('read:payments'), async (req, res) => {
  try {
    const intent = await findIntent(req.apiApp, req.params.reference);
    if (!intent) return res.status(404).json({ error: 'Payment intent not found' });
    res.json({ paymentIntent: serializeIntent(intent) });
  } catch (error) {
    console.error('[MERCHANT] Payment intent lookup error:', error.message);
    res.status(500).json({ error: 'Unable to retrieve payment intent' });
  }
});

const verifyHandler = async (req, res) => {
  try {
    if (req.apiApp.environment !== 'production') {
      return res.status(403).json({ error: 'Transfer verification is only available to production applications; use sandbox outcome simulation for tests' });
    }
    const { reference, transferReference } = req.body || {};
    if (!reference || !transferReference) {
      return res.status(400).json({ error: 'reference and transferReference are required' });
    }
    const intent = await findIntent(req.apiApp, reference);
    if (!intent) return res.status(404).json({ error: 'Payment intent not found' });
    if (intent.environment !== 'production' || intent.isSimulation) {
      return res.status(403).json({ error: 'Sandbox intents cannot be verified against financial transactions' });
    }
    if (intent.status === 'completed') {
      if (intent.transferReference === transferReference) {
        return res.json({ success: true, paymentIntent: serializeIntent(intent), replayed: true });
      }
      return res.status(409).json({ error: 'Payment intent has already been completed by another transfer' });
    }
    if (intent.status !== 'pending') return res.status(409).json({ error: `Payment intent cannot be verified from status ${intent.status}` });

    const transaction = await verifyInternalTransfer(req.apiApp, intent, transferReference);
    if (!transaction) {
      return res.status(422).json({ error: 'No matching completed Credixa internal transfer was found for this merchant, amount, currency, and time window' });
    }
    intent.transferReference = transaction.reference;
    intent.status = 'completed';
    intent.completedAt = transaction.createdAt;
    await intent.save();
    await enqueueWebhook(req.apiApp, 'payment_intent.succeeded', {
      payment_intent: serializeIntent(intent),
      transaction: { reference: transaction.reference, amount: transaction.amount, currency: intent.currency, createdAt: transaction.createdAt }
    });
    res.json({ success: true, paymentIntent: serializeIntent(intent), transactionReference: transaction.reference });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.transferReference) {
      return res.status(409).json({ error: 'This Credixa transfer has already been applied to another payment intent' });
    }
    console.error('[MERCHANT] Transfer verification error:', error.message);
    res.status(500).json({ error: 'Unable to verify payment transfer' });
  }
};

router.post('/payment-intent/verify', requireScope('write:payment_verification'), verifyHandler);
router.post('/verify-transfer', requireScope('write:payment_verification'), verifyHandler);

router.get('/payment-intent/:reference/transaction', requireScope('read:payments'), async (req, res) => {
  try {
    const intent = await findIntent(req.apiApp, req.params.reference);
    if (!intent) return res.status(404).json({ error: 'Payment intent not found' });
    if (intent.environment === 'sandbox' || intent.isSimulation || !intent.transferReference) {
      return res.status(404).json({ error: 'No financial transaction is created for this payment intent' });
    }
    const transaction = await Transaction.findOne({
      reference: intent.transferReference,
      receiverId: req.apiApp.collectionAccountId,
      status: 'completed',
      type: 'internal',
      isSimulation: { $ne: true }
    }).select('reference amount createdAt narration');
    if (!transaction) return res.status(404).json({ error: 'Verified transaction not found' });
    res.json({
      transaction: {
        reference: transaction.reference,
        paymentIntentReference: intent.reference,
        amount: transaction.amount,
        currency: intent.currency,
        status: 'completed',
        createdAt: transaction.createdAt,
        description: transaction.narration
      }
    });
  } catch (error) {
    console.error('[MERCHANT] Payment transaction lookup error:', error.message);
    res.status(500).json({ error: 'Unable to retrieve payment transaction' });
  }
});

router.post('/payment-intent/:reference/simulate', requireScope('write:sandbox'), async (req, res) => {
  try {
    if (req.apiApp.environment !== 'sandbox') return res.status(403).json({ error: 'Outcome simulation is only available to sandbox applications' });
    const outcome = req.body?.outcome;
    if (!['succeeded', 'failed', 'expired'].includes(outcome)) {
      return res.status(400).json({ error: 'outcome must be succeeded, failed, or expired' });
    }
    const intent = await findIntent(req.apiApp, req.params.reference);
    if (!intent) return res.status(404).json({ error: 'Payment intent not found' });
    if (intent.environment !== 'sandbox' || !intent.isSimulation) return res.status(403).json({ error: 'This payment intent is not a sandbox simulation' });
    if (intent.status !== 'pending') {
      if ((outcome === 'succeeded' && intent.status === 'completed') ||
          (outcome === intent.status && ['failed', 'expired'].includes(intent.status))) {
        return res.json({ success: true, replayed: true, testMode: true, paymentIntent: serializeIntent(intent) });
      }
      return res.status(409).json({ error: `Payment intent already reached status ${intent.status}` });
    }

    intent.status = outcome === 'succeeded' ? 'completed' : outcome;
    intent.completedAt = outcome === 'succeeded' ? new Date() : null;
    await intent.save();
    const eventType = outcome === 'succeeded' ? 'payment_intent.succeeded' : `payment_intent.${outcome}`;
    await enqueueWebhook(req.apiApp, eventType, {
      payment_intent: serializeIntent(intent),
      test: true,
      note: 'Sandbox outcome only; no real funds moved or ledger transaction created.'
    });
    res.json({
      success: true,
      testMode: true,
      simulated: true,
      paymentIntent: serializeIntent(intent),
      message: 'Sandbox outcome recorded without changing any financial balance.'
    });
  } catch (error) {
    console.error('[MERCHANT] Sandbox outcome error:', error.message);
    res.status(500).json({ error: 'Unable to simulate sandbox payment outcome' });
  }
});

router.get('/webhook-deliveries', requireScope('read:webhooks'), async (req, res) => {
  try {
    const deliveries = await WebhookDelivery.find({ applicationId: req.apiApp._id })
      .sort({ createdAt: -1 }).limit(50)
      .select('eventId eventType status url responseStatus attempts lastAttemptAt nextAttemptAt lastError deliveredAt createdAt');
    res.json({ deliveries });
  } catch (error) {
    console.error('[MERCHANT] Webhook delivery list error:', error.message);
    res.status(500).json({ error: 'Unable to retrieve webhook deliveries' });
  }
});

module.exports = router;
