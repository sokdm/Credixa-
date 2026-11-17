const crypto = require('crypto');
const dns = require('dns').promises;
const https = require('https');
const net = require('net');
const { URL } = require('url');
const WebhookDelivery = require('../models/WebhookDelivery');
const PaymentIntent = require('../models/PaymentIntent');
const ApiApplication = require('../models/APIApplication');

const MAX_ATTEMPTS = 5;
const RETRY_DELAYS_MS = [15_000, 60_000, 300_000, 900_000];
const MAX_RESPONSE_BYTES = 2048;
const MAX_WEBHOOK_BODY_BYTES = 64 * 1024;
let workerTimer = null;
let workerRunning = false;

const isPublicAddress = (address) => {
  const family = net.isIP(address);
  if (family === 4) {
    const [a, b] = address.split('.').map(Number);
    return !(
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0) ||
      (a === 198 && (b === 18 || b === 19 || b === 51)) ||
      (a === 203 && b === 0)
    );
  }
  if (family === 6) {
    const normalized = address.toLowerCase();
    if (normalized.startsWith('::ffff:')) {
      return isPublicAddress(normalized.slice(7));
    }
    const firstHextet = parseInt(normalized.split(':')[0] || '0', 16);
    return firstHextet >= 0x2000 && firstHextet <= 0x3fff;
  }
  return false;
};

const parseWebhookUrl = (value) => {
  let url;
  try {
    url = new URL(String(value || ''));
  } catch {
    return { error: 'Webhook URL must be a valid absolute URL' };
  }
  if (url.protocol !== 'https:' || !url.hostname || url.username || url.password || url.hash) {
    return { error: 'Webhook URL must use HTTPS and cannot contain credentials or a fragment' };
  }
  if (url.href.length > 2048 || net.isIP(url.hostname)) {
    return { error: 'Webhook URL must use a hostname and be no longer than 2048 characters' };
  }
  return { url };
};

const requestWebhook = async (target, payload, timestamp, signature) => {
  const { url } = target;
  const records = await dns.lookup(url.hostname, { all: true, verbatim: true });
  if (!records.length || records.some(({ address }) => !isPublicAddress(address))) {
    throw new Error('Webhook hostname resolves to a non-public network address');
  }
  const address = records[0];
  const body = JSON.stringify(payload);
  if (Buffer.byteLength(body) > MAX_WEBHOOK_BODY_BYTES) {
    throw new Error('Webhook payload exceeds the delivery size limit');
  }

  return new Promise((resolve, reject) => {
    const request = https.request(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(body),
        'user-agent': 'Credixa-Webhooks/1.0',
        'x-credixa-event-id': payload.id,
        'x-credixa-timestamp': timestamp,
        'x-credixa-signature': signature,
        'x-request-timestamp': timestamp,
        'x-signature': signature
      },
      timeout: 10_000,
      lookup: (hostname, options, callback) => {
        if (options && options.all) {
          callback(null, [address]);
          return;
        }
        callback(null, address.address, address.family);
      }
    }, (response) => {
      let responseBody = '';
      response.on('data', (chunk) => {
        if (Buffer.byteLength(responseBody) < MAX_RESPONSE_BYTES) {
          responseBody += chunk.toString('utf8').slice(0, MAX_RESPONSE_BYTES - Buffer.byteLength(responseBody));
        }
      });
      response.on('end', () => resolve({
        status: response.statusCode || 0,
        body: responseBody
      }));
      response.on('error', reject);
    });
    request.on('timeout', () => request.destroy(new Error('Webhook request timed out')));
    request.on('error', reject);
    request.end(body);
  });
};

