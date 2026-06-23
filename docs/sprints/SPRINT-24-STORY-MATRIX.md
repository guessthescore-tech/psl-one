# Sprint 24 — Story Matrix

## Sprint Goal

Owner-authorised beta EC2 re-deployment of the Sprint 23 RBAC fix, followed by full authenticated
admin smoke to confirm PSL_ADMIN access on admin endpoints. Close GAP-23-01 and GAP-23-02.

## Stories

| Story | Title | Status |
|-------|-------|--------|
| S24-01 | Beta EC2 re-deployment with Sprint 23 RBAC fix | DONE |
| S24-02 | Temporary PSL_ADMIN user provisioning (sprint24-admin-smoke@psl-one.internal) | DONE |
| S24-03 | Authenticated RBAC smoke — 8 PASS / 0 FAIL | DONE |
| S24-04 | Authenticated parse ingestion smoke — 3 PASS / 0 FAIL | DONE |
| S24-05 | Authenticated fixture publication smoke — 4 PASS / 0 FAIL | DONE |
| S24-06 | Authenticated PSL pre-flight smoke — HTTP 200 confirmed | DONE |
| S24-07 | Authenticated full admin smoke — 6 PASS / 0 FAIL | DONE |
| S24-08 | Temporary admin cleanup — TEMP_ADMIN_DISABLED_VERIFIED | DONE |
| S24-09 | Staging evidence docs | DONE |
| S24-10 | Handover docs | DONE |
| S24-11 | Experience tests | DONE |

## Test Counts

| Suite | Before | After | Delta |
|-------|--------|-------|-------|
| API tests | 1,968 | 1,968 | +0 |
| Experience tests | 884 | 907 | +23 |

## Migration Count

**Sprint 24 migrations added: 0**
Cumulative total: **42**

## New Models / Enums / Routes / Pages

- New models: 0
- New enums: 0
- New API routes: 0
- New web pages: 0
- New staging docs: 5
- New handover docs: 5
- New spec additions: +23 experience tests

## Key Technical Output

| Item | Detail |
|------|--------|
| SHA deployed to EC2 | `c731c494d37bda3679e149f869afb63448091b4f` |
| Deploy workflow run | `28015195029` — all 5 jobs success |
| SSM provision command | `d9cf5f2d-dcf4-4567-9756-377e015d2307` |
| SSM cleanup command | `26d5af5a-2829-4ea6-9797-c6f6cc72d6e8` |
| RBAC smoke | 8 PASS / 0 FAIL |
| Full admin smoke | 6 PASS / 0 FAIL / 1 WARN / 1 SKIP |
| GAP-23-01 | RESOLVED |
| GAP-23-02 | RESOLVED |

## RBAC Fix Verification

| Endpoint | Before (Sprint 22) | After (Sprint 24) |
|----------|--------------------|-------------------|
| GET /admin/data-provider/health | 403 | **200** |
| GET /admin/fixtures/imported | 403 | **200** |
| GET /admin/psl/preflight | 403 | **200** |
| Unauthenticated → admin route | 401 | 401 (unchanged) |

## Platform State

| Item | State |
|------|-------|
| PSL | INACTIVE |
| WC2026 | ACTIVE |
| Wallet | SANDBOX |
| Ingestion | DISABLED |
| Beta EC2 RBAC | FIXED |

## Beta Go/No-Go

**CONDITIONAL_GO**

RBAC fix proven in beta environment. PSL activation remains gated on fixture availability (~July/August 2026).
