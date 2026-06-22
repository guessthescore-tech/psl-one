# Sprint 13 — Owner Review Guide

## Purpose

This guide walks through the steps required to clear the Sprint 13 CONDITIONAL_GO gates and move to full GO.

## Prerequisites

- Access to `apps/api/.env` on your local machine
- football-data.org API token (free tier available)
- API-Football key from RapidAPI

## Steps

### Step 1 — football-data.org key — DONE ✅

`FOOTBALL_DATA_API_KEY` is set and validated. No further action needed for this provider.

### Step 2 — football-data.org WC validation — DONE ✅

`WC_BETA_VALIDATED` — 104 WC 2026 matches returned, score data available on free tier (2026-06-22).

### Step 3 — API-Football account status — ACTION REQUIRED

The API-Football account is suspended. Key is present (length=32) but all endpoints return HTTP 200 with:
```
errors.access: "Your account is suspended, check on https://dashboard.api-football.com."
```

**Action:** Log in to https://dashboard.api-football.com and reactivate or upgrade the account.

### Step 4 — Re-run API-Football PSL validation after reactivation

```bash
node --env-file=apps/api/.env tools/discovery/sprint-13-psl-sample.mjs
node --env-file=apps/api/.env tools/discovery/sprint-11-provider-coverage.mjs
```

Expected result: `PSL_FOUND` + `PSL_SAMPLE_OK` if PSL league 288 is on the active plan tier.

If PSL is not on the free tier, you may need to upgrade to a paid plan. The league ID 288 (South Africa Premier Soccer League) is confirmed correct from Sprint 11 research.

### Step 5 — Run routing check

```bash
node --env-file=apps/api/.env tools/discovery/sprint-13-routing-check.mjs
```

This validates that the routing decisions for known competition codes (`WC`, `PSL`, `288`, unknown) resolve correctly.

### Step 6 — Review commercial terms

### Step 7 — Review commercial terms

- football-data.org: https://www.football-data.org/client/register — review free/paid tier limits and attribution requirements.
- API-Football: https://rapidapi.com/api-sports/api/api-football — review request quotas and commercial use terms.

Accept terms before wiring either provider into a production ingestion pipeline.

### Step 8 — What NOT to do

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

football-data.org WC validation is already CLEARED. After API-Football PSL validation passes, update `docs/data/SPRINT-13-PROVIDER-LIVE-VALIDATION-SUMMARY.md` status from `PARTIAL_VALIDATED` to `FULLY_VALIDATED`.

Update `docs/data/SPRINT-13-PROVIDER-ROUTING-GO-NOGO.md` and `docs/handover/SPRINT-13-BETA-GO-NOGO.md` from `CONDITIONAL_GO` to `GO` when all six conditions are met.

## Related Documents

- `docs/data/SPRINT-13-PROVIDER-LIVE-VALIDATION-SUMMARY.md`
- `docs/data/SPRINT-13-PER-COMPETITION-ROUTING.md`
- `docs/handover/SPRINT-13-KNOWN-GAPS.md`
- `docs/handover/SPRINT-13-ROLLBACK-PLAN.md`
