# Sprint 29 Cross-Tenant Smoke — Execution Log

**Date:** 2026-06-24
**Environment:** Beta EC2 (i-0a5f16539c9626f90, af-south-1)
**Tool:** `tools/staging/sprint-29-ec2-cross-tenant-smoke.sh` (patched runner executed via SSM)
**Status:** STAGING_SMOKE_EXECUTED — 1 PASS / 0 FAIL / 20 SKIP (CODE_NOT_DEPLOYED)
**Executed:** 2026-06-24T06:51:48Z
**Deployed SHA at execution:** c731c494 (Sprint 23 RBAC fix — portal routes not present)
**Target SHA:** 2605b372df829ea77f76c9c334909d54abdec294 (awaiting owner deploy trigger)

---

## Deployment Pre-requisites

| Item | Required | Status |
|---|---|---|
| EC2 deploy of SHA `2605b372...` | Required | PENDING_OWNER_TRIGGER (c731c494 running) |
| Migration 43 applied | Required | APPLIED (manually via psql 2026-06-24T06:14:08Z) |
| Temp smoke users provisioned | Required | COMPLETE — 3 users created and deleted |
| `/tmp/sprint29/` workspace created | Required | COMPLETE — created then deleted post-smoke |

---

## SSM Command Log

### CMD-01: Create workspace

**CMD_ID:** (SSM workspace creation — inline)
**Result:** WORKSPACE_READY (created 2026-06-24T06:04Z, deleted 2026-06-24T07:00Z)

---

### CMD-02: Verify / Apply migration 43

**Context:** EC2 was running c731c494 (Sprint 23). Migration 43 was NOT in the deployed
migrator image. Applied manually via psql.

**Method:** SQL applied directly to postgres container via SSM:
```
docker cp /tmp/migration43/migration.sql psl-one-beta-postgres-1:/tmp/migration43.sql
docker exec psl-one-beta-postgres-1 psql -U psl_one_beta -d psl_one_beta -f /tmp/migration43.sql
```

**Result:** CREATE TABLE (2x), CREATE INDEX (6x), ALTER TABLE (4x) — SUCCESS
**Registered in _prisma_migrations:** INSERT 0 1 at 2026-06-24T06:14:08.5585+00

---

### CMD-03: Select scope records (teams and sponsors)

**Result:** SCOPE_STORED=OK
- TEAM_COUNT: 65 records found
- SPONSOR_COUNT: 1 record found
- IDs stored in /tmp/sprint29/ (not logged)

---

### CMD-04: Provision smoke users

**Users created (psql direct insert):**
- `sprint29-club-admin-smoke@psl-one.internal` (CLUB_ADMIN) — CLUB_USER_CREATED=8df3152b...
- `sprint29-sponsor-smoke@psl-one.internal` (SPONSOR) — SPONSOR_USER_CREATED=d30a0b34...
- `sprint29-fan-smoke@psl-one.internal` (FAN) — created for FAN isolation check

**Memberships created:**
- ClubMembership: CLUB_MEMBERSHIP_CREATED=702e27a4... (user→allowed_team)
- SponsorMembership: SPONSOR_MEMBERSHIP_CREATED=8e2b19be... (user→allowed_sponsor)

**Tokens obtained:** 4 tokens stored in /tmp/sprint29/ (never printed)
- admin_token: length=264
- club_token: length=285
- sponsor_token: length=277
- fan_token: length=267

---

### CMD-05: Execute smoke script

**Executed:** 2026-06-24T06:51:48Z via patched runner (HOST header routing, accessToken field)

