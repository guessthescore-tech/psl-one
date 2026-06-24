# Sprint 37 — Handover

## What Was Built

Sprint 37 creates the owner-ready pathway from fixture readiness monitoring to provider validation to fixture import dry-run to owner-approved write import.

### Backend Changes

| File | Change |
|------|--------|
| `apps/api/src/data-provider/data-provider.service.ts` | Enhanced `getPslFixtureReadiness()`: added `providerDecision`, `dryRunEligible`, `writeImportForbidden`, `fixturePublicationForbidden`, `pslActivationForbidden` |
| `apps/api/src/data-provider/data-provider-admin-http.spec.ts` | Updated mock with new fields; added Sprint 37 describe block (9 new tests) |

### New Tools (4)

| Tool | Purpose |
|------|---------|
| `tools/staging/sprint-37-provider-env-check.mjs` | Env var presence check — no API calls, no token |
| `tools/staging/sprint-37-psl-provider-availability-check.mjs` | PSL readiness via admin API — read-only |
| `tools/staging/sprint-37-world-cup-provider-availability-check.mjs` | WC provider health check — read-only |
| `tools/staging/sprint-37-fixture-import-dry-run-readiness.mjs` | Readiness precheck + optional dry-run call |

### New Docs (13)

```
docs/data/SPRINT-37-PROVIDER-ARCHITECTURE-BASELINE.md
docs/data/SPRINT-37-LIVE-PROVIDER-PROCUREMENT-MATRIX.md
docs/data/SPRINT-37-PROVIDER-ENV-VALIDATION.md
docs/data/SPRINT-37-FIXTURE-IMPORT-DRY-RUN-READINESS.md
docs/data/SPRINT-37-OWNER-APPROVAL-PACK-FIXTURE-WRITE-IMPORT.md
docs/data/SPRINT-37-LIVE-DATA-PROVIDER-READINESS.md
docs/data/SPRINT-37-PSL-FIXTURE-PROVIDER-GO-NOGO.md
docs/data/SPRINT-37-WORLD-CUP-DATA-PROVIDER-STATUS.md
docs/staging/SPRINT-37-PROVIDER-CHECK-RUNBOOK.md
docs/handover/SPRINT-37-HANDOVER.md
docs/handover/SPRINT-37-KNOWN-GAPS.md
docs/handover/SPRINT-37-OWNER-REVIEW-GUIDE.md
docs/sprints/SPRINT-37-STORY-MATRIX.md
```

## Current State

```
Beta EC2 SHA: 91dc999733c70195748d5acfd92e499f067638a1 (Sprint 36C deployed)
PSL readinessStatus: SOURCE_EMPTY (expected)
PSL: INACTIVE
WC 2026: ACTIVE (beta context)
Migrations: 44 (no new migrations in Sprint 37)
API tests: 2,114+ (Sprint 37 adds ~9 tests)
Experience tests: 1,411+ (Sprint 37 adds ~25 tests)
```

## What Sprint 37 Does NOT Do

- Does not import fixtures in write mode
- Does not publish fixtures
- Does not activate PSL
- Does not enable scheduled ingestion
- Does not expose provider keys
- Does not change any migration
- Does not change any database model
- Does not deploy to EC2 (tooling + docs sprint)

## Known Gaps

See `docs/handover/SPRINT-37-KNOWN-GAPS.md`.

## Recommended Next Sprint

**Sprint 38** — Once owner has configured provider keys in beta `.env.beta` and the PSL fixture schedule is published (~July/August 2026):
- Run dry-run import, review candidates
- Owner approves write import
- Owner approves fixture publication
- Prepare PSL activation preflight documentation

Or alternatively:
- Sprint 38: Admin UI improvements for the enhanced readiness page
- Sprint 38: Manual CSV/JSON fallback import path
