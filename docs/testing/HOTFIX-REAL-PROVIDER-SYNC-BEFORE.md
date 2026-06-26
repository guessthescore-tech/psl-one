# Hotfix: Real Provider Sync — Before State Evidence

**Date:** 2026-06-26  
**Branch:** hotfix/real-provider-sync-email-honesty  
**Source:** `GET https://api.beta.pslone.co.za/football/fixtures?seasonSlug=fifa-world-cup-2026`

## Fixture Data Audit

```json
{
  "count": 104,
  "providerSourceNull": 104,
  "providerFixtureIdNull": 104,
  "importedAtNull": 104,
  "lastSyncedAtNull": 104,
  "finished": 50,
  "finishedNullScores": 50,
  "sampleSources": ["fifa-wc2026"]
}
```

## Findings

| Field | Count | State |
|-------|-------|-------|
| Total fixtures | 104 | From seed data |
| `providerSource = null` | 104/104 | **100% static** |
| `providerFixtureId = null` | 104/104 | **Never provider-synced** |
| `importedAt = null` | 104/104 | **Never imported** |
| `lastSyncedAt = null` | 104/104 | **Never refreshed** |
| FINISHED fixtures | 50 | Status from seed |
| FINISHED with null scores | 50/50 | **No scores at all** |

## Root Causes

1. `WorldCupImportService.normalizeFixtures()` dropped `homeScore`/`awayScore` entirely.
2. `upsertFixtures()` update path only wrote `kickoffAt` and `lastSyncedAt`.
3. `refreshFixtureStatuses()` only updated `status` and `lastSyncedAt`, not scores.
4. No admin tool ran an actual provider sync against live football-data.org key.
5. 104 fixtures were seeded manually with `source=fifa-wc2026` — not imported from any provider.

## What "Live API" Actually Meant

```
Frontend → PSL One API (real HTTP, no fallback)  ✓
PSL One API → Database (real PostgreSQL)          ✓
Database ← Provider (football-data.org/etc.)      ✗  NEVER HAPPENED
```

The frontend was reading real API endpoints backed by real DB rows,
but those DB rows were seeded manually and never synced from any external provider.
