# Sprint 38A — World Cup 2026 Live Readiness

## Current Status: CONDITIONAL_GO

| Check | Status |
|---|---|
| football-data.org adapter | ✅ Built + enhanced |
| SportRadar adapter | ✅ Built (key procurement needed) |
| ScoreBat widget adapter | ✅ Built (token optional) |
| world-cup-live-readiness endpoint | ✅ RBAC-protected |
| WC fixture import endpoint | ✅ Dry-run default, write-blocked |
| WC live frontend page | ✅ `/world-cup/live` |
| ScoreBat widget component | ✅ Server-side token handling |
| 6 staging tools | ✅ All built |
| API tests | ✅ Sprint 38A test blocks |
| Safety flags | ✅ Double-gated write mode |
| PSL INACTIVE | ✅ Confirmed |
| No real money | ✅ Confirmed |

## Blocked Items

| Item | Blocker | Owner Action |
|---|---|---|
| Live fixture import (write) | Requires ALLOW_WORLD_CUP_WRITE=true | Owner approval |
| SportRadar validation | SPORTSRADAR_SOCCER_API_KEY not set | Key procurement |
| ScoreBat highlights | SCOREBAT_WIDGET_TOKEN not set | Token registration |
| WC season in DB | Verify WC2026 season exists in DB | Check seed output |

## football-data.org Status

- Key: Configured locally (`FOOTBALL_DATA_API_KEY` in `apps/api/.env`)
- WC 2026: 104 matches validated in Sprint 13
- Free tier: 10 calls/min; WC competition available
- Status: READY_FOR_DRY_RUN

## Next Dry-Run Command

```bash
ADMIN_TOKEN=<jwt> node tools/staging/sprint-38a-world-cup-fixture-import.mjs --dry-run
```

Expected: 104 WC fixtures, SOURCE_AVAILABLE, 0 DB writes.
