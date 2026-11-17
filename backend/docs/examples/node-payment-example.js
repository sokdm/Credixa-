const crypto = require('node:crypto');

const API_ORIGIN = process.env.CREDIXA_API_ORIGIN;
const API_KEY = process.env.CREDIXA_API_KEY;
const API_SECRET = process.env.CREDIXA_API_SECRET;

if (!API_ORIGIN || !API_KEY || !API_SECRET) {
  throw new Error('Set CREDIXA_API_ORIGIN, CREDIXA_API_KEY, and CREDIXA_API_SECRET');
}

async function credixaRequest(method, path, body, idempotencyKey) {
  const rawBody = body === undefined ? '' : JSON.stringify(body);
  const timestamp = String(Date.now());
  const derivedKey = crypto.createHash('sha256').update(API_SECRET, 'utf8').digest();
  const signature = crypto.createHmac('sha256', derivedKey)
    .update(`${timestamp}.${rawBody}`, 'utf8').digest('hex');
  const headers = {
    'X-API-Key': API_KEY,
    'X-Request-Timestamp': timestamp,
    'X-Signature': signature
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

  const response = await fetch(new URL(path, API_ORIGIN), {
    method,
    headers,
    body: body === undefined ? undefined : rawBody
  });
  const responseBody = await response.json();
  if (!response.ok) throw new Error(`Credixa returned ${response.status}: ${JSON.stringify(responseBody)}`);
  return responseBody;
}

async function main() {
  const created = await credixaRequest('POST', '/api/merchant/payment-intent', {
    amount: 42.5,
    currency: 'USD',
    metadata: { order_id: 'order_123' }
  }, `order_123-${crypto.randomUUID()}`);
  const reference = created.paymentIntent.reference;
  console.log('Intent:', created.paymentIntent);

  const current = await credixaRequest(
    'GET',
    `/api/merchant/payment-intent/${encodeURIComponent(reference)}/status`
  );
  console.log('Status:', current);

  if (current.environment === 'sandbox' && current.status === 'pending') {
    const simulated = await credixaRequest(
      'POST',
      `/api/merchant/payment-intent/${encodeURIComponent(reference)}/simulate`,
      { outcome: 'succeeded' }
    );
    console.log('Sandbox-only outcome:', simulated);
  }

  // In production, verify only after the customer made a real completed
  // Credixa internal transfer to the configured collection account.
  // Send its actual Credixa transaction reference to:
  // POST /api/merchant/payment-intent/verify
  // { reference, transferReference }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
