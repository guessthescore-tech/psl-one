# Sprint 16 — Story Matrix

## Sprint Goal

Implement a manual, idempotent, dry-run-first fixture ingestion job for Parse PSL data.
No scheduler. No production ingestion. No PSL activation.

## Stories

| Story ID | Title | Status | Owner | Notes |
|----------|-------|--------|-------|-------|
| S16-01 | ParsePslFixtureIngestionService | DONE | Engineering | 25+ tests; no scheduler |
| S16-02 | Admin ingest endpoint | DONE | Engineering | dryRun defaults true; RBAC |
| S16-03 | CLI dry-run script | DONE | Engineering | READ-ONLY; key redacted |
| S16-04 | Module wiring (PrismaModule) | DONE | Engineering | No migration needed |
| S16-05 | Sprint 15 live-validation docs committed | DONE | Engineering | C1-C4 cleared |
| S16-06 | Sprint 16 documentation (11 files) | DONE | Engineering | Runbook, handover, etc. |
| S16-07 | Experience spec block | DONE | Engineering | Sprint 16 safety gates |

## Out of Scope (Future Sprints)

| Item | Reason |
|------|--------|
| Scheduled ingestion (@Cron) | Owner-gated; not needed until fixtures available |
| Fixture publishing UI | Existing admin module handles this |
| PSL season activation | Separate gate — not triggered by ingestion |
| EventBridge events for ingestion | Sprint 17+ |

## Acceptance Criteria

- [x] ParsePslFixtureIngestionService injectable with 25+ tests
- [x] POST /admin/data-provider/parse-psl/fixtures/ingest responds correctly
- [x] CLI dry-run outputs INGESTION_SOURCE_EMPTY_NOOP (correct for current season state)
- [x] No @Cron decorator in any Sprint 16 file
- [x] No NEXT_PUBLIC_PARSE_API_KEY
- [x] No migration files added
- [x] All validation gates pass (typecheck, test, build, codex:validate, docs:validate)
- [x] No betting/odds/stakes in any Sprint 16 code
- [x] CI green on PR

## Sprint Metrics

| Metric | Value |
|--------|-------|
| API tests | 1,868 |
| Experience tests | 661 |
| Migrations | 0 (Sprint 16 added none) |
| New endpoints | 1 |
| New services | 1 |
| New CLI tools | 1 |
| New docs | 11 |
| Total web pages | 337 (unchanged) |
