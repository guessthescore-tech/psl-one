# Sprint 24 — Owner Review Guide

## What to Review

### 1. Smoke evidence

See:
- `docs/staging/SPRINT-24-AUTHENTICATED-RBAC-SMOKE-RESULTS.md` — full smoke results with before/after comparison
- `docs/staging/SPRINT-24-EC2-RBAC-SMOKE-EXECUTION-LOG.md` — deployment run ID, provisioning command IDs

Key result: PSL_ADMIN now receives HTTP 200 (not 403) on all 3 previously-broken admin endpoints.

### 2. Temp admin cleanup

See `docs/staging/SPRINT-24-TEMP-ADMIN-CLEANUP-EVIDENCE.md`

Confirm:
- TEMP_ADMIN_DISABLED_VERIFIED in SSM output
- SECRETS_DELETED in SSM output
- No JWT or password was printed

### 3. Safety invariants

The following must remain true after Sprint 24:

| Invariant | Check |
|-----------|-------|
| No admin JWT committed | `git log --all -- '*ADMIN_TOKEN*'` returns empty |
| No temp password committed | `git ls-files apps/api/.env` returns empty |
| No provider key in frontend | grep on apps/experience/src returns no key values |
| PSL not activated | `GET /admin/psl/preflight` returns `status: NO_GO` |
| No scheduled ingestion | No `@Cron` in apps/api/src |
| Wallet sandbox | SiliconEnterpriseSandboxWalletAdapter unchanged |

### 4. WRITE_SMOKE not authorised

Write smoke was NOT run. To run fixture publication with a real fixture, provide:
```bash
TEST_FIXTURE_ID=<id>
ALLOW_WRITE_SMOKE=true
```
This requires separate owner authorisation.

## Authorisation Required For Next Steps

| Action | Gate |
|--------|------|
| PSL fixture import write run | Owner authorisation required |
| PSL fixture publication | Owner authorisation required |
| PSL activation | Requires full pre-flight GO + separate owner authorisation |
| Provider key rotation | Owner action (local .env only) |
