# Sprint 18 — Rollback Plan

## Overview

Sprint 18 is low-risk from a rollback perspective. It adds no database migrations and no schema changes. All new code is purely additive.

---

## Rollback Trigger Conditions

Roll back Sprint 18 if:
1. The API fails to start after deployment (container crash on boot)
2. The `/admin/fixtures/imported` endpoint returns 500 on valid admin requests
3. The `/admin/psl/preflight` endpoint panics or causes DB connection exhaustion
4. A security vulnerability is found in the new routes
5. The `FixtureImportModule` fails to register new providers/controllers

---

## Rollback Procedure

### Step 1 — Identify the rollback target

Sprint 17 image SHA: `df324ee` (commit `df324ee feat(sprint): wire fixture ingestion into beta workflow (#17)`)

```bash
# Find the Sprint 17 image tag in ECR
aws ecr describe-images \
  --repository-name psl-one-api \
  --region af-south-1 \
  --query 'imageDetails[*].{tags:imageTags,pushed:imagePushedAt}' \
  --output table
```

### Step 2 — Redeploy Sprint 17 image

```bash
# Update the SSM parameter pointing to the API image tag
aws ssm put-parameter \
  --name /psl-one/beta/api/image-tag \
  --value <sprint-17-image-tag> \
  --overwrite \
  --region af-south-1

# Re-run the deploy workflow or restart the container
```

### Step 3 — Verify rollback

```bash
# Health check
curl http://16.28.84.11:3000/health

# Confirm new routes are gone
curl -I http://16.28.84.11:3000/admin/fixtures/imported
# Expected: 404
```

---

## No DB Rollback Needed

Sprint 18 introduces zero Prisma migrations. The `fixture-import.module.ts` change is backwards-compatible — removing new providers/controllers from the module does not affect existing schema.

If the Sprint 17 image is redeployed, the database requires no changes.

---

## Partial Rollback (module only)

If only the `FixtureImportModule` registration change needs to be reverted (e.g., provider conflict), restore `fixture-import.module.ts` to the Sprint 17 version:

```bash
git checkout df324ee -- apps/api/src/fixture-import/fixture-import.module.ts
```

The new service and controller files can remain; they will simply not be registered.

---

## Rollback Impact

| Component | Impact |
|-----------|--------|
| `/admin/fixtures/imported` | Unavailable |
| `/admin/fixtures/publish` | Unavailable |
| `/admin/psl/preflight` | Unavailable |
| All Sprint 17 and earlier routes | Unaffected |
| Database | No changes required |
| Fixture data | Unaffected (no data mutation in Sprint 18 services beyond publication status) |
| PSL season activation | Not applicable — PSL is not active |

---

## Rollback Contact

If rollback is triggered in a live scenario, notify the product owner before and after. All rollback actions on AWS infrastructure require owner authorisation per the hard constraints in CLAUDE.md.
