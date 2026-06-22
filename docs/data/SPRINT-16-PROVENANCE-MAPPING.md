# Sprint 16 — Provenance Mapping

## Purpose

Every fixture ingested from Parse PSL is tagged with provenance data so it can be traced back to
its source, audited, and differentiated from manually created or officially imported fixtures.

## Provenance Fields (Existing Schema — No Migration Required)

All fields already exist on the `Fixture` model (`apps/api/prisma/schema.prisma`):

| DB Field | Column | Value set by Parse ingestion |
|----------|--------|------------------------------|
| `providerSource` | `provider_source` | `'parse-psl'` |
| `providerFixtureId` | `provider_fixture_id` | Parse fixture externalId |
| `externalId` | `external_id` | Parse fixture externalId (same) |
| `sourceUrl` | `source_url` | Parse endpoint URL |
| `importedAt` | `imported_at` | Timestamp of first ingestion |
| `lastSyncedAt` | `last_synced_at` | Timestamp of last sync |
| `isPublished` | `is_published` | `false` (admin must publish) |
| `source` | `source` | Not set (available for future use) |

## Provenance Query Examples

Find all fixtures ingested from Parse PSL:
```sql
SELECT * FROM fixtures WHERE provider_source = 'parse-psl';
```

Find fixtures pending admin review:
```sql
SELECT * FROM fixtures
WHERE provider_source = 'parse-psl'
  AND is_published = false;
```

Find fixtures ingested in the last 24 hours:
```sql
SELECT * FROM fixtures
WHERE provider_source = 'parse-psl'
  AND imported_at > NOW() - INTERVAL '24 hours';
```

## Idempotency Key

The service uses `(providerFixtureId, providerSource)` as the deduplication key:

```typescript
await prisma.fixture.findFirst({
  where: {
    providerFixtureId: f.externalId,
    providerSource: 'parse-psl',
  },
});
```

Re-running ingestion with the same provider data will update (not duplicate) existing fixtures.

## Provider Competition Metadata

| Field | Value |
|-------|-------|
| `provider` | `parse-psl` |
| `competitionCode` | `BETWAY_PREMIERSHIP` |
| `tournament` (Parse param) | `betway-premiership` |
| `sourceUrl` | `https://api.parse.bot/scraper/0c2008df-2286-497a-a5cb-55dd56ec9a4e/get_fixtures` |

## Audit Events

The following audit event names are used (no new audit table required):

| Event | Trigger |
|-------|---------|
| `PARSE_PSL_FIXTURE_INGESTION_DRY_RUN` | Dry-run started |
| `PARSE_PSL_FIXTURE_INGESTION_SOURCE_EMPTY` | Source-empty no-op |
| `PARSE_PSL_FIXTURE_INGESTION_COMPLETED` | Write run completed |
| `PARSE_PSL_FIXTURE_INGESTION_FAILED` | Error during ingestion |

These are currently logged via the NestJS Logger. A formal audit-table hook can be added
in a future sprint if required.
