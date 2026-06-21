# Sprint 10 — Handover

## Sprint Summary

Sprint 10 validated provider coverage, created a read-only staging pipeline, fixed the onboarding smoke path, ran live local-dev smoke tests (all passing), and gated the EC2 staging migration pending EC2 DATABASE_URL configuration.

## Key Outcomes

| Outcome | Status |
|---------|--------|
| Sportmonks key validated | ⚠️ HTTP 401 — key invalid |
| SportsDataIO trial validated | ✅ Competitions + teams OK |
| PSL in SportsDataIO list | ❌ NOT FOUND — critical finding |
| WC2026 in SportsDataIO list | ✅ CompetitionId=21 |
| Read-only pipeline | ✅ 11/11 safety checks PASS |
| Staging discovery tool | ✅ Created + tested |
| Pipeline safety check tool | ✅ Created + tested |
| Live smoke (local dev) | ✅ 6/6 PASS (fixed onboarding path) |
| Settlement smoke | ✅ 8/8 PASS |
| EC2 migration | ⚠️ PENDING_EC2_DB_URL |
| Beta go/no-go | ⚠️ CONDITIONAL_GO |

## Test Counts

- API: 1,770 / 1,770
- Experience: 519 / 519 (19 Sprint 9 + Sprint 10 additions)

## New Tools

- `tools/discovery/staging-provider-discovery.mjs` — read-only sample from providers
- `tools/discovery/provider-readonly-pipeline-check.mjs` — 11 safety checks

## Bug Fixed

- `tools/smoke/sprint-9-staging-smoke.mjs` — onboarding path corrected to `/account/onboarding`

## Owner Actions Required

1. **Sportmonks key** — Go to https://app.sportmonks.com/api-tokens, generate a fresh replacement, update `apps/api/.env`
2. **Commercial terms** — Review Sportmonks pricing for PSL data rights
3. **EC2 DATABASE_URL** — Configure in `apps/api/.env`, then authorize EC2 migration apply
4. **PSL provider gap** — SportsDataIO does not have PSL in competition list; owner must confirm if Sportmonks covers PSL or if a different approach is needed

## Product State (UNCHANGED)

| Item | State |
|------|-------|
| PSL season | INACTIVE |
| WC2026 season | ACTIVE (beta) |
| Wallet | SANDBOX_ONLY |
| Production ingestion | DISABLED |
| Frontend provider keys | NONE |
| Real-money functionality | NONE |
