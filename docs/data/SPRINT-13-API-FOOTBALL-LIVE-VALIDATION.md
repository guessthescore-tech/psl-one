# Sprint 13 — API-Football Live Validation

## Summary

| Field | Value |
|---|---|
| Date | 2026-06-22 |
| Tools | `sprint-11-provider-health.mjs`, `sprint-13-psl-sample.mjs`, `sprint-13-provider-key-status.mjs` |
| Result | `API_FOOTBALL_ACCOUNT_SUSPENDED` |
| HTTP status | 200 (misleading — error is in response body) |
| Body error | `{"access":"Your account is suspended, check on https://dashboard.api-football.com."}` |
| PSL league ID | 288 (South Africa Premier Soccer League) |

## Validation log

```
[STATUS] 200
[COUNT] 0 leagues found for South Africa
[ACCOUNT] []
[SUBSCRIPTION] ""
[REQUESTS] ""
```

API-Football returns HTTP 200 for all endpoints but the JSON body contains an `errors` field when the account is suspended. The `response` array is always empty in this state. No PSL data was returned.

## Adapter fix applied

`apps/api/src/data-provider/api-football.adapter.ts` was updated (this sprint) to detect body-level errors:

```
if (data.errors && Object.keys(data.errors).length > 0) {
  this.logger.warn(`API-Football body error: ${JSON.stringify(data.errors)}`);
  return null;
}
```

Previously, the adapter returned empty arrays silently when the account was suspended (because `data.response` is `[]`). With this fix, a suspended account will log a warning and return `null`, which propagates correctly as empty arrays to callers.

## Owner Action Required

1. Log in to https://dashboard.api-football.com
2. Reactivate or upgrade the account
3. Re-run:
   ```bash
   node --env-file=apps/api/.env tools/discovery/sprint-13-psl-sample.mjs
   node --env-file=apps/api/.env tools/discovery/sprint-11-provider-health.mjs
   ```

## Expected Outcome After Account Reactivation

| Tool | Expected result code | Meaning |
|---|---|---|
| `sprint-13-psl-sample.mjs` | `PSL_FOUND` + `PSL_SAMPLE_OK` | PSL league 288 found with fixture data |
| `sprint-11-provider-health.mjs` | `available=true` | Account active and PSL accessible |
| `sprint-13-psl-sample.mjs` | `PSL_NOT_FOUND` | Account active but PSL not on free tier |

## Important notes

- HTTP 200 with an `errors` body is API-Football's pattern for suspended/invalid accounts. It is **not** a network error.
- The adapter fix ensures this is now caught correctly and logs a warning rather than silently returning empty data.
- PSL league ID 288 was verified as correct in Sprint 11 research. The issue is account access, not the league ID.

## Related Documents

- `docs/data/SPRINT-13-FOOTBALL-DATA-LIVE-VALIDATION.md` — football-data.org (WC path) — VALIDATED
- `docs/data/SPRINT-13-PROVIDER-LIVE-VALIDATION-SUMMARY.md` — combined status table
- `docs/data/SPRINT-13-PER-COMPETITION-ROUTING.md` — ProviderRouterService design
