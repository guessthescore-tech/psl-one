# World Cup 2026 Beta — Provider Decision Table

**Last updated:** 2026-07-01  
**Owner:** Platform Engineering  
**Scope:** WC 2026 beta only. PSL production data is governed by a separate provider stack (ADR-029, ADR-030).

---

## Provider Map

| Provider | Dataset | Prod status | Beta status | Known gap | Owner action |
|---|---|---|---|---|---|
| **football-data.org** | WC 2026 fixtures, scores, teams, standings, squad rosters | N/A (WC-only) | **LIVE** — 87 fixtures imported, 104 total; scores refreshed via admin endpoint | Free tier has no per-match player stats API (goals/assists/cards come from `/v4/matches/{id}`, minutes from lineups); no automated sync | None — primary fixture source; do not replace |
| **football-data.org (live-match)** | Per-match player stats via `/v4/matches/{id}` (goals, assists, cards, lineups, subs, clean sheets) | N/A | **READY** — `FootballDataOrgLiveMatchAdapter` added; activate with `WC_LIVE_PROVIDER=football-data-org` | Saves, shots, key passes not available on free tier; assist data from `goal.assist` (may be null for some goals); live in-game events not available (use manual entry) | Set `WC_LIVE_PROVIDER=football-data-org` on EC2; re-run backfill to populate player `externalId`; then run `sync:world-cup-player-stats` |
| **Sportmonks v3 (live-match)** | WC live match events, lineups, player stats | Rejected for PSL (ADR-029) | **MISALIGNED** — beta fixtures carry football-data.org `providerFixtureId` values; Sportmonks does not recognise FDO fixture IDs → always returns `[]` | Different fixture-ID namespace from FDO; WC 2026 backfill matched 0/48 teams (Sportmonks trial may not cover WC 2026); zero player `externalId` backfilled | Do not activate unless WC fixtures are reimported using Sportmonks fixture IDs; trial key must be verified to cover WC 2026 before attempting reimport |
| **ScoreBat** | WC video highlights widget (iframe embed) | N/A | **LIVE** — widget served at `/world-cup/live`; server-side token | Not a stats provider; highlights only | Set `SCOREBAT_WIDGET_TOKEN` on EC2 to enable embed |
| **ParsePslAdapter** | PSL fixtures from psl.co.za via Parse.bot | Not activated | **PENDING_LIVE_KEY** — adapter ready, ingestion service ready | No live PSL fixtures until July/August 2026 season starts | Obtain Parse.bot API key; set `PARSE_PSL_API_KEY`; run ingestion dry-run |
| **ApiFootball** | PSL fixtures (competition ID 288) | Not activated | Adapter ready | PSL not activated; season activation requires 13-point readiness checklist | Owner sign-off on PSL activation checklist before enabling |
| **WhenIsKickoff** | WC public schedule feed | N/A | Not integrated | Schedule-only (no scores, no player data) | No action — FDO is preferred for schedule + scores |
| **SportRadar** | WC team/player data (ProviderAdapter only) | N/A | Adapter present; key not set | Falls through to FDO in ProviderRouterService; SR has no `LiveMatchProviderAdapter` | Low priority; FDO covers WC data needs on free tier |
| **SportsDataIO** | WC coverage unverified | N/A | Adapter partial (UCL only partially validated) | WC 2026 coverage unverified; API key not set | Deferred |
| **NoOpAdapter** | Default fallback for all providers | — | **ALWAYS DEFAULT** when keys/flags not configured | Returns empty data; safe | No action needed |

---

## Current Beta State

| Check | Value |
|---|---|
| FINISHED WC fixtures | 68 |
| Fixtures with `providerFixtureId` | 87 (all football-data.org IDs, e.g. "537336") |
| `PlayerMatchStats` rows (WC season) | **0** — blocked by provider mismatch until fix applied |
| Players with `externalId` set | **0** — Sportmonks backfill matched 0/48 WC teams |
| Active live-match provider on EC2 | `WC_LIVE_PROVIDER=sportmonks` (misaligned — see gap above) |

---

## The Blocking Gap — Root Cause

All 87 beta WC fixtures carry `providerFixtureId` values from **football-data.org**
(numeric IDs like `537336`). The live-match provider was set to `sportmonks`. When
`syncProviderPlayerStats` runs, it calls:

