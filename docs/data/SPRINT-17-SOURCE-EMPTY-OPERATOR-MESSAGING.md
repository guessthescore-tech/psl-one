# Sprint 17 — Source-Empty Operator Messaging

## Background

psl.co.za publishes the Betway Premiership fixture schedule approximately 6–8 weeks before the season starts. The 2026/27 PSL season is expected to start in late July or early August 2026. Until then, all dry-run and write-run ingestion attempts will return `sourceStatus: SOURCE_EMPTY`.

## Source-Empty is Not an Error

`SOURCE_EMPTY` is a clean operational state. It means:
- The Parse PSL adapter successfully reached psl.co.za.
- The response was valid but contained zero fixtures.
- No action is required by the operator.

It is distinct from `AUTH_FAILED` (key invalid), `PROVIDER_ERROR` (HTTP/network failure), or `SCHEMA_CHANGED` (data format changed).

## Operator Messages

### Admin UI (page.tsx)

When `sourceStatus === 'SOURCE_EMPTY'`:

> **Source Empty** — psl.co.za has not published 2026/27 Betway Premiership fixtures yet. Re-run in July/August 2026 when fixtures are published. No action needed.

Displayed in a blue info box (not a red error box).

### API Response

```json
{
  "provider": "parse-psl",
  "competitionCode": "BETWAY_PREMIERSHIP",
  "dryRun": true,
  "sourceStatus": "SOURCE_EMPTY",
  "discovered": 0,
  "normalized": 0,
  "created": 0,
  "updated": 0,
  "skipped": 0,
  "candidates": [],
  "warnings": [],
  "errors": []
}
```

### Discovery Tool

```
[INGESTION_SOURCE_EMPTY_NOOP]
psl.co.za has not published 2026/27 Betway Premiership fixtures.
This is expected until ~July/August 2026.
```

### Audit Log

`PARSE_PSL_FIXTURE_INGESTION_SOURCE_EMPTY` is written to `AdminAuditLog` even on source-empty, so there is a timestamp record that the operator checked.

## Recommended Operating Schedule

| Date | Action |
|------|--------|
| Now (June 2026) | Run dry-run to confirm auth and source-empty state |
| Early July 2026 | Run dry-run again; check if fixtures have been published |
| Once SOURCE_AVAILABLE | Review candidates, verify team resolution, execute write run with `seasonId` |
| After write | Verify `isPublished=false` fixtures in admin; publish manually when season is ready |

## Write-Run on SOURCE_EMPTY

If a write run is triggered when the source is empty, the service returns SOURCE_EMPTY before attempting any DB writes. `created=0`, `updated=0`, `skipped=0`. The audit event `PARSE_PSL_FIXTURE_INGESTION_SOURCE_EMPTY` is written.
