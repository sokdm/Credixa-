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
