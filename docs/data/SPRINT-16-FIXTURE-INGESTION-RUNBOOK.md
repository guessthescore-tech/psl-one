# Sprint 16 — Fixture Ingestion Runbook

## Status: INGESTION_SOURCE_EMPTY_NOOP (Expected Seasonal)

Parse PSL is working. psl.co.za has not published 2026/27 Betway Premiership fixtures yet.
The ingestion service is ready to run when fixtures are published (~July/August 2026).

## Service

`ParsePslFixtureIngestionService` — `apps/api/src/data-provider/parse-psl-fixture-ingestion.service.ts`

## Admin Endpoint

```
POST /admin/data-provider/parse-psl/fixtures/ingest
Authorization: Bearer <admin-jwt>
Content-Type: application/json

{
  "competitionCode": "BETWAY_PREMIERSHIP",
  "dryRun": true
}
```

**`dryRun` defaults to `true`** — no DB writes unless explicitly set to `false`.

## CLI Dry-Run

```bash
node --env-file=apps/api/.env tools/discovery/sprint-16-parse-fixture-ingestion-dry-run.mjs
```

## Step-by-Step Manual Run

### 1. Dry-run first (always)

```bash
node --env-file=apps/api/.env tools/discovery/sprint-16-parse-fixture-ingestion-dry-run.mjs
```

Expected: `INGESTION_SOURCE_EMPTY_NOOP` (until psl.co.za publishes fixtures)
When fixtures available: `INGESTION_DRY_RUN_NORMALIZED`

### 2. Review output

Check the normalised fixture list. Confirm team names match your canonical teams.

### 3. API dry-run (optional)

```bash
curl -X POST http://localhost:4000/admin/data-provider/parse-psl/fixtures/ingest \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"competitionCode":"BETWAY_PREMIERSHIP","dryRun":true}'
```

### 4. Write run (owner-gated)

Only after owner explicitly approves:

```bash
curl -X POST http://localhost:4000/admin/data-provider/parse-psl/fixtures/ingest \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"competitionCode":"BETWAY_PREMIERSHIP","dryRun":false,"seasonId":"<psl-season-id>"}'
```

**Requires:** `seasonId` for the PSL season to attach fixtures to.
**Result:** Fixtures created with `isPublished=false` — admin must publish separately.

### 5. Publish fixtures (separate admin action)

After reviewing ingested fixtures in the admin panel, publish them via the Fixture Import / Publishing module.

## Outcome Statuses

| Status | Meaning | Action |
|--------|---------|--------|
| `INGESTION_SOURCE_EMPTY_NOOP` | psl.co.za hasn't published fixtures | Wait; re-run in July/August |
| `INGESTION_DRY_RUN_NORMALIZED` | Fixtures ready; no writes yet | Review and proceed to write |
| `INGESTION_AUTH_FAILED` | Key missing/invalid | Check PARSE_API_KEY |
| `INGESTION_RATE_LIMITED` | Too many requests | Wait 60s; retry |
| `INGESTION_SCHEMA_CHANGED` | Parse API changed shape | Raise with engineering |

## Safety Guarantees

- No scheduler — job only runs when explicitly triggered
- No PSL activation — separate admin action required
- No production ingestion enabled by default
- Source-empty exits cleanly with no DB writes
- Created fixtures have `isPublished=false`
- `PARSE_API_KEY` is never logged
