# Sprint 20 — Beta EC2 Deployment Plan

## Owner Authorisation

Owner has authorised beta EC2 deployment for Sprint 20.

**Authorization scope:**
- Beta EC2 only (`i-0a5f16539c9626f90`)
- No production deployment
- No Terraform apply
- No IAM mutation
- No PSL activation
- No scheduled ingestion
- No production ingestion
- Wallet remains sandbox-only
- No real-money functionality

---

## Target

| Property | Value |
|----------|-------|
| Instance ID | `i-0a5f16539c9626f90` |
| Public IP | `16.28.84.11` |
| Region | `af-south-1` |
| Domains | `staging.pslone.co.za`, `api.staging.pslone.co.za` |
| Environment | beta |
| Workflow | `.github/workflows/deploy-beta-ec2.yml` |

---

## Deployment SHA

The SHA to deploy is the Sprint 19 merge commit, currently at the tip of `main`:

```
81d3c391ffb69b9217caf0847aa9b4402493c83d
```

This SHA is:
- An ancestor of `origin/main` (required by workflow validation)
- The merge commit for Sprint 19 staging admin smoke readiness
- Validated by 7/7 CI checks (PASS)

---

## Deployment Mechanism

Deployment uses the `deploy-beta-ec2.yml` GitHub Actions workflow via `workflow_dispatch`.

The workflow:
1. Validates SHA format and ancestry
2. Builds and pushes three Docker images to ECR (beta repos, immutable tags)
3. Deploys via SSM Run Command to the EC2 instance
4. Runs Prisma migrations (unless `run_migrations=false`)
5. Runs built-in smoke tests via SSM + Docker

---

## Trigger Command

```bash
gh workflow run deploy-beta-ec2.yml \
  --repo guessthescore-tech/psl-one \
  --field git_sha=81d3c391ffb69b9217caf0847aa9b4402493c83d \
  --field run_migrations=true \
  --field confirm=DEPLOY
```

**Fields:**
- `git_sha`: Exact 40-char SHA (must be ancestor of `origin/main`)
- `run_migrations`: `true` — migration count is 42, same as current state; no migration will fail
- `confirm`: Must be literal string `DEPLOY`

---

## Pre-execution Safety Checklist

| Check | Status |
|-------|--------|
| Target is beta EC2 only | PASS |
| Not production deployment | PASS |
| Not Terraform apply | PASS |
| Not IAM mutation | PASS |
| Not PSL activation | PASS |
| Not wallet production | PASS |
| No scheduled ingestion | PASS |
| No production ingestion | PASS |
| SHA is ancestor of main | PASS |
| Migration count unchanged (42) | PASS |
| No real-money functionality added | PASS |

---

## Migration Safety

- Sprint 20 adds 0 new migrations
- Migration count remains 42 (unchanged since Sprint 7)
- Running `migrate deploy` on EC2 will apply any pending migrations, but there are none
- Expected result: `Already in sync, no schema changes or pending migrations`

---

## Rollback SHA

Before deploying, the workflow captures the previously deployed SHA from SSM `/psl-one/beta/git-sha` and stores it as `rollback_sha`.

To rollback: re-trigger `deploy-beta-ec2.yml` with the `rollback_sha` value.

Prior sprint: Sprint 17 SHA was the last known deployed image (`26916a7...`).

---

## PSL Activation Status

PSL remains **INACTIVE**. World Cup 2026 is the active beta context.

This deployment does NOT activate PSL. PSL activation requires:
1. PSL pre-flight passing (CONDITIONAL_GO or GO)
2. Explicit owner instruction via Season Switching admin action
3. Separate `SeasonActivationApproval` workflow

Fixture publishing is **SEPARATE** from PSL activation.
