# Sprint 13 — Provider Live Validation Summary

## Overall Status: PARTIAL_VALIDATED

| Provider | Tool | Date | Result | Detail |
|---|---|---|---|---|
| football-data.org | sprint-13-worldcup-sample.mjs | 2026-06-22 | `WC_BETA_VALIDATED` | 104 WC 2026 matches, score data available |
| API-Football | sprint-13-psl-sample.mjs | 2026-06-22 | `API_FOOTBALL_ACCOUNT_SUSPENDED` | HTTP 200 with `errors.access` in body |
| API-Football | sprint-11-provider-coverage.mjs | 2026-06-22 | `API_FOOTBALL_ACCOUNT_SUSPENDED` | 0 results across all endpoints |
| API-Football | sprint-11-provider-health.mjs | 2026-06-22 | FALSE POSITIVE `available=true` | Tool does not check `data.errors`; adapter fix applies |

## football-data.org — VALIDATED

- 104 World Cup 2026 matches returned on free tier
- Score data (fullTime goals) available
- `X-Auth-Token` header authentication confirmed working
- PSL NOT available on football-data.org (permanent — not a tier issue)

## API-Football — BLOCKED (account suspended)

API-Football returns HTTP 200 for all endpoints with an empty `response` array and a non-empty `errors` object when the account is suspended. This pattern was observed in both validation sessions (before and after key was confirmed present).

- Error: `{"access":"Your account is suspended, check on https://dashboard.api-football.com."}`
- PSL league 288: 0 results across all attempts
- South Africa leagues search: 0 results
- **Adapter fix applied**: `api-football.adapter.ts` now detects `data.errors` and returns `null` / logs warning

## Owner Action Required

1. Log in to https://dashboard.api-football.com
2. Reactivate or upgrade the account
3. Re-run validation:
   ```bash
   node --env-file=apps/api/.env tools/discovery/sprint-13-psl-sample.mjs
   node --env-file=apps/api/.env tools/discovery/sprint-11-provider-coverage.mjs
   ```

## Re-run Full Suite

```bash
node --env-file=apps/api/.env tools/discovery/sprint-13-provider-key-status.mjs
node --env-file=apps/api/.env tools/discovery/sprint-13-routing-check.mjs
node --env-file=apps/api/.env tools/discovery/sprint-13-psl-sample.mjs
node --env-file=apps/api/.env tools/discovery/sprint-13-worldcup-sample.mjs
node --env-file=apps/api/.env tools/discovery/sprint-11-provider-health.mjs
node --env-file=apps/api/.env tools/discovery/sprint-11-provider-coverage.mjs
```

Expected after reactivation: `[PSL_FOUND]` + `[PSL_SAMPLE_OK]` for PSL tools.

## Related Documents

- `docs/data/SPRINT-13-FOOTBALL-DATA-LIVE-VALIDATION.md`
- `docs/data/SPRINT-13-API-FOOTBALL-LIVE-VALIDATION.md`
- `docs/data/SPRINT-13-PER-COMPETITION-ROUTING.md`
- `docs/data/SPRINT-13-PROVIDER-ROUTING-GO-NOGO.md`
