# Sprint 10 — Sportmonks Validation

## Status: REJECTED — REMOVED FROM ACTIVE PROVIDER STRATEGY

Date: 2026-06-21  
Amended: 2026-06-22

**Sprint 10 amendment (2026-06-22):** Sportmonks has been rejected as a provider.  
Owner determination: Sportmonks does not provide the required data points for the PSL One platform.

The HTTP 401 issue was a contributing factor but the rejection is based on capability fit, not solely the key status.  
`SPORTMONKS_API_KEY` is no longer an owner action item. Do not regenerate or set this key.

---

## Previous HTTP Status (now historical record)

---

## Key Status

- Key presence: PRESENT (length 60, server-side only, never printed)
- Key storage: `apps/api/.env` as `SPORTMONKS_API_KEY` (gitignored, not tracked)
- HTTP result: **401 on ALL endpoints**

## Health Check Result

```
Provider: sportmonks
Health: FAIL — HTTP 401 — Auth failed
```

## Coverage Check Result

```
Endpoint     | HTTP | Count | Status
seasons      |  401 |   0   | FAIL
fixtures     |  401 |   0   | FAIL
teams        |  401 |   0   | FAIL
players      |  401 |   0   | FAIL
standings    |  401 |   0   | FAIL
```

## Field Mapping Result

All fields MISSING — API returns 401 before any data is returned.

```
externalId     | MISSING (401)
homeTeamName   | MISSING (401)
awayTeamName   | MISSING (401)
kickoffAt      | MISSING (401)
status         | MISSING (401)
homeScore      | OPTIONAL —
awayScore      | OPTIONAL —
```

## Diagnosis

The replacement key (length 60) was added by the owner but every API v3 endpoint returns HTTP 401.

Possible causes (in order of likelihood):
1. **Key was not activated** — new tokens on Sportmonks may require explicit activation on the dashboard
2. **Wrong key copied** — trailing space, missing character, or wrong token selected
3. **Plan does not include v3 football API** — some Sportmonks plans require an upgrade for `/v3/football/*`
4. **Key belongs to wrong account** — if multiple accounts exist, wrong account's key was copied

## Owner Actions Required

**None** — Sportmonks has been rejected and removed from the active provider strategy.

Do NOT regenerate or set `SPORTMONKS_API_KEY`. No further Sportmonks validation is needed.

See `docs/data/SPRINT-10-ACTIVE-PROVIDER-STRATEGY.md` for the path forward.

## PSL/WC2026 Coverage

Cannot validate — all endpoints return 401.

## Commercial Terms

Unknown — cannot access API to validate. Must be confirmed before any production ingestion.

## Security Confirmation

- No key value was printed, logged, or committed
- Key is server-side only (`apps/api/.env`, gitignored)
- No `NEXT_PUBLIC_SPORTMONKS_API_KEY` exists or is permitted
- No betting/odds endpoints were called
