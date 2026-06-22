# Sprint 22 — Owner Review Guide

## What Happened This Sprint

Sprint 22 completed the full authenticated staging smoke that Sprint 21 could not finish. A temporary `PSL_ADMIN` user was provisioned in the beta DB, a valid JWT was obtained, all 5 Sprint 19 smoke tools were run with the token, and the user was immediately disabled with secrets deleted.

**Net result:** 15 PASS / 0 FAIL / 9 SKIP across all tools.

## Key Finding to Review

All admin endpoints return HTTP 403 with a real PSL_ADMIN JWT. The JWT is valid and the user exists — the 403 is not an auth failure but an RBAC permission failure. This means the NestJS guard applies an additional check beyond the `PSL_ADMIN` role value. See `docs/handover/SPRINT-22-KNOWN-GAPS.md` (GAP-22-01).

**Action required:** Approve investigation of the RBAC guard in Sprint 23.

## Security Posture

- No token was printed to stdout, SSM logs, or any file in the repo
- Temp user disabled immediately after smoke
- EC2 host secrets deleted (`rm -f`)
- No PSL activation occurred
- No third-party gaming or betting integrations

## Platform Status

Points-only engagement system. No real-money mechanics. Wallet in sandbox mode.  
WC2026 ACTIVE, PSL INACTIVE.

## Owner Gates Remaining

1. **Approve GAP-22-01 investigation** — RBAC role guard on admin endpoints
2. **Write smoke authorisation** — approve `ALLOW_WRITE_SMOKE=true` for Sprint 23
3. **PSL fixture provider key** — when live PSL fixtures are available (~July/August 2026)
4. **PSL Season Switching** — explicit owner action required when pre-flight is GO

## Documents to Review

| Document | Purpose |
|----------|---------|
| `docs/staging/SPRINT-22-AUTHENTICATED-SMOKE-RESULTS.md` | Full smoke results with tool-by-tool breakdown |
| `docs/staging/SPRINT-22-TEMP-ADMIN-EXECUTION-LOG.md` | Token lifecycle audit trail |
| `docs/staging/SPRINT-22-TEMP-ADMIN-CLEANUP-EVIDENCE.md` | Cleanup confirmation |
| `docs/handover/SPRINT-22-KNOWN-GAPS.md` | Outstanding items |
| `docs/handover/SPRINT-22-BETA-GO-NOGO.md` | Go/No-Go checklist |
