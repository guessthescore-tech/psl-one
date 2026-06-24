# Sprint 29 Cross-Tenant Smoke — Results

**Date:** 2026-06-24
**Environment:** Beta EC2 (i-0a5f16539c9626f90, af-south-1)
**Status:** STAGING_SMOKE_PENDING

---

## Summary

| Category | Count | Status |
|---|---|---|
| PASS | — | PENDING |
| FAIL | — | PENDING |
| SKIP | — | PENDING |
| **OVERALL** | — | **STAGING_SMOKE_PENDING** |

---

## Check Results

| # | Check | Role | Expected | Result |
|---|---|---|---|---|
| 1 | API health check | — | 200 | PENDING |
| 2 | Anonymous /club-portal/overview | ANON | 401 | PENDING |
| 3 | Anonymous /sponsor-portal/overview | ANON | 401 | PENDING |
| 4 | Anonymous /club-portal/fixtures | ANON | 401 | PENDING |
| 5 | Anonymous /sponsor-portal/campaigns | ANON | 401 | PENDING |
| 6 | Admin /club-portal/overview (allowed teamId) | PSL_ADMIN | 200 | PENDING |
| 7 | Admin /sponsor-portal/overview (allowed sponsorId) | PSL_ADMIN | 200 | PENDING |
| 8 | Admin /club-portal/overview (no scope param) | PSL_ADMIN | 400/403 | PENDING |
| 9 | Club admin /club-portal/overview (allowed) | CLUB_ADMIN | 200 | PENDING |
| 10 | Club admin /club-portal/fixtures (allowed) | CLUB_ADMIN | 200 | PENDING |
| 11 | Club admin /club-portal/overview (cross-tenant) | CLUB_ADMIN | 403 | PENDING |
| 12 | Club admin /club-portal/fixtures (cross-tenant) | CLUB_ADMIN | 403 | PENDING |
| 13 | Club admin /sponsor-portal/overview | CLUB_ADMIN | 403 | PENDING |
| 14 | Club admin /sponsor-portal/campaigns | CLUB_ADMIN | 403 | PENDING |
| 15 | Sponsor /sponsor-portal/overview (allowed) | SPONSOR | 200 | PENDING |
| 16 | Sponsor /sponsor-portal/campaigns (allowed) | SPONSOR | 200 | PENDING |
| 17 | Sponsor /sponsor-portal/overview (cross-tenant) | SPONSOR | 403 | PENDING |
| 18 | Sponsor /sponsor-portal/campaigns (cross-tenant) | SPONSOR | 403 | PENDING |
| 19 | Sponsor /club-portal/overview | SPONSOR | 403 | PENDING |
| 20 | Fan /club-portal/overview | FAN | 403 | PENDING |
| 21 | Fan /sponsor-portal/overview | FAN | 403 | PENDING |

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

## Blockers to Smoke Execution

1. EC2 deployment of SHA `2605b372df829ea77f76c9c334909d54abdec294` not yet triggered
2. Migration 43 (`20260623000001_club_sponsor_memberships`) not yet applied to EC2
3. Temp smoke users not yet provisioned

Owner action required: trigger `deploy-beta-ec2.yml` workflow_dispatch with
`git_sha=2605b372df829ea77f76c9c334909d54abdec294` and `confirm=DEPLOY`.
