# Sprint 21 — Rollback Plan

## When to Roll Back

Roll back if:
1. Smoke results reveal a security regression (e.g., admin endpoint accessible without auth)
2. The admin token runbook procedure causes unintended DB state
3. A committed doc contains a real token or provider key

---

## Sprint 21 Rollback Procedure

Sprint 21 adds only docs and tests — no API routes, no frontend pages, no migrations.

### Code Rollback

```bash
git revert <sprint-21-merge-commit> --no-commit
git commit -m "revert: roll back Sprint 21 docs/tests"
git push origin main
```

This removes only Sprint 21 docs and experience test block. EC2 state is unaffected.

---

## EC2 Rollback

Sprint 21 makes no changes to EC2. The currently deployed SHA (`81d3c391ffb69b9217caf0847aa9b4402493c83d`) remains deployed.

If the smoke process created a temporary smoke user that needs to be removed:

```bash
# Via SSM
aws ssm send-command \
  --instance-ids i-0a5f16539c9626f90 \
  --document-name AWS-RunShellScript \
  --parameters '{"commands":["docker exec psl-one-beta-api-1 node -e \"const {PrismaClient}=require('"'"'@prisma/client'"'"'); const p=new PrismaClient(); p.user.deleteMany({where:{email:{endsWith:'"'"'@psl-one.internal'"'"',not:'"'"'seed-admin@psl-one.internal'"'"'}}}).then(r=>{console.log('"'"'Deleted:'"'"',r.count); p.\$disconnect();});\""],"executionTimeout":["30"]}' \
  --region af-south-1
```

---

## Database Rollback

Sprint 21 adds 0 migrations. No database rollback is needed.

No DB writes were made during Sprint 21 smoke (all write paths blocked by `ALLOW_WRITE_SMOKE=false` and auth guards).

---

## What Is NOT Rolled Back

- PSL activation status — PSL was not activated; nothing to roll back
- Wallet sandbox status — always sandbox
- EC2 deployment — unchanged
- Provider keys in SSM — not touched

---

## Rollback SHA Reference

- **Current EC2 deployed SHA:** `81d3c391ffb69b9217caf0847aa9b4402493c83d`
- **Previous good SHA (Sprint 17 deploy):** `26916a7...` (full SHA from GHA run 27683700325)
