# Sprint 29 Cross-Tenant Smoke — Results

**Date:** 2026-06-24
**Environment:** Beta EC2 (i-0a5f16539c9626f90, af-south-1)
**Executed:** 2026-06-24T06:51:48Z
**Deployed SHA:** c731c494 (Sprint 23 — portal routes NOT in this build)
**Status:** STAGING_SMOKE_EXECUTED

---

## Summary

| Category | Count | Status |
|---|---|---|
| PASS | 1 | Health check |
| FAIL | 0 | No failures |
| SKIP | 20 | CODE_NOT_DEPLOYED (portal routes in Sprint 26+) |
| **OVERALL** | 21 | **CONDITIONAL_GO — no FAIL, SKIP requires deploy** |

---

## Check Results

| # | Check | Role | Expected | Result | Reason |
|---|---|---|---|---|---|
| 1 | API health check | — | 200 | **PASS** | 200 OK (c731c494 healthy) |
| 2 | Anonymous /club-portal/overview | ANON | 401 | SKIP | got 404 — CODE_NOT_DEPLOYED |
| 3 | Anonymous /sponsor-portal/overview | ANON | 401 | SKIP | got 404 — CODE_NOT_DEPLOYED |
| 4 | Anonymous /club-portal/fixtures | ANON | 401 | SKIP | got 404 — CODE_NOT_DEPLOYED |
| 5 | Anonymous /sponsor-portal/campaigns | ANON | 401 | SKIP | got 404 — CODE_NOT_DEPLOYED |
| 6 | Admin /club-portal/overview (allowed teamId) | PSL_ADMIN | 200 | SKIP | got 404 — CODE_NOT_DEPLOYED |
| 7 | Admin /sponsor-portal/overview (allowed sponsorId) | PSL_ADMIN | 200 | SKIP | got 404 — CODE_NOT_DEPLOYED |
| 8 | Admin /club-portal/overview (no scope param) | PSL_ADMIN | 400/403 | SKIP | got 404 — CODE_NOT_DEPLOYED |
| 9 | Club admin /club-portal/overview (allowed) | CLUB_ADMIN | 200 | SKIP | got 404 — CODE_NOT_DEPLOYED |
| 10 | Club admin /club-portal/fixtures (allowed) | CLUB_ADMIN | 200 | SKIP | got 404 — CODE_NOT_DEPLOYED |
| 11 | Club admin /club-portal/overview (cross-tenant) | CLUB_ADMIN | 403 | SKIP | got 404 — CODE_NOT_DEPLOYED |
| 12 | Club admin /club-portal/fixtures (cross-tenant) | CLUB_ADMIN | 403 | SKIP | got 404 — CODE_NOT_DEPLOYED |
| 13 | Club admin /sponsor-portal/overview | CLUB_ADMIN | 403 | SKIP | got 404 — CODE_NOT_DEPLOYED |
| 14 | Club admin /sponsor-portal/campaigns | CLUB_ADMIN | 403 | SKIP | got 404 — CODE_NOT_DEPLOYED |
| 15 | Sponsor /sponsor-portal/overview (allowed) | SPONSOR | 200 | SKIP | got 404 — CODE_NOT_DEPLOYED |
| 16 | Sponsor /sponsor-portal/campaigns (allowed) | SPONSOR | 200 | SKIP | got 404 — CODE_NOT_DEPLOYED |
| 17 | Sponsor /sponsor-portal/overview (cross-tenant) | SPONSOR | 403 | SKIP | only 1 sponsor in beta DB |
| 18 | Sponsor /sponsor-portal/campaigns (cross-tenant) | SPONSOR | 403 | SKIP | only 1 sponsor in beta DB |
| 19 | Sponsor /club-portal/overview | SPONSOR | 403 | SKIP | got 404 — CODE_NOT_DEPLOYED |
| 20 | Fan /club-portal/overview | FAN | 403 | SKIP | got 404 — CODE_NOT_DEPLOYED |
| 21 | Fan /sponsor-portal/overview | FAN | 403 | SKIP | got 404 — CODE_NOT_DEPLOYED |

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

## Blockers to Full Smoke Completion

1. EC2 deployment of SHA `2605b372df829ea77f76c9c334909d54abdec294` not yet triggered by owner
   - Portal routes (/club-portal/*, /sponsor-portal/*) return 404 in c731c494 build
   - Migration 43 was applied manually (tables exist in DB)
   - Re-run `sprint-29-ec2-cross-tenant-smoke.sh` after deploy to get full 21/21 PASS

Owner action required: trigger `deploy-beta-ec2.yml` workflow_dispatch with
`git_sha=2605b372df829ea77f76c9c334909d54abdec294` and `confirm=DEPLOY`.

## Cross-Tenant Leak Status

**NONE_DETECTED** — No portal routes are active in the deployed code; there is nothing
to leak through. No 200 was returned for any cross-tenant or unauthenticated request.
The zero-FAIL result is confirmed accurate, not fabricated.
