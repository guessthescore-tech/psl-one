# Sprint 25 — Admin Portal Scope

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

## Scope

The Admin / League Operations Portal provides PSL_ADMIN users with a comprehensive view of all platform operations.

### Pages (22 total)

| Route | Purpose |
|---|---|
| /admin | Redirect to /admin/overview |
| /admin/overview | Platform status, PSL INACTIVE badge, safety flags, open owner gates |
| /admin/competitions | Competition list with activation status |
| /admin/seasons | Season list — PSL INACTIVE warning |
| /admin/fixtures | Fixture list with publish counts, SOURCE_EMPTY notice |
| /admin/teams | Team list |
| /admin/players | Player list with position filter |
| /admin/rules | Rules management overview |
| /admin/rules/guess-the-score | GTS points rules (POINTS_ONLY) |
| /admin/rules/fantasy | Fantasy points rules (POINTS_ONLY) |
| /admin/points | Points overview |
| /admin/points/simulation | Points simulation table |
| /admin/leaderboards | Leaderboard admin view |
| /admin/challenges | Challenge management |
| /admin/campaigns | Campaign management |
| /admin/sponsors | Sponsor list |
| /admin/clubs | Club list (all INACTIVE) |
| /admin/users | User management |
| /admin/roles | RBAC role definitions |
| /admin/audit | Audit log |
| /admin/settings | Platform settings (read-only safety flags) |
| /admin/readiness | Launch readiness checklist |

### Key Safety Features

- Every admin page shows PSL INACTIVE badge
- overview page lists all open owner gates
- settings page shows all platform constraint flags as locked/read-only
- readiness page tracks all launch readiness checks
- No activation buttons are exposed in any admin page without explicit owner gate
