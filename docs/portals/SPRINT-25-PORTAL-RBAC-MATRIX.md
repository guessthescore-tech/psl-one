# Sprint 25 — Portal RBAC Matrix

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

## RBAC Principles

1. RBAC is enforced at the NestJS API layer via `@Roles()` guards. Frontend RBAC is for UX only.
2. Never bypass RBAC. Never skip role checks.
3. Never store business logic in the frontend.
4. All admin mutations require PSL_ADMIN role.

## Role Definitions

| Role | Description | Portal Access |
|---|---|---|
| PSL_ADMIN | Full league operations | Admin Portal (`/admin/*`) |
| CLUB_ADMIN | Club management | Club Portal (`/club/*`) |
| SPONSOR_ADMIN | Sponsor management | Sponsor Portal (`/sponsor/*`) |
| FAN | Fan-facing features | Fan routes + authenticated fan pages |

## Route Access Matrix

### Admin Portal (`/admin/*`)

| Route | Required Role | Notes |
|---|---|---|
| /admin/overview | PSL_ADMIN | Read-only status |
| /admin/competitions | PSL_ADMIN | Read-only list |
| /admin/seasons | PSL_ADMIN | PSL INACTIVE — no activation |
| /admin/fixtures | PSL_ADMIN | No publication without auth |
| /admin/rules/guess-the-score | PSL_ADMIN | GTS POINTS ONLY |
| /admin/rules/fantasy | PSL_ADMIN | FANTASY POINTS ONLY |
| /admin/users | PSL_ADMIN | User management |
| /admin/audit | PSL_ADMIN | Audit log — never bypassed |
| /admin/readiness | PSL_ADMIN | Launch checklist |

### Club Portal (`/club/*`)

| Route | Required Role | Notes |
|---|---|---|
| /club/overview | CLUB_ADMIN | No league activation exposed |
| /club/profile | CLUB_ADMIN | Edit own club only |
| /club/squad | CLUB_ADMIN | Pending PSL activation |
| /club/fans | CLUB_ADMIN | Read-only fan list |

### Sponsor Portal (`/sponsor/*`)

| Route | Required Role | Notes |
|---|---|---|
| /sponsor/overview | SPONSOR_ADMIN | Non-financial declaration shown |
| /sponsor/campaigns | SPONSOR_ADMIN | Non-financial rewards only |
| /sponsor/rewards | SPONSOR_ADMIN | SPONSOR_REWARDS_NON_FINANCIAL |
| /sponsor/billing-placeholder | SPONSOR_ADMIN | Sandbox — no real transactions |

## RBAC Tests

Sprint 23 added 36 guard tests confirming `@Roles('PSL_ADMIN')` is applied to all admin routes.
Sprint 24 confirmed RBAC smoke: 8/0 pass/fail on beta EC2 staging.
