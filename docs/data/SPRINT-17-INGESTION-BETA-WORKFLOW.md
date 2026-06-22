# Sprint 17 — Parse PSL Ingestion Beta Workflow

## Purpose

This document describes the manual, admin-only workflow for ingesting PSL Betway Premiership fixture data from psl.co.za via the Parse PSL adapter. The workflow is designed for controlled beta operations — no scheduler, no automatic triggers, no PSL activation.

## Workflow Overview

```
1. Admin navigates to /admin/data-provider/parse-psl
2. Admin clicks "Run Dry-Run Preview"
   ↓ API: POST /admin/data-provider/parse-psl/fixtures/ingest (dryRun=true)
   ↓ Parse PSL adapter fetches psl.co.za fixtures
   ↓ Normalise + team resolution diagnostics returned
   ↓ Candidates displayed with match/warning status
3. Admin reviews candidate list and team resolution warnings
4. Admin enters PSL Season ID and checks the confirm checkbox
5. Admin clicks "Execute Write Run"
   ↓ API: POST /admin/data-provider/parse-psl/fixtures/ingest (dryRun=false, confirmWrite=true)
   ↓ Fixtures upserted with isPublished=false
   ↓ Audit log written to AdminAuditLog
   ↓ Write result returned (created/updated/skipped counts)
```

## Step 1 — Dry-Run Preview

- Default mode for all admin-triggered calls.
- `dryRun` defaults `true` at both the API layer and the service layer.
- Returns normalized fixture candidates with team resolution diagnostics.
- Source-empty is not an error — psl.co.za publishes fixtures ~July/August.

## Step 2 — Write Run

- Requires `dryRun=false`, `seasonId`, and `confirmWrite=true`.
- API returns 400 if either `seasonId` or `confirmWrite` is missing.
- All created fixtures are `isPublished=false`.
- PSL season activation is a separate admin action (not triggered here).
- Fixtures must be manually published before fans can see them.

## Source-Empty Handling

When psl.co.za has no fixtures:
- `sourceStatus: SOURCE_EMPTY`
- `discovered: 0`, `created: 0`, `updated: 0`, `skipped: 0`, `candidates: []`
- Admin UI shows informational message: expected until ~July/August 2026
- `PARSE_PSL_FIXTURE_INGESTION_SOURCE_EMPTY` event written to AdminAuditLog

## Safety Constraints

- No scheduled ingestion.
- No production ingestion.
- No PSL season activation.
- `PARSE_API_KEY` is server-side only — never sent to browser.
- Fixtures created as `isPublished=false` — not visible to fans without separate publish step.
- `confirmWrite=true` is a required explicit acknowledgment for write operations.

## Related Endpoints

| Verb | Route | Purpose |
|------|-------|---------|
| POST | `/admin/data-provider/parse-psl/fixtures/ingest` | Dry-run or write ingestion |

## Related Documents

- [SPRINT-17-TEAM-RESOLUTION-RULES.md](SPRINT-17-TEAM-RESOLUTION-RULES.md)
- [SPRINT-17-ADMIN-INGESTION-ENDPOINT.md](SPRINT-17-ADMIN-INGESTION-ENDPOINT.md)
- [SPRINT-17-PROVENANCE-AND-AUDIT.md](SPRINT-17-PROVENANCE-AND-AUDIT.md)
- [SPRINT-17-SOURCE-EMPTY-OPERATOR-MESSAGING.md](SPRINT-17-SOURCE-EMPTY-OPERATOR-MESSAGING.md)
