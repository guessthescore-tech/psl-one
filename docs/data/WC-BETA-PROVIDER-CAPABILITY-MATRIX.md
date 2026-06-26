# WC Beta — Provider Capability Matrix

**Updated:** 2026-06-26  
**Context:** World Cup 2026 beta. PSL season is NOT active. All features are points-only (no real money).

---

## Provider Overview

| Provider | Role in beta | Status | Key env var | PSL production |
|---|---|---|---|---|
| football-data.org | WC fixtures, scores, standings, teams | **ACTIVE** | `FOOTBALL_DATA_API_KEY` | Not applicable |
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
| WC match events (goals/cards) | ❌ (free tier) | ✅ | ❌ | ✅ | ✅ |
| WC lineups | ❌ (free tier) | ✅ | ❌ | ✅ | ✅ |
| WC player stats | ❌ (free tier) | ✅ | ❌ | ✅ | ✅ |
| WC video highlights | ❌ | ❌ | ✅ (widget) | ❌ | ❌ |
| PSL fixtures | ❌ | REJECTED | ❌ | ✅ (id=288) | ❌ |
| PSL standings | ❌ | REJECTED | ❌ | ✅ | ❌ |
| PSL player stats | ❌ | REJECTED | ❌ | ✅ | ❌ |

---

## Beta Adapter Status

### football-data.org (`FootballDataOrgAdapter`)
- **Status:** Active — primary WC fixture provider
- **Used for:** Fixture import, score refresh, standings
- **Adapter file:** `apps/api/src/data-provider/football-data-org.adapter.ts`
- **Key:** `FOOTBALL_DATA_API_KEY` (free tier, 10 req/min)
- **Limitations:** No live events, lineups, or player stats on free tier
- **Data state:** 85/105 fixtures provider-backed (19 knockout TBD fixtures self-resolve July 2026)

### Sportmonks (`SportmonksLiveMatchAdapter`)
- **Status:** Gated — activated by `WC_LIVE_PROVIDER=sportmonks` + `SPORTMONKS_API_KEY`
- **Used for:** Live match events, lineups, player stats (WC only)
- **Adapter file:** `apps/api/src/football/sportmonks-live-match.adapter.ts`
- **Key:** `SPORTMONKS_API_KEY` (trial available)
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
WC_LIVE_PROVIDER=sportmonks AND SPORTMONKS_API_KEY? → SportmonksLiveMatchAdapter
default → ManualLiveMatchProviderAdapter (admin manual entry)
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
