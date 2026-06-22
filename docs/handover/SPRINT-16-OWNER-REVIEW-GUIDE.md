# Sprint 16 — Owner Review Guide

## What To Review

### 1. Ingestion Service

File: `apps/api/src/data-provider/parse-psl-fixture-ingestion.service.ts`

Key things to check:
- `dryRun` defaults to `true` — no writes without explicit opt-in
- `seasonId` is required for write mode
- `isPublished=false` on all created fixtures
- No `@Cron` or scheduler decorator
- Source-empty exits cleanly with no errors

### 2. Admin Endpoint

File: `apps/api/src/data-provider/data-provider.controller.ts`

Check:
- Endpoint is `@Admin()` gated (RBAC protected)
- Default body uses `dryRun: body.dryRun !== false` — callers must explicitly set false
- `competitionCode` defaults to `BETWAY_PREMIERSHIP`

### 3. CLI Dry-Run Script

File: `tools/discovery/sprint-16-parse-fixture-ingestion-dry-run.mjs`

Check:
- READ-ONLY — does not write to DB
- Key is redacted in all output
- Source-empty exits 0 (success)

### 4. Module Wiring

File: `apps/api/src/data-provider/data-provider.module.ts`

Check:
- `PrismaModule` imported (needed for DB access in write mode)
- `ParsePslFixtureIngestionService` in providers and exports

### 5. Tests

File: `apps/api/src/data-provider/parse-psl-fixture-ingestion.service.spec.ts`

Check:
- No real HTTP calls (jest.mock on ParsePslAdapter)
- SOURCE_EMPTY returns zero counts
- dryRun=false writes DB; dryRun=true does not
- Write mode fails without seasonId

## Acceptance Criteria

- [ ] All 22 go/no-go criteria in SPRINT-16-BETA-GO-NOGO.md are PASS
- [ ] CI is green on the PR
- [ ] No PARSE_API_KEY in any committed file
- [ ] No scheduled ingestion wired

## Next Actions After Approval

1. Merge PR to main
2. Wait for psl.co.za to publish 2026/27 fixtures (~July/August)
3. Re-run CLI dry-run — confirm `INGESTION_DRY_RUN_NORMALIZED`
4. Review normalized fixture list
5. Approve write run — provide seasonId
6. Trigger: `POST /admin/data-provider/parse-psl/fixtures/ingest` with `dryRun:false, seasonId:<id>`
7. Review ingested fixtures in admin panel
8. Publish fixtures when ready
