# Sprint 38A — World Cup Dry-Run Import Runbook

## Pre-Requisites

1. API server running locally: `cd apps/api && pnpm start:dev`
2. `FOOTBALL_DATA_API_KEY` set in `apps/api/.env`
3. `ADMIN_TOKEN` obtainable via beta admin credentials
4. Sprint 38A branch deployed or running locally

## Step 1 — Provider Health Check

```bash
ADMIN_TOKEN=<your-token> node tools/staging/sprint-38a-world-cup-provider-health.mjs
```

Expected output:
```
[WORLD_CUP_HEALTH] STATUS: READY_FOR_DRY_RUN
  football-data.org: CONFIGURED
  SportRadar Soccer: NOT_CONFIGURED (optional fallback)
  ScoreBat Widget:   NOT_CONFIGURED (optional highlights)
```

If `NO_PROVIDER_CONFIGURED`: check `FOOTBALL_DATA_API_KEY` in `apps/api/.env`.

## Step 2 — Fixture Dry-Run Import

```bash
ADMIN_TOKEN=<your-token> node tools/staging/sprint-38a-world-cup-fixture-import.mjs --dry-run
```

Expected output:
```
[WC_FIXTURE_IMPORT] MODE: DRY-RUN — no DB writes
Provider: football-data-org
Source status: SOURCE_AVAILABLE
Discovered: 104
Normalized: 104
Fixture Candidates (first 5 of 104):
  ✅ Mexico vs TBD [2026-06-11T...]
  ...
[WC_FIXTURE_IMPORT] STATUS: DRY_RUN_COMPLETE
```

## Step 3 — Review Candidates

Review:
- All 32 teams represented
- Kickoff times in UTC (display converts to SAST in frontend)
- Status = SCHEDULED for future matches
- Team name matches → homeTeamMatched: true, awayTeamMatched: true

If team names don't match DB records, that is expected if teams haven't been seeded
for WC. Teams are matched by name in the PSL DB — WC teams may not be in DB yet.
This is a dry-run finding only — no action needed before write approval.

## Step 4 — Write Import (Owner Approval Required)

**Only proceed with explicit owner instruction.**

```bash
ALLOW_WORLD_CUP_WRITE=true \
CONFIRM_WORLD_CUP_WRITE=IMPORT_WORLD_CUP_BETA \
ADMIN_TOKEN=<your-token> \
node tools/staging/sprint-38a-world-cup-fixture-import.mjs --write
```

Post-write checklist:
- [ ] Fixtures created with `isPublished=false`
- [ ] Audit log entries created in AdminAuditLog
- [ ] No PSL activation occurred
- [ ] PSL season remains INACTIVE

## Step 5 — Fantasy Pool Preview

```bash
ADMIN_TOKEN=<your-token> node tools/staging/sprint-38a-world-cup-fantasy-pool-build.mjs
```

## Step 6 — GTS Card Preview

```bash
ADMIN_TOKEN=<your-token> node tools/staging/sprint-38a-world-cup-gts-card-build.mjs
```

## Rollback

All WC imports create fixtures with `isPublished=false`. To rollback:
1. Use admin UI to delete unpublished WC fixtures
2. Or run: `DELETE FROM "Fixture" WHERE provider_source IN ('football-data-org') AND is_published=false`
3. PSL season remains unaffected (separate competition)
