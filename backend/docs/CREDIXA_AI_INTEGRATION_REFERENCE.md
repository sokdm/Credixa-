# Credixa - AI Integration Reference

**Updated:** 2026-11-17\
**Purpose:** Self-contained reference for an AI assistant implementing an integration with the existing Credixa application.

> Use the implemented contracts and limitations below as the source of truth. Do not invent settlement, account, card issuance, refund, reversal, or processor capabilities that are not described here. Keep API secrets out of source code, prompts, browser persistence, and logs.

## Credixa card-request API

### Purpose and authentication

These routes manage requests for Credixa cards. They are separate from the Developer/Merchant API documented below and use the signed-in Credixa user session: send `Authorization: Bearer <Credixa user JWT>`. The router is mounted at `/api/card`.

The card endpoints create and track card requests; they do not issue a card, activate a card, create a card payment instrument, or perform a payment. Card types accepted by the model are `virtual`, `physical`, and `credit`. The model's intended lifecycle values are `pending`, `approved`, `shipped`, and `delivered`.

### Submit a request

`POST /api/card/request` - authenticated customer.

Request JSON:

```json
{
  "cardType": "virtual",
  "address": "123 Example Street, Example City",
  "phone": "+1 555 0100"
}
```

The server assigns the authenticated user's ID and name, sets status to `pending`, and records creation time. Success returns `{ "message": "Card request submitted successfully", "card": { ... } }`. Required fields and the card-type enum are enforced by the Mongoose model; validation failures currently return HTTP 500 from this handler rather than a client-validation status.

### List the current user's requests

`GET /api/card/my-cards` - authenticated customer. Returns an array of the current user's requests, newest first. It does not expose another user's requests.

### Admin request management

`GET /api/card/all` - admin session only. Returns all requests, newest first, with the related user's `fullName` and `email` populated.

`PUT /api/card/{cardId}` - admin session only. Body: `{ "status": "approved" }`. Intended status values are `pending`, `approved`, `shipped`, and `delivered`. Current handler passes the supplied status directly to `findByIdAndUpdate` without enabling schema validators and returns `null` for an unknown ID; clients should only submit a listed status and should not interpret `null` as a successful update.

Errors from these handlers return `{ "error": "..." }`; the current implementation generally uses HTTP 500 for caught errors. Customer endpoints require a valid session; admin endpoints require an admin session.

## Developer and Merchant API reference

# Credixa Developer API v1

**API version:** `2026-11-17`\
**Reference version:** `v1`\
**Last updated:** 2026-11-17\
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

`POST /api/merchant/payment-intent`\
**Scope:** `write:payment_intents`\
**Authentication:** API key + signed request headers\
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

`GET /api/merchant/payment-intent/{reference}`\
**Scope:** `read:payments`

Returns `{ "paymentIntent": { ... } }` using the intent shape above. An application can retrieve only its own intents. Unknown references return `404`.

### Retrieve status

`GET /api/merchant/payment-intent/{reference}/status`\
**Scope:** `read:payments`

Returns:

```json
{ "reference": "pi_<random>", "status": "pending", "environment": "sandbox", "simulated": true, "expiresAt": "2026-11-17T12:30:00.000Z" }
```

The service expires intents in the background. Reads also enforce expiration. Expired intents cannot be verified or simulated as successful.

### Verify a completed Credixa internal transfer

`POST /api/merchant/payment-intent/verify`\
**Legacy alias:** `POST /api/merchant/verify-transfer`\
**Scope:** `write:payment_verification`

Body:

```json
{ "reference": "pi_<random>", "transferReference": "CRX123ABC456" }
```

The server independently looks up the transaction and confirms that it is completed, internal, non-simulated, received by this application's configured account, for the exact intent amount and currency, and created during the intent's validity window. The caller-supplied amount is not trusted. A mismatch returns `422`; no intent is marked paid. Repeating verification with the same transfer reference is safe and returns the completed result. This endpoint does not initiate a transfer.

### Retrieve the verified transaction

`GET /api/merchant/payment-intent/{reference}/transaction`\
**Scope:** `read:payments`

Returns the associated completed internal Credixa transaction (`reference`, payment intent reference, amount, currency, status, date, and description). Pending, sandbox, or unverified intents have no financial transaction and return `404`.

### Simulate a sandbox outcome

`POST /api/merchant/payment-intent/{reference}/simulate`\
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

## OpenAPI 3.1 contract

