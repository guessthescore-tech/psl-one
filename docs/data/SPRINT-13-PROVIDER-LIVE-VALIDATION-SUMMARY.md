# Sprint 13 — Provider Live Validation Summary

## Overall Status: ALL_BLOCKED_PENDING_KEYS

All live validation attempts were blocked by missing or empty API keys. No HTTP calls were made to any external provider during Sprint 13.

## Validation Results Table

| Provider | Tool | Date | Result | Reason | Owner Action |
|---|---|---|---|---|---|
| football-data.org | sprint-12-football-data-health.mjs | 2026-06-22 | BLOCKED_BY_FOOTBALL_DATA_KEY | Key not set | Set FOOTBALL_DATA_API_KEY |
| football-data.org | sprint-12-football-data-worldcup.mjs | 2026-06-22 | BLOCKED_BY_FOOTBALL_DATA_KEY | Key not set | Set FOOTBALL_DATA_API_KEY |
| API-Football | sprint-11-provider-health.mjs | 2026-06-22 | BLOCKED_NO_KEY | Key empty | Set API_FOOTBALL_KEY |
| API-Football | sprint-11-provider-coverage.mjs | 2026-06-22 | BLOCKED_NO_KEY | Key empty | Set API_FOOTBALL_KEY |

## Provider Routing Intent (unvalidated)

| Competition | Target provider | Status |
|---|---|---|
| World Cup 2026 (WC, WORLD_CUP_2026) | football-data.org | Pending key validation |
| PSL (PSL, SOUTH_AFRICA_PSL, 288) | API-Football | Pending key validation |
| All others | NoOpAdapter | Active (default) |

## Instructions for Owner to Re-Run Validation

### Step 1 — Set keys in `apps/api/.env` (never commit this file)

```
FOOTBALL_DATA_API_KEY=<token>
API_FOOTBALL_KEY=<key>
```

### Step 2 — Run football-data.org validation

```bash
node --env-file=apps/api/.env tools/discovery/sprint-12-football-data-health.mjs
node --env-file=apps/api/.env tools/discovery/sprint-12-football-data-worldcup.mjs
```

Expected result: `FOOTBALL_DATA_WORLD_CUP_BETA_VALIDATED`

### Step 3 — Run API-Football validation

```bash
node --env-file=apps/api/.env tools/discovery/sprint-11-provider-health.mjs
node --env-file=apps/api/.env tools/discovery/sprint-11-provider-coverage.mjs
```

Expected result: `API_FOOTBALL_PSL_VALIDATED` or `API_FOOTBALL_PSL_PARTIAL`

### Step 4 — Run Sprint 13 routing check

```bash
node --env-file=apps/api/.env tools/discovery/sprint-13-routing-check.mjs
```

### Step 5 — Report results

Update this document with actual result codes once live keys are in place.

## What Remains Blocked Until Keys Are Set

- Full GO status for `SPRINT-13-PROVIDER-ROUTING-GO-NOGO.md` (currently CONDITIONAL_GO)
- Full GO status for `SPRINT-13-BETA-GO-NOGO.md` (currently CONDITIONAL_GO)
- Resolution of known gaps G1, G2, and G3 in `SPRINT-13-KNOWN-GAPS.md`

## Related Documents

- `docs/data/SPRINT-13-FOOTBALL-DATA-LIVE-VALIDATION.md`
- `docs/data/SPRINT-13-API-FOOTBALL-LIVE-VALIDATION.md`
- `docs/data/SPRINT-13-PER-COMPETITION-ROUTING.md`
- `docs/handover/SPRINT-13-KNOWN-GAPS.md`
- `docs/handover/SPRINT-13-OWNER-REVIEW-GUIDE.md`
