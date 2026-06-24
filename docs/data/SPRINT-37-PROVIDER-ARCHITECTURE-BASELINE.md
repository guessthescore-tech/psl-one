# Sprint 37 — Provider Architecture Baseline

## Overview

This document captures the data provider architecture at the start of Sprint 37, before any provider procurement or fixture import changes.

## Deployed SHA

`91dc999733c70195748d5acfd92e499f067638a1` (Sprint 36B/36C, beta EC2)

## Provider Router Architecture

### Global Provider Selection (`DataProviderService`)

Selection is explicit via `DATA_PROVIDER` env var. A key alone never activates a provider — both must be set.

```
DATA_PROVIDER=parse-psl   + PARSE_API_KEY        → ParsePslAdapter
DATA_PROVIDER=api-football + API_FOOTBALL_KEY     → ApiFootballAdapter
DATA_PROVIDER=football-data-org + FOOTBALL_DATA_API_KEY → FootballDataOrgAdapter
<anything else or not set> → NoOpAdapter (safe default)
```

### Per-Competition Router (`ProviderRouterService`)

Routes by competition code, independent of the global `DATA_PROVIDER` setting.

```
WC / WORLD_CUP_2026 / FIFA_WORLD_CUP:
  → FootballDataOrgAdapter (if FOOTBALL_DATA_API_KEY present)
  → NoOpAdapter (fallback)

PSL / SOUTH_AFRICA_PSL / 288 / BETWAY_PREMIERSHIP:
  1. ParsePslAdapter      (if PARSE_API_KEY present)
  2. ApiFootballAdapter   (fallback if API_FOOTBALL_KEY present, no parse key)
  3. NoOpAdapter          (if no key)

Default: NoOpAdapter
```

## Adapters Present

| Adapter | File | Competition | Status |
|---------|------|-------------|--------|
| NoOpAdapter | `no-op.adapter.ts` | All (fallback) | ACTIVE DEFAULT |
| FootballDataOrgAdapter | `football-data-org.adapter.ts` | WC 2026 | ACTIVE (key required) |
| ParsePslAdapter | `parse-psl.adapter.ts` | PSL | KEY_REQUIRED |
| ApiFootballAdapter | `api-football.adapter.ts` | PSL 288 | SUSPENDED (Sprint 13) |
| SportmonksAdapter | `sportmonks.adapter.ts` | Various | REJECTED (Sprint 9) |
| SportsDataIOAdapter | `sportsdataio.adapter.ts` | UCL/partial | NOT_SELECTED |

## Readiness Monitoring Endpoint

```
GET /admin/data-provider/psl-fixture-readiness
```

- PSL_ADMIN only (JwtAuthGuard + RolesGuard)
- Returns: `readinessStatus`, `providerDecision`, `dryRunEligible`, `writeImportForbidden`, `pslActivationForbidden`, `parsePsl`, `apiFootball`, `safety` flags
- No network calls — env var presence check only
- Enhanced in Sprint 37 with: `providerDecision`, `dryRunEligible`, `writeImportForbidden`, `fixturePublicationForbidden`, `pslActivationForbidden`

## Import Endpoint (Dry-Run / Write)

```
POST /admin/data-provider/parse-psl/fixtures/ingest
```

- PSL_ADMIN only
- `dryRun` defaults to `true` — no DB writes unless `dryRun=false`
- Write mode requires `seasonId` + `confirmWrite=true` — 400 otherwise
- All ingested fixtures created with `isPublished=false`
- No scheduler. No auto-trigger. No PSL activation.

## Current Known Provider States (Sprint 37 Start)

| Provider | Competition | State | Notes |
|----------|-------------|-------|-------|
| Parse PSL (psl.co.za) | PSL | SOURCE_EMPTY | psl.co.za has not published 2026/27 schedule |
| API-Football PSL 288 | PSL | SUSPENDED | Account suspended as of Sprint 13 (2026-06-22) |
| football-data.org | WC 2026 | ACTIVE (key required) | 104 WC matches validated Sprint 13 |
| NoOp | All | ACTIVE (default) | Returns empty responses safely |
| Sportmonks | PSL | REJECTED | Deliberately excluded |

## Ingestion Design Principles

From `docs/data/SPRINT-15-FIXTURE-INGESTION-DESIGN.md`:

1. **Idempotent** — re-running produces no duplicate fixtures (upsert by `providerFixtureId`)
2. **Manual-only** — no cron, EventBridge trigger, or scheduler
3. **Dry-run first** — default `dryRun=true` protects against accidental writes
4. **Owner gates** — write import requires `confirmWrite=true`; publication requires separate admin action
5. **Source-empty is not failure** — `SOURCE_EMPTY` is the expected state until psl.co.za publishes
6. **PSL inactive** — fixture import does not activate PSL; activation requires 13-check preflight

## Related Docs

- `docs/data/SPRINT-12-PROVIDER-STRATEGY.md`
- `docs/data/SPRINT-13-PER-COMPETITION-ROUTING.md`
- `docs/data/SPRINT-15-FIXTURE-INGESTION-DESIGN.md`
- `docs/data/SPRINT-18-FIXTURE-PUBLISHING-WORKFLOW.md`
- `docs/staging/SPRINT-25-PSL-ACTIVATION-BOUNDARY.md`
- `docs/data/SPRINT-36B-PSL-FIXTURE-READINESS-MONITORING.md`
