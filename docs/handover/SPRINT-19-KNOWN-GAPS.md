# Sprint 19 — Known Gaps

## Gap 1: EC2 Deployment Not Yet Performed

**Status:** PENDING OWNER AUTHORIZATION

**Detail:** Sprint 18 and Sprint 19 images have been built by CI (Container Build checks passed) but have not been deployed to the beta EC2 instance (`i-0a5f16539c9626f90`). The EC2 instance is still running the Sprint 17 image deployed on 2026-06-17.

**Mitigation:** Deployment runbook at `docs/staging/SPRINT-19-STAGING-DEPLOYMENT-RUNBOOK.md`.
All smoke tools are ready; they only require the Sprint 18 image to be deployed.

---

## Gap 2: No Live Smoke Evidence

**Status:** PENDING DEPLOYMENT

**Detail:** The admin smoke tools have been written and tested locally (tool existence, dry-run flag, write-guard), but have not been executed against the live EC2 instance because Sprint 18 is not yet deployed. Live smoke results are pending deployment.

---

## Gap 3: No PSL Fixtures Until ~July/August 2026

**Status:** External dependency

**Detail:** Parse PSL (psl.co.za) has not published the 2026/27 fixture schedule. All ingestion and pre-flight operations will return source-empty or NO_GO until:
1. psl.co.za publishes fixtures
2. Admin runs Parse PSL ingestion via `/admin/data-provider/parse-psl`
3. Admin reviews and publishes fixtures via `/admin/fixtures/imported`
4. PSL pre-flight re-run reaches CONDITIONAL_GO or GO

---

## Gap 4: Admin Token Not Automated

**Status:** Manual process

**Detail:** The admin smoke tools require an `ADMIN_TOKEN` (JWT) from the beta API. There is no automated token provisioning. An operator must log in to obtain a token before running smoke suites.

---

## Gap 5: `PARSE_API_KEY` SSM Presence Unverified for Sprint 18

**Status:** Assumed from Sprint 17 deployment

**Detail:** Sprint 17 deployment runbook set `PARSE_API_KEY` in SSM. It has not been reverified post-Sprint 18 merge. The migration status check (`sprint-19-migration-status-check.mjs`) and env check (`sprint-19-staging-env-check.mjs`) should be run after deployment to confirm.

---

## Gap 6: No Automated Staging Smoke in CI

**Status:** Deferred

**Detail:** Staging smoke tools run manually. There is no CI job that runs the staging smoke against a live EC2 or ephemeral staging environment. This is by design for the beta phase — full staging CI integration is a future sprint item.

---

## Gap 7: Migration Status Tool Requires Node ESM Support

**Status:** Minor constraint

**Detail:** `sprint-19-migration-status-check.mjs` uses ES module syntax (`import`) and `execSync`. It requires Node.js 18+ and the `pnpm` context at repo root. Cannot be run independently without the monorepo present.
