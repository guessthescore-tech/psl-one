# Sprint 21 — Known Gaps

## Gap 1: Authenticated Smoke Requires Real DB User (Method 1)

**Status:** MANUAL_SMOKE_PENDING_ADMIN_TOKEN (full authenticated paths)

The write smoke confirmed that the API validates JWT user existence in DB (HTTP 403 for non-DB user, not 401). This means:
- **Method 2** (JWT from JWT_SECRET) is insufficient for authenticated admin routes — RBAC checks that the user record exists in DB
- **Method 1** (create temp user via Prisma + bcryptjs + login) is required for full authenticated smoke

To resolve, follow `docs/staging/SPRINT-21-ADMIN-TOKEN-RUNBOOK.md` Method 1. The RBAC correctly enforcing 403 (not just 401) is a security positive — it means the JWT cannot be forged to bypass user validation.

**What is confirmed:**
- All admin endpoints reject unauthenticated requests (HTTP 401)
- All admin endpoints reject JWT-authenticated requests with no DB user (HTTP 403)
- RBAC is working correctly at both JWT validation and user-existence layers

---

## Gap 2: Write Smoke Disabled by Default

**Status:** By design — owner gate required

All Sprint 19 smoke tools default to `ALLOW_WRITE_SMOKE=false`. Fixture publication writes require:
1. Owner authorisation of `ALLOW_WRITE_SMOKE=true`
2. Selection of a `TEST_FIXTURE_ID` in the beta DB
3. Running: `ALLOW_WRITE_SMOKE=true node tools/staging/sprint-19-fixture-publication-smoke.mjs`

Note: fixture publication does NOT activate PSL.

---

## Gap 3: PSL Fixtures Unavailable Until ~July/August 2026

**Status:** External dependency — non-blocking

Parse PSL (psl.co.za) has not published the 2026/27 fixture schedule. Authenticated ingestion dry-run would return `sourceEmpty: true` (WARN, not FAIL).

---

## Gap 4: EC2 Not Reachable Externally

**Status:** By design — security group

The beta EC2 security group blocks inbound HTTP from external IPs. API is accessible only:
- Internally via Docker network (`http://api:4000`)
- Via SSM Run Command on the EC2 host

This is the expected security posture for beta staging.

---

## Gap 5: No Automated Staging Smoke in CI

**Status:** Deferred

Sprint 19–21 smoke tools are manual-only. Full CI integration with staging smoke is a future sprint item.
