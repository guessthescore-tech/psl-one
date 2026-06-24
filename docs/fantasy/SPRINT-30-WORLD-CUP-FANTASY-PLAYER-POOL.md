# Sprint 30 — World Cup 2026 Fantasy Player Pool

**Status:** DESIGN_COMPLETE | PSL INACTIVE | POINTS_ONLY | NON-FINANCIAL
**Date:** 2026-06-24

## Overview

The WC2026 fantasy player pool covers 48 national teams with a position-based selection model.
All fantasy points are **non-financial** — no real money, no wallet production, no cash rewards.

## Position Allocation

Fantasy squads are built with the following formation model (as per FantasyRulesConfig):

| Position | Squad Slots | Min Active | Bench Slots |
|----------|------------|------------|-------------|
| GK | 2 | 1 | 1 |
| DEF | 5 | 3 | 2 |
| MID | 5 | 3 | 2 |
| FWD | 3 | 1 | 1 |
| **Total** | **15** | **11** | **4** |

Configured via `FantasyRulesConfig` (admin-editable at `/admin/rules`).

## Placeholder Pricing Model

Until official pricing is calibrated, the system uses flat pricing by position:

| Position | Default Price (fantasy budget units) | Tier |
|----------|-------------------------------------|------|
| Goalkeeper | 5.0 | Standard |
| Defender | 5.0 | Standard |
| Midfielder | 6.0 | Standard |
| Forward | 7.0 | Standard |

Total squad budget: **100 units** (configurable via FantasyRulesConfig.totalBudget)

**Note:** These are **non-financial** budget units — not currency, not tradeable, no real monetary value.

### Price Calibration Workflow
Once full squad data is available, admin can:
1. POST `/admin/fantasy-price-calibration/batch` — trigger calibration run
2. GET `/admin/fantasy-price-calibration/preview` — review proposed prices
3. POST `/admin/fantasy-price-calibration/apply` — apply prices

Calibration factors (when player stats are available): minutes played, goals, assists, form.
For WC beta with provisional data: flat pricing is used.

## 48-Team Coverage Plan

All 48 WC national teams must be represented in the player pool. Minimum requirements:
- At least 1 GK per team (for squad building)
- At least 3 DEF per team
- At least 3 MID per team
- At least 1 FWD per team
- **Minimum viable per team: 8 players**
- **Target per team: 23+ players (full squad)**

Current coverage: ~96 players (~2/team average) — INSUFFICIENT for full fantasy.

See `SPRINT-30-WORLD-CUP-SQUAD-READINESS.md` for squad completion path.

## Fantasy Eligibility Rules

Player is eligible for fantasy selection if:
- `Player.isEligible = true` (or equivalent)
- `Player.teamId` links to an ACTIVE WC team in the current season
- Player has a valid `position` (GOALKEEPER/DEFENDER/MIDFIELDER/FORWARD)
- Player is NOT `status: SUSPENDED` or `status: INJURED` (if tracked)

## Gameweek Mapping

WC2026 rounds map to PSL One gameweeks:

| WC Round | Gameweek | Matches | Notes |
|----------|----------|---------|-------|
| Group Stage Round 1 | GW1 | 16 matches | All groups, Match Day 1 |
| Group Stage Round 2 | GW2 | 16 matches | All groups, Match Day 2 |
| Group Stage Round 3 | GW3 | 16 matches | All groups, Match Day 3 (simultaneous) |
| Round of 32 | GW4 | 32 matches | New format knock-out stage |
| Round of 16 | GW5 | 16 matches | |
| Quarter-finals | GW6 | 8 matches | |
| Semi-finals | GW7 | 4 matches | |
| Final + 3rd Place | GW8 | 2 matches | |

Transfer rules: FantasyRulesConfig.freeTransfersPerGameweek (admin-configurable).

## Points System (POINTS_ONLY)

All fantasy points are awarded as **non-financial engagement points** only.

| Action | Points |
|--------|--------|
| Goal scored (FWD/MID) | +6 / +5 |
| Goal scored (DEF/GK) | +6 |
| Assist | +3 |
| Clean sheet (GK/DEF 60+ min) | +4 / +1 |
| Yellow card | -1 |
| Red card | -3 |
| Penalty miss | -2 |
| Playing 60+ minutes | +2 |
| Playing 1-59 minutes | +1 |
| Captain multiplier | ×2 |

Configured via `FantasyRulesConfig.pointsConfig` (admin-editable).

## Auto-Substitution

FantasyAutoSubstitution model handles bench coverage:
- If active player did not play, eligible bench player substituted in
- Priority order set at team selection time
- Rules: same position for GK, any outfield for DEF/MID/FWD

## Safety Confirmations

- ✅ POINTS_ONLY — no cash prizes, no wallet production, no real-money rewards
- ✅ NON_FINANCIAL — fan value ledger used for engagement tracking only
- ✅ SANDBOX_WALLET — SiliconEnterpriseSandboxWalletAdapter (no real transactions)
- ✅ PSL_INACTIVE — WC context only, PSL not activated

---

*PSL INACTIVE | WALLET SANDBOX | POINTS_ONLY | NON-FINANCIAL | BETA ONLY*
