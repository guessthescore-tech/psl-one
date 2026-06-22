# Sprint 19 — Beta Go / No-Go Decision

## Sprint Summary

Sprint 19 delivers staging environment tooling, admin smoke suites, env validation, migration status checking, and staging readiness documentation for the fixture publishing and PSL pre-flight workflow introduced in Sprint 18.

**PSL season is NOT activated. EC2 deployment has NOT been performed (pending owner authorization).**

---

## Decision: CONDITIONAL_GO

| Dimension | Status | Notes |
|-----------|--------|-------|
| API tests | PASS | 1,932 API tests passing |
| Experience tests | PASS | 792 tests passing |
| TypeScript | PASS | Both apps typecheck clean |
| Build | PASS | Both apps build without errors |
| Secret scan | PASS | No provider keys in codebase |
| No-real-money scan | PASS | No betting/odds/wager language (betway-premiership is competition slug) |
| Scheduler scan | PASS | No `@Cron` or `setInterval` in new services |
| codex:validate | PASS | All agent/skill schemas valid |
| docs:validate | PASS | All 18 validation checks pass |
| EC2 deployment | PENDING OWNER | Not authorized yet |
| Admin smoke (live) | PENDING DEPLOYMENT | Tools ready; needs Sprint 18+ image on EC2 |
| PSL fixtures available | PENDING EXTERNAL | Parse PSL ~July/August 2026 |

---

## What Was Built

**Tools (6):**
- `sprint-19-staging-env-check.mjs` — env var validation, never prints secrets
- `sprint-19-admin-smoke.mjs` — comprehensive admin endpoint smoke
- `sprint-19-admin-rbac-smoke.mjs` — RBAC verification smoke
- `sprint-19-parse-ingestion-smoke.mjs` — ingestion dry-run smoke, dry-run-by-default
- `sprint-19-fixture-publication-smoke.mjs` — publication smoke, write-disabled by default
- `sprint-19-psl-preflight-smoke.mjs` — preflight smoke, read-only

**Docs (6):**
- `docs/staging/SPRINT-19-STAGING-READINESS-ASSESSMENT.md`
- `docs/staging/SPRINT-19-STAGING-ENV-CHECKLIST.md`
- `docs/staging/SPRINT-19-STAGING-DEPLOYMENT-RUNBOOK.md`
- `docs/staging/SPRINT-19-STAGING-ROLLBACK-RUNBOOK.md`
- `docs/staging/SPRINT-19-MIGRATION-STATUS.md`
- `docs/staging/SPRINT-19-ADMIN-UI-SMOKE-CHECKLIST.md`

**Tests:** +25 experience spec tests

---

## What Was NOT Built (by design)

- EC2 deployment — owner-gated
- PSL season activation — owner-gated
- Scheduled ingestion — not enabled
- Write fixture ingestion — manual dry-run only
- Production wallet activation — stays SANDBOX
- Any real-money functionality

---

## Owner Gates (6)

1. Review and approve PR #19
2. Authorize EC2 image push and deployment for Sprint 18/19
3. Confirm PSL activation remains deferred
4. Confirm wallet remains in SANDBOX mode
5. Confirm `PARSE_API_KEY` is set in EC2 SSM for beta
6. Confirm source-empty state (~July/August 2026) is acceptable

---

## Full GO Requirements

Full GO still requires:

1. Staging env configured and Sprint 18 image deployed to EC2
2. Admin token available for smoke testing
3. All smoke checks passing on EC2 (auth-gated checks unblocked)
4. Parse source data available or source-empty accepted as non-blocker
5. EC2 migration status confirmed as STAGING_MIGRATION_UP_TO_DATE
6. Owner approves fixture write run (when fixtures are available)
7. Owner approves fixture publication
8. PSL pre-flight reaches GO
9. Owner approves PSL activation separately
