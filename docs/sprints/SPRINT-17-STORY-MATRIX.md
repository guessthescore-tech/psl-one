# Sprint 17 — Story Matrix

## Sprint Goal

Wire Parse PSL fixture ingestion into the beta admin workflow. Admin operators can trigger dry-run previews and gated write runs. No scheduler. No PSL activation.

## Stories

| ID | Title | Status | Files |
|----|-------|--------|-------|
| S17-01 | DTO types for ingestion request/response | DONE | `dto/parse-psl-fixture-ingestion.dto.ts` |
| S17-02 | Service: `buildCandidates()` with team resolution | DONE | `parse-psl-fixture-ingestion.service.ts` |
| S17-03 | Service: `resolveTeam()` exact + fuzzy lookup | DONE | `parse-psl-fixture-ingestion.service.ts` |
| S17-04 | Service: `writeAuditLog()` with failure safety | DONE | `parse-psl-fixture-ingestion.service.ts` |
| S17-05 | Controller: `confirmWrite` guard | DONE | `data-provider.controller.ts` |
| S17-06 | Controller: `seasonId` required-in-write-mode guard | DONE | `data-provider.controller.ts` |
| S17-07 | Experience: `admin-ingestion-api.ts` helpers | DONE | `src/lib/admin-ingestion-api.ts` |
| S17-08 | Experience: Admin ingestion UI page | DONE | `src/app/admin/data-provider/parse-psl/page.tsx` |
| S17-09 | Discovery: ingestion preview CLI tool | DONE | `tools/discovery/sprint-17-parse-ingestion-preview.mjs` |
| S17-10 | Discovery: team resolution check CLI tool | DONE | `tools/discovery/sprint-17-team-resolution-check.mjs` |
| S17-11 | Docs: 5 data docs | DONE | `docs/data/SPRINT-17-*.md` |
| S17-12 | Docs: 5 handover docs + story matrix | DONE | `docs/handover/SPRINT-17-*.md`, this file |
| S17-13 | Tests: Sprint 17 API spec blocks | DONE | `parse-psl-fixture-ingestion.service.spec.ts` |
| S17-14 | Tests: Sprint 17 experience spec block | DONE | `src/lib/experience.spec.ts` |

## Test Counts

| Suite | Sprint 16 end | Sprint 17 end |
|-------|--------------|--------------|
| API | 1,894 | 1,904 |
| Experience | 718 | 728 |

## Architecture Decisions

No new ADRs required. Sprint 17 extends existing data-provider and Parse PSL adapter infrastructure established in Sprints 14–16.

## Gates Passed

All 15 go/no-go gates pass. See [SPRINT-17-BETA-GO-NOGO.md](../handover/SPRINT-17-BETA-GO-NOGO.md).

## Branch

`feature/sprint-17-fixture-ingestion-beta-workflow`

## PR

Draft PR — see GitHub PR list.

## Decision: CONDITIONAL_GO

Conditions:
1. `PARSE_API_KEY` validated before live write run.
2. Live PSL Season ID obtained when ready.
3. Source will be empty until July/August 2026.
4. Fixtures import as `isPublished=false`; require manual publish.
5. PSL season activation is owner-gated separately.
