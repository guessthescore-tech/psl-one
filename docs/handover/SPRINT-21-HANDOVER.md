# Sprint 21 — Handover

## Sprint Goal

Complete admin token provisioning runbook and run all Sprint 19 manual staging smoke tools against live beta EC2. No PSL activation. No real-money functionality.

## Status

**CONDITIONAL_GO** — Unauthenticated smoke PASS. Authenticated smoke MANUAL_SMOKE_PENDING_ADMIN_TOKEN.

---

## What Was Done

### Admin Token Runbook
Created `docs/staging/SPRINT-21-ADMIN-TOKEN-RUNBOOK.md` covering:
- Method 1: Create temp admin user via bcryptjs + Prisma upsert
- Method 2: Generate JWT directly from JWT_SECRET via SSM
- Safe token presence check (no token value printed)
- Smoke execution commands
- Cleanup (delete temp smoke user)
- Token exposure protocol

### Manual Staging Smoke (EC2 via SSM)

All 5 Sprint 19 smoke tools executed on beta EC2 via SSM Run Command (base64-encoded tools transferred into Docker container on `psl-one-beta` network). EC2 is not reachable externally (security group blocks inbound HTTP) — SSM is the authoritative execution path.

| Tool | Result |
|------|--------|
| `sprint-19-admin-rbac-smoke.mjs` | 5/5 PASS |
| `sprint-19-psl-preflight-smoke.mjs` | PASS (auth-gated) |
| `sprint-19-parse-ingestion-smoke.mjs` | 1/1 PASS + 2 SKIP |
| `sprint-19-fixture-publication-smoke.mjs` | 3/3 PASS + 2 SKIP |
| `sprint-19-admin-smoke.mjs` | 3/3 PASS + 4 SKIP |

### Smoke Result Docs Created
- `docs/staging/SPRINT-21-RBAC-SMOKE-RESULTS.md`
- `docs/staging/SPRINT-21-PSL-PREFLIGHT-SMOKE-RESULTS.md`
- `docs/staging/SPRINT-21-PARSE-INGESTION-SMOKE-RESULTS.md`
- `docs/staging/SPRINT-21-FIXTURE-PUBLICATION-SMOKE-RESULTS.md`
- `docs/staging/SPRINT-21-MANUAL-SMOKE-RESULTS.md`

### Handover Docs Created
- `docs/handover/SPRINT-21-BETA-GO-NOGO.md`
- `docs/handover/SPRINT-21-HANDOVER.md`
- `docs/handover/SPRINT-21-KNOWN-GAPS.md`
- `docs/handover/SPRINT-21-OWNER-REVIEW-GUIDE.md`
- `docs/handover/SPRINT-21-ROLLBACK-PLAN.md`
- `docs/sprints/SPRINT-21-STORY-MATRIX.md`

---

## What Was Not Done

- Authenticated smoke tools not run (require ADMIN_TOKEN from live beta API)
- Write smoke (`ALLOW_WRITE_SMOKE=true`) not enabled — pending owner authorisation
- PSL activation not attempted (intentional)

---

## Platform Constraints Confirmed

- PSL remains **INACTIVE**
- World Cup 2026 is active beta context
- Wallet is **SANDBOX**
- No scheduled ingestion
- No production ingestion
- No real-money functionality
- Fixture publishing is **SEPARATE** from PSL activation

---

## Migration Count

42 (unchanged from Sprint 7). No migrations in Sprint 21.

---

## Test Counts

- API: 1,932 (unchanged)
- Experience: ~840 (Sprint 21 block adds ~26 tests from 814 baseline)
