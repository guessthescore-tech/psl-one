# Sprint 36C — Beta EC2 Runtime Verification

## Deployed SHA

```
91dc999733c70195748d5acfd92e499f067638a1
```

Verified via smoke test `api version sha` → PASS.

## API Health

| Check | Result |
|-------|--------|
| API liveness (`/health`) | PASS |
| API readiness (`/health/ready`) | PASS |
| API version SHA (`/health/version`) | PASS — matches `91dc999` |
| Web health | PASS |
| Web landing | PASS |

## Sprint 36B Payload Verification

| Component | Expected | Verified via |
|-----------|----------|--------------|
| `GET /admin/data-provider/psl-fixture-readiness` | Present, PSL_ADMIN only | `unauthenticated admin rejection` smoke PASS |
| `DataProviderService.getPslFixtureReadiness()` | env-var presence check, no writes | unit tests PASS (90 test files, 2105 tests) |
| Admin UI `/admin/data-provider/psl-fixture-readiness` | Next.js page deployed | web health / landing PASS |
| Monitoring tool | In repo at `tools/staging/sprint-36b-psl-fixture-readiness-monitor.mjs` | file present in deployed SHA |
| Docs (4 files) | In repo | file present in deployed SHA |

## Readiness Endpoint — Live Smoke

| Check | Method | Result |
|-------|--------|--------|
| Unauthenticated `GET /admin/data-provider/psl-fixture-readiness` | standard smoke | PASS (401 returned) |
| Authenticated check with PSL_ADMIN JWT | monitoring tool | PENDING_ADMIN_TOKEN |

The monitoring tool (`sprint-36b-psl-fixture-readiness-monitor.mjs`) requires a PSL_ADMIN JWT, which is not available in this CI context for security reasons. Authentication rejection (401) is verified by the standard smoke suite.

Expected `readinessStatus` on next authenticated run: `SOURCE_EMPTY` (PSL 2026/27 fixtures not yet published by psl.co.za).

## Database State

| Item | State |
|------|-------|
| PSL season | EXISTS, INACTIVE |
| WC 2026 season | EXISTS, ACTIVE (beta) |
| Migrations applied | 44 (audience_segment is latest) |
| `audience_segments` table | Present (migration 44, Sprint 32) |
| Fixture import writes | NONE |
| Fixture publication writes | NONE |

## SSM Param Versions

| SSM Param | Notes |
|-----------|-------|
| `/psl-one/beta/API_IMAGE_URI` | Updated to `91dc999` image |
| `/psl-one/beta/WEB_IMAGE_URI` | Updated to `91dc999` image |
| Remaining 10 SSM params | No change (env config unchanged) |

## EC2 Instance

| Field | Value |
|-------|-------|
| Instance ID | `i-0a5f16539c9626f90` |
| Region/AZ | af-south-1b |
| IP | `16.28.84.11` |
| Status | Running |
| SSM | Online (proven by Poll 7/60 — Success) |
