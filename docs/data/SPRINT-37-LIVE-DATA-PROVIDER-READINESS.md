# Sprint 37 — Live Data Provider Readiness

## Status Summary

| Competition | Provider | Readiness | Blocker |
|-------------|----------|-----------|---------|
| WC 2026 | football-data.org | CONDITIONAL | Requires `FOOTBALL_DATA_API_KEY` in beta env |
| PSL 2026/27 | Parse PSL | SOURCE_EMPTY | psl.co.za has not published 2026/27 schedule |
| PSL 2026/27 | API-Football 288 | BLOCKED | Account suspended (Sprint 13) |

## World Cup 2026

- Active beta competition (`isActive=true`)
- 104 matches validated via football-data.org (Sprint 13)
- `ProviderRouterService` routes WC codes to `FootballDataOrgAdapter`
- Provider key: `FOOTBALL_DATA_API_KEY` (server-side only)
- No action required — WC data is stable and not changing

## PSL 2026/27 Betway Premiership

- PSL season exists in DB but is **INACTIVE**
- psl.co.za publishes fixture schedules annually, typically July/August
- Parse PSL adapter configured to pull from `get_fixtures` endpoint
- Current `readinessStatus`: `SOURCE_EMPTY` (expected)
- Next check: re-run readiness monitor in July/August 2026

## Provider Endpoint

```
GET /admin/data-provider/psl-fixture-readiness
```

Returns real-time env-var presence check with:
- `readinessStatus`
- `providerDecision`
- `dryRunEligible`
- `writeImportForbidden: true`
- `pslActivationForbidden: true`
- `safety` flags (all true)

## PSL Fixture Import Pipeline (not yet active)

```
readinessStatus=SOURCE_EMPTY
  → Wait until July/August 2026

readinessStatus=FIXTURES_AVAILABLE_DRY_RUN_REQUIRED
  → Owner approves dry-run
  → POST /admin/data-provider/parse-psl/fixtures/ingest (dryRun=true)
  → Review candidate list

readinessStatus=READY_FOR_OWNER_IMPORT_REVIEW
  → Owner approves write import
  → POST /admin/data-provider/parse-psl/fixtures/ingest (dryRun=false, confirmWrite=true)

  → Owner approves fixture publication (separate)
  → Owner approves PSL activation via 13-check preflight (separate)
```

## Safety Boundaries

PSL remains INACTIVE throughout all stages above until the final activation step. Each step requires separate owner approval. No scheduled ingestion. No production ingestion. No real-money.
