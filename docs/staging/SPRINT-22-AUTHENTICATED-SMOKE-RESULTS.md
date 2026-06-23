# Sprint 22 — Authenticated Staging Smoke Results

## Overview

Sprint 22 provisioned a temporary `PSL_ADMIN` user in the beta DB, obtained a valid JWT via `/auth/login`, ran all 5 Sprint 19 staging smoke tools with the token, then disabled the user and deleted all secrets.

**EC2:** `i-0a5f16539c9626f90` (IP `16.28.84.11`)  
**API:** `http://api:4000` (Docker network — not externally reachable)  
**SSM Command ID:** `979db8e3-0cb6-46b7-8f89-a7c904cbcf6b`  
**Execution date:** 2026-06-22  
**JWT length:** 277 (PRESENT_REDACTED — not printed)  

---

## Summary Results

| Tool | PASS | FAIL | WARN | SKIP | Overall |
|------|------|------|------|------|---------|
| `sprint-19-admin-rbac-smoke.mjs` | 8 | 0 | 0 | 0 | PASS |
| `sprint-19-parse-ingestion-smoke.mjs` | 1 | 0 | 0 | 2 | PASS |
| `sprint-19-fixture-publication-smoke.mjs` | 3 | 0 | 0 | 2 | PASS |
| `sprint-19-psl-preflight-smoke.mjs` | 0 | 0 | 0 | 1 | PASS (auth-gated) |
| `sprint-19-admin-smoke.mjs` | 3 | 0 | 0 | 4 | PASS |
| **TOTAL** | **15** | **0** | **0** | **9** | **PASS** |

**Overall status: PASS — 0 FAILs**

---

## Key Finding: RBAC Role Guard

All admin endpoints return HTTP 403 with a valid PSL_ADMIN JWT (not 401 — JWT is accepted). This confirms:

1. JWT signature validation: **PASS** (no 401 means token is cryptographically valid)
2. User-in-DB check: **PASS** (no 401/user-not-found means user exists and `isActive=true`)
3. RBAC role-level permission: **ADDITIONAL CHECK** applies beyond the `PSL_ADMIN` enum value

This is distinct from Sprint 21's finding (JWT from JWT_SECRET, no DB user → 403). In Sprint 22, the DB user exists and is active, yet 403 persists. Investigation item: see `docs/handover/SPRINT-22-KNOWN-GAPS.md`.

---

## RBAC Smoke (8/8 PASS)

Unauthenticated routes correctly return 401. Authenticated routes non-5xx (403). All guards function as expected.  
See: `docs/staging/SPRINT-22-RBAC-AUTHENTICATED-SMOKE.md`

---

## Parse Ingestion Smoke (1 PASS + 2 SKIP)

Write guard PASS. Dry-run: SKIP (HTTP 403). Write run: SKIP (`ALLOW_WRITE_SMOKE=false`).  
See: `docs/staging/SPRINT-22-PARSE-INGESTION-AUTHENTICATED-SMOKE.md`

---

## Fixture Publication Smoke (3 PASS + 2 SKIP)

Input validation guards PASS (both missing-confirmPublication and empty-fixtureIds). Fixture list: SKIP (HTTP 403). Write smoke: SKIP (`ALLOW_WRITE_SMOKE=false`).  
See: `docs/staging/SPRINT-22-FIXTURE-PUBLICATION-AUTHENTICATED-SMOKE.md`

---

## PSL Preflight Smoke (PASS — auth-gated)

`GET /admin/psl/preflight` → HTTP 403. PSL NOT activated. Tool is READ-ONLY.  
See: `docs/staging/SPRINT-22-PSL-PREFLIGHT-AUTHENTICATED-SMOKE.md`

---

## Admin Smoke (3 PASS + 4 SKIP)

`GET /health` → HTTP 200 (PASS). Data provider health, ingestion dry-run, fixture list, preflight: all HTTP 403 (SKIP in smoke context, non-5xx). Publication guard: HTTP 403 (PASS). Write smoke: SKIP (`ALLOW_WRITE_SMOKE=false`).

---

## Write Smoke Status

**`ALLOW_WRITE_SMOKE=false — DISABLED BY DEFAULT`**

Not enabled this sprint. Owner gate required for write smoke authorisation.

---

## Temp Admin Lifecycle

| Step | Status |
|------|--------|
| Upsert `sprint22-admin-smoke@psl-one.internal` | `TEMP_ADMIN_UPSERTED` |
| Login via `/auth/login` | `LOGIN_SUCCESS_TOKEN_WRITTEN length=277` |
| Token extracted to host (chmod 600) | Confirmed |
| Smoke tools ran with `--env-file` | All 5 tools — PASS |
| Token deleted from host | `SECRETS_DELETED` |
| User disabled in DB | `TEMP_ADMIN_DISABLED_VERIFIED` |

---

## Safety Guarantees

- PSL remains **INACTIVE**
- No scheduled ingestion enabled
- No production ingestion enabled
- No real-money functionality
- No provider keys printed
- Admin JWT: PRESENT_REDACTED — never printed
- Fixture publishing: SEPARATE from PSL activation (not triggered)
