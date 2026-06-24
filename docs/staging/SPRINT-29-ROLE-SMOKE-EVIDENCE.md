# Sprint 29 Role Smoke Evidence

**Date:** 2026-06-24
**Environment:** Beta EC2 (i-0a5f16539c9626f90, af-south-1)
**Status:** STAGING_SMOKE_PENDING

---

## Per-Role Evidence Table

### ANONYMOUS

| Route | Expected | Result |
|---|---|---|
| GET /club-portal/overview | 401 | PENDING |
| GET /sponsor-portal/overview | 401 | PENDING |
| GET /club-portal/fixtures | 401 | PENDING |
| GET /sponsor-portal/campaigns | 401 | PENDING |

**Mechanism:** `JwtAuthGuard` rejects all unauthenticated requests.

---

### PSL_ADMIN

| Route | Expected | Result |
|---|---|---|
| GET /club-portal/overview?teamId=ALLOWED | 200 | PENDING |
| GET /sponsor-portal/overview?sponsorId=ALLOWED | 200 | PENDING |
| GET /club-portal/overview (no teamId) | 400/403 | PENDING |

**Mechanism:** `PortalScopeService.assertClubScope()` allows PSL_ADMIN to
specify any teamId. Without a scope param, returns 400 (missing required param).

---

### CLUB_ADMIN (with ClubMembership for ALLOWED_TEAM_ID)

| Route | Expected | Result |
|---|---|---|
| GET /club-portal/overview?teamId=ALLOWED | 200 | PENDING |
| GET /club-portal/fixtures?teamId=ALLOWED | 200 | PENDING |
| GET /club-portal/overview?teamId=FORBIDDEN | **403** | PENDING |
| GET /club-portal/fixtures?teamId=FORBIDDEN | **403** | PENDING |
| GET /sponsor-portal/overview | **403** | PENDING |
| GET /sponsor-portal/campaigns | **403** | PENDING |

**Mechanism:** 
- Allowed team: `ClubMembership` record exists — `PortalScopeService` confirms access.
- Forbidden team: `CROSS_CLUB_ACCESS_DENIED` — throws `ForbiddenException`.
- Sponsor portal: `@Roles('SPONSOR')` guard blocks access by role.

---

### SPONSOR (with SponsorMembership for ALLOWED_SPONSOR_ID)

| Route | Expected | Result |
|---|---|---|
| GET /sponsor-portal/overview?sponsorId=ALLOWED | 200 | PENDING |
| GET /sponsor-portal/campaigns?sponsorId=ALLOWED | 200 | PENDING |
| GET /sponsor-portal/overview?sponsorId=FORBIDDEN | **403** | PENDING |
| GET /sponsor-portal/campaigns?sponsorId=FORBIDDEN | **403** | PENDING |
| GET /club-portal/overview | **403** | PENDING |

**Mechanism:**
- Allowed sponsor: `SponsorMembership` record exists — `PortalScopeService` confirms access.
- Forbidden sponsor: `CROSS_SPONSOR_ACCESS_DENIED` — throws `ForbiddenException`.
- Club portal: `@Roles('CLUB_ADMIN')` guard blocks access by role.

---

### FAN

| Route | Expected | Result |
|---|---|---|
| GET /club-portal/overview | 403 | PENDING |
| GET /sponsor-portal/overview | 403 | PENDING |

**Mechanism:** FAN role is not included in `@Roles(...)` decorator for portal controllers.

---

## Overall Role Matrix

| Role | Own club portal | Other club portal | Own sponsor portal | Other sponsor portal | Cross-role |
|---|---|---|---|---|---|
| ANON | 401 | 401 | 401 | 401 | 401 |
| PSL_ADMIN | 200 (with teamId) | 200 (with teamId) | 200 (with sponsorId) | 200 (with sponsorId) | — |
| CLUB_ADMIN | 200 | **403** | **403** | **403** | **403** |
| SPONSOR | **403** | **403** | 200 | **403** | **403** |
| FAN | **403** | **403** | **403** | **403** | **403** |

---

## Status

**STAGING_SMOKE_PENDING** — Results will be populated after EC2 deployment and smoke run.

PSL remains INACTIVE. Wallet SANDBOX only. NON_FINANCIAL scope. No real-money.
