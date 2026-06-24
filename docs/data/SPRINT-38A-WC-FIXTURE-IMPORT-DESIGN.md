# Sprint 38A — World Cup Fixture Import Design

## Service: WorldCupImportService

Location: `apps/api/src/data-provider/world-cup-import.service.ts`

## Import Flow

```
POST /admin/data-provider/world-cup/fixtures/import
  ↓
DataProviderController.importWorldCupFixtures()
  → validates confirmWorldCupWrite (controller layer)
  → delegates to WorldCupImportService.importFixtures()
    ↓
    Dry-run guard (dryRun=true by default)
    ↓
    Write guard check (env flag ALLOW_WORLD_CUP_WRITE)
    ↓
    FootballDataOrgAdapter.getFixtures('WC') OR SportRadarSoccerAdapter
    ↓
    normalizeFixtures() → filter invalid/incomplete records
    ↓
    buildCandidates() → team name resolution (fuzzy match against DB)
    ↓
    [DRY-RUN: return candidates, 0 DB writes]
    [WRITE: upsertFixtures() → isPublished=false]
    ↓
    writeAuditLog() → AdminAuditLog
```

## Team Resolution Strategy

1. Exact match: `Team.name === providerTeamName`
2. Case-insensitive contains: `Team.name ILIKE '%providerTeamName%'`
3. No match → `teamResolution.homeTeamMatched=false` (warning only in dry-run)

## DB Impact

- New fixtures: `Fixture` row with `isPublished=false`
- Existing fixtures (by `providerFixtureId + providerSource`): update `kickoffAt + lastSyncedAt` only
- No cascade to other models
- No PSL Season affected (WC season only)
- Migration: none required (uses existing Fixture model)

## Idempotency

- Upsert is idempotent: re-running write mode updates kickoffAt but doesn't duplicate
- Lookup key: `providerFixtureId + providerSource`
- Safe to run multiple times

## Season Auto-Detection

```typescript
// Auto-detect WC season from DB
competition.code IN ['WC', 'WORLD_CUP_2026', 'FIFA_WORLD_CUP', 'WC2026']
  WHERE season.isActive = true
  FALLBACK: any season for WC competition
```

Caller can override with explicit `seasonId` in request body.

## Error Handling

| Error | sourceStatus | Action |
|---|---|---|
| Key not set | AUTH_FAILED | Return early; audit log |
| Network error | PROVIDER_ERROR | Return early; audit log |
| Rate limited | RATE_LIMITED | Return early; audit log |
| 0 fixtures from provider | SOURCE_EMPTY | Return early; no-op |
| Write flag missing | WRITE_BLOCKED_MISSING_FLAGS | Return early; no write |
| Write env flag missing | WRITE_BLOCKED_ENV_FLAG | Return early; no write |
| Team not found | warning in result | Skip fixture with warning |
| Invalid kickoffAt | warning in result | Skip fixture with warning |
