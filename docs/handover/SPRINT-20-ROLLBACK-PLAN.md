# Sprint 20 — Rollback Plan

## Overview

Sprint 20 deploys Sprint 18+19 images to beta EC2. It adds no migrations, no API routes, and no frontend pages. Rollback scope is limited to EC2 image rollback.

---

## EC2 Image Rollback

If the deployment fails or causes unexpected behaviour:

### Step 1: Identify rollback SHA

The deployment workflow outputs `rollback_sha` — the SHA that was deployed before this run. This is captured from SSM `/psl-one/beta/git-sha` at the start of each deployment.

### Step 2: Re-deploy prior SHA

```bash
gh workflow run deploy-beta-ec2.yml \
  --repo guessthescore-tech/psl-one \
  --field git_sha=<rollback_sha> \
  --field run_migrations=false \
  --field confirm=DEPLOY
```

Use `run_migrations=false` — the previous state had no migrations to undo.

### Step 3: Verify

```bash
curl -s http://api.staging.pslone.co.za/health/ready
```

---

## Code Rollback

Sprint 20 is docs/tests only. To roll back merged code:

```bash
git revert <sprint-20-merge-commit> --no-commit
git commit -m "revert: roll back Sprint 20 staging deployment docs"
git push origin main
```

No API endpoints or frontend pages are impacted.

---

## Database Rollback

Sprint 20 adds 0 migrations. No database rollback required under any scenario.

If `run_migrations=true` was used and the EC2 migration task ran, it applied no changes (migration count was already at 42, which matches the deployed schema).

---

## PSL State

PSL was not activated. No PSL rollback needed.

---

## Wallet State

Wallet remains sandbox-only. No wallet rollback needed.

---

## Contact

All rollback actions on shared EC2 infrastructure require owner notification.
