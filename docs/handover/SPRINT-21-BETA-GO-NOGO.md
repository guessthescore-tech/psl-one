# Sprint 21 — Beta Go/No-Go

## Summary

Sprint 21 completes the admin token provisioning runbook and manual staging smoke for Sprint 19 smoke tools. All unauthenticated paths PASS. Authenticated paths are `MANUAL_SMOKE_PENDING_ADMIN_TOKEN`.

---

## Go Criteria

| Criterion | Status |
|-----------|--------|
| Admin token runbook documented | GO |
| RBAC smoke — all admin endpoints return 401 without auth | GO (5/5 PASS) |
| Ingestion smoke — write guard active | GO |
| Publication smoke — input validation guards active | GO (3/3 PASS) |
| Admin smoke — /health PASS | GO |
| Pre-flight smoke — auth-gated PASS | GO |
| No PSL activation | GO |
| No real-money functionality | GO |
| No provider keys printed | GO |
| Wallet sandbox-only | GO |
| No scheduled ingestion | GO |
| Migration count unchanged (42) | GO |

---

## No-Go Criteria

Any of the following would be a NO-GO:

- Admin endpoint returns 200 without a token
- Smoke tool outputs a provider key or admin JWT value
- PSL activation occurs during smoke
- Any unauthenticated write succeeds
- Smoke detects 5xx on health endpoint

---

## Overall Status

**CONDITIONAL_GO** — All unauthenticated smoke PASS. Authenticated paths pending ADMIN_TOKEN acquisition. EC2 is deployed and operational. Beta is ready for controlled tester access with read-only restrictions.

---

## Remaining Owner Gates

1. Obtain admin JWT and complete authenticated smoke (see `SPRINT-21-ADMIN-TOKEN-RUNBOOK.md`)
2. Decide whether to enable write smoke (`ALLOW_WRITE_SMOKE=true`) for fixture publication test
3. PSL fixtures not yet available (~July/August 2026) — source-empty expected on ingestion
4. PSL activation gated on fixture import/publication + explicit Season Switching instruction

---

## Platform Safety Reminders

- PSL remains **INACTIVE**
- Wallet remains **SANDBOX**
- Fixture publishing is **SEPARATE** from PSL activation
- No scheduled ingestion is active
- No production ingestion is active
