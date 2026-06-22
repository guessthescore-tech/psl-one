# Sprint 13 — API-Football Live Validation

## Summary

| Field | Value |
|---|---|
| Date | 2026-06-22 |
| Tools | `sprint-13-psl-sample.mjs`, `sprint-11-provider-health.mjs`, `sprint-11-provider-coverage.mjs`, `sprint-11-provider-field-map.mjs` |
| Result | `API_FOOTBALL_ACCOUNT_SUSPENDED` |
| HTTP status | 200 on all endpoints (misleading) |
| Body error | `{"access":"Your account is suspended, check on https://dashboard.api-football.com."}` |
| PSL league 288 | NOT RETURNED (suspension prevents all data) |
| Free-tier field map | SIMULATED PASS (live fetch not possible while suspended) |

## Validation log

```
[INFO] Checking league 288 (PSL) on API-Football ...
[PSL_NOT_FOUND] league 288 returned no results
[CRITICAL] PSL not found — API-Football may not cover PSL on free tier
```

Direct status check:
```
[ERRORS] {"access":"Your account is suspended, check on https://dashboard.api-football.com."}
[league 288 no filter] results: 0  errors: {"access":"Your account is suspended..."}
[south africa leagues] results: 0  errors: {"access":"Your account is suspended..."}
```

## False positive in sprint-11 tools

`sprint-11-provider-health.mjs` reported `available=true | HTTP 200` — this is a false positive. The tool checks HTTP status and array length only; it does not inspect `data.errors`. API-Football returns HTTP 200 for all endpoints when an account is suspended, with `response: []` and a non-empty `errors` body. The tool interprets 0-length response as "healthy but empty" rather than "suspended".

The **adapter** (`api-football.adapter.ts`) was fixed this sprint to detect `data.errors` and return `null`. The sprint-11 discovery tools were not updated — they are pre-validation scripts, not runtime adapters.

## Adapter fix applied (this sprint)

```typescript
const data = (await res.json()) as { response: T; errors?: Record<string, string> };
if (data.errors && Object.keys(data.errors).length > 0) {
  this.logger.warn(`API-Football body error: ${JSON.stringify(data.errors)}`);
  return null;
}
return data.response ?? null;
```

This fix ensures the adapter correctly returns `null` (→ empty arrays) when the account is suspended, rather than silently returning empty data with no log warning.

## Owner Action Required

1. Log in to https://dashboard.api-football.com
2. Check account status — if suspended for non-payment, upgrade or reactivate
3. Re-run after reactivation:
   ```bash
   node --env-file=apps/api/.env tools/discovery/sprint-13-psl-sample.mjs
   node --env-file=apps/api/.env tools/discovery/sprint-11-provider-coverage.mjs
   ```

## Expected Outcome After Account Reactivation

| Tool | Expected result code | Meaning |
|---|---|---|
| `sprint-13-psl-sample.mjs` | `PSL_FOUND` + `PSL_SAMPLE_OK` | PSL league 288 found with fixture data |
| `sprint-11-provider-coverage.mjs` | count > 0 for `/leagues?id=288` | League accessible |
| `sprint-11-provider-health.mjs` | count > 0 | True healthy response |

If PSL league 288 returns no results after reactivation, it may be a plan/tier limitation — see gap G3.

## Related Documents

- `docs/data/SPRINT-13-FOOTBALL-DATA-LIVE-VALIDATION.md` — football-data.org (WC path) — VALIDATED
- `docs/data/SPRINT-13-PROVIDER-LIVE-VALIDATION-SUMMARY.md` — combined status table
- `docs/data/SPRINT-13-PER-COMPETITION-ROUTING.md` — ProviderRouterService design
