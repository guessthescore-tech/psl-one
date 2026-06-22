# Sprint 13 — football-data.org Live Validation Attempt

## Summary

| Field | Value |
|---|---|
| Date | 2026-06-22 |
| Tools | `sprint-12-football-data-health.mjs`, `sprint-12-football-data-worldcup.mjs` |
| Result | `BLOCKED_BY_FOOTBALL_DATA_KEY` |
| Endpoint attempted | None — key check failed before any HTTP call |
| PSL support | NOT SUPPORTED on football-data.org regardless of key |

## Reason

`FOOTBALL_DATA_API_KEY` is not present in `apps/api/.env`. The validation scripts perform a key presence check before issuing any HTTP request. Because the key is absent the scripts exit immediately with status `BLOCKED_BY_FOOTBALL_DATA_KEY` and no live network call is made.

## Owner Action Required

1. Obtain a football-data.org API token (free tier covers World Cup fixtures).
2. Add to `apps/api/.env` — **never commit this file**:
   ```
   FOOTBALL_DATA_API_KEY=<token>
   ```
3. Re-run both tools:
   ```bash
   node --env-file=apps/api/.env tools/discovery/sprint-12-football-data-health.mjs
   node --env-file=apps/api/.env tools/discovery/sprint-12-football-data-worldcup.mjs
   ```

## Expected Outcome When Key Is Set

| Tool | Expected result code | Meaning |
|---|---|---|
| `sprint-12-football-data-health.mjs` | `FOOTBALL_DATA_HEALTH_OK` | API reachable and token valid |
| `sprint-12-football-data-worldcup.mjs` | `FOOTBALL_DATA_WORLD_CUP_BETA_VALIDATED` | WC 2026 fixtures available |

## PSL Availability Note

PSL (South African Premier Division) is **not listed** in the football-data.org competition catalogue. This is a known permanent gap — it is not a key issue. The PSL data path uses API-Football (league 288). See `SPRINT-13-PER-COMPETITION-ROUTING.md` for the routing design.

Expected result code when WC is confirmed but PSL is requested: `WC_BETA_VALIDATED_PSL_NOT_SUPPORTED`.

## Related Documents

- `docs/data/SPRINT-13-API-FOOTBALL-LIVE-VALIDATION.md` — API-Football (PSL path) validation
- `docs/data/SPRINT-13-PROVIDER-LIVE-VALIDATION-SUMMARY.md` — combined status table
- `docs/data/SPRINT-13-PER-COMPETITION-ROUTING.md` — ProviderRouterService design
- `docs/data/SPRINT-12-FOOTBALL-DATA-ORG-VALIDATION.md` — prior Sprint 12 findings
