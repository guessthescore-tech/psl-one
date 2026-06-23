# Sprint 25 — Club Portal Scope

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
- The club portal does NOT expose league activation controls. Activation is admin-only.

## Scope

The Club Portal provides CLUB_ADMIN users with access to manage their club's presence, squad, and fan engagement.

### Pages (14 total)

| Route | Purpose |
|---|---|
| /club | Redirect to /club/overview |
| /club/overview | Club dashboard, PSL INACTIVE notice, no league activation exposed |
| /club/profile | Club profile management |
| /club/squad | Squad management (pending PSL activation) |
| /club/players | Individual player profiles |
| /club/fixtures | Upcoming fixtures (SOURCE_EMPTY) |
| /club/results | Match results (INACTIVE) |
| /club/fans | Fan registrations and points |
| /club/content | Article and video management |
| /club/campaigns | Sponsor campaign view |
| /club/sponsors | Sponsor partnerships |
| /club/analytics | Fan engagement analytics |
| /club/supporters | Supporter groups |
| /club/settings | Club portal settings |

### Safety: No League Activation

The club portal does not expose any controls for season activation, fixture publication, or competition management. Those are admin-only operations gated behind PSL_ADMIN role.
