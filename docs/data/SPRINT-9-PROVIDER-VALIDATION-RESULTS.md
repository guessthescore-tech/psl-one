# Sprint 9 — Provider Validation Results

## Status

| Provider | Key Status | Validation Status | Last Checked |
|----------|-----------|-------------------|--------------|
| Sportmonks | PRESENT (key invalid — HTTP 401) | HTTP_401_ALL_ENDPOINTS | 2026-06-21 |
| SportsDataIO | PRESENT (trial — UCL only) | PARTIAL_UCL_TRIAL | 2026-06-21 |

Run command: `node --env-file=apps/api/.env tools/discovery/provider-health-check.mjs`

## Sportmonks

**Status: HTTP_401 — key present but rejected by API**

The adapter is fully implemented (`apps/api/src/data-provider/sportmonks.adapter.ts`).
The replacement key (length 60) was added to `apps/api/.env` by the owner and confirmed PRESENT.
However, every endpoint returns HTTP 401.

**Live results (2026-06-21):**
```
Health:     FAIL  HTTP 401
Seasons:    FAIL  HTTP 401
Fixtures:   FAIL  HTTP 401
Teams:      FAIL  HTTP 401
Players:    FAIL  HTTP 401
Standings:  FAIL  HTTP 401
PSL fixtures available:  UNKNOWN (key rejected)
WC2026 fixtures available: UNKNOWN (key rejected)
Date validated: 2026-06-21
```

**Likely causes of HTTP 401:**
1. Key was copied incorrectly (trailing space, missing character)
2. Key has not been activated on the Sportmonks dashboard
3. Plan does not include v3 API access (some plans require upgrade)
4. Key belongs to a different account or project

**To fix:**
1. Go to https://app.sportmonks.com/api-tokens
2. Verify the exact key value and plan tier
3. If key is correct, check plan includes `GET /v3/football/seasons`
4. Re-place correct key in `apps/api/.env` as `SPORTMONKS_API_KEY=<value>` (never commit)
5. Re-run: `node --env-file=apps/api/.env tools/discovery/provider-health-check.mjs`

## SportsDataIO

**Status: PARTIAL — competitions and teams OK; schedules/players/standings blocked by trial tier**

The candidate adapter skeleton is at `apps/api/src/data-provider/sportsdataio.adapter.ts`.
It is NOT wired to DataProviderService (candidate only).
Free trial is limited to UEFA Champions League (Competition ID 3).

**Live results (2026-06-21):**
```
Health:       OK    HTTP 200
Competitions: OK    Count: 93
UCL Schedules: FAIL HTTP 401  (trial limitation)
UCL Teams:    OK    Count: 258
UCL Players:  FAIL  HTTP 404  (trial limitation)
UCL Standings: FAIL HTTP 401  (trial limitation)
PSL fixtures: NOT AVAILABLE on free trial
WC2026 fixtures: NOT AVAILABLE on free trial
Date validated: 2026-06-21
```

**Note:** The competitions and teams endpoints confirm auth model works. Schedules/players/standings require a paid tier. PSL and WC2026 coverage cannot be validated on the free trial.

## Discovery Tools

| Tool | Purpose | Command |
|------|---------|---------|
| `provider-health-check.mjs` | Check both providers' health | `node tools/discovery/provider-health-check.mjs` |
| `provider-coverage-check.mjs` | Test endpoint coverage | `PROVIDER=sportmonks node tools/discovery/provider-coverage-check.mjs` |
| `provider-field-mapping-check.mjs` | Verify PSL One field mapping | `PROVIDER=sportmonks node tools/discovery/provider-field-mapping-check.mjs` |
| `provider-compare.mjs` | Side-by-side comparison | `node tools/discovery/provider-compare.mjs` |

## Security Reminders
- Key values must NEVER be printed, logged, or committed
- All tools read keys from `process.env` only
- No `NEXT_PUBLIC_*` provider keys exist or are permitted
- No betting/odds endpoints are called
