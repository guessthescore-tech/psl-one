# Sprint 29 Handover

**Date:** 2026-06-24
**Sprint:** 29 — Beta EC2 Deployment + Cross-Tenant Membership Smoke
**Status:** CONDITIONAL_GO (pending EC2 deployment and live smoke)
**PR:** feature/sprint-29-staging-membership-smoke → main

---

## What Was Built

### Smoke Infrastructure (committed)

| Artifact | Location | Purpose |
|---|---|---|
| Cross-tenant smoke script | `tools/staging/sprint-29-ec2-cross-tenant-smoke.sh` | EC2 bash smoke — 21 checks |
| Pre-flight doc | `docs/staging/SPRINT-29-STAGING-MEMBERSHIP-PREFLIGHT.md` | Migration safety review |
| Scope selection | `docs/staging/SPRINT-29-SMOKE-SCOPE-SELECTION.md` | Team/sponsor selection protocol |
| Temp user provisioning | `docs/staging/SPRINT-29-TEMP-USER-PROVISIONING.md` | CLUB_ADMIN + SPONSOR user setup |
| Execution log | `docs/staging/SPRINT-29-CROSS-TENANT-SMOKE-EXECUTION-LOG.md` | SSM command log + expected output |
| Smoke results | `docs/staging/SPRINT-29-CROSS-TENANT-SMOKE-RESULTS.md` | 21-check result matrix |
| Role evidence | `docs/staging/SPRINT-29-ROLE-SMOKE-EVIDENCE.md` | Per-role access table |
| Cleanup evidence | `docs/staging/SPRINT-29-TEMP-USER-CLEANUP-EVIDENCE.md` | Temp user removal protocol |
| Access verification | `docs/security/SPRINT-29-CROSS-TENANT-ACCESS-VERIFICATION.md` | Control design + unit test coverage |
| Security review | `docs/security/SPRINT-29-MEMBERSHIP-SMOKE-SECURITY-REVIEW.md` | Risk assessment + no-go conditions |
| Experience tests | `apps/experience/src/lib/experience.spec.ts` | +26 Sprint 29 doc coverage tests |

---

## State Summary

| Item | State |
|---|---|
| PSL season | INACTIVE — PSL remains inactive, no activation occurred |
| Wallet mode | SANDBOX only — SiliconEnterpriseSandboxWalletAdapter |
| Sponsor rewards | NON_FINANCIAL — no real-money, no cash, no billing |
| Migration 43 on main | MERGED (20260623000001_club_sponsor_memberships) |
| Migration 43 on EC2 | PENDING_DEPLOY — not yet applied to beta EC2 |
| EC2 deployed SHA | c731c494 (Sprint 24) — 5 sprints behind |
| EC2 target SHA | 2605b372df829ea77f76c9c334909d54abdec294 |
| Cross-tenant smoke | STAGING_SMOKE_PENDING |
| API tests | 2,053 PASS |
| Experience tests | 1,257+ PASS (after Sprint 29 additions) |

---

## Owner Actions Required

### 1. Trigger EC2 deployment (HIGHEST PRIORITY)

```
Workflow: deploy-beta-ec2.yml (workflow_dispatch)
git_sha: 2605b372df829ea77f76c9c334909d54abdec294
run_migrations: true
confirm: DEPLOY
```

This applies Migration 43 automatically and rolls all three images.

### 2. Confirm smoke execution

After deploy completes (17/17 smoke PASS expected):
1. SSH or SSM into EC2
2. Run `tools/staging/sprint-29-ec2-cross-tenant-smoke.sh`
3. Populate results in `SPRINT-29-CROSS-TENANT-SMOKE-RESULTS.md`
4. Run cleanup and confirm `SMOKE_USER_COUNT=0`

---

## What Was NOT Done

- No PSL activation (PSL remains inactive)
- No Terraform changes
- No IAM mutations
- No production deployments
- No fixture import write
- No fixture publication
- No wallet production activation
- No real-money functionality
- No scheduled ingestion enabled
- Live smoke not yet executed (pending EC2 deployment)

---

## Recommended Sprint 30 Focus

**Option A:** Audience Segmentation + Sponsor Asset Management
- Fan cohort filtering by achievement/activity tier
- Sponsor campaign asset upload + approval workflow
- Campaign impression analytics

**Option B:** World Cup Squads + Fantasy Player Pool Completion
- Verified WC2026 squad import (via API-Football)
- Fantasy player pool seeding from WC2026 rosters
- Fantasy price calibration for WC2026 players

Owner to select Sprint 30 direction.

---

## Test Counts

| Suite | Sprint 28 | Sprint 29 |
|---|---|---|
| API tests | 2,053 | 2,053 (unchanged) |
| Experience tests | 1,231 | 1,257 (+26 Sprint 29 doc tests) |

---

## References

- ADR-032: DB-Backed Portal Scoping
- `docs/staging/SPRINT-29-CROSS-TENANT-SMOKE-EXECUTION-LOG.md`
- `docs/staging/SPRINT-29-CROSS-TENANT-SMOKE-RESULTS.md`
- `docs/security/SPRINT-29-MEMBERSHIP-SMOKE-SECURITY-REVIEW.md`
