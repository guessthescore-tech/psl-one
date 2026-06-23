# Sprint 24 — Authenticated RBAC Smoke Results

## Context

Sprint 22 provisioned a temp PSL_ADMIN user on beta EC2 and ran the Sprint 19 admin smoke tools.
15 checks PASS, 0 FAIL, 9 SKIP — but all admin-endpoint checks returned 403 for PSL_ADMIN.
Sprint 23 identified the root cause (`@Roles('ADMIN')` not a valid UserRole) and fixed it.
Sprint 24 re-deployed the fix and re-ran the same smoke suite.

## Target

- Instance: `i-0a5f16539c9626f90`
- SHA deployed: `c731c494d37bda3679e149f869afb63448091b4f`
- ALLOW_WRITE_SMOKE: `false`
- DRY_RUN_ONLY: `true`

## Tools Run

| Tool | Path |
|------|------|
| RBAC smoke | `tools/staging/sprint-19-admin-rbac-smoke.mjs` |
| Parse ingestion smoke | `tools/staging/sprint-19-parse-ingestion-smoke.mjs` |
| Fixture publication smoke | `tools/staging/sprint-19-fixture-publication-smoke.mjs` |
| PSL pre-flight smoke | `tools/staging/sprint-19-psl-preflight-smoke.mjs` |
| Admin full smoke | `tools/staging/sprint-19-admin-smoke.mjs` |

## Results

All 5 smoke tools run on 2026-06-23.

### RBAC Smoke (`sprint-19-admin-rbac-smoke.mjs`)
SSM Command ID: `f6e061d8-f7cd-41d9-a2f1-49fca8f15078`

| Check | Result |
|-------|--------|
| No-auth: /admin/fixtures/imported | PASS — HTTP 401 |
| No-auth: /admin/psl/preflight | PASS — HTTP 401 |
| No-auth: /admin/data-provider/health | PASS — HTTP 401 |
| PSL_ADMIN: /admin/fixtures/imported | PASS — HTTP 200 ✓ (was 403) |
| PSL_ADMIN: /admin/psl/preflight | PASS — HTTP 200 ✓ (was 403) |
| PSL_ADMIN: /admin/data-provider/health | PASS — HTTP 200 ✓ (was 403) |
| No-auth POST /admin/fixtures/publish | PASS — HTTP 401 |
| POST /admin/fixtures/publish (no confirmPublication) | PASS — HTTP 400 |
| **Total** | **8 PASS / 0 FAIL** |

### Parse Ingestion Smoke (`sprint-19-parse-ingestion-smoke.mjs`)
SSM Command ID: `ed934beb-6c72-4d56-a538-db65847a2d8a`

| Check | Result |
|-------|--------|
| POST .../ingest dryRun=true | PASS — HTTP 201 |
| dryRun flag confirmed | PASS — response.dryRun=true |
| Write ingestion smoke | SKIP — ALLOW_WRITE_SMOKE=false |
| Write smoke guard | PASS |
| **Total** | **3 PASS / 0 FAIL / 1 SKIP** |

### Fixture Publication Smoke (`sprint-19-fixture-publication-smoke.mjs`)
SSM Command ID: `ed934beb-6c72-4d56-a538-db65847a2d8a`

| Check | Result |
|-------|--------|
| GET /admin/fixtures/imported | PASS — HTTP 200 |
| Empty fixture list | WARN — zero fixtures (expected until ~July/August 2026) |
| Missing confirmPublication rejected | PASS — HTTP 400 |
| Empty fixtureIds rejected | PASS — HTTP 400 |
| Publish write smoke | SKIP — ALLOW_WRITE_SMOKE=false |
| Write smoke guard | PASS |
| **Total** | **4 PASS / 0 FAIL / 1 WARN / 1 SKIP** |

### PSL Pre-Flight Smoke (`sprint-19-psl-preflight-smoke.mjs`)

| Check | Result |
|-------|--------|
| GET /admin/psl/preflight | PASS — HTTP 200 ✓ (was 403) |
| Overall pre-flight status | NO_GO — 1 blocker: "No PSL season found in the database" |
| Note | NO_GO is expected — PSL is intentionally INACTIVE |

### Admin Full Smoke (`sprint-19-admin-smoke.mjs`)
SSM Command ID: `4c64bea7-e503-4c43-9ac5-fba4149ea406`

| Check | Result |
|-------|--------|
| GET /health | PASS — HTTP 200 |
| GET /admin/data-provider/health | PASS — HTTP 200 ✓ (was 403) |
| POST parse-psl/fixtures/ingest (dryRun=true) | PASS — HTTP 201 |
| GET /admin/fixtures/imported | PASS — HTTP 200 ✓ (was 403) |
| Fixture count | WARN — zero (expected until ~July/August 2026) |
| POST /admin/fixtures/publish | SKIP — ALLOW_WRITE_SMOKE=false |
| Publication guard (no confirmPublication) | PASS — HTTP 400 |
| GET /admin/psl/preflight | PASS — HTTP 200 ✓ (was 403) |
| Pre-flight status | NO_GO — expected (PSL INACTIVE) |
| Exit code | 0 |
| **Total** | **6 PASS / 0 FAIL / 1 WARN / 1 SKIP** |

## Actual Outcomes vs Sprint 22

| Endpoint | Sprint 22 Result | Sprint 24 Result | Change |
|----------|-----------------|-----------------|--------|
| Unauthenticated admin request | 401 | 401 | Unchanged ✓ |
| PSL_ADMIN → GET /health | 200 | 200 | Unchanged ✓ |
| PSL_ADMIN → GET /admin/data-provider/health | 403 (bug) | 200 | FIXED ✓ |
| PSL_ADMIN → GET /admin/fixtures/imported | 403 (bug) | 200 | FIXED ✓ |
| PSL_ADMIN → GET /admin/psl/preflight | 403 (bug) | 200 | FIXED ✓ |
| Parse ingestion dry-run | SKIP (403) | HTTP 201 | FIXED ✓ |
| Fixture publication write | SKIP (ALLOW_WRITE_SMOKE=false) | SKIP | Unchanged ✓ |

## Safety Properties

- ADMIN_TOKEN: PRESENT_REDACTED (never printed)
- No fixture write occurred
- No fixture publication occurred
- No PSL activation occurred
- No scheduled ingestion enabled
- No production ingestion enabled
- No real-money functionality
- Wallet: SANDBOX
