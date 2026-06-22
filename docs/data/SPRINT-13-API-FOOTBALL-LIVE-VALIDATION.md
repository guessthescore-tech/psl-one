# Sprint 13 — API-Football Live Validation Attempt

## Summary

| Field | Value |
|---|---|
| Date | 2026-06-22 |
| Tools | `sprint-11-provider-health.mjs`, `sprint-11-provider-coverage.mjs` |
| Result | `BLOCKED_NO_KEY` |
| Endpoint attempted | None — key check failed before any HTTP call |
| PSL league ID | 288 (South Africa Premier Soccer League) |

## Reason

`API_FOOTBALL_KEY` is present in `apps/api/.env` but has zero length (empty string). The validation scripts perform a key length check before issuing any HTTP request. Because the key is empty the scripts exit immediately with status `BLOCKED_NO_KEY` and no live network call is made.

## Owner Action Required

1. Obtain an API-Football key from RapidAPI (https://rapidapi.com/api-sports/api/api-football).
2. Add to `apps/api/.env` — **never commit this file**:
   ```
   API_FOOTBALL_KEY=<key>
   ```
3. Re-run both tools:
   ```bash
   node --env-file=apps/api/.env tools/discovery/sprint-11-provider-health.mjs
   node --env-file=apps/api/.env tools/discovery/sprint-11-provider-coverage.mjs
   ```

## Expected Outcome When Key Is Set

| Tool | Expected result code | Meaning |
|---|---|---|
| `sprint-11-provider-health.mjs` | `API_FOOTBALL_HEALTH_OK` | API reachable and key valid |
| `sprint-11-provider-coverage.mjs` | `API_FOOTBALL_PSL_VALIDATED` | PSL league 288 returns fixture data |
| `sprint-11-provider-coverage.mjs` | `API_FOOTBALL_PSL_PARTIAL` | League 288 found but limited data (acceptable) |

## SportsDataIO Note

During Sprint 10–11 health checks, SportsDataIO returned `available=true | HTTP 200 | 93 competition(s)`. However PSL coverage was not confirmed in its catalogue. SportsDataIO is **not the primary provider** for PSL — API-Football (league 288) is the selected path. SportsDataIO remains a research-only candidate.

## Related Documents

- `docs/data/SPRINT-13-FOOTBALL-DATA-LIVE-VALIDATION.md` — football-data.org (WC path) validation
- `docs/data/SPRINT-13-PROVIDER-LIVE-VALIDATION-SUMMARY.md` — combined status table
- `docs/data/SPRINT-13-PER-COMPETITION-ROUTING.md` — ProviderRouterService design
- `docs/data/SPRINT-11-PROVIDER-DECISION.md` — API-Football selection rationale
- `docs/data/SPRINT-12-API-FOOTBALL-PSL-VALIDATION.md` — prior Sprint 12 findings
