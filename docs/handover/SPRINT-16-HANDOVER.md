# Sprint 16 — Handover

## Sprint Summary

Sprint 16 implements a manual, idempotent, dry-run-first fixture ingestion job for Parse PSL data.

The service is fully implemented and tested. psl.co.za has not yet published 2026/27 Betway
Premiership fixtures (expected July/August 2026), so all ingestion runs produce `SOURCE_EMPTY`.

## What Was Built

| Deliverable | File | Status |
|-------------|------|--------|
| Ingestion service | `apps/api/src/data-provider/parse-psl-fixture-ingestion.service.ts` | DONE |
| Service spec | `apps/api/src/data-provider/parse-psl-fixture-ingestion.service.spec.ts` | DONE |
| Admin endpoint | `POST /admin/data-provider/parse-psl/fixtures/ingest` | DONE |
| CLI dry-run script | `tools/discovery/sprint-16-parse-fixture-ingestion-dry-run.mjs` | DONE |
| Module wiring | `data-provider.module.ts` + `data-provider.controller.ts` | DONE |
| Runbook | `docs/data/SPRINT-16-FIXTURE-INGESTION-RUNBOOK.md` | DONE |
| Provenance mapping | `docs/data/SPRINT-16-PROVENANCE-MAPPING.md` | DONE |
| Source-empty doc | `docs/data/SPRINT-16-SOURCE-EMPTY-HANDLING.md` | DONE |
| Rate-limit doc | `docs/data/SPRINT-16-RATE-LIMIT-AND-RETRY.md` | DONE |
| Results log | `docs/data/SPRINT-16-FIXTURE-INGESTION-RESULTS.md` | DONE |
| Experience spec | `apps/experience/src/lib/experience.spec.ts` (Sprint 16 block) | DONE |

## What Is NOT Done (Owner-Gated)

- Write run (requires owner approval + seasonId)
- PSL season activation (separate gate)
- Production ingestion schedule (future sprint)
- Fixture publishing (separate admin action after ingestion)

## Key Technical Decisions

1. **dryRun defaults true** — `opts.dryRun !== false`. Admin must explicitly set `dryRun: false`.
2. **No migration required** — Fixture model already has providerSource, providerFixtureId, etc.
3. **Source-empty is not an error** — Returns `sourceStatus: 'SOURCE_EMPTY'` with zero counts.
4. **Write requires seasonId** — Guard prevents accidental writes without target season.
5. **isPublished=false** — Admin must explicitly publish after reviewing ingested fixtures.

## How to Proceed When Fixtures Are Available

1. Run: `node --env-file=apps/api/.env tools/discovery/sprint-16-parse-fixture-ingestion-dry-run.mjs`
2. Confirm output shows `INGESTION_DRY_RUN_NORMALIZED`
3. Review the normalized fixture list — check team name matching
4. Owner approves write run and provides PSL seasonId
5. Call `POST /admin/data-provider/parse-psl/fixtures/ingest` with `{"dryRun":false,"seasonId":"<id>"}`
6. Verify fixtures appear in admin panel with `isPublished=false`
7. Admin reviews and publishes fixtures

## Test Coverage

- `ParsePslFixtureIngestionService`: 25+ unit tests
- Experience spec: Sprint 16 block added (service, endpoint, script, docs, safety)
- Total tests: 1,868 API / 661 experience
