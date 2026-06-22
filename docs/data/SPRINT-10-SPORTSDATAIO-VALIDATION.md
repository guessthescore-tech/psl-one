# Sprint 10 — SportsDataIO Trial Validation

Date: 2026-06-21

## Status: PARTIAL_UCL_TRIAL

---

## Key Status

- Key presence: PRESENT (length 32, server-side only, never printed)
- Key storage: `apps/api/.env` as `SPORTSDATAIO_SOCCER_API_KEY` (gitignored)
- Auth method: `Ocp-Apim-Subscription-Key` header (server-side only)
- HTTP result: **200 on competitions and teams; 401/404 on schedules/players/standings**

## Trial Scope

Free trial: UEFA Champions League (Competition ID 3) only.
PSL and WC2026 coverage requires a paid plan.

## Health Check Result

```
Provider: sportsdataio
Health: OK — HTTP 200 — 93 competition(s) returned
```

## Coverage Check Result

```
Endpoint            | HTTP | Count | Status
competitions        |  200 |  93   | OK
schedules (UCL 24)  |  401 |   0   | FAIL — trial tier
teams (UCL)         |  200 | 258   | OK
players (UCL team)  |  404 |   0   | FAIL — trial tier
standings (UCL)     |  401 |   0   | FAIL — trial tier
```

## Field Mapping Result

```
Team fields (UCL trial):
  externalId → TeamId: 509 (Arsenal FC)  ✅ MAPPED
  name → Name: Arsenal FC               ✅ MAPPED
  shortName → (absent)                  ❌ MISSING

Fixture fields (schedules blocked by trial):
  All fields: NOT_AVAILABLE_TRIAL        ❌
```

## What the Trial Validates

✅ Auth model works (Ocp-Apim-Subscription-Key)
✅ Competitions endpoint returns data (93 competitions)
✅ Teams endpoint returns data (258 UCL teams)
✅ TeamId (externalId) and Name (team name) fields are present
✅ No betting/odds endpoints accessed

## What the Trial Does NOT Validate

❌ Schedule/fixture endpoint access (HTTP 401 on trial)
❌ Standings access (HTTP 401 on trial)
❌ Players by team (HTTP 404 on trial)
❌ PSL Premier League fixture availability
❌ WC2026 fixture availability
❌ Data freshness / real-time updates
❌ Rate limits under scale

## PSL/WC2026 Coverage

- **PSL**: NOT VALIDATED — requires paid plan
- **WC2026**: NOT VALIDATED — requires paid plan (UCL trial ≠ WC2026)

## Adapter Status

The SportsDataIO adapter skeleton exists at `apps/api/src/data-provider/sportsdataio.adapter.ts`.
It is NOT wired to `DataProviderService` (candidate only — intentional, awaiting decision).

## Security Confirmation

- No key value was printed, logged, or committed
- Key is server-side only (`apps/api/.env`, gitignored)
- No `NEXT_PUBLIC_SPORTSDATAIO_*` exists or is permitted
- No betting/odds/stake endpoints were called
