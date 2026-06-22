# Sprint 13 — Provider Live Validation Summary

## Overall Status: PARTIAL_VALIDATED

| Provider | Tool | Date | Result | Detail |
|---|---|---|---|---|
| football-data.org | sprint-13-worldcup-sample.mjs | 2026-06-22 | `WC_BETA_VALIDATED` | 104 WC matches, score data available |
| API-Football | sprint-13-psl-sample.mjs | 2026-06-22 | `API_FOOTBALL_ACCOUNT_SUSPENDED` | HTTP 200 but `errors.access` in body |
| API-Football | sprint-11-provider-health.mjs | 2026-06-22 | `available=false` | 0 leagues returned (account suspended) |

## football-data.org — VALIDATED

- 104 World Cup 2026 matches returned on free tier
- Score data (fullTime goals) available
- `X-Auth-Token` header authentication working
- PSL NOT available on football-data.org (permanent — not a key issue)

## API-Football — BLOCKED (account suspended)

- HTTP 200 returned but response body contains `errors.access`
- Error message: `"Your account is suspended, check on https://dashboard.api-football.com."`
- `response` array is always `[]` when account is suspended
- **Adapter fix applied**: `api-football.adapter.ts` now checks `data.errors` before returning `data.response`

## Owner Action Required (API-Football)

1. Log in to https://dashboard.api-football.com
2. Reactivate or upgrade the account
3. Re-run:
   ```bash
   node --env-file=apps/api/.env tools/discovery/sprint-13-psl-sample.mjs
   ```
4. Expected: `[PSL_FOUND]` + `[PSL_SAMPLE_OK]` if PSL league 288 is on the active tier

## Re-run Instructions

After account reactivation:
```bash
node --env-file=apps/api/.env tools/discovery/sprint-13-provider-key-status.mjs
node --env-file=apps/api/.env tools/discovery/sprint-13-routing-check.mjs
node --env-file=apps/api/.env tools/discovery/sprint-13-psl-sample.mjs
node --env-file=apps/api/.env tools/discovery/sprint-13-worldcup-sample.mjs
```

## Related Documents

- `docs/data/SPRINT-13-FOOTBALL-DATA-LIVE-VALIDATION.md`
- `docs/data/SPRINT-13-API-FOOTBALL-LIVE-VALIDATION.md`
- `docs/data/SPRINT-13-PER-COMPETITION-ROUTING.md`
- `docs/data/SPRINT-13-PROVIDER-ROUTING-GO-NOGO.md`
