# Sprint 9 — Smoke Results

## File-Level Checks: PASS

The following checks run without a running server (static analysis):

| Check | Tool | Result |
|-------|------|--------|
| Settlement service exists | `sprint-9-challenge-settlement-smoke.mjs` | PASS |
| `settleAllAcceptedForFixture` method exists | `sprint-9-challenge-settlement-smoke.mjs` | PASS |
| Fire-and-forget integration in FootballService | `sprint-9-challenge-settlement-smoke.mjs` | PASS |
| No wallet/payment in settlement service | `sprint-9-challenge-settlement-smoke.mjs` | PASS |
| No provider key in settlement service | `sprint-9-challenge-settlement-smoke.mjs` | PASS |
| Discovery tools: no NEXT_PUBLIC_* keys | `experience.spec.ts` S9 tests | PASS |
| Discovery tools: no betting/odds paths | `experience.spec.ts` S9 tests | PASS |

## Live Checks: FAIL (API not running on localhost:4000)

Run date: 2026-06-21 — `node tools/smoke/sprint-9-staging-smoke.mjs`

| Check | Result | Notes |
|-------|--------|-------|
| API health | FAIL | Network error: fetch failed (no server running) |
| Fixture list (public) | FAIL | Network error |
| Challenge result 404 | FAIL | Network error |
| Settlement gate (no auth) | FAIL | Network error |
| Onboarding endpoint | FAIL | Network error |
| Provider health admin gate | FAIL | Network error |
| Admin provider health (authed) | SKIP | No SMOKE_ADMIN_TOKEN |
| Admin settle-fixture (authed) | SKIP | No SMOKE_ADMIN_TOKEN |

**Overall: FAIL — 0 PASS / 6 FAIL / 2 SKIP**

Root cause: API server not running locally. Live checks require `pnpm --filter @psl-one/api run start:dev` first.

To re-run with running API:
```bash
# Start API in another terminal:
# pnpm --filter @psl-one/api run start:dev
BASE_URL=http://localhost:4000 node tools/smoke/sprint-9-staging-smoke.mjs
BASE_URL=http://localhost:4000 node tools/smoke/sprint-9-challenge-settlement-smoke.mjs
```

## Staging EC2 Smoke: PENDING_DB_URL

Staging EC2 smoke requires:
1. `DATABASE_URL` updated to EC2 instance in `apps/api/.env`
2. Owner authorization for EC2 migration apply
3. API deployed to EC2 or tunneled
4. `SMOKE_ADMIN_TOKEN` with ADMIN role

## Settlement Smoke Run History

| Date | Environment | Result | Notes |
|------|-------------|--------|-------|
| 2026-06-21 | File-level (local) | PASS 5/5 | No server needed for file checks |
| 2026-06-21 | Live (localhost:4000) | FAIL 0/6 | API not running |
