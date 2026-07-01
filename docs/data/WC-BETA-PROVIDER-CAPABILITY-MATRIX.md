# WC Beta — Provider Capability Matrix

**Updated:** 2026-07-01  
**Context:** World Cup 2026 beta. PSL season is NOT active. All features are points-only (no real money).

---

## Provider Overview

| Provider | Role in beta | Status | Key env var | PSL production |
|---|---|---|---|---|
| football-data.org | WC fixtures, scores, standings, teams, top-scorers (aggregate) | **ACTIVE** | `FOOTBALL_DATA_API_KEY` | Not applicable |
| football-data.org (live) | WC live match state + player stats via `FootballDataOrgLiveMatchAdapter` | **ACTIVE** | `FOOTBALL_DATA_API_KEY` + `WC_LIVE_PROVIDER=football-data-org` | Not applicable |
| Sportmonks v3 | WC live match events, lineups, player stats | **GATED** | `SPORTMONKS_API_KEY` + `WC_LIVE_PROVIDER=sportmonks` | REJECTED (ADR-029) |
| ScoreBat | WC video highlights (widget embed) | **GATED** | `SCOREBAT_WIDGET_TOKEN` | Not applicable |
| ParsePslAdapter | PSL fixture ingestion monitoring | **INACTIVE** | `PARSE_API_KEY` + `DATA_PROVIDER=parse-psl` | Candidate (awaiting fixtures) |
| ApiFootballAdapter | PSL fallback fixture ingestion | **INACTIVE** | `API_FOOTBALL_KEY` + `DATA_PROVIDER=api-football` | PSL league id=288 |
| SportRadarSoccerAdapter | WC fixture fallback (if FD.org key absent) | **INACTIVE** | `SPORTSRADAR_SOCCER_API_KEY` | Not evaluated |
| SportsDataIO | WC fixture backup | **INACTIVE** | `SPORTS_DATA_IO_KEY` | Not evaluated |
| NoOpAdapter | Safe default when no key configured | **ALWAYS PRESENT** | None | N/A |

---

## Capability Matrix by Data Type

| Data type | football-data.org | Sportmonks v3 | ScoreBat | API-Football | SportRadar |
|---|---|---|---|---|---|
| WC fixtures (list) | ✅ | ✅ | ❌ | Limited | ✅ |
| WC fixture scores | ✅ | ✅ | ❌ | Limited | ✅ |
| WC standings | ✅ | ✅ | ❌ | Limited | ✅ |
| WC teams | ✅ | ✅ | ❌ | ✅ | ✅ |
| WC live state (status/minute) | ✅ (polling) | ✅ | ❌ | ✅ | ✅ |
| WC match events (goals/cards) | ❌ (free tier — `/v4/matches/{id}` returns no events) | ✅ | ❌ | ✅ | ✅ |
| WC lineups | ❌ (free tier) | ✅ | ❌ | ✅ | ✅ |
| WC per-match player stats | ❌ (free tier — no lineups/events) | ✅ | ❌ | ✅ | ✅ |
| WC aggregate top-scorers | ✅ `/v4/competitions/WC/scorers` — competition totals only | ❌ | ❌ | ❌ | ❌ |
| WC leaderboard (beta path) | ✅ via `sync:world-cup-scorers` (52/100 matched) | N/A | ❌ | ❌ | ❌ |
| WC video highlights | ❌ | ❌ | ✅ (widget) | ❌ | ❌ |
| PSL fixtures | ❌ | REJECTED | ❌ | ✅ (id=288) | ❌ |
| PSL standings | ❌ | REJECTED | ❌ | ✅ | ❌ |
| PSL player stats | ❌ | REJECTED | ❌ | ✅ | ❌ |

> **WC beta leaderboard data source:** The beta `PlayerMatchStats` table is populated
> by the `sync:world-cup-scorers` script, which calls
> `/v4/competitions/WC/scorers?limit=100`. Each scorer gets ONE aggregate row with
> competition totals (goals, assists). `minutesPlayed` is approximated as
> `playedMatches × 85`. 52 of 100 FDO scorers matched beta seed players by name. The
> per-match sync (`sync:world-cup-player-stats`) returns **0 rows** on the free tier
> and must not be used for leaderboard population.

---

## Beta Adapter Status

### football-data.org (`FootballDataOrgAdapter`)
- **Status:** Active — primary WC fixture provider
- **Used for:** Fixture import, score refresh, standings
- **Adapter file:** `apps/api/src/data-provider/football-data-org.adapter.ts`
- **Key:** `FOOTBALL_DATA_API_KEY` (free tier, 10 req/min)
- **Limitations:** No live events, lineups, or player stats on free tier
- **Data state:** 85/105 fixtures provider-backed (19 knockout TBD fixtures self-resolve July 2026)

### football-data.org live (`FootballDataOrgLiveMatchAdapter`)
- **Status:** Active — current live match adapter on beta EC2
- **Activated by:** `WC_LIVE_PROVIDER=football-data-org` + `FOOTBALL_DATA_API_KEY`
- **Used for:** Live match status + score polling; `fetchFixturePlayerStats()` called but
  returns `[]` on free tier (no lineups in `/v4/matches/{id}`)
