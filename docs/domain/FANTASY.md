# PSL One — Fantasy Football Domain

**Purpose:** Fantasy Football rules, scoring, and lifecycle  
**Audience:** Backend engineers, product  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Domain Overview

Fantasy Football lets fans pick a squad of PSL players, score points based on real match performance, and compete in leagues.

Modules: `FantasyModule`, `FantasyTransfersModule`, `FantasyChipsModule`, `FantasyRulesModule`, `FantasyLeaguesModule`, `FantasyScoringModule`, `FantasyAutoSubModule`, `FantasyCalibrationModule`

---

## Fantasy Team Structure

- One `FantasyTeam` per fan per season
- Squad of 15 players (configurable via `FantasyRulesConfig`)
- Starting XI + bench of 4
- Budget: 100m (configurable)

---

## FantasyRulesConfig

Admin-configurable per season:

| Field | Description |
|-------|-------------|
| `budget` | Total budget in millions (default: 100) |
| `squadSize` | Total squad size (default: 15) |
| `startingXI` | Starting players count (default: 11) |
| `transfersPerWeek` | Free transfers per gameweek (default: 1) |
| `pointsPerGoal` | Points for a goal (default: 6) |
| `pointsPerAssist` | Points for an assist (default: 3) |
| `pointsPerCleanSheet` | Points for clean sheet by position (configurable) |
| `captainMultiplier` | Captain score multiplier (default: 2) |

All rules are read from config at scoring time — no hardcoded values.

---

## Transfer Rules

- Free transfers: defined by `FantasyRulesConfig.transfersPerWeek`
- Excess transfers cost points (configurable)
- Transfer window: open after gameweek scores are finalised until next deadline
- `assertFantasyOpen()` guard: validates window is open before any transfer

---

## Chips

One-time advantages per season:

| Chip | Effect |
|------|--------|
| Wildcard | Unlimited free transfers for one gameweek |
| Triple Captain | Captain earns 3× points |
| Bench Boost | Bench players score normally (not just starters) |
| Free Hit | Temporary unlimited transfers for one gameweek (team reverts after) |

---

## Auto-Substitution

If a starting player scores 0 points (did not play), the system checks the bench in priority order and substitutes the first eligible bench player.

- `FantasyAutoSubstitution` records written per substitution
- Priority order: bench positions 1 → 2 → 3 → 4
- Formation rules respected (can't field 0 goalkeepers)

---

## Scoring

`FantasyGameweekScore` written per team per gameweek:

- `points` — total score
- `isProvisional` — `true` until official settlement
- Side effect: `FanValueLedger` entry for engagement

---

## Leagues

| Type | Description |
|------|-------------|
| GLOBAL | All fans — one per season |
| PUBLIC | Open to join — fan-created |
| PRIVATE | Invite-only — fan-created with code |

Standings: ordered by total points, with transfer count as tie-breaker (fewer transfers = higher rank on equal points).

---

## Fantasy Season Calibration

`FantasyCalibrationModule` handles provisional PSL player prices before official data arrives:

- 96 provisional players seeded
- Prices can be adjusted by admin via calibration tools
- Status: PROVISIONAL → ACTIVE on official data receipt (STORY-40)

---

## Key Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/fantasy/team` | Fan | Get my Fantasy team |
| POST | `/fantasy/transfers` | Fan | Make transfers |
| GET | `/fantasy/players` | Fan | Browse player pool |
| GET | `/fantasy/leagues` | Fan | My leagues |
| POST | `/fantasy/leagues` | Fan | Create a league |
| GET | `/admin/fantasy/gameweeks/:id/score` | Admin | Score a gameweek |
| POST | `/admin/fantasy-rules/:seasonId` | Admin | Set rules config |
| GET | `/admin/fantasy-calibration/:seasonId` | Admin | View calibration state |
