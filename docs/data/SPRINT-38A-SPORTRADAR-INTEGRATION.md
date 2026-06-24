# Sprint 38A — SportRadar Soccer API v4 Integration

## Status: ADAPTER_BUILT — KEY_PROCUREMENT_REQUIRED

## Overview

`SportRadarSoccerAdapter` implements `ProviderAdapter` for World Cup 2026 data
as a fallback when football-data.org key is unavailable.

## Adapter Details

- **File**: `apps/api/src/data-provider/sportradar-soccer.adapter.ts`
- **Class**: `SportRadarSoccerAdapter`
- **Base URL**: `https://api.sportradar.com/soccer/trial/v4/en`
- **Auth**: Query param `?api_key={key}` (server-side only)
- **Env var**: `SPORTSRADAR_SOCCER_API_KEY`
- **Safe mode**: All methods return empty/disabled when key absent

## Provider Routing

SportRadar is WC fallback only:
```
WC codes → FootballDataOrgAdapter (if FOOTBALL_DATA_API_KEY set)
         → SportRadarSoccerAdapter (if SPORTSRADAR_SOCCER_API_KEY set)
         → NoOpAdapter             (if neither)
```

SportRadar is NOT used for PSL (no PSL coverage confirmed).

## Endpoints Used

| Method | Path | Description |
|---|---|---|
| GET | `/competitions.json` | List competitions (health check) |
| GET | `/competitions/{id}/seasons.json` | List seasons |
| GET | `/seasons/{urn}/summaries.json` | Fixture list + scores |
| GET | `/seasons/{urn}/competitors.json` | Team list |
| GET | `/competitors/{urn}/profile.json` | Team squad |
| GET | `/seasons/{urn}/standings.json` | Group standings |

## Key Procurement

SportRadar trial keys available at: https://developer.sportradar.com/
- Soccer API v4 trial: limited calls per minute, trial data only
- WC 2026: check current catalogue for competition availability
- Set `SPORTSRADAR_SOCCER_API_KEY` in `.env` to activate

## Safety

- No betting/odds endpoints called
- No PSL data via this adapter
- Key never returned in API responses
- Trial key must be revoked before going live if replaced
