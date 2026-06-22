# Sprint 19 — Staging Deployment Runbook

## Purpose

Step-by-step runbook for deploying Sprint 18/19 images to the beta EC2 instance. **Requires owner authorization before execution.**

**Do not deploy. Do not activate PSL. Do not apply Terraform/IAM.**

---

## Prerequisites

- Owner has explicitly authorized this deployment
- GitHub Actions Container Build has completed for the target commit
- ECR images are available in `af-south-1`
- EC2 instance `i-0a5f16539c9626f90` (16.28.84.11) is running
- Operator has `aws ssm` access

---

## Step 1 — Identify target image tags

```bash
# List available API images
aws ecr describe-images \
  --repository-name psl-one-api \
  --region af-south-1 \
  --query 'sort_by(imageDetails, &imagePushedAt)[-5:].{tags:imageTags,pushed:imagePushedAt}' \
  --output table
```

Target: the image tagged with commit SHA `1fb6d6f` or the `latest` push after Sprint 18 merge.

---

## Step 2 — Verify migration status (should be up to date)

```bash
DATABASE_URL=$(aws ssm get-parameter \
  --name /psl-one/beta/app/DATABASE_URL \
  --with-decryption \
  --query 'Parameter.Value' --output text)

DATABASE_URL=$DATABASE_URL node tools/staging/sprint-19-migration-status-check.mjs
```

Expected: `STAGING_MIGRATION_UP_TO_DATE` — Sprint 18/19 added 0 migrations.

If pending migrations are found, apply with:

```bash
DATABASE_URL=$DATABASE_URL pnpm --filter @psl-one/api exec prisma migrate deploy
```

Only do this with owner authorization. Target must be staging, not production.

---

## Step 3 — Update image tags in SSM

```bash
# Set the new API image tag
aws ssm put-parameter \
  --name /psl-one/beta/api/image-tag \
  --value "<new-image-tag>" \
  --overwrite \
  --region af-south-1
```

---

## Step 4 — Restart services on EC2

```bash
# Via SSM Session Manager
aws ssm start-session --target i-0a5f16539c9626f90 --region af-south-1

# On the EC2 instance:
cd /home/ec2-user/psl-one
docker compose -f docker-compose.beta.yml pull
docker compose -f docker-compose.beta.yml up -d
```

---

## Step 5 — Verify deployment

```bash
# Health check
curl -s http://16.28.84.11:3000/health | jq .

# Sprint 18 endpoints
curl -s -H "Authorization: Bearer $ADMIN_JWT" \
  http://16.28.84.11:3000/admin/fixtures/imported | jq '.total'

curl -s -H "Authorization: Bearer $ADMIN_JWT" \
  http://16.28.84.11:3000/admin/psl/preflight | jq '.status'
```

---

## Step 6 — Run smoke suite

```bash
BASE_URL=http://16.28.84.11:3000 \
ADMIN_TOKEN=$ADMIN_JWT \
DRY_RUN_ONLY=true \
node tools/staging/sprint-19-admin-smoke.mjs
```

---

## Step 7 — Confirm invariants

After deployment:

- [ ] PSL season is INACTIVE
- [ ] World Cup 2026 is ACTIVE
- [ ] Wallet providers are SANDBOX
- [ ] No fixture data written (ingestion not triggered)
- [ ] Admin routes require ADMIN token

---

## Rollback

If deployment fails, redeploy the previous image:

```bash
aws ssm put-parameter \
  --name /psl-one/beta/api/image-tag \
  --value "<previous-image-tag>" \
  --overwrite \
  --region af-south-1

# Restart on EC2
docker compose -f docker-compose.beta.yml pull
docker compose -f docker-compose.beta.yml up -d
```

No DB rollback needed (Sprint 18/19 added no migrations).

---

## Important Constraints

- Do NOT activate PSL during or after deployment
- Do NOT enable scheduled ingestion
- Do NOT push to production domains
- Do NOT apply Terraform or mutate IAM
- All changes are to beta EC2 only
