# Sprint 25 — Known Gaps

**Status:** Documented
**Date:** 2026-06-23

## Platform Safety Constraints

- PSL remains inactive. World Cup 2026 remains active beta context.
- Wallet remains sandbox-only. No production wallet activation.
- Fantasy remains points-only. No real-money integration.
- Guess the Score remains points-only. No real-money integration.
- Sponsor rewards remain non-financial (points, badges, digital experiences only).
- No production ingestion. No scheduled ingestion.
- No real-money functionality.

## Known Gaps

### API Gaps (Frontend shows mock/empty data)

1. `GET /admin/overview` — Not yet implemented. Shows hardcoded platform status.
2. `GET /admin/competitions` — May need to map to existing `/competitions` endpoint.
3. `GET /admin/seasons` — May need to map to existing `/seasons` endpoint.
4. `GET /admin/users` — Endpoint needed for user management.
5. `GET /clubs/:id/fans` — New endpoint needed.
6. `GET /clubs/:id/analytics` — New endpoint needed.
7. `GET /clubs/:id/content` — New endpoint needed.
8. `GET /sponsors/:id/audiences` — New endpoint needed.
9. `GET /sponsors/:id/analytics` — New endpoint needed.
10. `GET /admin/rules/prediction/simulation` — Simulation endpoint needed.
11. `GET /admin/fantasy/rules/simulation` — Simulation endpoint needed.
12. `GET /admin/points` — Aggregated overview endpoint needed.

### Data Gaps

1. PSL clubs show fan count 0 — PSL inactive, no fans registered to PSL clubs.
2. Player stats not available — pending PSL activation and live provider.
3. WC 2026 data is limited to fixtures, standings, and basic player data.

### UX Gaps

1. Portal sidebar is not collapsible (mobile optimization needed).
2. PortalDataTable pagination not implemented (shows all rows).
3. Search in PortalTopbar is a placeholder (not wired to API).
4. User menu in PortalTopbar is a placeholder (no dropdown).

### Owner Gates (Blocking Production)

1. PSL season activation — PENDING owner authorisation.
2. Wallet production mode — PENDING owner authorisation.
3. Live provider key (API-Football PSL) — PENDING owner supply.
4. Parse.bot key — PENDING owner supply.
5. EC2 re-deployment after Sprint 25 changes — PENDING.
