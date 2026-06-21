# Sprint 9 — Provider Validation Results

## Status

| Provider | Key Status | Validation Status | Last Checked |
|----------|-----------|-------------------|--------------|
| Sportmonks | BLOCKED_BY_REPLACEMENT_TOKEN | NOT_VALIDATED | — |
| SportsDataIO | BLOCKED_BY_REPLACEMENT_TOKEN | NOT_VALIDATED | — |

## Sportmonks

**Status:** BLOCKED_BY_REPLACEMENT_TOKEN

The adapter is fully implemented (`apps/api/src/data-provider/sportmonks.adapter.ts`).
Validation is blocked because the previously tested key must be treated as exposed.

**To unblock:**
1. Generate a replacement key at https://app.sportmonks.com/api-tokens
2. Place it in `apps/api/.env` as `SPORTMONKS_API_KEY=<value>` (never commit)
3. Run: `node tools/discovery/provider-health-check.mjs`
4. If healthy: `PROVIDER=sportmonks node tools/discovery/provider-coverage-check.mjs`
5. Record results below

**Result template (fill in after unblocking):**
```
Health:     [ ] OK  [ ] FAIL  HTTP ___
Seasons:    [ ] OK  Count: ___
Fixtures:   [ ] OK  Count: ___
Teams:      [ ] OK  Count: ___
Players:    [ ] OK  Count: ___
Standings:  [ ] OK  Count: ___
PSL fixtures available:  [ ] YES  [ ] NO
WC2026 fixtures available: [ ] YES  [ ] NO
Date validated: ___
```

## SportsDataIO

**Status:** BLOCKED_BY_REPLACEMENT_TOKEN

The candidate adapter skeleton is at `apps/api/src/data-provider/sportsdataio.adapter.ts`.
It is NOT wired to DataProviderService (candidate only).
Free trial is limited to UEFA Champions League (Competition ID 3).

**To unblock:**
1. Register at https://sportsdata.io/cart/soccer and start a free trial
2. Place the trial key in `apps/api/.env` as `SPORTSDATAIO_SOCCER_API_KEY=<value>` (never commit)
3. Run: `node tools/discovery/provider-health-check.mjs`
4. If healthy: `PROVIDER=sportsdataio node tools/discovery/provider-coverage-check.mjs`
5. Record results below

**Result template:**
```
Health:       [ ] OK  [ ] FAIL  HTTP ___
Competitions: [ ] OK  Count: ___
UCL Schedules:[ ] OK  Count: ___
UCL Teams:    [ ] OK  Count: ___
UCL Standings:[ ] OK  Count: ___
PSL fixtures: [ ] NOT AVAILABLE on free trial
WC2026 fixtures: [ ] NOT AVAILABLE on free trial
Date validated: ___
```

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
