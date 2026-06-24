# Sprint 29 Rollback Plan

**Date:** 2026-06-24
**Sprint:** 29 — Cross-Tenant Membership Smoke

---

## Overview

Sprint 29 adds no new API routes, no new frontend pages, and no new Prisma models
beyond those already merged in Sprint 28. The only infrastructure change is applying
Migration 43 (`20260623000001_club_sponsor_memberships`) to the beta EC2.

---

## Migration 43 Rollback

Migration 43 is **additive only** — two new empty tables with no data. If rollback
is required after apply:

```bash
# Drop the two new tables
# Run via SSM docker exec on beta EC2
docker exec $(docker ps -qf name=psl-one-api) node -e "
  const {PrismaClient} = require('@prisma/client');
  const p = new PrismaClient();
  // Tables to drop: ClubMembership, SponsorMembership
  // These are empty during smoke — no data loss
  Promise.all([
    p.\$executeRaw\`DROP TABLE IF EXISTS \"ClubMembership\" CASCADE\`,
    p.\$executeRaw\`DROP TABLE IF EXISTS \"SponsorMembership\" CASCADE\`
  ]).then(() => { console.log('ROLLBACK_DONE'); p.\$disconnect(); });
"
```

Note: This is only necessary if Migration 43 caused an unforeseen issue.
In practice, the tables are empty during the smoke window, so rollback
has zero data loss impact.

---

## EC2 Service Rollback

If the EC2 deployment of SHA `2605b372...` causes service instability, roll back
to Sprint 24 SHA:

```bash
# Trigger deploy-beta-ec2.yml with previous SHA
# git_sha: c731c494d37bda3679e149f869afb63448091b4f
# run_migrations: false
# confirm: DEPLOY
```

Note: The previous SHA does not include Migration 43 tables.
If rolled back to Sprint 24, the `ClubMembership` and `SponsorMembership`
tables will be present (from the migration) but the code won't use them
until Sprint 28 features are re-deployed.

---

## Smoke User Rollback

If smoke users were provisioned and smoke fails before cleanup:

```bash
aws ssm send-command \
  --instance-ids i-0a5f16539c9626f90 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "docker exec $(docker ps -qf name=psl-one-api) node -e \"const {PrismaClient}=require('"'"'@prisma/client'"'"');const p=new PrismaClient();p.user.deleteMany({where:{email:{contains:'"'"'sprint29'"'"'}}}).then(r=>{console.log('"'"'EMERGENCY_CLEANUP='"'"'+r.count);p.\\$disconnect()})\"",
    "rm -rf /tmp/sprint29",
    "echo EMERGENCY_CLEANUP_DONE"
  ]' \
  --region af-south-1 --output json
```

---

## No PSL Activation Rollback Needed

PSL season remains INACTIVE. No rollback required for PSL state.

---

## No Wallet Rollback Needed

Wallet remains SANDBOX. No production wallet calls made. No rollback required.

---

## PR Rollback

If this PR is merged and needs to be reverted:

```bash
# Revert on main
git revert <MERGE_COMMIT_SHA> --no-commit
git commit -m "revert(sprint-29): remove smoke evidence PR"
```

All Sprint 29 additions are documentation and test only — no production
code changes. Revert is safe with zero risk to existing functionality.
