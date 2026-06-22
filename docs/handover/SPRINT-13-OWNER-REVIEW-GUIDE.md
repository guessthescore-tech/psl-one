# Sprint 13 — Owner Review Guide

## Purpose

This guide walks through the steps required to clear the Sprint 13 CONDITIONAL_GO gates and move to full GO.

## Prerequisites

- Access to `apps/api/.env` on your local machine
- football-data.org API token (free tier available)
- API-Football key from RapidAPI

## Steps

### Step 1 — Set football-data.org key

Add to `apps/api/.env` — **never commit this file**:
```
FOOTBALL_DATA_API_KEY=<token>
```

### Step 2 — Verify key status

```bash
node --env-file=apps/api/.env tools/discovery/sprint-13-provider-key-status.mjs
```

Expected output: `FOOTBALL_DATA_KEY_PRESENT | API_FOOTBALL_KEY_MISSING`

### Step 3 — Run football-data.org World Cup validation

```bash
node --env-file=apps/api/.env tools/discovery/sprint-12-football-data-worldcup.mjs
```

Expected result: `FOOTBALL_DATA_WORLD_CUP_BETA_VALIDATED`

### Step 4 — Run football-data.org World Cup sample

```bash
node --env-file=apps/api/.env tools/discovery/sprint-13-worldcup-sample.mjs
```

Expected output: a sample WC 2026 fixture printed to stdout.

### Step 5 — Set API-Football key

Add to `apps/api/.env`:
```
API_FOOTBALL_KEY=<key>
```

### Step 6 — Run API-Football PSL coverage check

```bash
node --env-file=apps/api/.env tools/discovery/sprint-11-provider-coverage.mjs
```

Expected result: `API_FOOTBALL_PSL_VALIDATED` or `API_FOOTBALL_PSL_PARTIAL`

### Step 7 — Run API-Football PSL sample

```bash
node --env-file=apps/api/.env tools/discovery/sprint-13-psl-sample.mjs
```

Expected output: PSL league 288 fixture data printed to stdout.

### Step 8 — Run routing check

```bash
node --env-file=apps/api/.env tools/discovery/sprint-13-routing-check.mjs
```

This validates that the routing decisions for known competition codes (`WC`, `PSL`, `288`, unknown) resolve correctly.

### Step 9 — Review commercial terms

- football-data.org: https://www.football-data.org/client/register — review free/paid tier limits and attribution requirements.
- API-Football: https://rapidapi.com/api-sports/api/api-football — review request quotas and commercial use terms.

Accept terms before wiring either provider into a production ingestion pipeline.

### Step 10 — What NOT to do

| Do NOT | Reason |
|---|---|
| Activate PSL season | PSL INACTIVE — separate explicit decision required |
| Deploy to production | Staging validation must pass first |
| Apply EC2 migration | Separate authorisation required |
| Enable data ingestion | Sprint 14 scope — requires safe job design |
| Activate wallet production | Not part of Sprint 13 scope |
| Use Sportmonks | REJECTED — do not re-introduce |
| Commit `apps/api/.env` | Contains secrets — must stay out of git |

## After All Steps Pass

Update `docs/data/SPRINT-13-PROVIDER-LIVE-VALIDATION-SUMMARY.md` with actual result codes and change overall status from `ALL_BLOCKED_PENDING_KEYS` to reflect actual outcomes.

Update `docs/data/SPRINT-13-PROVIDER-ROUTING-GO-NOGO.md` and `docs/handover/SPRINT-13-BETA-GO-NOGO.md` from `CONDITIONAL_GO` to `GO` when all six conditions are met.

## Related Documents

- `docs/data/SPRINT-13-PROVIDER-LIVE-VALIDATION-SUMMARY.md`
- `docs/data/SPRINT-13-PER-COMPETITION-ROUTING.md`
- `docs/handover/SPRINT-13-KNOWN-GAPS.md`
- `docs/handover/SPRINT-13-ROLLBACK-PLAN.md`
