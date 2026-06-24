# Sprint 29 Cross-Tenant Smoke — Results

**Date:** 2026-06-24
**Environment:** Beta EC2 (i-0a5f16539c9626f90, af-south-1)
**Executed:** 2026-06-24T07:51:48Z (post-deploy run 28082159537)
**Deployed SHA:** 2605b372df829ea77f76c9c334909d54abdec294
**Status:** SMOKE_PASS

---

## Summary

| Category | Count | Status |
|---|---|---|
| PASS | 21 | All checks |
| FAIL | 0 | No failures |
| SKIP | 0 | No skips |
| **OVERALL** | 21 | **GO — 21/21 PASS, 0 FAIL** |

---

## Check Results

| # | Check | Role | Expected | Result | Actual HTTP |
|---|---|---|---|---|---|
| 1 | API health check | — | 200 | **PASS** | 200 |
| 2 | Anonymous /club-portal/overview | ANON | 401 | **PASS** | 401 |
| 3 | Anonymous /sponsor-portal/overview | ANON | 401 | **PASS** | 401 |
| 4 | Anonymous /club-portal/fixtures | ANON | 401 | **PASS** | 401 |
| 5 | Anonymous /sponsor-portal/campaigns | ANON | 401 | **PASS** | 401 |
| 6 | Admin /club-portal/overview (allowed teamId) | PSL_ADMIN | 200 | **PASS** | 200 |
| 7 | Admin /sponsor-portal/overview (allowed sponsorId) | PSL_ADMIN | 200 | **PASS** | 200 |
| 8 | Admin /club-portal/overview (no scope param) | PSL_ADMIN | 400/403 | **PASS** | 400 |
| 9 | Club admin /club-portal/overview (allowed) | CLUB_ADMIN | 200 | **PASS** | 200 |
| 10 | Club admin /club-portal/fixtures (allowed) | CLUB_ADMIN | 200 | **PASS** | 200 |
| 11 | Club admin /club-portal/overview (cross-tenant) | CLUB_ADMIN | 403 | **PASS** | 403 |
| 12 | Club admin /club-portal/fixtures (cross-tenant) | CLUB_ADMIN | 403 | **PASS** | 403 |
| 13 | Club admin /sponsor-portal/overview | CLUB_ADMIN | 403 | **PASS** | 403 |
| 14 | Club admin /sponsor-portal/campaigns | CLUB_ADMIN | 403 | **PASS** | 403 |
| 15 | Sponsor /sponsor-portal/overview (allowed) | SPONSOR | 200 | **PASS** | 200 |
| 16 | Sponsor /sponsor-portal/campaigns (allowed) | SPONSOR | 200 | **PASS** | 200 |
| 17 | Sponsor /sponsor-portal/overview (cross-tenant) | SPONSOR | 403 | **PASS** | 403 |
| 18 | Sponsor /sponsor-portal/campaigns (cross-tenant) | SPONSOR | 403 | **PASS** | 403 |
| 19 | Sponsor /club-portal/overview | SPONSOR | 403 | **PASS** | 403 |
| 20 | Fan /club-portal/overview | FAN | 403 | **PASS** | 403 |
| 21 | Fan /sponsor-portal/overview | FAN | 403 | **PASS** | 403 |

---

## Security Controls Verified (design-time)

| Control | Expected Behaviour | Implementation |
|---|---|---|
| `CROSS_CLUB_ACCESS_DENIED` | CLUB_ADMIN gets 403 for non-member teamId | `PortalScopeService.assertClubScope()` |
| `CROSS_SPONSOR_ACCESS_DENIED` | SPONSOR gets 403 for non-member sponsorId | `PortalScopeService.assertSponsorScope()` |
| Role isolation | CLUB_ADMIN cannot reach sponsor portal | `@Roles('CLUB_ADMIN')` guard on club portal |
| Role isolation | SPONSOR cannot reach club portal | `@Roles('SPONSOR')` guard on sponsor portal |
| Unauthenticated | All portal routes require JWT | `JwtAuthGuard` on all portal controllers |

---

## PSL and Safety Confirmation

**No PSL activation occurred during this smoke run.**
PSL remains INACTIVE on beta EC2.

- Wallet mode: SANDBOX (SiliconEnterpriseSandboxWalletAdapter)
- Sponsor rewards: NON_FINANCIAL — no real-money, no cash prizes
- No fixture import write performed
- No fixture publication performed
- No production ingestion triggered
- No scheduled ingestion enabled
- No real-money functionality added in Sprint 29

---

## Blockers

None. All 21 checks PASS.

## Cross-Tenant Leak Status

**NONE_DETECTED** — No 200 was returned for any cross-tenant or unauthenticated request.
`CROSS_CLUB_ACCESS_DENIED` (403) enforced on forbidden teamId checks.
`CROSS_SPONSOR_ACCESS_DENIED` (403) enforced on forbidden sponsorId checks.
Role isolation (CLUB_ADMIN/SPONSOR cross-portal) confirmed via 403 on all role-mismatch routes.
Result is confirmed accurate from actual EC2 HTTP response codes.
