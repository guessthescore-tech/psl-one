# Sprint 17 — Fixture Provenance & Audit Trail

## Fixture Provenance Fields

Every fixture ingested via Parse PSL has the following provenance fields populated:

| Field | Type | Source |
|-------|------|--------|
| `providerSource` | `string` | Always `'parse-psl'` for this workflow |
| `providerFixtureId` | `string` | `externalId` from provider normalisation |
| `externalId` | `string` | Same as `providerFixtureId` |
| `sourceUrl` | `string` | Parse PSL scraper endpoint |
| `importedAt` | `DateTime` | Set on initial upsert |
| `lastSyncedAt` | `DateTime` | Updated on each upsert |
| `isPublished` | `boolean` | Always `false` on import; set to `true` by separate publish action |

These fields were already present in the `Fixture` model (no migration required).

## Upsert Key

Fixtures are upserted on `externalId`. If a fixture with the same `externalId` already exists, it is updated rather than duplicated.

```typescript
prisma.fixture.upsert({
  where: { externalId: normalized.externalId },
  create: { ... provenance fields ... isPublished: false },
  update: { ... provenance fields ... lastSyncedAt: new Date() },
})
```

## AdminAuditLog Events

Ingestion events are written to `AdminAuditLog` after each significant action:

```typescript
type AdminAuditLog = {
  actorUserId: 'system';
  actorRole: 'SYSTEM';
  action: string;           // See table below
  entityType: 'Fixture';
  entityId: competitionCode;
  route: '/admin/data-provider/parse-psl/fixtures/ingest';
  metadata: object;         // Stats (created/updated/skipped/warnings)
  createdAt: DateTime;
};
```

### Audit Events

| Action | When |
|--------|------|
| `PARSE_PSL_FIXTURE_INGESTION_DRY_RUN` | Dry-run completes with SOURCE_AVAILABLE |
| `PARSE_PSL_FIXTURE_INGESTION_SOURCE_EMPTY` | Provider returned no fixtures (expected pre-season) |
| `PARSE_PSL_FIXTURE_INGESTION_WRITE_ATTEMPTED` | Write mode started (before DB writes) |
| `PARSE_PSL_FIXTURE_INGESTION_WRITE_COMPLETED` | Write mode finished successfully |
| `PARSE_PSL_FIXTURE_INGESTION_FAILED` | Provider or unexpected error during ingestion |

## Audit Failure Safety

Audit log writes are wrapped in a try/catch. If the audit write fails, a warning is logged but ingestion continues. The ingestion result is returned successfully. This prevents an audit subsystem failure from blocking fixture data import.

## Querying the Audit Trail

```sql
SELECT action, metadata, "createdAt"
FROM "AdminAuditLog"
WHERE route = '/admin/data-provider/parse-psl/fixtures/ingest'
ORDER BY "createdAt" DESC
LIMIT 20;
```
