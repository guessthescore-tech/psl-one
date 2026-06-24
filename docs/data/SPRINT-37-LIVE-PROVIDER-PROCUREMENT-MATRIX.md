# Sprint 37 — Live Provider Procurement Decision Matrix

## Purpose

Evaluate provider options for PSL 2026/27 Betway Premiership fixture data and World Cup 2026 fixture data.

**PSL remains INACTIVE. World Cup 2026 remains the active beta context.**

No provider selection decision activates PSL. Provider key configuration is owner-only. Fixture import requires separate dry-run → owner review → write import authorisation.

---

## PSL Fixture Providers

### 1. Parse PSL / psl.co.za

| Field | Value |
|-------|-------|
| Status | SOURCE_EMPTY (expected) |
| Env var required | `PARSE_API_KEY` |
| Competition coverage | Betway Premiership / PSL only |
| Fixture coverage | Upcoming fixtures when published by psl.co.za |
| Team coverage | Via `get_clubs_list` — 16 teams |
| Squad/player coverage | Limited — match lineups only |
| Rate limits | Provider-dependent (8s timeout per call) |
| Legal/ToS risk | MEDIUM — Parse.bot wrapper over public site; not an official API |
| Beta suitability | YES — low cost, PSL-specific, owner-controlled |
| Production suitability | CONDITIONAL — requires ongoing Parse.bot subscription; no SLA |
| Cost | Parse.bot subscription (owner to confirm) |
| Owner action | Set `DATA_PROVIDER=parse-psl` + `PARSE_API_KEY` in beta `.env` |
| Failure mode | SOURCE_EMPTY until psl.co.za publishes; key expiry causes AUTH_FAILED |
| Recommended use | **PRIMARY PSL SOURCE** when fixtures are published |
| Current state | SOURCE_EMPTY — PSL 2026/27 schedule expected ~July/August 2026 |

### 2. API-Football PSL League 288

| Field | Value |
|-------|-------|
| Status | SUSPENDED (Sprint 13 — 2026-06-22) |
| Env var required | `API_FOOTBALL_KEY` |
| Competition coverage | PSL (league 288), broad international coverage |
| Fixture coverage | Full season + historical |
| Team coverage | Teams, squads, players |
| Squad/player coverage | Good — player stats, lineups, events |
| Rate limits | 100 requests/day (free); commercial plans available |
| Legal/ToS risk | LOW — official API with proper ToS |
| Beta suitability | CONDITIONAL — requires active paid account for PSL |
| Production suitability | YES — if account is active and licensed |
| Cost | Paid plan required (PSL is not free tier) |
| Owner action | Obtain a new API-Football account/key; verify PSL 288 access; set `DATA_PROVIDER=api-football` + `API_FOOTBALL_KEY` |
| Failure mode | Account suspension → all requests fail; key expiry → AUTH_FAILED |
| Recommended use | **PSL FALLBACK** if Parse PSL key is unavailable |
| Current state | BLOCKED — previous account suspended in Sprint 13 |

### 3. Manual CSV/JSON Fallback

| Field | Value |
|-------|-------|
| Status | NOT_IMPLEMENTED (emergency path only) |
| Env var required | None (manual upload) |
| Competition coverage | Whatever is in the uploaded file |
| Fixture coverage | Manual — depends on what owner uploads |
| Legal/ToS risk | LOW — owner-controlled data |
| Beta suitability | EMERGENCY ONLY |
| Production suitability | NOT RECOMMENDED |
| Cost | None (labor cost for manual prep) |
| Owner action | Prepare fixture CSV/JSON; implement manual import endpoint |
| Recommended use | LAST RESORT — if psl.co.za SOURCE_EMPTY after September 2026 |
| Current state | Not implemented; would require Sprint 38+ |

### 4. SportsDataIO

| Field | Value |
|-------|-------|
| Status | NOT_SELECTED |
| Env var required | Separate key |
| Competition coverage | UCL partial; PSL not confirmed |
| Beta suitability | LOW — no confirmed PSL coverage |
| Recommended use | Do not use for PSL — not evaluated for PSL 288 |
| Current state | Adapter present but not active |

### 5. NoOp Fallback

| Field | Value |
|-------|-------|
| Status | ACTIVE DEFAULT |
| Competition coverage | All (returns empty) |
| Beta suitability | YES — safe fallback |
| Recommended use | Default when no provider is configured |
| Current state | Active when DATA_PROVIDER not set |

---

## World Cup 2026 Provider

### football-data.org

| Field | Value |
|-------|-------|
| Status | ACTIVE (key required) |
| Env var required | `FOOTBALL_DATA_API_KEY` |
| Competition coverage | World Cup (code `WC`), UEFA, major leagues |
| Fixture coverage | 104 WC 2026 matches (validated Sprint 13) |
| Team coverage | Full national teams |
| Squad/player coverage | Players, squads, lineups |
| Rate limits | Free tier limited; commercial tier available |
| Legal/ToS risk | LOW — official licensed API |
| Beta suitability | YES — active WC 2026 data |
| Production suitability | YES — if licensed appropriately |
| Cost | Subscription (owner to confirm current tier) |
| Owner action | Confirm `FOOTBALL_DATA_API_KEY` is set in beta `.env` |
| Recommended use | **PRIMARY WC SOURCE** — WC data is the active beta context |
| Current state | ACTIVE via ProviderRouterService WC route when key present |

---

## Recommended Provider Path

```
WC 2026 beta:       football-data.org              (active, validated)
PSL 2026/27:        Parse PSL primary              (SOURCE_EMPTY — await July/August 2026)
PSL 2026/27 backup: API-Football PSL 288            (new account required)
Emergency:          Manual CSV/JSON                 (not yet implemented)
Default:            NoOpAdapter                     (always safe)
```

---

## Owner Decision Required

| Decision | Who | When |
|----------|-----|------|
| Confirm Parse PSL key is active | Owner | Before fixture import |
| Confirm football-data.org key is set | Owner | Ongoing WC beta |
| Decide whether to procure new API-Football account | Owner | If Parse PSL fails |
| Approve fixture dry-run once PSL fixes available | Owner | ~July/August 2026 |
| Approve fixture write import | Owner | After dry-run review |
| Approve fixture publication | Owner | After write import review |
| Approve PSL activation (13-check preflight) | Owner | Separately, after all above |

---

## Safety State

| Boundary | Status |
|----------|--------|
| PSL | INACTIVE |
| WC 2026 | ACTIVE (beta) |
| Fixture import write | NOT APPROVED |
| Fixture publication | NOT APPROVED |
| PSL activation | NOT APPROVED |
| Scheduled ingestion | DISABLED |
| Production ingestion | DISABLED |
| Real-money | NONE |
