# Sprint 10 — Live Smoke Results

Date: 2026-06-21

## Staging Smoke (Sprint 9 tool, fixed onboarding path)

Target: `http://localhost:4000` (local dev API)
Admin token: not set — authed checks skipped

**Onboarding path fix:** `/onboarding/status` (404) → `/account/onboarding` (401) ✅

| Check | Result | Notes |
|-------|--------|-------|
| API health (`GET /health`) | ✅ PASS HTTP 200 | API running |
| Fixture list (`GET /football/fixtures?limit=3`) | ✅ PASS HTTP 200, 104 fixtures | 104 fixtures in local dev DB |
| Challenge result 404 (`GET /predictions/challenges/nonexistent/result`) | ✅ PASS HTTP 404 | Endpoint exists, returns 404 for unknown token |
| Settlement gate (`POST /predictions/challenges/settle-fixture/test`) | ✅ PASS HTTP 401 | Auth guard active |
| Onboarding (`GET /account/onboarding`) | ✅ PASS HTTP 401 | RBAC guard active |
| Provider health (`GET /admin/data-provider/health`) | ✅ PASS HTTP 401 | Admin RBAC guard active |
| Admin provider health (authed) | ⏭️ SKIP | No SMOKE_ADMIN_TOKEN |
| Admin settle-fixture (authed) | ⏭️ SKIP | No SMOKE_ADMIN_TOKEN |

**Result: PASS 6/6 (2 SKIP — admin token not set)**

## Challenge Settlement Smoke

Target: `http://localhost:4000` (local dev API)

| Check | Result | Notes |
|-------|--------|-------|
| Settlement service file exists | ✅ PASS | File present |
| `settleAllAcceptedForFixture` method exists | ✅ PASS | Method found |
| Fire-and-forget integration in FootballService | ✅ PASS | `.catch()` pattern confirmed |
| No wallet/payment in settlement service | ✅ PASS | Points-only confirmed |
| No provider key in settlement service | ✅ PASS | Settlement isolated from provider |
| Live: API health | ✅ PASS HTTP 200 | |
| Live: result endpoint 404 | ✅ PASS HTTP 404 | Correct for unknown token |
| Live: settlement admin gate 401 | ✅ PASS HTTP 401 | Auth guard active |

**Result: PASS 8/8**

## EC2 Staging Smoke

Status: PENDING — EC2 DATABASE_URL not configured, EC2 migration not applied.

To run against EC2:
```bash
BASE_URL=http://16.28.84.11:4000 \
SMOKE_ADMIN_TOKEN=<admin-jwt> \
node tools/smoke/sprint-9-staging-smoke.mjs
```

## Authed Admin Smoke

To run the skipped authed checks, obtain an admin JWT:
```bash
# Login as admin
curl -X POST http://localhost:4000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@psl.co.za","password":"<admin-password>"}'

# Extract token, then:
SMOKE_ADMIN_TOKEN=<token> BASE_URL=http://localhost:4000 node tools/smoke/sprint-9-staging-smoke.mjs
```
