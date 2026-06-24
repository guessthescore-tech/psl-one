# Sprint 29 Cross-Tenant Smoke — Execution Log

**Date:** 2026-06-24
**Environment:** Beta EC2 (i-0a5f16539c9626f90, af-south-1)
**Tool:** `tools/staging/sprint-29-ec2-cross-tenant-smoke.sh` (BASE_URL adapted to direct API IP, executed via SSM)
**Status:** SMOKE_PASS — 21 PASS / 0 FAIL / 0 SKIP
**Deploy run:** 28082159537 (workflow: deploy-beta-ec2.yml)
**Deployed SHA:** 2605b372df829ea77f76c9c334909d54abdec294 (confirmed on EC2)
**Second run executed:** 2026-06-24T07:51:48Z (post-deploy)
**First run (pre-deploy):** 2026-06-24T06:51:48Z — 1 PASS / 0 FAIL / 20 SKIP (CODE_NOT_DEPLOYED)

---

## Deployment Pre-requisites

| Item | Required | Status |
|---|---|---|
| EC2 deploy of SHA `2605b372...` | Required | COMPLETE — run 28082159537, all 4 jobs SUCCESS |
| Migration 43 applied | Required | APPLIED — tables `club_memberships` + `sponsor_memberships` confirmed |
| Temp smoke users provisioned | Required | COMPLETE — 4 users created and deleted |
| `/tmp/sprint29/` workspace created | Required | COMPLETE — created then deleted post-smoke |

---

## SSM Command Log

### CMD-01: Create workspace

**Result:** WORKSPACE_READY

---

### CMD-02: Verify migration 43

**Context:** Migration 43 was applied manually (psql) before deploy run. Deploy workflow
ran `prisma migrate deploy` as part of run 28082159537 — both `club_memberships` and
`sponsor_memberships` tables confirmed present via `pg_tables` query.

**Result:**
```
      tablename
---------------------
 club_memberships
 sponsor_memberships
(2 rows)
```

---

### CMD-03: Deploy workflow (run 28082159537)

**Triggered:** 2026-06-24T07:21:13Z via `gh workflow run deploy-beta-ec2.yml`
**SHA:** 2605b372df829ea77f76c9c334909d54abdec294
**Jobs:** Validate SHA (7s SUCCESS) → Build and push images (7m16s SUCCESS) → Deploy to EC2 (SUCCESS) → Smoke test (1m14s SUCCESS) → Release manifest (SUCCESS)
**Migration:** `run_migrations=true` — prisma migrate deploy ran in EC2 deploy job
**Containers after deploy:**
```
NAMES                     IMAGE                                                                                                     STATUS
psl-one-beta-caddy-1      caddy:2.9.1-alpine                                                                                       Up About a minute
psl-one-beta-web-1        ...psl-one-beta-web:2605b372df829ea77f76c9c334909d54abdec294                                             Up About a minute (healthy)
psl-one-beta-api-1        ...psl-one-beta-api:2605b372df829ea77f76c9c334909d54abdec294                                             Up 2 minutes (healthy)
psl-one-beta-postgres-1   postgres:16-alpine                                                                                       Up 7 days (healthy)
```

---

### CMD-04: Select scope records (teams and sponsors)

**Result:** SCOPE_STORED=OK
- TEAM_COUNT: 3 records selected (allowed_team_id, forbidden_team_id stored)
- SPONSOR_COUNT: 1 existing sponsor ("Demo Sponsor") — stored as allowed_sponsor_id
- Smoke-only second sponsor created (slug: `sprint29-smoke-sponsor`) — stored as forbidden_sponsor_id

---

### CMD-05: Provision smoke users

**Users created (Prisma via docker exec + explicit bcrypt path):**
- `sprint29-club-admin-smoke@psl-one.internal` (CLUB_ADMIN) — CLUB_USER=e130819b... prefix (truncated)
- `sprint29-sponsor-smoke@psl-one.internal` (SPONSOR) — SPONSOR_USER created
- `sprint29-fan-smoke@psl-one.internal` (FAN) — FAN_USER created
- `sprint29-psl-admin-smoke@psl-one.internal` (PSL_ADMIN) — ADMIN_USER created

**Memberships created:**
- ClubMembership: club_mem_id=4bc790c9... (club_admin→allowed_team)
- SponsorMembership: sponsor_mem_id=1ccce8cd... (sponsor_user→allowed_sponsor)

