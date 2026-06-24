# Sprint 36B — PSL Fixture Readiness Monitoring Handover

## What was built

A read-only PSL fixture readiness monitoring layer consisting of:

| Artifact | Path | Purpose |
|----------|------|---------|
| Service method | `apps/api/src/data-provider/data-provider.service.ts` | `getPslFixtureReadiness()` |
| API endpoint | `GET /admin/data-provider/psl-fixture-readiness` | PSL_ADMIN only |
| Admin UI page | `/admin/data-provider/psl-fixture-readiness` | Read-only status card |
| Monitoring tool | `tools/staging/sprint-36b-psl-fixture-readiness-monitor.mjs` | CLI check |
| API tests | `apps/api/src/data-provider/data-provider-admin-http.spec.ts` | 5 new RBAC + safety tests |
| Experience tests | `apps/experience/src/lib/experience.spec.ts` | Sprint 36B describe block |
| Docs | `docs/data/SPRINT-36B-PSL-FIXTURE-READINESS-MONITORING.md` | Reference |
| Runbook | `docs/staging/SPRINT-36B-PSL-FIXTURE-MONITORING-RUNBOOK.md` | Operations |

## What it does

1. Inspects provider configuration (env var presence — no key values returned)
2. Returns a structured readiness status with safety flags
3. Provides owner action checklist for when fixtures become available

## What it does NOT do

- Does not import fixtures (no DB writes)
- Does not publish fixtures
- Does not activate PSL
- Does not call external providers (env var presence check only)
- Does not make network calls
- Does not expose provider key values
- Does not enable scheduled ingestion
- Does not enable production ingestion
- Does not introduce real-money functionality

## Current State

```
PSL = INACTIVE
readinessStatus = SOURCE_EMPTY (expected — psl.co.za has not published 2026/27 fixtures)
Expected fixture availability = ~July/August 2026
```

## What owner needs to do next

Nothing immediately. Monitor periodically:

```bash
BASE_URL=http://16.28.84.11:4000 ADMIN_TOKEN=<jwt> \
  node tools/staging/sprint-36b-psl-fixture-readiness-monitor.mjs
```

When `readinessStatus` changes to `FIXTURES_AVAILABLE_DRY_RUN_REQUIRED`:
1. Approve dry-run import review
2. Review fixture candidates
3. Separately approve write import
4. Separately approve fixture publication
5. Separately approve PSL activation (after 13-check preflight)

## Safety Boundaries Confirmed

| Boundary | Status |
|----------|--------|
| PSL INACTIVE | Confirmed |
| No fixture import write | Confirmed |
| No fixture publication | Confirmed |
| No PSL activation | Confirmed |
| No scheduled ingestion | Confirmed |
| No production ingestion | Confirmed |
| No wallet production | Confirmed |
| No real-money functionality | Confirmed |
| Fantasy = points-only | Confirmed |
| Commerce = CATALOGUE_ONLY | Confirmed |

## Known Gaps

See `docs/handover/SPRINT-36B-KNOWN-GAPS.md`.
