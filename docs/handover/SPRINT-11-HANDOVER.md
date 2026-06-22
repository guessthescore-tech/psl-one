# Sprint 11 — Handover

## Sprint Summary

Sprint 11 selected API-Football (api-sports.io) as the primary provider candidate, implemented the `ApiFootballAdapter` in safe no-key skeleton mode, wired `DataProviderService` with an explicit `DATA_PROVIDER` flag, added read-only provider discovery tools, and produced a full provider validation matrix and decision record.

## Key Outcomes

| Outcome | Status |
|---------|--------|
| Provider candidate selected | ✅ API-Football (api-sports.io, league ID 288 for PSL) |
| ApiFootballAdapter implemented | ✅ Full adapter, safe no-key mode, 22 unit tests |
| DataProviderService wiring | ✅ Explicit `DATA_PROVIDER=api-football` flag required |
| NoOp fallback retained | ✅ Default when flag not set or key absent |
| PSL coverage confirmed | ❌ PENDING — no live key in Sprint 11 |
| WC2026 coverage confirmed | ❌ PENDING — no live key in Sprint 11 |
| Provider discovery tools | ✅ 4 tools created (health, coverage, field map, decision) |
| Provider research docs | ✅ 6 docs (shortlist, matrix, data points, decision, risk register, go-no-go) |
| Sportmonks status | ✅ REJECTED — not reconsidered |
| SportsDataIO status | ✅ SECONDARY_CANDIDATE — PSL still unconfirmed |
| EC2 staging migration | ⚠️ PENDING_EC2_DB_URL — unchanged from Sprint 10 |
| Beta go/no-go | ⚠️ CONDITIONAL_GO |

## Test Counts

- API: 1,798 / 1,798 (+27 Sprint 11 additions)
- Experience: 556+ / 556+ (+Sprint 11 assertions)

## New Files

### Code
- `apps/api/src/data-provider/api-football.adapter.ts` — `ApiFootballAdapter` targeting PSL league 288
- `apps/api/src/data-provider/api-football.adapter.spec.ts` — 22 unit tests

### Discovery Tools
- `tools/discovery/sprint-11-provider-health.mjs`
- `tools/discovery/sprint-11-provider-coverage.mjs`
- `tools/discovery/sprint-11-provider-field-map.mjs`
- `tools/discovery/sprint-11-provider-decision.mjs`

### Docs
- `docs/data/SPRINT-11-PROVIDER-SHORTLIST.md`
- `docs/data/SPRINT-11-PROVIDER-VALIDATION-MATRIX.md`
- `docs/data/SPRINT-11-PROVIDER-DATA-POINTS.md`
- `docs/data/SPRINT-11-PROVIDER-DECISION.md`
- `docs/data/SPRINT-11-PROVIDER-RISK-REGISTER.md`
- `docs/data/SPRINT-11-PROVIDER-GO-NOGO.md`

## Key Architecture Change

`DataProviderService` now uses an explicit `DATA_PROVIDER` env var for provider selection:

```
DATA_PROVIDER=api-football + API_FOOTBALL_KEY=<key> → ApiFootballAdapter
DATA_PROVIDER=api-football + no API_FOOTBALL_KEY    → NoOpAdapter (warn)
DATA_PROVIDER=(unset or other)                       → NoOpAdapter (default)
```

A key alone never activates a provider. Both `DATA_PROVIDER` and a valid key must be set.

## Owner Actions Required

1. **Obtain API-Football trial key** — sign up at https://api-football.com or https://api-sports.io
2. **Set in `apps/api/.env`** (never commit): `API_FOOTBALL_KEY=<key>` and `DATA_PROVIDER=api-football`
3. **Run health check**: `node --env-file=apps/api/.env tools/discovery/sprint-11-provider-health.mjs`
4. **Run coverage check**: `node --env-file=apps/api/.env tools/discovery/sprint-11-provider-coverage.mjs`
5. **Confirm PSL (league 288)** is in competition list
6. **Confirm WC2026** is in competition list
7. **Run field map check**: `node --env-file=apps/api/.env tools/discovery/sprint-11-provider-field-map.mjs`
8. **Review commercial terms** at https://api-sports.io/pricing before production ingestion

## Product State (UNCHANGED)

| Item | State |
|------|-------|
| PSL season | INACTIVE |
| WC2026 season | ACTIVE (beta) |
| Wallet | SANDBOX_ONLY |
| Production ingestion | DISABLED |
| Frontend provider keys | NONE |
| Real-money functionality | NONE |
