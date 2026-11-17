# Credixa Developer API v1

**API version:** `2026-11-17`  
**Reference version:** `v1`  
**Last updated:** 2026-11-17  
**Base path:** `/api` on the Credixa API origin

> **Important product boundary:** Credixa currently has no external card processor, bank-payment rail, refund service, or reversal service. Creating an intent does not move or reserve funds. A production intent can be completed only after the API verifies an existing, completed Credixa internal transfer to the application's configured account. Sandbox outcomes never change balances or create ledger transactions.

## Getting started

1. Sign in to Credixa and open **Developer Tools**.
2. Create an application. Choose either **Sandbox** or **Production**; create a separate application and credential set for each environment.
3. Select an eligible collection account. The current platform supports the developer's own active Credixa personal account only. It does not expose or permit choosing another user's account.
4. Choose only the scopes the integration needs and optionally register an HTTPS webhook URL.
5. Store the API secret and webhook signing secret in a server-side secrets manager. Each is displayed only at creation or rotation. Never put either secret in a browser, mobile bundle, source control, or URL.
6. Sign each API request as described below, create a payment intent, and use the returned reference in your checkout.
7. In production, complete payment only after an actual Credixa internal transfer is made to the selected account. Submit that transfer's Credixa transaction reference to the verification endpoint.

**Sandbox and production use the same route paths** and are separated by distinct application records and credentials. Keys use `ck_test_...` for sandbox and `ck_live_...` for production. A sandbox intent is explicitly marked `simulated: true`; its test outcome endpoint is unavailable to production applications.

## Authentication and signing

Developer Portal management routes use the Credixa user session (`Authorization: Bearer <Credixa user JWT>`). Merchant API routes use a separate API key and API secret; they do not accept the portal JWT.

Send these headers to every `/api/merchant/*` request:

| Header | Value |
|---|---|
| `X-API-Key` | Application key (`ck_test_...` or `ck_live_...`) |
| `X-Request-Timestamp` | Unix timestamp in **milliseconds** |
| `X-Signature` | Lowercase hex HMAC-SHA256 digest (64 hex characters) |
| `Content-Type` | `application/json` for requests with JSON bodies |

The API secret is never sent over the wire. Compute `key = SHA256(UTF8(api_secret))`, then compute:

```text
X-Signature = hex(HMAC-SHA256(key, UTF8(timestamp + "." + exact_raw_request_body)))
```

For a request with no body, the raw body is the empty string. Sign the exact JSON bytes sent; do not reserialize after signing. The timestamp must be within five minutes of server time. Use HTTPS. Requests are limited to 60 per application per five minutes; the server also applies a shared API/IP limit of 100 requests per 15 minutes.

API key identifies the application and environment; it is not sufficient to authenticate. API secret is the private signing credential. A webhook signing secret is a different credential used only to verify messages sent from Credixa to your webhook. Rotating either secret invalidates the previous value for that purpose. API secrets are stored as SHA-256 digests and never returned by list endpoints.

Applications created before credential version 2 retain their existing signature key derivation until their API credentials are rotated. Rotating credentials issues a version 2 `ck_test_...` or `ck_live_...` key and switches to the signing procedure above.

### Credential rotation

Rotate an API secret with `POST /api/developer/apps/{id}/regenerate`. The response contains the new key and secret once; old API credentials stop working immediately. Rotate webhook secrets with `POST /api/developer/apps/{id}/webhook-secret/rotate`; update your receiver before relying on future deliveries. Revoking an application disables its API credentials; revoked credentials cannot be re-enabled unless they are rotated first. Production credentials must never be copied into a sandbox integration or vice versa.

## Permissions

Scopes are checked server-side for each merchant endpoint.

| Scope | Allows |
|---|---|
| `read:payments` | Read intents, status, and verified transaction details belonging to this application |
| `write:payment_intents` | Create payment intents for the application's configured collection account |
| `write:payment_verification` | Verify a matching completed Credixa internal transfer |
| `read:webhooks` | Read this application's webhook delivery status and logs |
| `read:merchant_accounts` | Read the application's own configured collection account summary |
| `write:sandbox` | Simulate a sandbox intent outcome; cannot be used by production applications |

