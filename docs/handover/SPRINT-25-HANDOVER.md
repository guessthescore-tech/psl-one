# Sprint 25 — Handover Document

**Status:** Complete
**Date:** 2026-06-23

## Platform Safety Constraints

- PSL remains inactive. World Cup 2026 remains active beta context.
- Wallet remains sandbox-only. No production wallet activation.
- Fantasy remains points-only. No real-money integration.
- Guess the Score remains points-only. No real-money integration.
- Sponsor rewards remain non-financial (points, badges, digital experiences only).
- No production ingestion. No scheduled ingestion.
- No real-money functionality.

## What Was Built

### Portal Shell Components (8 files)

- `PortalShell.tsx` — Left sidebar + topbar wrapper layout
- `PortalSidebar.tsx` — Role-aware navigation links with groups
- `PortalTopbar.tsx` — Breadcrumbs, search placeholder, user menu
- `PortalStatusBadges.tsx` — PSL INACTIVE, SANDBOX, POINTS ONLY badges
- `PortalMetricCard.tsx` — Metric card with label, value, trend
- `PortalDataTable.tsx` — Generic sortable table
- `PortalEmptyState.tsx` — Empty state with action
- `PortalConfirmDialog.tsx` — Confirmation modal for dangerous actions

### Admin Portal (22 pages)

All pages in `apps/experience/src/app/admin/` — see SPRINT-25-ADMIN-PORTAL-SCOPE.md

### Club Portal (14 pages)

All pages in `apps/experience/src/app/club/` — see SPRINT-25-CLUB-PORTAL-SCOPE.md

### Sponsor Portal (13 pages)

All pages in `apps/experience/src/app/sponsor/` — see SPRINT-25-SPONSOR-PORTAL-SCOPE.md

### API Clients (4 files)

- `admin-portal-api.ts` — Admin portal API client
- `club-portal-api.ts` — Club portal API client
- `sponsor-portal-api.ts` — Sponsor portal API client (non-financial)
- `points-rules-api.ts` — GTS + Fantasy points rules API client

### Route Constants

- `portal-routes.ts` — Typed constants for all portal routes

### Documentation (13 files)

- `docs/portals/SPRINT-25-ADMIN-PORTAL-SCOPE.md`
- `docs/portals/SPRINT-25-CLUB-PORTAL-SCOPE.md`
- `docs/portals/SPRINT-25-SPONSOR-PORTAL-SCOPE.md`
- `docs/portals/SPRINT-25-POINTS-RULES-MANAGEMENT.md`
- `docs/portals/SPRINT-25-PORTAL-RBAC-MATRIX.md`
- `docs/portals/SPRINT-25-PORTAL-API-CONTRACT-GAPS.md`
- `docs/portals/SPRINT-25-PORTAL-UX-QA-CHECKLIST.md`
- `docs/handover/SPRINT-25-BETA-GO-NOGO.md`
- `docs/handover/SPRINT-25-HANDOVER.md`
- `docs/handover/SPRINT-25-KNOWN-GAPS.md`
- `docs/handover/SPRINT-25-OWNER-REVIEW-GUIDE.md`
- `docs/handover/SPRINT-25-ROLLBACK-PLAN.md`
- `docs/sprints/SPRINT-25-STORY-MATRIX.md`

## Baseline Metrics

- API tests: 1,968 (unchanged — no backend changes)
- Experience tests: 905 → increased with portal tests
- Migrations: 0 (no schema changes)
- Pages added: 49 (22 admin + 14 club + 13 sponsor)

## Next Actions for Owner

1. Review portal pages visually in browser
2. Confirm safety badges are visible on all pages
3. Approve PR #25 once satisfied
4. Supply live provider keys when ready
5. Authorise PSL season activation when ready
