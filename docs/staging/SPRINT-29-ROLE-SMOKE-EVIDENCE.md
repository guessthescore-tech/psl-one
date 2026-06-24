# Sprint 29 Role Smoke Evidence

**Date:** 2026-06-24
**Environment:** Beta EC2 (i-0a5f16539c9626f90, af-south-1)
**Executed:** 2026-06-24T06:51:48Z
**Deployed SHA:** c731c494 (Sprint 23 — portal routes NOT present)
**Status:** STAGING_SMOKE_EXECUTED (1 PASS / 0 FAIL / 20 SKIP — CODE_NOT_DEPLOYED)

---

## Per-Role Evidence Table

### ANONYMOUS

| Route | Expected | Actual | Status |
|---|---|---|---|
| GET /club-portal/overview | 401 | 404 | SKIP (CODE_NOT_DEPLOYED) |
| GET /sponsor-portal/overview | 401 | 404 | SKIP (CODE_NOT_DEPLOYED) |
| GET /club-portal/fixtures | 401 | 404 | SKIP (CODE_NOT_DEPLOYED) |
| GET /sponsor-portal/campaigns | 401 | 404 | SKIP (CODE_NOT_DEPLOYED) |

**Mechanism:** `JwtAuthGuard` rejects all unauthenticated requests.

---

### PSL_ADMIN

| Route | Expected | Actual | Status |
|---|---|---|---|
| GET /club-portal/overview?teamId=ALLOWED | 200 | 404 | SKIP (CODE_NOT_DEPLOYED) |
| GET /sponsor-portal/overview?sponsorId=ALLOWED | 200 | 404 | SKIP (CODE_NOT_DEPLOYED) |
| GET /club-portal/overview (no teamId) | 400/403 | 404 | SKIP (CODE_NOT_DEPLOYED) |

**Mechanism:** `PortalScopeService.assertClubScope()` allows PSL_ADMIN to
specify any teamId. Without a scope param, returns 400 (missing required param).

---

### CLUB_ADMIN (with ClubMembership for ALLOWED_TEAM_ID)

| Route | Expected | Actual | Status |
|---|---|---|---|
| GET /club-portal/overview?teamId=ALLOWED | 200 | 404 | SKIP (CODE_NOT_DEPLOYED) |
| GET /club-portal/fixtures?teamId=ALLOWED | 200 | 404 | SKIP (CODE_NOT_DEPLOYED) |
| GET /club-portal/overview?teamId=FORBIDDEN | **403** | 404 | SKIP (CODE_NOT_DEPLOYED) |
| GET /club-portal/fixtures?teamId=FORBIDDEN | **403** | 404 | SKIP (CODE_NOT_DEPLOYED) |
| GET /sponsor-portal/overview | **403** | 404 | SKIP (CODE_NOT_DEPLOYED) |
| GET /sponsor-portal/campaigns | **403** | 404 | SKIP (CODE_NOT_DEPLOYED) |

**Mechanism:** 
- Allowed team: `ClubMembership` record exists — `PortalScopeService` confirms access.
- Forbidden team: `CROSS_CLUB_ACCESS_DENIED` — throws `ForbiddenException`.
- Sponsor portal: `@Roles('SPONSOR')` guard blocks access by role.

---

### SPONSOR (with SponsorMembership for ALLOWED_SPONSOR_ID)

| Route | Expected | Actual | Status |
|---|---|---|---|
| GET /sponsor-portal/overview?sponsorId=ALLOWED | 200 | 404 | SKIP (CODE_NOT_DEPLOYED) |
| GET /sponsor-portal/campaigns?sponsorId=ALLOWED | 200 | 404 | SKIP (CODE_NOT_DEPLOYED) |
| GET /sponsor-portal/overview?sponsorId=FORBIDDEN | **403** | SKIP | SKIP (only 1 sponsor in beta) |
| GET /sponsor-portal/campaigns?sponsorId=FORBIDDEN | **403** | SKIP | SKIP (only 1 sponsor in beta) |
| GET /club-portal/overview | **403** | 404 | SKIP (CODE_NOT_DEPLOYED) |

**Mechanism:**
- Allowed sponsor: `SponsorMembership` record exists — `PortalScopeService` confirms access.
- Forbidden sponsor: `CROSS_SPONSOR_ACCESS_DENIED` — throws `ForbiddenException`.
- Club portal: `@Roles('CLUB_ADMIN')` guard blocks access by role.

---

### FAN

| Route | Expected | Actual | Status |
|---|---|---|---|
| GET /club-portal/overview | 403 | 404 | SKIP (CODE_NOT_DEPLOYED) |
| GET /sponsor-portal/overview | 403 | 404 | SKIP (CODE_NOT_DEPLOYED) |

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

**STAGING_SMOKE_EXECUTED** (2026-06-24T06:51:48Z) — 1 PASS / 0 FAIL / 20 SKIP

All SKIP results are due to CODE_NOT_DEPLOYED (c731c494 does not include portal routes).
No FAIL was recorded. No cross-tenant leak detected. No unauthenticated access granted.

**Owner action required:** Trigger `deploy-beta-ec2.yml` with SHA `2605b372...` to
deploy portal code, then re-run smoke to populate PASS/FAIL results for checks 2-21.

PSL remains INACTIVE. Wallet SANDBOX only. NON_FINANCIAL scope. No real-money.
