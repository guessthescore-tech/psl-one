# Sprint 24 — Handover

## Sprint Goal

Re-deploy the Sprint 23 RBAC fix to beta EC2 and prove via authenticated smoke that PSL_ADMIN
can now access admin endpoints. Close GAP-23-01 and GAP-23-02.

## Delivered

| Item | Status |
|------|--------|
| Beta EC2 re-deployment (SHA c731c494) | DONE |
| Temporary admin provisioning | DONE |
| Authenticated RBAC smoke — 8 PASS / 0 FAIL | DONE |
| Authenticated full admin smoke — 6 PASS / 0 FAIL | DONE |
| Authenticated parse ingestion smoke — 3 PASS / 0 FAIL | DONE |
| Authenticated fixture publication smoke — 4 PASS / 0 FAIL | DONE |
| PSL pre-flight accessible — HTTP 200 (was 403) | DONE |
| Temporary admin cleanup | DONE — TEMP_ADMIN_DISABLED_VERIFIED |
| Secrets deleted | DONE — SECRETS_DELETED |
| 5 staging evidence docs | DONE |
| 5 handover docs | DONE |
| Sprint 24 story matrix | DONE |
| Experience tests updated | DONE |
| All gates passing | DONE |

## Key Outcome

The RBAC fix from Sprint 23 is now proven in production-like beta environment.
PSL_ADMIN users can access all 3 previously-broken admin endpoints:
- `GET /admin/data-provider/health` — now 200
- `GET /admin/fixtures/imported` — now 200
- `GET /admin/psl/preflight` — now 200

## Test Counts at Handover

| Suite | Count |
|-------|-------|
| API tests | 1,968 (unchanged) |
| Experience tests | 907 (+23 from 884) |
| Total migrations | 42 (unchanged) |

## Platform State at Handover

- **Beta EC2:** RBAC fix deployed — PSL_ADMIN access confirmed
- **PSL:** INACTIVE
- **WC2026:** ACTIVE
- **Wallet:** SANDBOX
- **Ingestion:** DISABLED (manual only)

## Gaps Remaining

| Gap | Description |
|-----|-------------|
| GAP-23-03 | PSL fixtures expected ~July/August 2026 |
| GAP-23-04 | Provider key rotation recommended if keys were shared |

## Next Sprint (Sprint 25) Recommended Focus

1. Monitor Parse.bot / psl.co.za for 2026/27 PSL fixture schedule publication
2. When fixtures appear, run parse ingestion dry-run to confirm candidate list
3. Owner review and approval of fixture import write run
4. Owner review and approval of fixture publication
