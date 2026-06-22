# Sprint 18 — Beta Go / No-Go Decision

## Sprint Summary

Sprint 18 delivered the Fixture Publishing Admin Workflow and the PSL Activation Pre-Flight Check. These tools prepare the path to PSL season activation without activating it.

**PSL season is NOT activated.** This is by design and consistent with all prior sprints.

---

## Decision: CONDITIONAL_GO

| Dimension | Status | Notes |
|-----------|--------|-------|
| API tests | PASS | 1,932 API tests passing |
| TypeScript | PASS | Both apps typecheck clean |
| Build | PASS | Both apps build without errors |
| Secret scan | PASS | No provider keys in codebase |
| No-real-money scan | PASS | No betting/odds/wager language |
| Scheduler scan | PASS | No `@Cron` or `setInterval` in new services |
| codex:validate | PASS | All agent/skill schemas valid |
| docs:validate | PASS | All 18 validation checks pass |

### Conditional items (not blockers for merge)

1. **No PSL fixtures yet** — Parse PSL has not published 2026/27 fixtures. The fixture list is empty. This is an external data dependency, not a code issue.
2. **PSL season activation pending owner decision** — The pre-flight check will show NO_GO until fixtures are imported and published. Owner must approve activation when ready.
3. **Beta EC2 deployment** — Sprint 18 changes are not yet deployed to EC2. Images must be built and pushed; deploy requires owner approval.

---

## What Was Built

- `FixturePublicationService` — bulk publish/unpublish with idempotency, audit log, confirmPublication guard
- `PslActivationPreflightService` — 10-check read-only pre-flight evaluation
- `FixturePublicationController` — `GET /admin/fixtures/imported`, `POST /admin/fixtures/publish`
- `PslPreflightController` — `GET /admin/psl/preflight`
- Admin page `/admin/fixtures/imported` — filter, bulk-select, publish/unpublish
- Admin page `/admin/psl/preflight` — run checks, view detailed results
- 2 discovery tools for operator smoke testing
- 4 data docs + 5 handover docs + 1 sprint matrix

---

## What Was NOT Built (by design)

- PSL season activation — owner-gated, out of scope
- Scheduled ingestion — not enabled, remains manual-only
- Production wallet activation — wallet stays in SANDBOX mode
- Automated fixture import — ingestion is manual (Sprint 17)

---

## Owner Gates (6)

1. Review and approve PR #18 (draft)
2. Confirm no PSL activation is desired at this time
3. Confirm wallet remains in SANDBOX mode
4. Authorize beta EC2 image push and deploy
5. Review pre-flight check results once fixtures are available (~July/August 2026)
6. Approve PSL season activation separately when pre-flight reaches GO

---

## Next Steps for Owner

1. Merge PR #18 when CI is green
2. Push Sprint 18 images to ECR (when ready)
3. Deploy to beta EC2 (when authorized)
4. Wait for psl.co.za to publish 2026/27 fixtures (~July/August 2026)
5. Run Parse PSL ingestion via `/admin/data-provider/parse-psl`
6. Review and publish imported fixtures via `/admin/fixtures/imported`
7. Run PSL pre-flight check via `/admin/psl/preflight`
8. When pre-flight reaches GO: schedule activation with owner approval
