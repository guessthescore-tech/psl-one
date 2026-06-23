# Sprint 24 — Known Gaps

## Resolved in Sprint 24

| Gap | Resolution |
|-----|-----------|
| GAP-23-01 | RESOLVED — RBAC fix deployed to beta EC2 |
| GAP-23-02 | RESOLVED — authenticated smoke confirms PSL_ADMIN gets 200 on admin endpoints |

## Still Open

| Gap | Description | Priority |
|-----|-------------|----------|
| GAP-23-03 | PSL 2026/27 fixtures not yet available on psl.co.za (~July/August 2026) | LOW — time-gated |
| GAP-23-04 | Provider keys in `apps/api/.env` — rotation recommended if shared outside local dev | LOW |

## New Observations from Sprint 24 Smoke

| Observation | Status |
|-------------|--------|
| Parse ingestion returns dryRun=true dry-run response — source is SOURCE_EMPTY (no fixtures yet) | Expected |
| Fixture list is empty (zero imported fixtures) | Expected — no ingestion has run |
| PSL pre-flight returns NO_GO with blocker "No PSL season found in the database" | Expected — PSL is INACTIVE by design |
| ALLOW_WRITE_SMOKE=false enforced — no fixture writes or publications | Confirmed |

## Not Gaps

- FAN users return 403 on admin routes — correct RBAC behaviour
- Unauthenticated users return 401 — correct guard behaviour
- PSL is INACTIVE — intentional until fixture season is ready
