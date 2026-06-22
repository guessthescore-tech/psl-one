# Sprint 16 — Fixture Ingestion Results

## Sprint 16 Ingestion Runs (2026-06-22)

### CLI Dry-Run (tools/discovery/sprint-16-parse-fixture-ingestion-dry-run.mjs)

| Run | Status | Discovered | Normalized | DB Writes | Notes |
|-----|--------|-----------|------------|-----------|-------|
| 2026-06-22 | INGESTION_SOURCE_EMPTY_NOOP | 0 | 0 | 0 | psl.co.za has not published 2026/27 fixtures |

### API Dry-Run (POST /admin/data-provider/parse-psl/fixtures/ingest)

Not yet run — API endpoint available; no fixtures to ingest currently.

## Expected Next Run

Once psl.co.za publishes the 2026/27 Betway Premiership schedule (~July/August 2026):
1. CLI dry-run will return `INGESTION_DRY_RUN_NORMALIZED`
2. Owner reviews normalized fixture list
3. Owner approves write run with seasonId
4. Write run creates fixtures with `isPublished=false`
5. Admin publishes fixtures

## Historical Ingestion Runs

No fixtures ingested yet. This document will be updated after each run.
