# Sprint 39 World Cup Date & Time Awareness

**WC_BETA · PSL_INACTIVE · NO_REAL_MONEY**
Date: 2026-06-25

---

## Fixture Storage (Database)

| Property | Value |
|----------|-------|
| Count (as of seed) | 104 fixtures |
| Finished | 50 FINISHED |
| Scheduled | 54 SCHEDULED |
| Storage format | UTC ISO 8601 (e.g. 2026-06-12T20:00:00Z) |
| Database column | `kickoffAt DateTime` (Prisma/PostgreSQL TIMESTAMPTZ) |
| Last sync | Sprint 38B seed (SHA d4d8d8c) |

---

## Frontend Display

All WC fixture pages display kickoff times in SAST (South African Standard Time, UTC+2):

```typescript
// Pattern used across fixtures/page.tsx, match-centre/page.tsx, world-cup/live/page.tsx
kickoff.toLocaleTimeString('en-ZA', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Johannesburg',
})
// e.g. "22:00 SAST" for a 20:00 UTC kickoff
```

### Timezone Conversion

| UTC Time | SAST (UTC+2) | Example fixture |
|----------|-------------|-----------------|
| 17:00 UTC | 19:00 SAST | Group stage afternoon |
| 20:00 UTC | 22:00 SAST | Group stage evening |
| 00:00 UTC | 02:00 SAST | Late North America kick |
| 22:00 UTC | 00:00 SAST | Midnight in SA |

---

## Status Refresh (New in Sprint 39)

Admin endpoint: `POST /admin/data-provider/world-cup/fixtures/refresh-status`

| Property | Value |
|----------|-------|
| Source | football-data.org FootballDataOrgAdapter |
| Safety | noNewFixtures: true — only updates existing DB fixtures |
| Match window | homeTeamId + awayTeamId + kickoffAt ±24h |
| Status mapping | TIMED→SCHEDULED, IN_PLAY→LIVE, PAUSED→HALF_TIME, FINISHED→FINISHED |
| Audit event | WORLD_CUP_FIXTURE_STATUS_REFRESH |
| Auth | PSL_ADMIN required |

### Status Mapping Table

| Provider Status | Internal Status |
|----------------|-----------------|
| TIMED | SCHEDULED |
| SCHEDULED | SCHEDULED |
| not_started | SCHEDULED |
| IN_PLAY | LIVE |
| in_progress | LIVE |
| PAUSED | HALF_TIME |
| half_time | HALF_TIME |
| FINISHED | FINISHED |
| closed | FINISHED |
| ended | FINISHED |
| POSTPONED | POSTPONED |
| CANCELLED | CANCELLED |
| SUSPENDED | SUSPENDED |

---

## Public API Access

WC fixtures are accessible without authentication:

```
GET /football/fixtures?seasonSlug=fifa-world-cup-2026
```

This enables the frontend to display live fixture data on /world-cup/live, /fixtures, and /match-centre without requiring fan login.

---

## Smoke Test

```bash
# Run date awareness smoke
node tools/staging/sprint-39-world-cup-date-awareness-smoke.mjs http://16.28.84.11
```

Expected output:
- All fixtures have valid ISO 8601 kickoffAt
- All times UTC-normalised
- SAST display confirmed
- Date range shown (earliest and latest fixture)
