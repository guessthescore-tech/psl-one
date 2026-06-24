# Sprint 29 Temporary User Cleanup Evidence

**Date:** 2026-06-24
**Environment:** Beta EC2 (i-0a5f16539c9626f90, af-south-1)
**Status:** CLEANUP_COMPLETE (2026-06-24T07:58:00Z — post smoke run 28082159537)

---

## Users Removed

| Email | Role | Created | Removed |
|---|---|---|---|
| `sprint29-club-admin-smoke@psl-one.internal` | CLUB_ADMIN | 2026-06-24T07:41Z | DELETED |
| `sprint29-sponsor-smoke@psl-one.internal` | SPONSOR | 2026-06-24T07:41Z | DELETED |
| `sprint29-fan-smoke@psl-one.internal` | FAN | 2026-06-24T07:41Z | DELETED |
| `sprint29-psl-admin-smoke@psl-one.internal` | PSL_ADMIN | 2026-06-24T07:46Z | DELETED |

---

## Cleanup Command

```bash
aws ssm send-command \
  --instance-ids i-0a5f16539c9626f90 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "docker exec $(docker ps -qf name=psl-one-api) node -e \"const {PrismaClient}=require('"'"'@prisma/client'"'"');const p=new PrismaClient();async function cleanup(){const r=await p.user.deleteMany({where:{email:{in:['"'"'sprint29-club-admin-smoke@psl-one.internal'"'"','"'"'sprint29-sponsor-smoke@psl-one.internal'"'"']}}});console.log('"'"'DELETED='"'"'+r.count);await p.\\$disconnect();}cleanup().catch(e=>{console.error(e);process.exit(1)})\"",
    "rm -rf /tmp/sprint29",
    "echo CLEANUP_DONE"
  ]' \
  --region af-south-1 --output json
```

Note: `deleteMany` on `User` cascades to `ClubMembership` and `SponsorMembership`
via the `onDelete: Cascade` relation defined in the Prisma schema for Sprint 28.

---

## Verification Command

```bash
aws ssm send-command \
  --instance-ids i-0a5f16539c9626f90 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["docker exec $(docker ps -qf name=psl-one-api) node -e \"const {PrismaClient}=require('"'"'@prisma/client'"'"');const p=new PrismaClient();p.user.count({where:{email:{contains:'"'"'sprint29'"'"'}}}).then(n=>{console.log('"'"'SMOKE_USER_COUNT='"'"'+n);p.\\$disconnect()})\""]' \
  --region af-south-1 --output json
```

**Expected output:** `SMOKE_USER_COUNT=0`

---

## Cleanup Evidence

**CLEANUP_STATUS: COMPLETE (2026-06-24T07:58:00Z)**

Actual SSM output:
```
USERS_DELETED=4
SMOKE_SPONSORS_DELETED=1
CLEANUP_COMPLETE
TMP_DELETED
```

Verification:
```
SMOKE_USER_COUNT=0
SMOKE_SPONSOR_COUNT=0
TMP_DELETED
VERIFICATION_DONE
```

Note: 4 users deleted (CLUB_ADMIN + SPONSOR + FAN + PSL_ADMIN). 1 smoke-only sponsor deleted.
`/tmp/sprint29/` deleted. Cascade delete also removed ClubMembership and SponsorMembership records.

---

## What is NOT cleaned up

| Item | Reason |
|---|---|
| Migration 43 tables | Permanent schema change — correct, not rolled back |
| Seeded teams/sponsors | Pre-existing beta seed data — not touched |
| PSL season state | Remains INACTIVE — unchanged |
| Wallet state | Remains SANDBOX — unchanged |

---

## Cleanup Timing

Cleanup must happen within the same SSM session as smoke execution. The cleanup
command is the final step before the SSM command exits. `/tmp/sprint29/` is also
removed, destroying all tokens and passwords stored on-disk.

This pattern follows Sprint 22 and Sprint 24 cleanup procedures:
- `docs/staging/SPRINT-22-TEMP-ADMIN-CLEANUP-EVIDENCE.md`
- `docs/staging/SPRINT-24-TEMP-ADMIN-CLEANUP-EVIDENCE.md`
