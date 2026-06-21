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

## Live Checks: PENDING (require running API)

These checks require a running API server (`BASE_URL=http://localhost:4000` or staging URL):

| Check | Command | Expected Result |
|-------|---------|----------------|
| API health | `GET /health` | HTTP 200 |
| Fixture list | `GET /football/fixtures?limit=3` | HTTP 200 |
| Challenge result 404 | `GET /predictions/challenges/nonexistent/result` | HTTP 404 |
| Settlement gate (no auth) | `POST /predictions/challenges/settle-fixture/test` | HTTP 401 |
| Onboarding gate | `GET /onboarding/status` | HTTP 401 |
| Provider health gate | `GET /admin/data-provider/health` | HTTP 401 |

To run live checks:
```bash
# Local dev server
BASE_URL=http://localhost:4000 node tools/smoke/sprint-9-staging-smoke.mjs
BASE_URL=http://localhost:4000 node tools/smoke/sprint-9-challenge-settlement-smoke.mjs
```

## Staging Smoke: PENDING_AUTHORIZATION

Staging smoke requires:
1. Owner authorization for staging migration apply
2. Staging API server running post-migration
3. Optionally: `SMOKE_ADMIN_TOKEN` with ADMIN role for authed checks

To run against staging:
```bash
BASE_URL=http://<staging-ip>:4000 \
SMOKE_ADMIN_TOKEN=<admin-jwt-from-staging-login> \
node tools/smoke/sprint-9-staging-smoke.mjs
```

## Settlement Smoke Run History

| Date | Environment | Result | Notes |
|------|-------------|--------|-------|
| — | File-level only | PASS | Live checks pending server |
