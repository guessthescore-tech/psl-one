# Sprint 7 — Handover

**Sprint:** 7 — Sportmonks Trial Activation, Challenge Settlement & Staging Readiness  
**Status:** COMPLETE (pending owner visual review)

---

## What Was Delivered

### S7-01: Sportmonks Trial Activation
- Full Sportmonks v3 API implementation replacing empty skeleton
- `fetchSafe()` method handles 401, 403, 429, network errors gracefully
- Auth uses `Authorization: Bearer` header (NOT query param `api_token=`)
- New `getStandings()` method added to interface, NoOp, DataProvider, and Controller
- When `SPORTMONKS_API_KEY` is absent: all methods return safe empty state
- Discovery endpoint: `GET /admin/data-provider/discovery/standings/:seasonId`

### S7-02: Challenge Settlement Engine
- New service: `ChallengeSettlementService`
- Admin endpoint: `POST /predictions/challenges/:token/settle`
- Public endpoint: `GET /predictions/challenges/:token/result`
- Points: exact score = 10, correct outcome = 5, incorrect = 0
- Idempotent: calling settle twice returns same result without mutation
- Writes `CHALLENGE_SETTLED` audit event for both creator and acceptor
- No wallet records, no cash, no financial mechanics
- Frontend shows settled state with final score, points breakdown, winner/draw

### S7-03: Staging Migration Readiness
- Migration 42: `20260621000003_challenge_settlement` (additive)
- Runbook: `SPRINT-7-STAGING-MIGRATION-RUNBOOK.md`
- Rollback: `SPRINT-7-STAGING-MIGRATION-ROLLBACK.md`

---

## Product State

| Item | State |
|------|-------|
| PSL Season | INACTIVE (do not activate) |
| WC 2026 | ACTIVE (beta) |
| Wallet | Sandbox only |
| Provider key in frontend | NONE |
| Real money mechanics | NONE |
| STORY-40 | RESERVED |

---

## Test Counts

- API tests: ~1,713 + new settlement tests + Sportmonks tests
- Experience tests: ~476 + 13 new Sprint 7 tests

---

## Next Steps for Owner

1. Visual review of settled challenge UI at `/predict/challenge/accept?token=<settled-token>`
2. Owner to add `SPORTMONKS_API_KEY` to staging `.env` when trial account is set up
3. Run migration 42 on staging: `pnpm --filter @psl-one/api exec prisma migrate deploy`
4. Test settlement: create a challenge, accept it, mark fixture as FINISHED, call settle
