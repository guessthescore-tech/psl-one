# Sprint 29 Cross-Tenant Smoke — Execution Log

**Date:** 2026-06-24
**Environment:** Beta EC2 (i-0a5f16539c9626f90, af-south-1)
**Tool:** `tools/staging/sprint-29-ec2-cross-tenant-smoke.sh`
**Status:** STAGING_SMOKE_PENDING

---

## Deployment Pre-requisites

| Item | Required | Status |
|---|---|---|
| EC2 deploy of SHA `2605b372...` | Required | PENDING_OWNER_TRIGGER |
| Migration 43 applied | Required | PENDING_DEPLOY |
| Temp smoke users provisioned | Required | PENDING_DEPLOY |
| `/tmp/sprint29/` workspace created | Required | PENDING_DEPLOY |

---

## SSM Command Log

### CMD-01: Create workspace

```bash
aws ssm send-command \
  --instance-ids i-0a5f16539c9626f90 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["mkdir -p /tmp/sprint29 && chmod 700 /tmp/sprint29 && echo WORKSPACE_READY"]' \
  --region af-south-1 --output json
```

**Result:** PENDING

---

### CMD-02: Verify migration 43 applied

```bash
aws ssm send-command \
  --instance-ids i-0a5f16539c9626f90 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["docker exec $(docker ps -qf name=psl-one-api) npx prisma migrate status 2>&1 | tail -20"]' \
  --region af-south-1 --output json
```

**Expected:** `20260623000001_club_sponsor_memberships ... Applied`
**Result:** PENDING

---

### CMD-03: Select scope records (teams and sponsors)

```bash
aws ssm send-command \
  --instance-ids i-0a5f16539c9626f90 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["docker exec $(docker ps -qf name=psl-one-api) node -e \"const {PrismaClient}=require('"'"'@prisma/client'"'"');const p=new PrismaClient();Promise.all([p.team.findMany({take:4,select:{id:true,name:true}}),p.sponsor.findMany({take:4,select:{id:true,name:true}})]).then(([t,s])=>{console.log(JSON.stringify({teams:t,sponsors:s}));p.\$disconnect()})\""]' \
  --region af-south-1 --output json
```

**Result:** PENDING

---

### CMD-04: Provision smoke users

See `SPRINT-29-TEMP-USER-PROVISIONING.md` for detailed commands.

**Result:** PENDING

---

### CMD-05: Upload and execute smoke script

```bash
# Upload smoke script to EC2
aws ssm send-command \
  --instance-ids i-0a5f16539c9626f90 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["cp /opt/psl-one/tools/staging/sprint-29-ec2-cross-tenant-smoke.sh /tmp/sprint29/cross-tenant-smoke.sh && chmod +x /tmp/sprint29/cross-tenant-smoke.sh && echo SCRIPT_UPLOADED"]' \
  --region af-south-1 --output json

# Execute smoke script
aws ssm send-command \
  --instance-ids i-0a5f16539c9626f90 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["bash /tmp/sprint29/cross-tenant-smoke.sh 2>&1"]' \
  --region af-south-1 --output json
```

**Result:** PENDING

---

## Expected Smoke Output

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

## Actual Result

**STAGING_SMOKE_EXECUTION_STATUS: PENDING_DEPLOY**

EC2 deployment of Sprint 28 SHA (`2605b372df829ea77f76c9c334909d54abdec294`)
must be triggered by owner via `deploy-beta-ec2.yml` workflow_dispatch before
smoke execution can proceed.

All runbooks, tools, and templates are committed and ready.
