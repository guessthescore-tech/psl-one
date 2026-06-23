# Sprint 25 — Handover

## Sprint Goal

Prepare the platform for official PSL fixture availability by adding a safe fixture availability monitoring and readiness workflow, without importing fixtures, publishing fixtures, activating PSL, or enabling scheduled ingestion.

## Sprint Status

**CONDITIONAL_GO** — Documentation and tooling sprint. All deliverables created. CI pending.

---

## Deliverables

### Tools (2)

| File | Purpose |
|------|---------|
| `tools/staging/sprint-25-psl-fixture-availability-check.mjs` | Read-only dry-run fixture availability check (dryRun=true always) |
| `tools/staging/sprint-25-team-resolution-readiness.mjs` | Read-only team name resolution diagnostic |

### Staging Docs (8)

| File | Purpose |
|------|---------|
| `docs/staging/SPRINT-25-PARSE-FIXTURE-AVAILABILITY.md` | Current Parse PSL fixture availability status |
| `docs/staging/SPRINT-25-PARSE-DRY-RUN-RESULTS.md` | Dry-run result record (SOURCE_EMPTY as of 2026-06-23) |
| `docs/staging/SPRINT-25-SOURCE-EMPTY-STATUS.md` | Why SOURCE_EMPTY is expected behaviour |
| `docs/staging/SPRINT-25-TEAM-RESOLUTION-READINESS.md` | Team name resolution matrix for 16 PSL clubs |
| `docs/staging/SPRINT-25-FIXTURE-IMPORT-WRITE-RUNBOOK.md` | 10-gate runbook for future fixture import write |
| `docs/staging/SPRINT-25-FIXTURE-PUBLICATION-RUNBOOK.md` | 7-gate runbook for future fixture publication |
| `docs/staging/SPRINT-25-OWNER-APPROVAL-GATES.md` | All owner-approval gates and current status |
| `docs/staging/SPRINT-25-PSL-ACTIVATION-BOUNDARY.md` | Explicit boundary — what Sprint 25 does vs. PSL activation |

### Handover Docs (5 + matrix)

- `SPRINT-25-BETA-GO-NOGO.md`
- `SPRINT-25-HANDOVER.md` (this file)
- `SPRINT-25-KNOWN-GAPS.md`
- `SPRINT-25-OWNER-REVIEW-GUIDE.md`
- `SPRINT-25-ROLLBACK-PLAN.md`
- `docs/sprints/SPRINT-25-STORY-MATRIX.md`

---

## No Changes To

- Schema (0 migrations)
- API routes (0 new routes)
- Frontend pages (0 new pages)
- EC2 deployment (not deployed in Sprint 25)
- Database seed data

---

## Key Status

```
PSL:                    INACTIVE (unchanged)
Fixtures:               SOURCE_EMPTY — psl.co.za has not published 2026/27 schedule yet
Expected fixture date:  ~July/August 2026
Migrations:             42 (unchanged)
API tests:              1,968 (unchanged)
Experience tests:       ~925 (Sprint 25 adds ~20 tests)
```

---

## Owner Actions Required

None immediately — Sprint 25 is monitoring preparation only.

When psl.co.za publishes the 2026/27 fixture schedule:
1. Run `sprint-25-psl-fixture-availability-check.mjs` against beta EC2
2. If `PSL_FIXTURE_CANDIDATES_FOUND`, notify owner
3. Owner reviews dry-run candidates
4. Owner opens Gate A03+ to proceed with import write

## Platform Safety Status

PSL remains inactive. Wallet remains sandbox-only. No real-money functionality. No production ingestion.