Requests missing a required scope return `403`. Scope changes take effect on the next request.
`write:sandbox` is valid only for sandbox applications; `write:payment_verification` is valid only for production applications. Sandbox applications must use the simulation route instead of transfer verification.

## Merchant collection accounts

A collection account is the Credixa account assigned to receive the merchant's incoming internal transfers. The existing Credixa data model does not define a separate merchant-account entity or business account type. For now, the only eligible account is the application owner's own active, unlocked personal account. Locked accounts are rejected; other users' accounts are never listed or selectable.

An application has one collection account. Applications can have different collection accounts only when those accounts belong to the same authenticated owner; the current platform model provides one personal account per user. Currency must match the account's ISO currency code. Payment intents snapshot the account ID and account number at creation; changing the application account affects only future intents. The API returns the account identifier, name, ISO currency, type (`personal`), and status, but not the account balance or email.

If no eligible account appears, unlock or configure the owner's Credixa account through the existing account support flow. There is no separate merchant-account onboarding route today.

## Payment API

### Create a payment intent

`POST /api/merchant/payment-intent`  
**Scope:** `write:payment_intents`  
**Authentication:** API key + signed request headers  
**Idempotency:** Optional `Idempotency-Key` header (1–128 printable ASCII characters). Reuse with the same amount and currency returns the original intent; different amount/currency returns `409`.

Request body:

```json
{
  "amount": 42.5,
  "currency": "USD",
  "customerName": "Example Customer",
  "metadata": { "order_id": "order_123" }
}
```

`amount` is positive, finite, and has at most two decimal places. `currency` is a three-letter ISO currency code and must match the selected collection account. `customerName` is optional and limited to 120 characters. `metadata` is an optional JSON object limited to 4 KB. Do not send customer bank-account numbers or card data.

Success (`201`, or `200` for an idempotent replay):

```json
{
  "success": true,
  "paymentIntent": {
    "reference": "pi_<random>",
    "amount": 42.5,
    "currency": "USD",
    "merchantName": "Example Store",
    "status": "pending",
    "environment": "sandbox",
    "simulated": true,
    "createdAt": "2026-11-17T12:00:00.000Z",
    "expiresAt": "2026-11-17T12:30:00.000Z",
    "completedAt": null,
    "transferReference": null,
    "metadata": { "order_id": "order_123" }
  },
  "testMode": true,
  "message": "Sandbox payment intent created. It does not move or reserve real funds."
}
```

Intents expire 30 minutes after creation. They do not debit a customer or credit a merchant when created. Production completion requires a separately completed Credixa internal transfer. Sandbox intents carry `simulated: true`.

### Retrieve an intent

`GET /api/merchant/payment-intent/{reference}`  
**Scope:** `read:payments`

Returns `{ "paymentIntent": { ... } }` using the intent shape above. An application can retrieve only its own intents. Unknown references return `404`.

### Retrieve status

`GET /api/merchant/payment-intent/{reference}/status`  
**Scope:** `read:payments`

Returns:

```json
{ "reference": "pi_<random>", "status": "pending", "environment": "sandbox", "simulated": true, "expiresAt": "2026-11-17T12:30:00.000Z" }
```

The service expires intents in the background. Reads also enforce expiration. Expired intents cannot be verified or simulated as successful.

### Verify a completed Credixa internal transfer

`POST /api/merchant/payment-intent/verify`  
**Legacy alias:** `POST /api/merchant/verify-transfer`  
**Scope:** `write:payment_verification`

Body:

```json
{ "reference": "pi_<random>", "transferReference": "CRX123ABC456" }
```

The server independently looks up the transaction and confirms that it is completed, internal, non-simulated, received by this application's configured account, for the exact intent amount and currency, and created during the intent's validity window. The caller-supplied amount is not trusted. A mismatch returns `422`; no intent is marked paid. Repeating verification with the same transfer reference is safe and returns the completed result. This endpoint does not initiate a transfer.

### Retrieve the verified transaction

`GET /api/merchant/payment-intent/{reference}/transaction`  
**Scope:** `read:payments`

