# Sprint 15 — Idempotent Ingestion Rules

## Purpose

These rules ensure that running the fixture ingestion job multiple times produces the same result as running it once. This prevents duplicate data, phantom records, and inconsistent state.

## Core Idempotency Contract

**Every ingestion operation must be safe to replay.**

If the job is interrupted, restarted, or run again without any data changes on the provider side, the DB state must remain identical.

## Upsert Rules by Entity

### Fixture

```
Upsert key: (externalId, providerName)
Fields always updated: scheduledAt, status, homeTeamId, awayTeamId, updatedAt
Fields updated if not manually set: homeScore, awayScore
Fields never overwritten: isPublished, adminNotes, manualScore flag
```

Conflict strategy: `ON CONFLICT (externalId, providerName) DO UPDATE SET ...`

Do not use `INSERT IGNORE` or bare `INSERT` — they silently skip conflicts.

### Team (Club)

```
Upsert key: (externalId, providerName)
Fields always updated: externalName, updatedAt
Fields never overwritten: canonical Team.name, Team.shortCode
```

Team rows from providers are cross-referenced against canonical `Team` rows. Provider teams are stored in a separate `ProviderTeamMapping` table, not in the `Team` table directly.

### Standings

Standings are **not persisted**. They are read-only and displayed directly from provider responses. No upsert required.

### Results

Results from `get_results` update the `Fixture` row only if:
- The fixture already exists (by externalId match)
- No manual admin score has been set (`manualScore = false`)
- The provider result differs from current stored data

## Preventing Phantom Records

1. Never insert a Fixture row without a valid homeTeamId and awayTeamId in the DB.
2. If a team name from the provider cannot be matched, log a warning and skip the fixture (do not insert with null team references).
3. Track unmatched teams in a `ProviderIngestionWarning` log for owner review.

## Transaction Boundary

Each fixture upsert must be wrapped in a transaction:
- Fetch homeTeam mapping
- Fetch awayTeam mapping
- Upsert Fixture
- Commit or rollback all three together

## Audit Trail

Every upsert must write to `AdminAuditLog`:
```
action: FIXTURE_INGESTED
entityId: fixture.id
performedBy: 'system:parse-psl-ingestion'
metadata: { externalId, providerName, status: 'upserted' | 'unchanged' }
```

## Source-Empty Handling

If `get_fixtures` returns `[]`:
- Audit log: `action: FIXTURE_INGESTION_SOURCE_EMPTY`
- Exit code: 0 (success — not an error)
- No DB changes

## Related Documents

- `docs/data/SPRINT-15-FIXTURE-INGESTION-DESIGN.md`
- `docs/data/SPRINT-15-CANONICAL-DATA-BOUNDARY.md`
