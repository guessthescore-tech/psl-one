# Sprint 38A — Owner Approval Pack

## Summary

Sprint 38A delivers the World Cup 2026 live data provider integration.
Football-data.org is the primary provider (104 WC matches available, validated).
SportRadar Soccer API is wired as fallback. ScoreBat widget is ready for highlights.

## What Changed

- 2 new provider adapters (SportRadar, ScoreBat)
- 3 new API routes (WC readiness, WC import, ScoreBat config)
- 1 new service (WorldCupImportService)
- 1 new frontend page (/world-cup/live)
- 1 new component (ScoreBatWorldCupWidget)
- 6 staging tools
- 13 docs
- No new Prisma migrations
- No PSL changes

## Approval Levels

### Level 1: Dry-Run Review (No Risk)
No approval needed — anyone with admin token can run the health check and dry-run.

### Level 2: Write Import Approval (Owner Required)
**Owner must explicitly authorize** by setting `ALLOW_WORLD_CUP_WRITE=true` in their
terminal session before running the write-mode tool. This is a local flag —
it does NOT get deployed and does NOT affect staging/production automatically.

### Level 3: ScoreBat Token (Optional)
Register at scorebat.com, set `SCOREBAT_WIDGET_TOKEN` in `.env`. Widget is additive.

### Level 4: SportRadar Key (Optional)
Register at developer.sportradar.com, set `SPORTSRADAR_SOCCER_API_KEY`. Fallback only.

## Safety Summary

```
PSL: INACTIVE ✅
No real money ✅
No scheduled ingestion ✅
All imports: isPublished=false ✅
Write mode: double-gated ✅
Provider keys: never in responses ✅
RBAC: PSL_ADMIN only on all new routes ✅
```

## Recommended Owner Action

1. `ADMIN_TOKEN=<jwt> node tools/staging/sprint-38a-world-cup-provider-health.mjs`
2. `ADMIN_TOKEN=<jwt> node tools/staging/sprint-38a-world-cup-fixture-import.mjs --dry-run`
3. Review 104 fixture candidates in output
4. Decide: authorize write or defer