The following is the complete machine-readable contract shipped with the portal. The API reference above includes authentication, production/sandbox boundaries, errors, and webhook behavior.

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Credixa Developer API",
    "version": "2026-11-17",
    "summary": "Application-scoped Credixa payment intents and webhook delivery.",
    "description": "Sandbox intents are simulations and never move funds. Production intents can complete only after verification of a completed Credixa internal transfer. No external-bank settlement, capture, refund, or reversal API is available.",
    "contact": { "name": "Credixa Support" }
  },
  "servers": [{ "url": "{origin}", "variables": { "origin": { "default": "https://credixa-api.onrender.com" } } }],
  "security": [{ "ApiKey": [], "RequestTimestamp": [], "RequestSignature": [] }],
  "tags": [
    { "name": "Merchant accounts" },
    { "name": "Payment intents" },
    { "name": "Webhooks" }
  ],
  "paths": {
    "/api/merchant/collection-account": {
      "get": {
        "tags": ["Merchant accounts"],
        "summary": "Read the application's own collection account",
        "description": "Returns the owner account assigned to this application; never exposes balance or email.",
        "x-required-permission": "read:merchant_accounts",
        "responses": {
          "200": { "description": "Collection account", "content": { "application/json": { "schema": { "type": "object", "properties": { "collectionAccount": { "$ref": "#/components/schemas/CollectionAccount" } }, "required": ["collectionAccount"] } } } },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "403": { "$ref": "#/components/responses/Forbidden" },
          "404": { "$ref": "#/components/responses/NotFound" }
        }
      }
    },
    "/api/merchant/payment-intent": {
      "post": {
        "tags": ["Payment intents"],
        "summary": "Create a pending payment intent",
        "description": "Does not debit or credit any account. Payment intents expire after 30 minutes.",
        "x-required-permission": "write:payment_intents",
        "parameters": [{ "$ref": "#/components/parameters/IdempotencyKey" }],
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/CreatePaymentIntent" }, "example": { "amount": 42.5, "currency": "USD", "customerName": "Example Customer", "metadata": { "order_id": "order_123" } } } } },
        "responses": {
          "201": { "description": "Created", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/PaymentIntentResponse" } } } },
          "200": { "description": "Idempotent replay", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/PaymentIntentResponse" } } } },
          "400": { "$ref": "#/components/responses/BadRequest" },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "403": { "$ref": "#/components/responses/Forbidden" },
          "409": { "$ref": "#/components/responses/Conflict" },
          "429": { "$ref": "#/components/responses/RateLimited" }
        }
      }
    },
    "/api/merchant/payment-intent/{reference}": {
      "get": {
        "tags": ["Payment intents"],
        "summary": "Retrieve a payment intent",
        "x-required-permission": "read:payments",
        "parameters": [{ "$ref": "#/components/parameters/Reference" }],
        "responses": {
          "200": { "description": "Payment intent", "content": { "application/json": { "schema": { "type": "object", "properties": { "paymentIntent": { "$ref": "#/components/schemas/PaymentIntent" } } } } } },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "403": { "$ref": "#/components/responses/Forbidden" },
          "404": { "$ref": "#/components/responses/NotFound" }
        }
      }
    },
    "/api/merchant/payment-intent/{reference}/status": {
      "get": {
        "tags": ["Payment intents"],
        "summary": "Retrieve payment status",
        "x-required-permission": "read:payments",
        "parameters": [{ "$ref": "#/components/parameters/Reference" }],
        "responses": {
          "200": { "description": "Current status", "content": { "application/json": { "schema": { "type": "object", "properties": { "reference": { "type": "string" }, "status": { "$ref": "#/components/schemas/PaymentStatus" }, "environment": { "type": "string" }, "simulated": { "type": "boolean" }, "expiresAt": { "type": ["string", "null"], "format": "date-time" } } } } } },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "403": { "$ref": "#/components/responses/Forbidden" },
          "404": { "$ref": "#/components/responses/NotFound" }
        }
      }
    },
    "/api/merchant/payment-intent/verify": {
      "post": {
        "tags": ["Payment intents"],
        "summary": "Verify a completed Credixa internal transfer",
        "description": "Verifies a real, completed, non-simulated transaction received by this app's collection account. Does not initiate a transfer.",
        "x-required-permission": "write:payment_verification",
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/VerifyPayment" } } } },
        "responses": {
          "200": { "description": "Verified payment", "content": { "application/json": { "schema": { "type": "object", "properties": { "success": { "type": "boolean" }, "paymentIntent": { "$ref": "#/components/schemas/PaymentIntent" }, "transactionReference": { "type": "string" }, "replayed": { "type": "boolean" } } } } } },
          "400": { "$ref": "#/components/responses/BadRequest" },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "403": { "$ref": "#/components/responses/Forbidden" },
          "404": { "$ref": "#/components/responses/NotFound" },
          "409": { "$ref": "#/components/responses/Conflict" },
          "422": { "description": "No matching completed transfer", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } } }
        }
      }
    },
    "/api/merchant/verify-transfer": {
      "post": {
        "tags": ["Payment intents"],
        "summary": "Legacy alias for transfer verification",
        "deprecated": true,
        "x-required-permission": "write:payment_verification",
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/VerifyPayment" } } } },
        "responses": { "200": { "description": "Verification result" }, "400": { "$ref": "#/components/responses/BadRequest" }, "401": { "$ref": "#/components/responses/Unauthorized" }, "403": { "$ref": "#/components/responses/Forbidden" }, "404": { "$ref": "#/components/responses/NotFound" }, "422": { "description": "No matching transfer" } }
      }
    },
    "/api/merchant/payment-intent/{reference}/transaction": {
      "get": {
        "tags": ["Payment intents"],
        "summary": "Retrieve the verified Credixa transaction",
        "x-required-permission": "read:payments",
        "parameters": [{ "$ref": "#/components/parameters/Reference" }],
        "responses": {
          "200": { "description": "Verified ledger transaction" },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "403": { "$ref": "#/components/responses/Forbidden" },
          "404": { "description": "No financial transaction exists for this intent" }
        }
      }
    },
    "/api/merchant/payment-intent/{reference}/simulate": {
      "post": {
        "tags": ["Payment intents"],
        "summary": "Simulate a sandbox outcome",
        "description": "Sandbox only. Creates no financial transaction and changes no balance.",
        "x-required-permission": "write:sandbox",
        "parameters": [{ "$ref": "#/components/parameters/Reference" }],
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "type": "object", "required": ["outcome"], "properties": { "outcome": { "type": "string", "enum": ["succeeded", "failed", "expired"] } } } } } },
        "responses": {
          "200": { "description": "Sandbox outcome recorded" },
          "400": { "$ref": "#/components/responses/BadRequest" },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "403": { "$ref": "#/components/responses/Forbidden" },
          "404": { "$ref": "#/components/responses/NotFound" },
          "409": { "$ref": "#/components/responses/Conflict" }
        }
      }
    },
    "/api/merchant/webhook-deliveries": {
      "get": {
        "tags": ["Webhooks"],
        "summary": "List this application's webhook deliveries",
        "x-required-permission": "read:webhooks",
        "responses": {
          "200": { "description": "Latest 50 deliveries" },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "403": { "$ref": "#/components/responses/Forbidden" }
        }
      }
    }
  },
  "components": {
    "securitySchemes": {
      "ApiKey": { "type": "apiKey", "in": "header", "name": "X-API-Key" },
      "RequestTimestamp": { "type": "apiKey", "in": "header", "name": "X-Request-Timestamp", "description": "Unix timestamp in milliseconds." },
      "RequestSignature": { "type": "apiKey", "in": "header", "name": "X-Signature", "description": "HMAC-SHA256 of timestamp + '.' + exact raw body, using SHA256(api secret) as the key." }
    },
    "parameters": {
      "Reference": { "name": "reference", "in": "path", "required": true, "schema": { "type": "string", "maxLength": 100 } },
      "IdempotencyKey": { "name": "Idempotency-Key", "in": "header", "required": false, "schema": { "type": "string", "minLength": 1, "maxLength": 128 } }
    },
    "schemas": {
      "CollectionAccount": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "identifier": { "type": "string" },
          "currency": { "type": "string", "pattern": "^[A-Z]{3}$" },
          "type": { "const": "personal" },
          "status": { "const": "active" }
        },
        "required": ["id", "name", "identifier", "currency", "type", "status"]
      },
      "CreatePaymentIntent": {
        "type": "object",
        "required": ["amount", "currency"],
        "properties": {
          "amount": { "type": "number", "exclusiveMinimum": 0, "maximum": 1000000000, "multipleOf": 0.01 },
          "currency": { "type": "string", "pattern": "^[A-Z]{3}$" },
          "customerName": { "type": "string", "maxLength": 120 },
          "metadata": { "type": "object", "maxProperties": 100 }
        }
      },
      "PaymentStatus": { "type": "string", "enum": ["pending", "authorized", "completed", "expired", "failed"] },
      "PaymentIntent": {
        "type": "object",
        "properties": {
          "reference": { "type": "string" },
          "amount": { "type": "number" },
          "currency": { "type": "string" },
          "merchantName": { "type": "string" },
          "status": { "$ref": "#/components/schemas/PaymentStatus" },
          "environment": { "type": "string", "enum": ["sandbox", "production"] },
          "simulated": { "type": "boolean" },
          "createdAt": { "type": "string", "format": "date-time" },
          "expiresAt": { "type": ["string", "null"], "format": "date-time" },
          "completedAt": { "type": ["string", "null"], "format": "date-time" },
          "transferReference": { "type": ["string", "null"] },
          "metadata": { "type": "object" }
        },
        "required": ["reference", "amount", "currency", "merchantName", "status", "environment", "simulated", "createdAt"]
      },
      "PaymentIntentResponse": {
        "type": "object",
        "properties": {
          "success": { "type": "boolean" },
          "paymentIntent": { "$ref": "#/components/schemas/PaymentIntent" },
          "replayed": { "type": "boolean" },
          "testMode": { "type": "boolean" },
          "message": { "type": "string" }
        },
        "required": ["success", "paymentIntent"]
      },
      "VerifyPayment": {
        "type": "object",
        "required": ["reference", "transferReference"],
        "properties": {
          "reference": { "type": "string" },
          "transferReference": { "type": "string" }
        }
      },
      "Error": {
        "type": "object",
        "properties": { "error": { "type": "string" }, "required": { "type": "array", "items": { "type": "string" } } },
        "required": ["error"]
      }
    },
    "responses": {
      "BadRequest": { "description": "Invalid request", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } } },
      "Unauthorized": { "description": "Missing or invalid credentials/signature", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } } },
      "Forbidden": { "description": "Required scope or environment permission is missing", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } } },
      "NotFound": { "description": "Resource not found within this application", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } } },
      "Conflict": { "description": "Idempotency or state conflict", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } } },
      "RateLimited": { "description": "Application or server rate limit exceeded", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } } }
    }
  }
}
```

## Version history

# Credixa Developer API changelog

## v1 — 2026-11-17

- Added application-bound, owner-scoped payment intents and idempotent creation.
- Added intent retrieval, status, verified transaction retrieval, and sandbox-only outcome simulation.
- Production verification now requires a matching completed Credixa internal transaction; it cannot mark a payment complete using caller-supplied amounts alone.
- Enforced application scopes, environment-specific credential prefixes, request signatures, timestamp freshness, and per-application request limits.
- Restricted collection accounts to the application owner's own active account.
- Added separate webhook signing secrets, signed event envelopes, delivery logs, retry scheduling, and webhook test events.
- Added downloaded Markdown, OpenAPI JSON, PDF, and Node examples.
- Refunds, reversals, and external-bank settlement remain unsupported.

## Node.js payment-intent example

Set `CREDIXA_API_ORIGIN`, `CREDIXA_API_KEY`, and `CREDIXA_API_SECRET` in the server environment before running this example. Use a sandbox key for test calls.

```javascript
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
```

## Node.js webhook verification example

Set `CREDIXA_WEBHOOK_SECRET` in the webhook receiver server environment. Preserve the exact raw request body for signature verification, and make processing idempotent by event ID.

```javascript
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
```

## AI implementation checklist

- Use a distinct application and key pair for sandbox and production. Keep secrets server-side.
- Sign the exact request body with the documented timestamp/HMAC scheme; do not send credentials in query strings or request bodies.
- Request only the scopes required by the integration. Sandbox simulation cannot move funds.
- A production intent is not paid until a matching, completed Credixa internal transfer is verified by its transaction reference. Intent creation does not debit or reserve money.
- Webhook delivery is at-least-once; verify signatures against raw bytes and make event handling idempotent.
- Card request APIs are session-authenticated and independent of the Developer API key. They create requests only; they do not represent card issuance or payment processing.
- Report unsupported functionality plainly: no external bank/card settlement, production payment processor, refunds, reversals, or separate merchant business-account onboarding is available.