- **Adapter file:** `apps/api/src/football/football-data-org-live-match.adapter.ts`
- **Key:** `FOOTBALL_DATA_API_KEY` (same key as fixture adapter — 10 req/min)
- **Important:** `fetchFixtureEvents()` always returns `[]` (free tier limitation,
  documented in code and pinned in adapter spec). Do not expect goal/card events.

### Sportmonks (`SportmonksLiveMatchAdapter`)
- **Status:** Gated — NOT active on beta EC2; activated by `WC_LIVE_PROVIDER=sportmonks` + `SPORTMONKS_API_KEY`
- **Used for:** Live match events, lineups, player stats (WC only) — richer than FDO but requires paid key
- **Adapter file:** `apps/api/src/football/sportmonks-live-match.adapter.ts`
- **Key:** `SPORTMONKS_API_KEY` (trial available; current trial token expired or invalid)
- **PSL use:** REJECTED — see ADR-029 and ADR-037
- **Fallback:** `ManualLiveMatchProviderAdapter` (safe default, no network calls)

### ScoreBat (`ScoreBatWidgetAdapter`)
- **Status:** Gated — activated by `SCOREBAT_WIDGET_TOKEN`
- **Used for:** Embedded WC video highlights widget on `/world-cup/live`
- **Adapter file:** `apps/api/src/data-provider/scorebat-widget.adapter.ts`
- **Key:** `SCOREBAT_WIDGET_TOKEN`
- **Integration:** Widget embed URL only — no server-side API calls

### ParsePslAdapter
- **Status:** Inactive — INGESTION_SOURCE_EMPTY (WC fixtures only in July/Aug 2026)
- **Used for:** PSL fixture candidate monitoring
- **Activation:** `DATA_PROVIDER=parse-psl` + `PARSE_API_KEY` (owner must provision)

### ApiFootballAdapter
- **Status:** Inactive (PSL fallback, not activated)
- **PSL league ID:** 288 (Betway Premiership)
- **Activation:** `DATA_PROVIDER=api-football` + `API_FOOTBALL_KEY`

---

## Provider Selection Logic

### WC fixture ingestion / refresh
```
FOOTBALL_DATA_API_KEY? → FootballDataOrgAdapter
SPORTSRADAR_SOCCER_API_KEY? → SportRadarSoccerAdapter (fallback)
default → NoOpAdapter
```

### WC live match state / events / lineups / stats
```
WC_LIVE_PROVIDER=football-data-org AND FOOTBALL_DATA_API_KEY? → FootballDataOrgLiveMatchAdapter
  ↳ fetchFixturePlayerStats() returns [] on free tier (no lineups/events in /v4/matches/{id})
  ↳ CURRENT BETA EC2 STATE

WC_LIVE_PROVIDER=sportmonks AND SPORTMONKS_API_KEY? → SportmonksLiveMatchAdapter
  ↳ full lineups + events + player stats (requires paid Sportmonks key)
  ↳ GATED — NOT active on beta EC2

default → ManualLiveMatchProviderAdapter (admin manual entry — safe no-op)
```

### WC leaderboard / top-performers population
```
Beta aggregate path (current):
  pnpm sync:world-cup-scorers -- --confirm=SYNC_WC_SCORERS
  → calls /v4/competitions/WC/scorers (1 API request, free tier)
  → writes PlayerMatchStats with status=VERIFIED, source=IMPORTED
  → 52/100 scorers matched; competition totals (not per-match breakdown)

Per-match path (NOT usable on FDO free tier):
  pnpm sync:world-cup-player-stats -- --confirm=SYNC_PROVIDER_PLAYER_STATS
  → calls /v4/matches/{id} per fixture (no lineups → 0 rows written)
  → DO NOT USE as the leaderboard population step on FDO free tier
```

### PSL fixture ingestion
```
DATA_PROVIDER=parse-psl AND PARSE_API_KEY? → ParsePslAdapter
DATA_PROVIDER=api-football AND API_FOOTBALL_KEY? → ApiFootballAdapter (fallback)
default → NoOpAdapter
PSL SEASON IS NOT ACTIVE — ingestion candidates require owner review + approval
```

---

## Safety Guards (all beta)

| Guard | Status |
|---|---|
| PSL season activated | NO |
| PSL fixtures imported | NO |
| PSL fixtures published | NO |
| Sportmonks used for PSL | NO (rejected at ProviderRouterService) |
| Provider key in API response | NEVER (key presence only) |
| Provider key in NEXT_PUBLIC_ | NEVER |
| Betting / odds | NONE |
| Real money | NONE |
| Fantasy / GTS | Points-only |

---

## Admin Endpoints

| Endpoint | Provider | Purpose |
|---|---|---|
| `GET /admin/data-provider/world-cup-live-readiness` | All | Full readiness report |
| `GET /admin/data-provider/wc-beta-capability` | All | Compact capability matrix |
| `GET /admin/data-provider/world-cup/sync-status` | football-data.org | Fixture sync state |
| `POST /admin/data-provider/world-cup/fixtures/refresh-status` | football-data.org | Refresh scores from API |
| `POST /admin/data-provider/world-cup/fixtures/import` | football-data.org | Import new fixtures (dry-run default) |
| `GET /admin/data-provider/world-cup/scorebat-widget-config` | ScoreBat | Widget embed config |
