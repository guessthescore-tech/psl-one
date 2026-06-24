# Sprint 36C — Beta EC2 Smoke Results

## Workflow Run

| Field | Value |
|-------|-------|
| Run ID | `28107618815` |
| Git SHA | `91dc999733c70195748d5acfd92e499f067638a1` |
| Smoke job ID | `83226882675` |
| readiness_result | **pass** |
| smoke_result | **pass** |

## Smoke Results: 17/17 PASS

| # | Check | Result |
|---|-------|--------|
| 1 | api liveness | PASS |
| 2 | api readiness | PASS |
| 3 | api version sha | PASS |
| 4 | web health | PASS |
| 5 | web landing | PASS |
| 6 | beta environment label | PASS |
| 7 | world cup season preserved | PASS |
| 8 | psl season exists and inactive | PASS |
| 9 | psl activation not ACTIVATED | PASS |
| 10 | fixtures | PASS |
| 11 | standings | PASS |
| 12 | match centre | PASS |
| 13 | fantasy landing | PASS |
| 14 | guess the score landing | PASS |
| 15 | social prediction landing | PASS |
| 16 | leaderboards | PASS |
| 17 | unauthenticated admin rejection | PASS |

**Total: 17 PASS / 0 FAIL / 0 SKIP**

## Readiness Endpoint Smoke

| Check | Result | Notes |
|-------|--------|-------|
| Unauthenticated `GET /admin/data-provider/psl-fixture-readiness` | PASS (via check 17) | 401 returned as expected |
| Authenticated PSL_ADMIN check | PENDING_ADMIN_TOKEN | Requires PSL_ADMIN JWT — not available in CI |

## Safety Assertions from Smoke

| Assertion | Result |
|-----------|--------|
| PSL not ACTIVATED | PASS (check 9) |
| PSL season exists and is INACTIVE | PASS (check 8) |
| WC 2026 season preserved (ACTIVE) | PASS (check 7) |
| Unauthenticated admin routes return 401 | PASS (check 17) |
| No fixture import occurred | Confirmed (no DB write smoke) |
| No fixture publication occurred | Confirmed (fixtures smoke returns WC fixtures only) |

## Local Validation Gates

| Gate | Result |
|------|--------|
| API tests (2105) | PASS — 90 test files |
| Experience tests (1411) | PASS — 1 test file |
| docs:validate | PASS — 18/18 checks |
| codex:validate | PASS — 0 errors, 0 warnings |

## Conclusion

Sprint 36B (PSL fixture readiness monitoring) is live on beta EC2 at SHA `91dc999`. All standard smoke checks PASS. The readiness endpoint is deployed and RBAC-protected (401 for unauthenticated). The full authenticated readiness check (`PENDING_ADMIN_TOKEN`) is available for owner-run verification via the runbook.

**readinessStatus** expected on next authenticated check: `SOURCE_EMPTY`
**Reason**: PSL 2026/27 Betway Premiership fixture schedule not yet published by psl.co.za (~July/August 2026 expected).
