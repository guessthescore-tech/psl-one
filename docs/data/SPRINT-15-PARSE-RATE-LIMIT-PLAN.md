# Sprint 15 — Parse.bot Rate Limit Plan

## Current Known Limits

Parse.bot rate limits for the psl-co-za-api marketplace listing are not publicly documented.
Until confirmed by the owner reviewing account/dashboard limits, use conservative defaults.

## Conservative Default Policy

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Delay between calls | 1000ms (1 second) | Avoids bursting against unknown limits |
| Max retries on 429 | 3 | Avoid infinite retry loops |
| Backoff multiplier | 2× (exponential) | 1s → 2s → 4s |
| Max backoff | 30s | Prevent runaway waits |
| Calls per ingestion run | ≤ 5 | health + fixtures + results + standings + match-details |
| Scheduled calls | 0 | No scheduler active in Sprint 15 |

## HTTP 429 Handling

```
On 429 response:
  retry_delay = initial_delay * (2 ^ attempt_number)
  if attempt > max_retries:
    EXIT_ERROR PARSE_PSL_RATE_LIMITED
    alert owner
  else:
    wait retry_delay
    retry request
```

## HTTP 503 / Network Timeout

```
On 503 or network timeout:
  treat same as 429 with 5s initial delay
  log: PARSE_PSL_NETWORK_ERROR
  if all retries exhausted: EXIT_ERROR
```

## Rate Limit Discovery

Once the owner sets the `PARSE_API_KEY` and reviews the Parse.bot dashboard:
1. Check documented rate limits under account settings.
2. Update this file with confirmed values.
3. Adjust `ParsePslAdapter` defaults if limits are more permissive.

## What NOT To Do

- Do not fire all 5 endpoint calls simultaneously (burst).
- Do not retry indefinitely.
- Do not cache parse responses for more than 1 hour (data may have changed).
- Do not expose rate-limit errors to end users — return `available: false` instead.

## Related Documents

- `docs/data/SPRINT-15-FIXTURE-INGESTION-DESIGN.md`
- `apps/api/src/data-provider/parse-psl.adapter.ts`
