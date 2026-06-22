# Sprint 17 — Handover

## Summary

Sprint 17 wired Parse PSL fixture ingestion into the beta admin workflow. Operators can now trigger a dry-run preview or a gated write run from the admin UI or directly via the API.

## Deliverables

### API Layer

| File | Change |
|------|--------|
| `apps/api/src/data-provider/dto/parse-psl-fixture-ingestion.dto.ts` | NEW — DTO types for request/response/candidates |
| `apps/api/src/data-provider/parse-psl-fixture-ingestion.service.ts` | Extended — `buildCandidates()`, `resolveTeam()`, `writeAuditLog()`, `includeCandidates` option |
| `apps/api/src/data-provider/data-provider.controller.ts` | Extended — `confirmWrite` and `seasonId` guards, `POST parse-psl/fixtures/ingest` |
| `apps/api/src/data-provider/parse-psl-fixture-ingestion.service.spec.ts` | Extended — Sprint 17 test blocks |

### Experience (Admin UI)

| File | Change |
|------|--------|
| `apps/experience/src/lib/admin-ingestion-api.ts` | NEW — `runDryRun()` / `runWriteRun()` helpers |
| `apps/experience/src/app/admin/data-provider/parse-psl/page.tsx` | NEW — Two-step admin UI: dry-run preview → write run |

### Discovery Tools

| File | Purpose |
|------|---------|
| `tools/discovery/sprint-17-parse-ingestion-preview.mjs` | Dry-run preview from CLI (PARSE_API_KEY required) |
| `tools/discovery/sprint-17-team-resolution-check.mjs` | Team name variant resolution check against DB (DATABASE_URL required) |

### Documentation

5 data docs, 5 handover docs, 1 sprint matrix — see `docs/data/SPRINT-17-*` and `docs/handover/SPRINT-17-*`.

## Test Counts

| Suite | Before | After |
|-------|--------|-------|
| API | 1,894 | 1,904 |
| Experience | 718 | 728 |

## Known State

- Source is currently `SOURCE_EMPTY` — psl.co.za has no 2026/27 fixtures yet.
- `PARSE_API_KEY` is in `apps/api/.env` (not committed).
- All fixtures import as `isPublished=false`.
- PSL season is NOT activated.
- No scheduler exists.

## Next Steps

1. Monitor psl.co.za from July 2026 — run dry-run when season fixtures appear.
2. Obtain PSL Season ID from Admin Command Centre when ready.
3. Execute write run with `seasonId` and `confirmWrite=true`.
4. Publish fixtures manually via Admin Fixture Management.
5. Activate PSL season when all pre-activation checks pass (separate owner-gated action).
