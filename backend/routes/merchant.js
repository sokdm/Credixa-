const express = require('express');
const crypto = require('crypto');
const ApiApplication = require('../models/APIApplication');
const PaymentIntent = require('../models/PaymentIntent');
const User = require('../models/User');
const WebhookDelivery = require('../models/WebhookDelivery');
const { apiAuth } = require('../middleware/apiAuth');
const router = express.Router();

const sendWebhook = async (application, payload, eventType = 'payment_intent_verified') => {
  if (!application.webhookUrl) return null;

  try {
    const signedPayload = JSON.stringify(payload);
    const timestamp = String(Date.now());
    const signature = crypto.createHmac('sha256', application.apiSecretHash)
      .update(`${timestamp}.${signedPayload}`)
      .digest('hex');

    const response = await fetch(application.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-request-timestamp': timestamp,
        'x-signature': signature,
        'x-api-key': application.apiKey
      },
      body: signedPayload
    });

    const text = await response.text();
    const delivery = await WebhookDelivery.create({
      applicationId: application._id,
      eventType,
      status: response.ok ? 'sent' : 'failed',
      url: application.webhookUrl,
      payload,
      responseStatus: response.status,
      responseBody: text,
      attempts: 1
    });

    return delivery;
  } catch (error) {
    console.error('[MERCHANT] Webhook delivery failed:', error.message);
    await WebhookDelivery.create({
      applicationId: application._id,
      eventType,
      status: 'failed',
      url: application.webhookUrl,
      payload,
      responseStatus: 500,
      responseBody: error.message,
      attempts: 1
    });
    return null;
  }
};

router.get('/collection-account', apiAuth, async (req, res) => {
  try {
    const app = req.apiApp;
    if (!app.permissions.includes('read:merchant_accounts')) {
      return res.status(403).json({ error: 'Application is not allowed to read collection account data' });
    }

    if (!app.collectionAccountId) {
      return res.status(404).json({ error: 'No collection account configured for this application' });
    }

    const account = await User.findById(app.collectionAccountId).select('fullName accountNumber balance currency email isLocked');
    if (!account) {
      return res.status(404).json({ error: 'Configured collection account not found' });
    }

    res.json({
      collectionAccount: {
        _id: account._id,
        fullName: account.fullName,
        accountNumber: account.accountNumber,
        balance: account.balance,
        currency: account.currency,
        email: account.email,
        isLocked: account.isLocked
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/payment-intent', apiAuth, async (req, res) => {
  try {
    const app = req.apiApp;
    if (!app.permissions.includes('write:payment_intents')) {
      return res.status(403).json({ error: 'Application is not allowed to create payment intents' });
    }

    const amount = Number(req.body?.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const collectionAccount = await User.findById(app.collectionAccountId || req.body.collectionAccountId || app.ownerId);
    if (!collectionAccount) {
      return res.status(404).json({ error: 'Collection account not found' });
    }

    const reference = req.body?.reference || `PI-${Date.now()}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const paymentIntent = await PaymentIntent.create({
      applicationId: app._id,
      ownerId: app.ownerId,
      reference,
      merchantName: req.body?.merchantName || app.name,
      amount,
      currency: (req.body?.currency || app.collectionCurrency || collectionAccount.currency || 'USD').toUpperCase(),
      merchantCollectionAccountId: collectionAccount._id,
      merchantCollectionAccountNumber: collectionAccount.accountNumber,
      customerName: req.body?.customerName || 'Customer',
      customerAccountNumber: req.body?.customerAccountNumber || '',
      status: 'pending',
      webhookUrl: app.webhookUrl,
      metadata: req.body?.metadata || {}
    });

    const response = {
      success: true,
      paymentIntent: {
        reference: paymentIntent.reference,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        merchantName: paymentIntent.merchantName,
        destinationAccountNumber: paymentIntent.merchantCollectionAccountNumber,
        destinationAccountName: collectionAccount.fullName,
        status: paymentIntent.status,
        createdAt: paymentIntent.createdAt
      }
    };

    if (app.webhookUrl) {
      await sendWebhook(app, {
        event: 'payment_intent.created',
        reference: paymentIntent.reference,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        destinationAccountNumber: paymentIntent.merchantCollectionAccountNumber,
        createdAt: paymentIntent.createdAt
      }, 'payment_intent.created');
    }

    res.status(201).json(response);
  } catch (error) {
    console.error('[MERCHANT] Payment intent creation error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify-transfer', apiAuth, async (req, res) => {
  try {
    const app = req.apiApp;
    const { reference, transferReference, amount } = req.body || {};
    if (!reference || !transferReference) {
      return res.status(400).json({ error: 'reference and transferReference are required' });
    }

    const paymentIntent = await PaymentIntent.findOne({ reference, applicationId: app._id });
    if (!paymentIntent) return res.status(404).json({ error: 'Payment intent not found' });

    const verifiedAmount = Number(amount || paymentIntent.amount);
    paymentIntent.transferReference = transferReference;
    paymentIntent.status = Number(verifiedAmount) === Number(paymentIntent.amount) ? 'authorized' : 'failed';
    await paymentIntent.save();

    const payload = {
      event: 'payment_intent_verified',
      reference: paymentIntent.reference,
      transferReference,
      status: paymentIntent.status,
      amount: verifiedAmount,
      currency: paymentIntent.currency
    };

    if (app.webhookUrl) {
      await sendWebhook(app, payload, 'payment_intent_verified');
    }

    res.json({ success: true, paymentIntent: payload });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
