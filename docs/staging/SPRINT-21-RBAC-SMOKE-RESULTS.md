# Sprint 21 — RBAC Smoke Results

## Tool

`tools/staging/sprint-19-admin-rbac-smoke.mjs`

## Execution Method

Base64-encoded tool transferred to EC2 via SSM Run Command, then executed inside `psl-one-beta` Docker network.

## Execution Context

- **EC2 instance:** `i-0a5f16539c9626f90`
- **Docker network:** `psl-one-beta`
- **BASE_URL:** `http://api:4000`
- **DRY_RUN_ONLY:** `true`
- **ALLOW_WRITE_SMOKE:** `false`
- **ADMIN_TOKEN present:** false
- **SSM Command ID:** `44d008c7-4061-4af2-bebc-738fa33b025f` (first command batch)

## Unauthenticated Results

| Check | Endpoint | HTTP Status | Result |
|-------|----------|-------------|--------|
| Admin RBAC — fixture import list | `GET /admin/fixtures/imported` | 401 | PASS |
| Admin RBAC — PSL preflight | `GET /admin/psl/preflight` | 401 | PASS |
| Admin RBAC — data provider health | `GET /admin/data-provider/health` | 401 | PASS |
| Admin RBAC — publish no-auth | `POST /admin/fixtures/publish` (no auth) | 401 | PASS |
| Admin RBAC — publish no confirmPublication | `POST /admin/fixtures/publish` (no confirmPublication) | 401 | PASS |

**PASS: 5 | FAIL: 0 | WARN: 0 | SKIP: 0**

## Authenticated Results

**Status:** `MANUAL_SMOKE_PENDING_ADMIN_TOKEN`

Seed admin (`seed-admin@psl-one.internal`) has a placeholder password hash. No admin JWT was available. Authenticated smoke paths were not executed.

See `docs/staging/SPRINT-21-ADMIN-TOKEN-RUNBOOK.md` for token acquisition procedure.

---

## Safety Guarantees

- PSL NOT activated — RBAC smoke is read-only
- No real-money functionality
- No provider keys printed
- No DB writes by this tool
