# Sprint 22 — Beta Go/No-Go

## Status: CONDITIONAL_GO

## Sprint 22 Gate Checks

| Gate | Result |
|------|--------|
| Temp admin provisioned without printing token | PASS |
| JWT obtained and verified (length=277) | PASS |
| All 5 smoke tools ran with 0 FAILs | PASS |
| Temp admin disabled after smoke | PASS (`TEMP_ADMIN_DISABLED_VERIFIED`) |
| Secrets deleted from EC2 host | PASS (`SECRETS_DELETED`) |
| PSL NOT activated | PASS |
| No scheduled ingestion enabled | PASS |
| No production ingestion enabled | PASS |
| No real-money functionality | PASS |
| ALLOW_WRITE_SMOKE=false enforced | PASS |
| No admin JWT printed to stdout or logs | PASS |
| API health check | PASS (HTTP 200) |

## Outstanding Conditions

1. **GAP-22-01:** PSL_ADMIN role returns HTTP 403 on admin endpoints — investigate RBAC guard in Sprint 23 (see `docs/handover/SPRINT-22-KNOWN-GAPS.md`)
2. **Write smoke not authorised** — requires separate owner gate before enabling `ALLOW_WRITE_SMOKE=true`
3. **PSL fixtures unavailable** — ~July/August 2026; ingestion dry-run will return `sourceEmpty: true` until then
4. **PSL NOT activated** — requires separate owner-authorised Season Switching action

## What Is Working

- Beta EC2 instance online, healthy
- API container serving HTTP 200 on `/health`
- RBAC guards enforcing 401 for unauthenticated requests
- JWT issuance and validation pipeline operational
- Temp admin provisioning + cleanup lifecycle complete
- All staging smoke tools functional

## What Requires Owner Action Before Next Milestone

- Investigate and resolve `PSL_ADMIN` role 403 on admin endpoints (GAP-22-01)
- Authorise write smoke (`ALLOW_WRITE_SMOKE=true`) gate
- Provider key for PSL live data when fixtures are available
- PSL Season Switching when activation conditions are met

## Platform Status

- Points-only system — no real-money functionality
- WC2026 season ACTIVE, PSL INACTIVE
- Wallet: sandbox mode only
- Prediction system: settlement available, no live data feed active
