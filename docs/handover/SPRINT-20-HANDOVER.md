# Sprint 20 — Handover

## Sprint Goal

Owner-authorised beta EC2 deployment and staging smoke validation of the Sprint 18/19 admin workflow.

## Status

**CONDITIONAL_GO** — EC2 deployment workflow triggered, docs complete, tests complete. Manual smoke tools pending ADMIN_TOKEN acquisition.

---

## What Was Done

### Owner Authorisation
Owner explicitly authorised beta EC2 deployment for Sprint 20.

### EC2 Deployment
Triggered `deploy-beta-ec2.yml` with SHA `81d3c391ffb69b9217caf0847aa9b4402493c83d` (Sprint 19 merge commit, tip of main).

### Docs Created
- `docs/staging/SPRINT-20-EC2-DEPLOYMENT-PLAN.md`
- `docs/staging/SPRINT-20-EC2-EXECUTION-LOG.md`
- `docs/staging/SPRINT-20-STAGING-SMOKE-RESULTS.md`
- `docs/staging/SPRINT-20-STAGING-ENV-VALIDATION.md`
- `docs/staging/SPRINT-20-ROLLBACK-CHECKLIST.md`
- `docs/handover/SPRINT-20-BETA-GO-NOGO.md`
- `docs/handover/SPRINT-20-HANDOVER.md`
- `docs/handover/SPRINT-20-KNOWN-GAPS.md`
- `docs/handover/SPRINT-20-OWNER-REVIEW-GUIDE.md`
- `docs/handover/SPRINT-20-ROLLBACK-PLAN.md`
- `docs/sprints/SPRINT-20-STORY-MATRIX.md`

### Tests Added
Sprint 20 experience spec block: covers doc existence, execution log verification, deployment plan safety, smoke results presence, no PSL activation in commands, no Terraform/IAM in tools, no real-money content.

---

## What Was Not Done

- Manual Sprint 19 smoke tools not run (require ADMIN_TOKEN from live beta API post-deployment)
- PARSE_API_KEY SSM presence verification pending (EC2 deployment first)
- Write smoke (`ALLOW_WRITE_SMOKE=true`) not enabled — owner may opt in

---

## Platform Constraints Confirmed

- PSL remains **INACTIVE**
- World Cup 2026 is active beta context
- Wallet is **SANDBOX**
- No scheduled ingestion
- No production ingestion
- No real-money functionality
- Fixture publishing is **SEPARATE** from PSL activation

---

## Remaining Owner Gates (5)

1. Verify deployment workflow SUCCESS in GitHub Actions
2. Obtain admin JWT from live beta API and run Sprint 19 smoke tools
3. Confirm PSL pre-flight returns NO_GO or CONDITIONAL_GO (not activation)
4. Decide whether to enable write smoke (`ALLOW_WRITE_SMOKE=true`)
5. Monitor for psl.co.za 2026/27 fixture schedule publication (~July/August 2026)

---

## Migration Count

42 (unchanged from Sprint 7). No migrations in Sprint 20.

---

## Test Counts

- API: 1,932 (unchanged)
- Experience: ~808 (Sprint 20 block adds ~20 tests)