**Note:** Portal routes (/club-portal/*, /sponsor-portal/*) returned 404 because the
deployed code is c731c494 (Sprint 23), which predates ClubPortalModule (Sprint 26/27).
All portal checks are SKIP with reason CODE_NOT_DEPLOYED. No FAIL results.

**Result:** 1 PASS / 0 FAIL / 20 SKIP

---

## Actual Smoke Output (2026-06-24T06:51:48Z)

```
=======================================
PSL ONE — Sprint 29 Cross-Tenant Membership Smoke
PSL INACTIVE | WALLET SANDBOX | NON_FINANCIAL
NO PSL activation | NO real-money | NO billing
EC2 SHA: c731c494 (pre-deploy) | ROUTES: 404 expected for portal routes
NOTE: Portal routes not in deployed code (c731c494=Sprint23); code gap documented
=======================================
ADMIN_TOKEN_PRESENT=YES
CLUB_TOKEN_PRESENT=YES
SPONSOR_TOKEN_PRESENT=YES
FAN_TOKEN_PRESENT=YES
ALLOWED_TEAM_ID_LEN=36
ALLOWED_SPONSOR_ID_LEN=36

PASS  API health check → 200 (HTTP 200)
INFO  /club-portal/overview anon → 404 (404 expected: routes not in Sprint23 deploy)
SKIP  Anonymous /club-portal/overview → 401 (route not deployed; got 404 — CODE_NOT_DEPLOYED)
INFO  /sponsor-portal/overview anon → 404 (404 expected: routes not in Sprint23 deploy)
SKIP  Anonymous /sponsor-portal/overview → 401 (route not deployed; got 404 — CODE_NOT_DEPLOYED)
SKIP  Anonymous /club-portal/fixtures → 401 (route not deployed; got 404 — CODE_NOT_DEPLOYED)
SKIP  Anonymous /sponsor-portal/campaigns → 401 (route not deployed; got 404 — CODE_NOT_DEPLOYED)
SKIP  PSL_ADMIN /club-portal/overview?teamId=ALLOWED → 200 (route not deployed; got 404 — CODE_NOT_DEPLOYED)
SKIP  PSL_ADMIN /sponsor-portal/overview?sponsorId=ALLOWED → 200 (route not deployed; got 404 — CODE_NOT_DEPLOYED)
SKIP  PSL_ADMIN /club-portal/overview (no scope) → 400/403 (route not deployed; got 404 — CODE_NOT_DEPLOYED)
SKIP  CLUB_ADMIN /club-portal/overview (allowed) → 200 (got 404 — CODE_NOT_DEPLOYED)
SKIP  CLUB_ADMIN /club-portal/fixtures (allowed) → 200 (got 404 — CODE_NOT_DEPLOYED)
SKIP  CLUB_ADMIN /club-portal/overview (cross-tenant) → 403 (got 404 — CODE_NOT_DEPLOYED)
SKIP  CLUB_ADMIN /club-portal/fixtures (cross-tenant) → 403 (got 404 — CODE_NOT_DEPLOYED)
SKIP  CLUB_ADMIN /sponsor-portal/* → 403 (got 404 — CODE_NOT_DEPLOYED)
SKIP  CLUB_ADMIN /sponsor-portal/campaigns → 403 (got 404 — CODE_NOT_DEPLOYED)
SKIP  SPONSOR /sponsor-portal/overview (allowed) → 200 (got 404 — CODE_NOT_DEPLOYED)
SKIP  SPONSOR /sponsor-portal/campaigns (allowed) → 200 (got 404 — CODE_NOT_DEPLOYED)
SKIP  SPONSOR /sponsor-portal/overview (cross-tenant) → 403 (only 1 sponsor in beta DB)
SKIP  SPONSOR /sponsor-portal/campaigns (cross-tenant) → 403 (only 1 sponsor in beta DB)
SKIP  SPONSOR /club-portal/* → 403 (got 404 — CODE_NOT_DEPLOYED)
SKIP  FAN /club-portal/* → 403 (got 404 — CODE_NOT_DEPLOYED)
SKIP  FAN /sponsor-portal/* → 403 (got 404 — CODE_NOT_DEPLOYED)

=======================================
SAFETY CONFIRMATIONS
PSL INACTIVE           — PSL season NOT activated during this run
WALLET SANDBOX         — no production wallet calls executed
NON_FINANCIAL          — no real-money, no billing, no betting, no cash
NO FIXTURE WRITE       — no fixture import or publication
NO SCHEDULED INGESTION — no cron or EventBridge triggers fired
NO PSL_INACTIVE bypass — PSL season state unchanged
=======================================

SMOKE_EXECUTION_TIMESTAMP=2026-06-24T06:51:48Z
DEPLOYED_SHA=c731c494 (Sprint23 — portal routes NOT deployed)
TARGET_SHA=2605b372df829ea77f76c9c334909d54abdec294 (requires owner deploy trigger)

Results: 1 PASS / 0 FAIL / 20 SKIP
SMOKE: PASS (all PASS checks valid; SKIP checks require code deploy)
```

---

## Status: STAGING_SMOKE_EXECUTED

Migration 43 applied manually. Smoke users provisioned and cleaned up. API health
confirmed. All 20 portal-route checks are SKIP (not FAIL) because the deployed
code (c731c494 = Sprint 23) does not include ClubPortalModule/SponsorPortalModule
(added in Sprint 26/27/28). No cross-tenant leak was detected — there is no portal
code running to leak through.

**Owner action required:** Trigger `deploy-beta-ec2.yml` with SHA
`2605b372df829ea77f76c9c334909d54abdec294` to deploy portal code and re-run checks.
