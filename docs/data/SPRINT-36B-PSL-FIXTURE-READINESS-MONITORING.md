# Sprint 36B — PSL Fixture Readiness Monitoring

## Overview

This document describes the read-only PSL fixture readiness monitoring layer added in Sprint 36B. It answers the question:

> Are PSL fixtures available from configured providers yet?

## What this is

A read-only monitoring endpoint and tool that periodically checks whether official PSL 2026/27 Betway Premiership fixture data has become available from the configured provider.

## What this is NOT

| What it is NOT | Why |
|----------------|-----|
| Fixture import | No DB writes occur |
| Fixture publication | No fixture `isPublished` flag is changed |
| PSL season activation | PSL remains INACTIVE |
| Scheduled ingestion | No cron, EventBridge, or scheduler |
| Production ingestion | No write to production DB |
| Real-money functionality | Platform is points-only |

## Current Expected State

```
PSL = INACTIVE
readinessStatus = SOURCE_EMPTY (expected until ~July/August 2026)
```

`SOURCE_EMPTY` is **not a failure**. It means psl.co.za has not yet published the 2026/27 fixture schedule. Re-run the check periodically.

## API Endpoint

```
GET /admin/data-provider/psl-fixture-readiness
```

| Auth | PSL_ADMIN only |
|------|----------------|
| Anonymous | 401 |
| FAN | 403 |
| CLUB_ADMIN | 403 |
| SPONSOR | 403 |

### Response Shape

```ts
{
  competition: 'PSL';
  season: string;
  pslActive: false;                         // always false — PSL not activated
  fixturePublicationIsActivation: false;    // fixture publishing ≠ PSL activation
  readinessStatus:
    | 'SOURCE_EMPTY'                        // expected current state
    | 'PROVIDER_NOT_CONFIGURED'             // DATA_PROVIDER env var missing
    | 'PROVIDER_ERROR'                      // provider returned error
    | 'FIXTURES_AVAILABLE_DRY_RUN_REQUIRED' // fixtures found; dry-run next
    | 'READY_FOR_OWNER_IMPORT_REVIEW';      // dry-run done; owner review needed
  parsePsl: {
    configured: boolean;
    status: 'OK' | 'SOURCE_EMPTY' | 'NOT_CONFIGURED';
    candidateFixtureCount: number;
    lastCheckedAt: string;
  };
  apiFootball: {
    configured: boolean;
    leagueId: 288;
    status: 'OK' | 'SUSPENDED' | 'NOT_CONFIGURED' | 'NOT_CHECKED';
    candidateFixtureCount?: number;
  };
  ownerActions: string[];
  forbiddenActions: string[];
  safety: {
    noWrites: true;
    noPublication: true;
    noPslActivation: true;
    noScheduledIngestion: true;
    noProductionIngestion: true;
    noRealMoney: true;
  };
}
```

### Safety Guarantee

The endpoint inspects environment variable **presence only** (server-side). Provider key values are never returned in the response. No network calls to providers are made. No DB writes occur.

## Monitoring Tool

```bash
BASE_URL=http://api:4000 ADMIN_TOKEN=<psl-admin-jwt> \
  node tools/staging/sprint-36b-psl-fixture-readiness-monitor.mjs
```

- ADMIN_TOKEN is never printed
- Provider keys are never returned by the server
- Exits 0 for expected states (SOURCE_EMPTY, PROVIDER_NOT_CONFIGURED)
- Exits 1 only for failures (server error, safety flag violation)

## Admin UI

```
/admin/data-provider/psl-fixture-readiness
```

Read-only status card showing provider configuration, candidate count, safety flags, and owner action checklist.

## Owner Action Sequence (when fixtures become available)

1. `readinessStatus` changes to `FIXTURES_AVAILABLE_DRY_RUN_REQUIRED`
2. Owner approves dry-run import at `POST /admin/data-provider/parse-psl/fixtures/ingest` with `dryRun=true`
3. Owner reviews fixture candidates in dry-run response
4. Owner approves write import (`dryRun=false`, `confirmWrite=true`, `seasonId=<id>`)
5. Owner separately approves fixture publication (separate admin action)
6. PSL season activation requires 13-check preflight and separate owner approval

Steps 3–6 are separate owner-gated actions. This monitoring layer covers step 1 only.

## Safety Boundaries

- PSL remains INACTIVE throughout
- Fixture readiness monitoring is not fixture import
- Fixture import write requires `confirmWrite=true` + owner approval
- Fixture publication does not activate PSL
- PSL activation requires 13-check preflight and owner approval
- No scheduled ingestion
- No production ingestion
- No wallet production
- No real-money functionality
- Fantasy = points-only
- Social prediction = points-only
- Commerce = CATALOGUE_ONLY

## Related Docs

- `docs/data/SPRINT-18-FIXTURE-PUBLISHING-WORKFLOW.md`
- `docs/staging/SPRINT-25-PSL-ACTIVATION-BOUNDARY.md`
- `docs/staging/SPRINT-36B-PSL-FIXTURE-MONITORING-RUNBOOK.md`
