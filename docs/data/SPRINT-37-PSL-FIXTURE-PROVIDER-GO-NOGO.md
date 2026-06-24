# Sprint 37 — PSL Fixture Provider Go/No-Go

## Recommendation: CONDITIONAL_GO

**Condition:** PSL fixture import path is technically ready. Provider key and source data are the blocking items, not the codebase.

## Provider Decision

| Provider | Decision | Reason |
|----------|----------|--------|
| Parse PSL | GO (when key + data available) | Primary PSL source; adapter complete; SOURCE_EMPTY is normal seasonal state |
| API-Football 288 | BLOCKED | Account suspended Sprint 13; owner must procure new account |
| Manual CSV/JSON | DEFERRED | Not implemented; emergency path only |
| NoOp | ALWAYS SAFE | Fallback; no risk |

## Gate Results

| Gate | Result | Notes |
|------|--------|-------|
| Ingestion service | PASS | `ParsePslFixtureIngestionService` complete and tested |
| Dry-run default | PASS | `dryRun=true` by default; no accidental writes |
| Write-mode guards | PASS | 400 without `seasonId`; 400 without `confirmWrite=true` |
| RBAC | PASS | PSL_ADMIN only |
| Key safety | PASS | Keys not returned in any response |
| Source-empty handling | PASS | Returns graceful no-op; audit logged |
| Team resolution | PASS | Exact + fuzzy match; warnings on miss |
| Idempotent upsert | PASS | `providerFixtureId` deduplication |
| Audit logging | PASS | All ingestion events logged |
| PSL remains inactive | PASS | Fixture import never activates PSL |
| `isPublished=false` | PASS | All ingested fixtures start unpublished |

## Blocking Items (owner must resolve)

| Blocker | Owner action |
|---------|-------------|
| Parse PSL key not in beta env | Set `DATA_PROVIDER=parse-psl` + `PARSE_API_KEY` |
| psl.co.za not published 2026/27 | Wait until July/August 2026 |
| API-Football account suspended | Procure new account if Parse PSL fails |

## Non-Blocking Items

| Item | Status |
|------|--------|
| Adapter code | Complete |
| Dry-run tooling | Complete (Sprint 25 + Sprint 37) |
| Readiness endpoint | Complete (Sprint 36B + Sprint 37 enhancements) |
| Owner approval pack | Complete (Sprint 37) |
| Team resolution | 16 clubs seeded (Sprint 26) |

## Next Trigger

When `readinessStatus` changes from `SOURCE_EMPTY` to `FIXTURES_AVAILABLE_DRY_RUN_REQUIRED`:
1. Run Sprint 25 dry-run tool for owner review
2. Owner approves write import (separate approval)
3. Owner approves publication (separate approval)
4. PSL activation via 13-check preflight (separate approval)

**PSL remains inactive until step 4.**