const deliverOne = async () => {
  if (workerRunning) return false;
  workerRunning = true;
  try {
    const now = new Date();
    const delivery = await WebhookDelivery.findOneAndUpdate(
      {
        $or: [
          { status: { $in: ['queued', 'failed'] }, attempts: { $lt: MAX_ATTEMPTS }, nextAttemptAt: { $lte: now } },
          { status: 'delivering', lastAttemptAt: { $lt: new Date(now.getTime() - 30_000) }, attempts: { $lt: MAX_ATTEMPTS } }
        ]
      },
      {
        $set: { status: 'delivering', lastAttemptAt: now, lastError: '', updatedAt: now },
        $inc: { attempts: 1 }
      },
      { new: true, sort: { nextAttemptAt: 1, createdAt: 1 } }
    );
    if (!delivery) return false;

    try {
      const target = parseWebhookUrl(delivery.url);
      if (target.error) throw new Error(target.error);
      const application = await ApiApplication.findById(delivery.applicationId)
        .select('webhookSecretHash');
      if (!application?.webhookSecretHash) throw new Error('Webhook signing secret is not configured');

      const timestamp = String(Math.floor(Date.now() / 1000));
      const body = JSON.stringify(delivery.payload);
      const signature = `v1=${crypto.createHmac('sha256', Buffer.from(application.webhookSecretHash, 'hex'))
        .update(`${timestamp}.${body}`).digest('hex')}`;
      const response = await requestWebhook(target, delivery.payload, timestamp, signature);
      delivery.responseStatus = response.status;
      delivery.responseBody = response.body;
      if (response.status >= 200 && response.status < 300) {
        delivery.status = 'sent';
        delivery.deliveredAt = new Date();
        delivery.nextAttemptAt = null;
        delivery.lastError = '';
      } else {
        delivery.status = 'failed';
        delivery.lastError = `Webhook endpoint returned HTTP ${response.status}`;
        delivery.nextAttemptAt = delivery.attempts < MAX_ATTEMPTS
          ? new Date(Date.now() + RETRY_DELAYS_MS[delivery.attempts - 1])
          : null;
      }
    } catch (error) {
      delivery.status = 'failed';
      delivery.responseStatus = null;
      delivery.responseBody = '';
      delivery.lastError = String(error.message || 'Webhook delivery failed').slice(0, 500);
      delivery.nextAttemptAt = delivery.attempts < MAX_ATTEMPTS
        ? new Date(Date.now() + RETRY_DELAYS_MS[delivery.attempts - 1])
        : null;
    }
    await delivery.save();
    return true;
  } finally {
    workerRunning = false;
  }
};

const expirePendingIntents = async () => {
  const due = await PaymentIntent.find({ status: 'pending', expiresAt: { $lte: new Date() } })
    .sort({ expiresAt: 1 }).limit(100).select('_id applicationId reference amount currency environment isSimulation createdAt expiresAt metadata');
  for (const candidate of due) {
    const updated = await PaymentIntent.findOneAndUpdate(
      { _id: candidate._id, status: 'pending' },
      { $set: { status: 'expired', updatedAt: new Date() } },
      { new: true }
    );
    if (!updated) continue;
    const application = await ApiApplication.findById(updated.applicationId).select('webhookUrl webhookSecretHash environment');
    if (application?.webhookUrl) {
      await enqueueWebhook(application, 'payment_intent.expired', {
        payment_intent: {
          reference: updated.reference,
          amount: updated.amount,
          currency: updated.currency,
          status: updated.status,
          environment: updated.environment,
          simulated: updated.isSimulation,
          createdAt: updated.createdAt,
          expiresAt: updated.expiresAt
        }
      });
    }
  }
};

const enqueueWebhook = async (application, eventType, data) => {
  if (!application.webhookUrl) return null;
  const eventId = `evt_${crypto.randomBytes(18).toString('hex')}`;
  const delivery = await WebhookDelivery.create({
    applicationId: application._id,
    eventId,
    eventType,
    status: 'queued',
    url: application.webhookUrl,
    payload: {
      id: eventId,
      type: eventType,
      api_version: '2026-11-17',
      created_at: new Date().toISOString(),
      livemode: application.environment === 'production',
      data
    },
    nextAttemptAt: new Date()
  });
  setImmediate(() => deliverOne().catch((error) => console.error('[WEBHOOK] Delivery worker error:', error.message)));
  return delivery;
};

const startWebhookWorker = () => {
  if (workerTimer) return;
  workerTimer = setInterval(async () => {
    if (require('mongoose').connection.readyState !== 1) return;
    try {
      await expirePendingIntents();
      await deliverOne();
    } catch (error) {
      console.error('[WEBHOOK] Worker error:', error.message);
    }
  }, 10_000);
  if (workerTimer.unref) workerTimer.unref();
};

module.exports = {
  enqueueWebhook,
  startWebhookWorker,
  parseWebhookUrl,
  deliverOne,
  MAX_ATTEMPTS
};
