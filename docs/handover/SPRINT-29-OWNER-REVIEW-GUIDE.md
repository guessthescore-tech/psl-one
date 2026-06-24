# Sprint 29 Owner Review Guide

**Date:** 2026-06-24
**Sprint:** 29 — Cross-Tenant Membership Smoke
**Status:** CONDITIONAL_GO

---

## What to Review

Sprint 29 delivers smoke infrastructure and evidence runbooks for the
ClubMembership + SponsorMembership access controls built in Sprint 28.
There is no new feature code in Sprint 29.

---

## Key Decision: EC2 Deployment

**PSL remains inactive.** EC2 deployment of SHA `2605b372df829ea77f76c9c334909d54abdec294`
is the most important action needed from you.

### How to trigger

1. Go to: `https://github.com/guessthescore-tech/psl-one/actions/workflows/deploy-beta-ec2.yml`
2. Click **Run workflow**
3. Enter:
   - `git_sha`: `2605b372df829ea77f76c9c334909d54abdec294`
   - `run_migrations`: `true`
   - `confirm`: `DEPLOY`
4. Click **Run workflow**

The workflow will:
- Build 3 Docker images (api, migrator, web) at the exact SHA
- Apply Migration 43 (additive only — 2 new tables)
- Roll all services
- Run 17 standard smoke checks

**Expected outcome:** 17/17 smoke PASS (same as Sprint 24 baseline)

---

## What the Smoke Script Tests

After EC2 deployment, run `tools/staging/sprint-29-ec2-cross-tenant-smoke.sh`
on the EC2 via SSM. It tests:

1. **Anonymous access** → 401 on all portal routes (5 checks)
2. **PSL_ADMIN** with explicit scope → 200 (2 checks)
3. **PSL_ADMIN** without scope param → 400/403 (1 check)
4. **CLUB_ADMIN allowed club** → 200 (2 checks)
5. **CLUB_ADMIN foreign club** → 403 (cross-tenant denial) (2 checks)
6. **CLUB_ADMIN on sponsor portal** → 403 (role isolation) (2 checks)
7. **SPONSOR allowed sponsor** → 200 (2 checks)
8. **SPONSOR foreign sponsor** → 403 (cross-tenant denial) (2 checks)
9. **SPONSOR on club portal** → 403 (role isolation) (1 check)
10. **FAN** → 403 on all portals (2 checks)

**21 total checks — expected: 21 PASS / 0 FAIL**

---

## Safety Confirmations

| Safety Gate | Status |
|---|---|
| PSL season | INACTIVE — PSL remains inactive throughout Sprint 29 |
| Wallet | SANDBOX — no wallet production activation |
| Sponsor rewards | NON_FINANCIAL — no real-money, no cash prizes |
| Fixture import | NOT executed |
| Fixture publication | NOT executed |
| Production ingestion | NOT triggered |
| Scheduled ingestion | NOT enabled |
| Real-money | NOT added |
| Billing/payments | NOT in scope |

---

## Files to Review

| File | What to look for |
|---|---|
| `tools/staging/sprint-29-ec2-cross-tenant-smoke.sh` | No token printing; 403 cross-tenant checks present |
| `docs/staging/SPRINT-29-STAGING-MEMBERSHIP-PREFLIGHT.md` | Migration safety confirmed |
| `docs/security/SPRINT-29-MEMBERSHIP-SMOKE-SECURITY-REVIEW.md` | No-go conditions and risk assessment |
| `apps/experience/src/lib/experience.spec.ts` | Sprint 29 describe blocks at end of file |

---

## CI Status

| Check | Expected |
|---|---|
| CI Quality | PASS |
| Container Build | PASS |
| API tests | 2,053 PASS |
| Experience tests | 1,257+ PASS |

---

## Sprint 30 Decision Required

Please select Sprint 30 direction:

**Option A: Audience Segmentation + Sponsor Asset Management**
- Fan cohort filtering (achievement/activity tier)
- Sponsor campaign asset upload + approval workflow
- Campaign impression analytics

**Option B: World Cup Squads + Fantasy Player Pool**
- Verified WC2026 squad import (API-Football)
- Fantasy player pool seeding from WC2026 rosters
- Price calibration for WC2026 players

---

## Merge Decision

**CONDITIONAL_GO** — merge PR when:
- CI is green (all checks pass)
- You have reviewed key docs above

Live smoke can be executed after merge via EC2 deployment.
Do NOT block merge on live smoke — smoke runs post-deploy.