Returns the associated completed internal Credixa transaction (`reference`, payment intent reference, amount, currency, status, date, and description). Pending, sandbox, or unverified intents have no financial transaction and return `404`.

### Simulate a sandbox outcome

`POST /api/merchant/payment-intent/{reference}/simulate`  
**Scope:** `write:sandbox`; **sandbox applications only**

Body: `{ "outcome": "succeeded" }`, where `outcome` is `succeeded`, `failed`, or `expired`. This is a one-way transition from `pending`. It emits the corresponding webhook event, but **does not move funds, alter balances, or create a ledger transaction**. A production key receives `403`.

### Failures, refunds, and reversals

Sandbox simulation can produce `failed` or `expired` statuses. A production failure can currently occur when verification does not match, but the intent remains pending so a valid transfer can still be submitted. Credixa currently has no production payment processor, automatic capture, reversal, or refund route. No refund or reversal endpoint/event is implemented; do not treat an intent as settled until the verified internal Credixa transaction exists.

## Webhooks

Configure one HTTPS webhook URL per application in the Developer Portal. Credixa validates HTTPS URL syntax at configuration and resolves the hostname before delivery; endpoints resolving to non-public addresses are rejected to reduce SSRF risk. Redirects are not followed. Each request has a 10-second timeout and a 64 KB payload limit.

Supported events:

- `developer.webhook_test`
- `payment_intent.created`
- `payment_intent.pending`
- `payment_intent.succeeded`
- `payment_intent.failed` (sandbox simulation)
- `payment_intent.expired`

Example:

```json
{
  "id": "evt_<random>",
  "type": "payment_intent.succeeded",
  "api_version": "2026-11-17",
  "created_at": "2026-11-17T12:04:00.000Z",
  "livemode": false,
  "data": {
    "payment_intent": {
      "reference": "pi_<random>",
      "amount": 42.5,
      "currency": "USD",
      "status": "completed",
      "environment": "sandbox",
      "simulated": true
    },
    "test": true,
    "note": "Sandbox outcome only; no real funds moved or ledger transaction created."
  }
}
```

Headers: `X-Credixa-Event-Id`, `X-Credixa-Timestamp` (Unix seconds), and `X-Credixa-Signature` (`v1=<hex>`). The signature is `HMAC-SHA256(key, timestamp + "." + exact_raw_body)`, where `key = SHA256(UTF8(webhook_signing_secret))`. Verify the timestamp is within five minutes, verify the signature using a constant-time comparison, and record each event ID before processing so retries are idempotent. Verify against the raw request bytes, not parsed/re-serialized JSON.

Credixa retries non-2xx responses and network errors up to five total attempts, with retry delays of 15 seconds, 1 minute, 5 minutes, and 15 minutes. A 2xx response acknowledges delivery; redirects, timeouts, DNS/private-address rejection, and other status codes are failures, not successes. Event IDs and payloads stay the same on retries; timestamps/signatures are regenerated for each attempt. Delivery is at-least-once, and ordering is not guaranteed. Return any `2xx` only after safely accepting the event. Delivery history includes status, attempt count, last response code, failure reason, and timestamps. Developers can queue a test event or retry a failed delivery from the portal.

## Error responses

Errors use JSON `{ "error": "..." }`. Important statuses: `400` invalid input, `401` missing/invalid credentials or timestamp/signature, `403` insufficient scope or environment restriction, `404` not found in this application's data, `409` idempotency/state conflict, `422` transfer mismatch, `429` rate limit, `500` unexpected server failure, and `503` database unavailable.

## Integration examples

Download `node-payment-example.js` and `node-webhook-example.js` from the Developer Portal. The payment example signs exact JSON bytes, creates an intent, retrieves status, and simulates a sandbox result. Its production example verifies only a real Credixa transaction reference; it does not pretend to create an external payment.

## API reference and changelog

- OpenAPI JSON: `openapi-v1.json`
- Node payment example: `node-payment-example.js`
- Node webhook verification example: `node-webhook-example.js`
- Changelog: `changelog.md`

This reference describes only routes implemented in this version. Refunds, reversals, payment capture, external-bank settlement, separate merchant business-account onboarding, payment-method tokenization, and out-of-order settlement handling are not currently provided.
