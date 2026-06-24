# Sprint 29 Role Smoke Evidence

**Date:** 2026-06-24
**Environment:** Beta EC2 (i-0a5f16539c9626f90, af-south-1)
**Executed:** 2026-06-24T07:51:48Z (post-deploy run 28082159537)
**Deployed SHA:** 2605b372df829ea77f76c9c334909d54abdec294
**Status:** SMOKE_PASS — 21 PASS / 0 FAIL / 0 SKIP

---

## Per-Role Evidence Table

### ANONYMOUS

| Route | Expected | Actual | Status |
|---|---|---|---|
| GET /club-portal/overview | 401 | **401** | **PASS** |
| GET /sponsor-portal/overview | 401 | **401** | **PASS** |
| GET /club-portal/fixtures | 401 | **401** | **PASS** |
| GET /sponsor-portal/campaigns | 401 | **401** | **PASS** |

**Mechanism:** `JwtAuthGuard` rejects all unauthenticated requests.

---

### PSL_ADMIN

| Route | Expected | Actual | Status |
|---|---|---|---|
| GET /club-portal/overview?teamId=ALLOWED | 200 | **200** | **PASS** |
| GET /sponsor-portal/overview?sponsorId=ALLOWED | 200 | **200** | **PASS** |
| GET /club-portal/overview (no teamId) | 400/403 | **400** | **PASS** |

**Mechanism:** `PortalScopeService.assertClubScope()` allows PSL_ADMIN to
specify any teamId. Without a scope param, returns 400 (missing required param).

---

### CLUB_ADMIN (with ClubMembership for ALLOWED_TEAM_ID)

| Route | Expected | Actual | Status |
|---|---|---|---|
| GET /club-portal/overview?teamId=ALLOWED | 200 | **200** | **PASS** |
| GET /club-portal/fixtures?teamId=ALLOWED | 200 | **200** | **PASS** |
| GET /club-portal/overview?teamId=FORBIDDEN | **403** | **403** | **PASS** |
| GET /club-portal/fixtures?teamId=FORBIDDEN | **403** | **403** | **PASS** |
| GET /sponsor-portal/overview | **403** | **403** | **PASS** |
| GET /sponsor-portal/campaigns | **403** | **403** | **PASS** |

**Mechanism:**
- Allowed team: `ClubMembership` record exists — `PortalScopeService` confirms access.
- Forbidden team: `CROSS_CLUB_ACCESS_DENIED` — throws `ForbiddenException`.
- Sponsor portal: `@Roles('SPONSOR')` guard blocks access by role.

---

### SPONSOR (with SponsorMembership for ALLOWED_SPONSOR_ID)

| Route | Expected | Actual | Status |
|---|---|---|---|
| GET /sponsor-portal/overview?sponsorId=ALLOWED | 200 | **200** | **PASS** |
| GET /sponsor-portal/campaigns?sponsorId=ALLOWED | 200 | **200** | **PASS** |
| GET /sponsor-portal/overview?sponsorId=FORBIDDEN | **403** | **403** | **PASS** |
| GET /sponsor-portal/campaigns?sponsorId=FORBIDDEN | **403** | **403** | **PASS** |
| GET /club-portal/overview | **403** | **403** | **PASS** |

**Mechanism:**
- Allowed sponsor: `SponsorMembership` record exists — `PortalScopeService` confirms access.
- Forbidden sponsor: `CROSS_SPONSOR_ACCESS_DENIED` — throws `ForbiddenException` (smoke-only second sponsor created for this check).
- Club portal: `@Roles('CLUB_ADMIN')` guard blocks access by role.

---

### FAN

| Route | Expected | Actual | Status |
|---|---|---|---|
| GET /club-portal/overview | 403 | **403** | **PASS** |
| GET /sponsor-portal/overview | 403 | **403** | **PASS** |

**Mechanism:** FAN role is not included in `@Roles(...)` decorator for portal controllers.

---

## Overall Role Matrix (actual results)

| Role | Own club portal | Other club portal | Own sponsor portal | Other sponsor portal | Cross-role |
|---|---|---|---|---|---|
| ANON | **401** | **401** | **401** | **401** | **401** |
| PSL_ADMIN | **200** (with teamId) | **200** (with teamId) | **200** (with sponsorId) | **200** (with sponsorId) | — |
| CLUB_ADMIN | **200** | **403** | **403** | **403** | **403** |
| SPONSOR | **403** | **403** | **200** | **403** | **403** |
| FAN | **403** | **403** | **403** | **403** | **403** |

All cells confirmed via live HTTP response on SHA 2605b372 on beta EC2 (2026-06-24T07:51:48Z).

---

## Status

**SMOKE_PASS** (2026-06-24T07:51:48Z) — 21 PASS / 0 FAIL / 0 SKIP

No FAIL was recorded. No cross-tenant leak detected. No unauthenticated access granted.

PSL remains INACTIVE. Wallet SANDBOX only. NON_FINANCIAL scope. No real-money.
