# Sprint 38A — World Cup Live Data Provider Integration

## Status: CONDITIONAL_GO (2026-06-24)

## Overview

Sprint 38A builds the execution-first World Cup 2026 live data provider integration:
- football-data.org adapter (enhanced — primary WC provider)
- SportRadar Soccer API v4 adapter (new — WC fallback)
- ScoreBat widget adapter (new — highlights widget only)
- `GET /admin/data-provider/world-cup-live-readiness` endpoint
- `POST /admin/data-provider/world-cup/fixtures/import` (dry-run default)
- 6 staging tools for health, fixture, team, squad, fantasy pool, and GTS card operations
- `/world-cup/live` frontend page with ScoreBat widget integration

## Provider Matrix

| Provider | Competition | Tier | Status |
|---|---|---|---|
| football-data.org | WC2026 | Free | PRIMARY — 104 matches validated Sprint 13 |
| SportRadar Soccer | WC2026 | Trial | FALLBACK — key procurement needed |
| ScoreBat | WC2026 | Widget | HIGHLIGHTS ONLY — widget embed attribution token |
| ParsePsl | PSL | Trial | SOURCE_EMPTY until July/August 2026 |
| API-Football | PSL | Trial | ACCOUNT_SUSPENDED |

## WC Provider Routing

```
WC competition codes (WC, WORLD_CUP_2026, FIFA_WORLD_CUP):
  1. FootballDataOrgAdapter  (if FOOTBALL_DATA_API_KEY set)
  2. SportRadarSoccerAdapter (if SPORTSRADAR_SOCCER_API_KEY set)
  3. NoOpAdapter             (if neither key set)
```

## Write-Mode Safety Flags

World Cup beta write mode requires BOTH:
1. Server env var: `ALLOW_WORLD_CUP_WRITE=true`
2. Request body: `confirmWorldCupWrite: "IMPORT_WORLD_CUP_BETA"`

Any missing flag → immediate `WRITE_BLOCKED_*` response, no DB writes.

## Safety Invariants

- PSL INACTIVE — fixture publication is not PSL activation
- No real money — fantasy and GTS are points-only
- No scheduled ingestion
- No production ingestion
- Provider keys never returned in API responses
- ScoreBat embed URL is safe to render (widget attribution token, not secret API key)
- SCOREBAT_WIDGET_TOKEN read server-side only; never NEXT_PUBLIC_

## New API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/admin/data-provider/world-cup-live-readiness` | PSL_ADMIN | Read-only env check |
| POST | `/admin/data-provider/world-cup/fixtures/import` | PSL_ADMIN | Import WC fixtures (dry-run default) |
| GET | `/admin/data-provider/world-cup/scorebat-widget-config` | PSL_ADMIN | ScoreBat embed config |

## New Frontend Routes

| Route | Description |
|---|---|
| `/world-cup/live` | WC live page with fixtures + ScoreBat highlights widget |
