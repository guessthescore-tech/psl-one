# Sprint 19 — Staging Rollback Runbook

## When to Roll Back

Roll back the beta EC2 staging deployment if:

1. API container fails to start (continuous restart loop)
2. Any admin endpoint returns 500 on valid authenticated requests
3. Database connection is lost after deployment
4. A security concern is identified in the new code
5. Sprint 18/19 features cause unexpected side effects on existing data

---

## Rollback Steps

### Step 1 — Identify rollback target

Sprint 17 was the last stable beta deployment (image pushed 2026-06-17).

```bash
aws ecr describe-images \
  --repository-name psl-one-api \
  --region af-south-1 \
  --query 'sort_by(imageDetails, &imagePushedAt)[-10:].{tags:imageTags,pushed:imagePushedAt}' \
  --output table
```

Look for the image pushed on or before 2026-06-17.

### Step 2 — Update SSM parameter

```bash
aws ssm put-parameter \
  --name /psl-one/beta/api/image-tag \
  --value "<sprint-17-image-tag>" \
  --overwrite \
  --region af-south-1
```

### Step 3 — Restart on EC2

```bash
aws ssm start-session --target i-0a5f16539c9626f90 --region af-south-1

# On EC2:
cd /home/ec2-user/psl-one
docker compose -f docker-compose.beta.yml pull
docker compose -f docker-compose.beta.yml up -d
```

### Step 4 — Verify rollback

```bash
curl -s http://16.28.84.11:3000/health | jq .

# Confirm Sprint 18 routes are gone
curl -I http://16.28.84.11:3000/admin/fixtures/imported
# Expected: 404 (route not in Sprint 17)
curl -I http://16.28.84.11:3000/admin/psl/preflight
# Expected: 404
```

---

## Database Rollback

Sprint 18 and Sprint 19 add **zero Prisma migrations**. A rollback to the Sprint 17 image requires **no database changes**. The database schema is fully compatible with Sprint 17 images.

---

## Impact of Rollback

| Component | Impact |
|-----------|--------|
| `/admin/fixtures/imported` | Unavailable (Sprint 18 route) |
| `/admin/fixtures/publish` | Unavailable (Sprint 18 route) |
| `/admin/psl/preflight` | Unavailable (Sprint 18 route) |
| Sprint 17 and earlier routes | Unaffected |
| Fixture data | Unaffected (no data was mutated by Sprint 18/19) |
| PSL season | Still INACTIVE (unchanged) |
| Database | No changes required |

---

## Contact

All EC2 rollback actions require owner notification before and after execution. Do not perform rollback without informing the product owner.
