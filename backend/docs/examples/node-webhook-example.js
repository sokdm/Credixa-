const crypto = require('node:crypto');

const WEBHOOK_SECRET = process.env.CREDIXA_WEBHOOK_SECRET;
if (!WEBHOOK_SECRET) throw new Error('Set CREDIXA_WEBHOOK_SECRET');

function verifyCredixaWebhook(rawBody, timestamp, signatureHeader) {
  const seconds = Number(timestamp);
  if (!Number.isSafeInteger(seconds) || Math.abs(Date.now() / 1000 - seconds) > 300) {
    throw new Error('Webhook timestamp is stale');
  }
  const derivedKey = crypto.createHash('sha256').update(WEBHOOK_SECRET, 'utf8').digest();
  const expected = `v1=${crypto.createHmac('sha256', derivedKey)
    .update(`${timestamp}.${rawBody}`, 'utf8').digest('hex')}`;
  const providedBuffer = Buffer.from(String(signatureHeader || ''), 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  if (providedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    throw new Error('Webhook signature is invalid');
  }
  return JSON.parse(rawBody);
}

// Express example:
// app.post('/webhooks/credixa', express.raw({ type: 'application/json' }), async (req, res) => {
//   const event = verifyCredixaWebhook(
//     req.body.toString('utf8'),
//     req.get('X-Credixa-Timestamp'),
//     req.get('X-Credixa-Signature')
//   );
//   if (await alreadyProcessed(event.id)) return res.sendStatus(200);
//   await saveEventId(event.id); // Persist before applying non-idempotent effects.
//   await processCredixaEvent(event);
//   return res.sendStatus(200);
// });

module.exports = { verifyCredixaWebhook };