**Tokens obtained:** 4 tokens stored in /tmp/sprint29/ (never printed)
- admin_token: length=283
- club_token: length=285
- sponsor_token: length=277
- fan_token: length=267

---

### CMD-06: Execute smoke script (2026-06-24T07:51:48Z)

**BASE_URL:** http://172.18.0.3:4000 (direct API container IP — Caddy on port 80 requires Host header)
**Executed:** 2026-06-24T07:51:48Z via SSM bash /tmp/sprint29/cross-tenant-smoke.sh

**Result: 21 PASS / 0 FAIL / 0 SKIP — SMOKE: PASS**

---

## Actual Smoke Output (2026-06-24T07:51:48Z)

```
=======================================
PSL ONE — Sprint 29 Cross-Tenant Membership Smoke
PSL INACTIVE | WALLET SANDBOX | NON_FINANCIAL
NO PSL activation | NO real-money | NO billing
=======================================
PASS  API health check → 200 (HTTP 200)
PASS  Anonymous /club-portal/overview → 401 (HTTP 401)
PASS  Anonymous /sponsor-portal/overview → 401 (HTTP 401)
PASS  Anonymous /club-portal/fixtures → 401 (HTTP 401)
PASS  Anonymous /sponsor-portal/campaigns → 401 (HTTP 401)
PASS  PSL_ADMIN /club-portal/overview?teamId=ALLOWED → 200 (HTTP 200)
PASS  PSL_ADMIN /sponsor-portal/overview?sponsorId=ALLOWED → 200 (HTTP 200)
PASS  PSL_ADMIN /club-portal/overview (no teamId) → 400/403 (HTTP 400)
PASS  CLUB_ADMIN /club-portal/overview (allowed team) → 200 (HTTP 200)
PASS  CLUB_ADMIN /club-portal/fixtures (allowed team) → 200 (HTTP 200)
PASS  CLUB_ADMIN /club-portal/overview (cross-tenant/forbidden) → 403 (HTTP 403)
PASS  CLUB_ADMIN /club-portal/fixtures (cross-tenant/forbidden) → 403 (HTTP 403)
PASS  CLUB_ADMIN /sponsor-portal/* → 403 (role isolation) (HTTP 403)
PASS  CLUB_ADMIN /sponsor-portal/campaigns → 403 (HTTP 403)
PASS  SPONSOR /sponsor-portal/overview (allowed sponsor) → 200 (HTTP 200)
PASS  SPONSOR /sponsor-portal/campaigns (allowed sponsor) → 200 (HTTP 200)
PASS  SPONSOR /sponsor-portal/overview (cross-tenant/forbidden) → 403 (HTTP 403)
PASS  SPONSOR /sponsor-portal/campaigns (cross-tenant/forbidden) → 403 (HTTP 403)
PASS  SPONSOR /club-portal/* → 403 (role isolation) (HTTP 403)
PASS  FAN /club-portal/* → 403 (HTTP 403)
PASS  FAN /sponsor-portal/* → 403 (HTTP 403)

CROSS_CLUB_ACCESS_DENIED:   enforced by PortalScopeService (403 on forbidden teamId)
CROSS_SPONSOR_ACCESS_DENIED: enforced by PortalScopeService (403 on forbidden sponsorId)

=======================================
SAFETY CONFIRMATIONS
PSL INACTIVE           — PSL season NOT activated during this run
WALLET SANDBOX         — no production wallet calls executed
NON_FINANCIAL          — no real-money, no billing, no betting, no cash
NO FIXTURE WRITE       — no fixture import or publication
NO SCHEDULED INGESTION — no cron or EventBridge triggers fired
NO PSL_INACTIVE bypass — PSL season state unchanged
=======================================

Results: 21 PASS / 0 FAIL / 0 SKIP
SMOKE: PASS
```

---

### CMD-07: Cleanup

**SSM cleanup command:** Deleted 4 users, 1 smoke sponsor.
**Verification:** SMOKE_USER_COUNT=0, SMOKE_SPONSOR_COUNT=0, TMP_DELETED

```
USERS_DELETED=4
SMOKE_SPONSORS_DELETED=1
CLEANUP_COMPLETE
TMP_DELETED
```

---

## Status: SMOKE_PASS

All 21 cross-tenant checks passed. Migration 43 applied. No cross-tenant leak detected.
PSL remains INACTIVE. Wallet remains SANDBOX. Cleanup verified.

**Deploy run 28082159537 — workflow SUCCESS on all 5 jobs.**
