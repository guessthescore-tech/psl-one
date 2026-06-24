# Sprint 38C — World Cup Fixture Refresh Verification

**Date:** 2026-06-24
**Status:** IMPLEMENTED

---

## Problem Statement

WC fixture statuses in DB were seeded as FINISHED/SCHEDULED at seed time. With live matches in progress, the DB could become stale (e.g. SCHEDULED fixtures that have since kicked off show as SCHEDULED instead of LIVE/FINISHED).

The existing `POST /admin/data-provider/world-cup/fixtures/import` endpoint creates **new** fixtures rather than updating existing seeded ones (match is on `providerFixtureId + providerSource`, but seeded fixtures have both null).

## Solution

New method `refreshFixtureStatuses()` added to `WorldCupImportService`. It matches by `homeTeamId + awayTeamId + kickoffAt ± 24h` instead of `providerFixtureId`, avoiding duplicate fixture creation.

## New Endpoint

```
POST /admin/data-provider/world-cup/fixtures/refresh-status
Guard: PSL_ADMIN
Body: none
```

### Response shape

```json
{
  "provider": "football-data-org",
  "sourceStatus": "SOURCE_AVAILABLE | AUTH_FAILED | SOURCE_EMPTY | PROVIDER_ERROR",
  "discovered": 104,
  "matched": 98,
  "updated": 12,
  "skipped": 6,
  "errors": [],
  "safety": {
    "noPslActivation": true,
    "noRealMoney": true,
    "noNewFixtures": true
  }
}
```

## Status Mapping

football-data.org → PSL One enum:

| Provider status | DB enum |
|-----------------|---------|
| `TIMED` | `SCHEDULED` |
| `SCHEDULED` | `SCHEDULED` |
| `IN_PLAY` | `LIVE` |
| `LIVE` | `LIVE` |
| `PAUSED` | `HALF_TIME` |
| `HALF_TIME` | `HALF_TIME` |
| `FINISHED` | `FINISHED` |
| `POSTPONED` | `POSTPONED` |
| `CANCELLED` | `CANCELLED` |
| `SUSPENDED` | `POSTPONED` |

## Safety Guarantees

- `noNewFixtures: true` — only updates existing records by `id`, never creates
- `noPslActivation: true` — scoped to WC season ID only
- `noRealMoney: true` — no wallet/financial data touched
- Writes audit log entry `WORLD_CUP_FIXTURE_STATUS_REFRESH`
- Requires PSL_ADMIN JWT — not callable by fans

## Operational Usage

Run during a live WC matchday to sync statuses:

```bash
# Via temp admin token
curl -X POST http://api.staging.pslone.co.za/admin/data-provider/world-cup/fixtures/refresh-status \
  -H "Authorization: Bearer <PSL_ADMIN_JWT>"
```

Run at most once per 10 minutes (football-data.org rate limit: 10 req/min on free tier).

## User Question Answered

**"Are fixtures and match information live, up to date, and date/time aware?"**

- Fixtures display with correct kickoffAt in SAST (UTC+2) on `/fixtures` and `/match-centre`
- Statuses are seeded as FINISHED (50) / SCHEDULED (54)
- The refresh endpoint allows an admin to sync live statuses from football-data.org on demand
- For fully automated live status updates, a future sprint can add a cron-triggered refresh
