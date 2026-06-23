# Sprint 25 — Points Rules Management

**Status:** Beta Ready
**Date:** 2026-06-23

## Platform Safety Constraints

- PSL remains inactive. World Cup 2026 remains active beta context.
- Wallet remains sandbox-only. No production wallet activation.
- Fantasy remains points-only. No real-money integration.
- Guess the Score remains points-only. No real-money integration.
- Sponsor rewards remain non-financial (points, badges, digital experiences only).
- No production ingestion. No scheduled ingestion.
- No real-money functionality.

## Points System Overview

All points systems in PSL One are points-based with no financial value.

### GTS_POINTS_ONLY

Guess the Score awards PSL points for:
- Exact score prediction: **5 points**
- Correct result (W/D/L): **2 points**
- Correct goal difference: **3 points**
- 0-0 correct prediction bonus: **3 points**
- Prediction streak (3+): **×1.5 multiplier**

PSL points have no financial value, cannot be redeemed for cash, and are not used in gambling or wagering.

### FANTASY_POINTS_ONLY

Fantasy football awards PSL points for player performance:
- Goal (GK): 8 pts | Goal (DEF): 6 pts | Goal (MID): 5 pts | Goal (FWD): 4 pts
- Assist: 3 pts
- Clean sheet (GK/DEF): 4 pts
- Yellow card: -1 pt | Red card: -3 pts
- Captain multiplier: ×2
- Free transfer limit: 1/gameweek | Extra transfer: -4 pts

Fantasy points have no financial value. No real money. No gambling.

### Points Simulation

The `/admin/points/simulation` page shows projected points for hypothetical match scenarios, allowing admins to validate rule configuration before going live.

### API Surface

All rules management goes through the admin API:
- `GET /admin/rules/prediction` — GTS config
- `PATCH /admin/rules/prediction` — Update GTS config (PSL_ADMIN)
- `GET /admin/rules/prediction/simulation` — GTS simulation
- `GET /admin/fantasy/rules` — Fantasy config
- `PATCH /admin/fantasy/rules` — Update fantasy config (PSL_ADMIN)
- `GET /admin/fantasy/rules/simulation` — Fantasy simulation
- `GET /admin/points` — Combined overview

API endpoints are currently pending backend implementation (API_PENDING: true).
