# Sprint 10 — Handover

## Sprint Summary

Sprint 10 validated provider coverage, created a read-only staging pipeline, fixed the onboarding smoke path, ran live local-dev smoke tests (all passing), and gated the EC2 staging migration pending EC2 DATABASE_URL configuration.

**Sprint 10 Amendment (2026-06-22):** Sportmonks rejected and removed from active provider strategy. Primary provider is now UNDECIDED. See `docs/data/SPRINT-10-ACTIVE-PROVIDER-STRATEGY.md`.

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

1. **Provider strategy** — Sportmonks REJECTED. Review `docs/data/SPRINT-10-NEW-PROVIDER-SHORTLIST.md` and select a replacement provider that has PSL fixture data.
2. **EC2 DATABASE_URL** — Configure in `apps/api/.env`, then authorize EC2 migration apply.
3. ~~Sportmonks key~~ — **NO ACTION NEEDED.** Key should remain empty or be removed from `.env`.
4. ~~Sportmonks commercial terms~~ — **NO ACTION NEEDED.** Sportmonks rejected.

## Product State (UNCHANGED)

| Item | State |
|------|-------|
| PSL season | INACTIVE |
| WC2026 season | ACTIVE (beta) |
| Wallet | SANDBOX_ONLY |
| Production ingestion | DISABLED |
| Frontend provider keys | NONE |
| Real-money functionality | NONE |
