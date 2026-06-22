# Sprint 17 — Admin Ingestion Endpoint Reference

## Endpoint

```
POST /admin/data-provider/parse-psl/fixtures/ingest
```

Auth: `Bearer <ADMIN_JWT>` — `JwtAuthGuard` + `RolesGuard` + `@Roles('ADMIN')`.

## Request Body — `ParsePslIngestionRequestDto`

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `competitionCode` | `string?` | `'BETWAY_PREMIERSHIP'` | Override if testing other competitions |
| `dryRun` | `boolean?` | `true` | Set `false` for write mode |
| `seasonId` | `string?` | — | Required when `dryRun=false`; 400 if missing |
| `includeCandidates` | `boolean?` | `true` | Return fixture candidates in response; set `false` to save bandwidth |
| `confirmWrite` | `boolean?` | — | Must be exactly `true` when `dryRun=false`; 400 otherwise |

## Response — `ParsePslIngestionPreviewResponseDto`

```typescript
{
  provider: 'parse-psl';
  competitionCode: string;
  dryRun: boolean;
  sourceStatus: 'SOURCE_EMPTY' | 'SOURCE_AVAILABLE' | 'AUTH_FAILED' | 'RATE_LIMITED' | 'PROVIDER_ERROR' | 'SCHEMA_CHANGED';
  discovered: number;    // raw fixtures from provider
  normalized: number;   // fixtures that passed normalisation
  created: number;      // DB inserts (write mode only, else 0)
  updated: number;      // DB updates (write mode only, else 0)
  skipped: number;      // normalised but skipped (team unresolved etc.)
  candidates: ParsePslFixtureCandidateDto[];
  warnings: string[];
  errors: string[];
}
```

## Error Responses

| Status | Condition |
|--------|-----------|
| 400 | `dryRun=false` without `seasonId` |
| 400 | `dryRun=false` without `confirmWrite=true` |
| 401 | JWT missing or expired |
| 403 | Token role is not `ADMIN` |

## Dry-Run Example

```bash
curl -X POST https://api.psl.one/admin/data-provider/parse-psl/fixtures/ingest \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true, "includeCandidates": true}'
```

## Write-Run Example

```bash
curl -X POST https://api.psl.one/admin/data-provider/parse-psl/fixtures/ingest \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false, "seasonId": "SEASON_ID", "confirmWrite": true, "includeCandidates": false}'
```

## Audit Events

| Event | Trigger |
|-------|---------|
| `PARSE_PSL_FIXTURE_INGESTION_DRY_RUN` | Successful dry-run with SOURCE_AVAILABLE |
| `PARSE_PSL_FIXTURE_INGESTION_SOURCE_EMPTY` | Provider returned no fixtures |
| `PARSE_PSL_FIXTURE_INGESTION_WRITE_ATTEMPTED` | Write mode started |
| `PARSE_PSL_FIXTURE_INGESTION_WRITE_COMPLETED` | Write mode completed successfully |
| `PARSE_PSL_FIXTURE_INGESTION_FAILED` | Any provider or unexpected error |

Audit records are written to `AdminAuditLog`. Audit failure never blocks ingestion.