```
SportmonksLiveMatchAdapter.fetchFixturePlayerStats("537336")
→ GET https://api.sportmonks.com/v3/football/fixtures/537336/statistics
→ Sportmonks returns 404 or empty — it has no fixture with ID "537336"
→ ProviderPlayerStat[] = []
→ PlayerMatchStats rows written = 0
```

Additionally, the Sportmonks backfill matched 0/48 WC teams (WC 2026 teams are not
indexed by Sportmonks under matching names), leaving `player.externalId = null` for
all 1,200 WC players. Even if stats were fetched, the player-ID mapping would fail.

---

## Fix Applied (2026-07-01)

Three changes were made. No schema migration, no PSL behaviour change.

### 1. `FootballDataOrgLiveMatchAdapter` (new)

`apps/api/src/football/football-data-org-live-match.adapter.ts`

Implements `LiveMatchProviderAdapter` using the same FDO namespace as the fixture import:
- `fetchFixturePlayerStats("537336")` → `GET /v4/matches/537336` → goals, assists, cards, lineups, subs
- Outputs `ProviderPlayerStat[]` with FDO player IDs as `playerProviderRef`
- 20 unit tests — 20/20 passing

### 2. `LiveMatchService.resolveProvider()` updated

```
WC_LIVE_PROVIDER=football-data-org + FOOTBALL_DATA_API_KEY → FootballDataOrgLiveMatchAdapter
WC_LIVE_PROVIDER=sportmonks       + SPORTMONKS_API_KEY     → SportmonksLiveMatchAdapter
default                                                     → ManualLiveMatchProviderAdapter
```

### 3. `WorldCupBetaBackfillService` constructor updated

Provider selection priority:
1. Explicit injection (tests / admin caller)
2. `FOOTBALL_DATA_API_KEY` set → `FootballDataOrgAdapter` (matches fixture-import namespace)
3. `SPORTMONKS_API_KEY` set → `SportmonksAdapter` (legacy)
4. Neither → seed-only fallback

---

## Steps to Populate Beta Stats (owner action)

These run on the EC2 instance via SSM. The deploy workflow can be extended to run
them automatically once `FOOTBALL_DATA_API_KEY` is present.

```bash
# 1. Set env vars on EC2 (SSM Parameter Store or .env.beta)
WC_LIVE_PROVIDER=football-data-org
FOOTBALL_DATA_API_KEY=<key>
ALLOW_WORLD_CUP_WRITE=true

# 2. Re-run backfill (non-destructive; sets player externalId from FDO squad data)
docker compose -f /opt/psl-one/compose.beta.yaml exec -T api \
  node dist/scripts/world-cup-backfill.js --confirm=BACKFILL_WORLD_CUP_BETA

# 3. Sync player stats for all FINISHED WC fixtures
docker compose -f /opt/psl-one/compose.beta.yaml exec -T api \
  node dist/scripts/sync-world-cup-player-stats.js --confirm=SYNC_PROVIDER_PLAYER_STATS

# 4. Verify (expect PlayerMatchStats rows > 0 and top-performers non-empty)
curl -s https://api.beta.pslone.co.za/player-stats/seasons/fifa-world-cup-2026/top-performers | jq length
```

---

## Free-Tier Limitations (FDO) — Known and Documented

| Field | Available | Notes |
|---|---|---|
| `goals` | ✓ | Per player, per match |
| `assists` | ✓ (partial) | From `goal.assist`; may be null if not tracked |
| `yellowCards` | ✓ | From `bookings` |
| `redCards` | ✓ | From `bookings` |
| `minutesPlayed` | ✓ | Derived from lineups + substitutions |
| `cleanSheet` | ✓ | Derived from score + lineups |
| `goalsConceded` | ✓ | Derived from match score per team |
| `saves` | ✗ | Not on free tier; defaults to 0 |
| `shotsOnTarget` | ✗ | Not on free tier; defaults to 0 |
| `passAccuracy` | ✗ | Not on free tier; defaults to null |
| Live in-game events | ✗ | Use manual entry via admin event endpoint |

---

## Related ADRs

- ADR-029: Sportmonks rejected for PSL — remains in force
- ADR-030: football-data.org selected for WC fixtures — remains in force
- ADR-037: WC beta live-match provider strategy — Sportmonks conditionally accepted; **FDO is now preferred** for the reasons above; update to ADR-037 pending
