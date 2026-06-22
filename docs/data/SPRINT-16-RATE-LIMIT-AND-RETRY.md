# Sprint 16 — Rate Limit and Retry

## Current Limits (Conservative — Unconfirmed)

Parse.bot rate limits for psl-co-za-api are not publicly documented.
Conservative defaults are used until the owner confirms limits via the Parse.bot dashboard.

## Service Defaults

The `ParsePslAdapter` uses an 8-second timeout per request (`AbortSignal.timeout(8000)`).

The ingestion service does not add retry logic — retries are the responsibility of the
caller (admin endpoint or CLI script). For CLI tools, the 1-second inter-call delay is applied.

## Rate Limit Classification

| HTTP Status | Classification | Service Behaviour |
|-------------|----------------|-------------------|
| 429 | RATE_LIMITED | Return `RATE_LIMITED` sourceStatus; no retry |
| 503 | PROVIDER_ERROR | Return `PROVIDER_ERROR`; no retry |
| Timeout | PROVIDER_ERROR | Return `PROVIDER_ERROR`; no retry |
| 401/403 | AUTH_FAILED | Return `AUTH_FAILED`; no retry |

## CLI Script Behaviour

The CLI script (`sprint-16-parse-fixture-ingestion-dry-run.mjs`) adds a `1000ms` delay before the
single `get_fixtures` call to avoid accidental bursting on repeated runs.

On 429: script exits non-zero with `[INGESTION_RATE_LIMITED]` message.

## Production Ingestion (Future Sprint)

When a scheduled ingestion job is implemented (future sprint), it must:
- Run at most once per hour
- Apply exponential backoff on 429 (1s → 2s → 4s → abort)
- Alert owner after 3 consecutive failures
- Never retry indefinitely

See `docs/data/SPRINT-15-PARSE-RATE-LIMIT-PLAN.md` for the full rate-limit design.
