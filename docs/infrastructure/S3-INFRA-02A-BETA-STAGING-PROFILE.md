# S3-INFRA-02A — AWS Free Plan Beta Staging Profile

Story: S3-INFRA-02A
Status: AUTHORED (not deployed)
Date: 2026-06-16
Author: Infrastructure / Claude Code
Account: `Guess__The_Score` (844513166932)

---

## Overview

S3-INFRA-02A defines a low-cost beta staging profile for PSL One that runs on a single AWS Free Plan EC2 instance using Docker Compose and Caddy. It is a parallel path to the ECS Fargate environment authored in S3-INFRA-01, which is preserved unchanged as the future production target.

The primary constraint driving this profile is cost: the ECS Fargate staging environment requires a NAT gateway (~$45–65/month) and ALB (~$18/month) that would consume the entire $100 AWS credit within two to three months. EC2 + Docker Compose avoids these resources entirely while delivering a functionally complete beta environment.

---

## Architecture

```
Internet
    │
    ▼
EC2 t2.micro (Amazon Linux 2023)
├── Security Group: port 80 (HTTP), port 443 (HTTPS). No port 22, 3001, 4000, 5432.
│
├── Docker Compose (compose.beta.yaml)
│   ├── caddy:2.9.1-alpine  ← reverse proxy, TLS (Mode B) or HTTP (Mode A)
│   ├── psl-one-web     ← Next.js 15, port 3001 (internal)
│   ├── psl-one-api     ← NestJS, port 4000 (internal)
│   ├── migrate         ← one-off Prisma migrate deploy (restart: "no")
│   └── postgres:16-alpine ← named volume psl-one-beta-postgres
│
├── IAM Instance Profile
│   ├── AmazonSSMManagedInstanceCore (managed — SSM Session Manager access)
│   ├── Inline: ecr:GetAuthorizationToken on *
│   │   ecr:BatchGetImage, ecr:GetDownloadUrlForLayer, ecr:BatchCheckLayerAvailability
│   │   scoped to: psl-one-beta-api, psl-one-beta-api-migrator, psl-one-beta-web only
│   └── Inline: ssm:GetParameter* on /psl-one/beta/*
│
└── SSM Parameter Store: /psl-one/beta/* (runtime secrets, no cost)
```

Operator access: AWS SSM Session Manager only. Port 22 is not open.

---

## Files Authored

| File | Purpose |
|---|---|
| `docs/adr/ADR-029-FREE-PLAN-BETA-STAGING-PROFILE.md` | Architecture decision record |
| `compose.beta.yaml` | Docker Compose for EC2 beta |
| `.env.beta.example` | Placeholder env template |
| `infra/beta/Caddyfile` | Caddy virtual host config (Mode A/B) |
| `infra/beta/bootstrap-ec2.sh` | EC2 user_data bootstrap script |
| `infra/terraform/environments/beta-ec2/versions.tf` | Terraform version constraints |
| `infra/terraform/environments/beta-ec2/variables.tf` | Input variables |
| `infra/terraform/environments/beta-ec2/main.tf` | EC2, SG, IAM, EIP resources |
| `infra/terraform/environments/beta-ec2/outputs.tf` | Instance ID, IP, profile name |
| `infra/terraform/environments/beta-ec2/backend.tf.example` | S3 backend template |
| `infra/terraform/environments/beta-ec2/terraform.tfvars.example` | Operator variable template |
| `scripts/beta/backup-postgres.sh` | PostgreSQL backup script |
| `scripts/beta/restore-postgres.sh` | PostgreSQL restore script |
| `scripts/beta/bootstrap-data.sh` | Prisma migrate + seed runner |
| `.github/workflows/deploy-beta-ec2.yml` | CI/CD deploy workflow |
| `docs/infrastructure/BETA-STAGING-COST-CONTROLS.md` | Cost analysis and guardrails |
| `docs/operations/BETA-EC2-DEPLOYMENT-RUNBOOK.md` | First-time and routine deployment |
| `docs/operations/BETA-EC2-ROLLBACK-RUNBOOK.md` | Image rollback procedure |
| `docs/operations/BETA-EC2-BACKUP-RESTORE.md` | Database backup and restore |
| `docs/operations/BETA-EC2-INCIDENT-RUNBOOK.md` | Incident triage and recovery |

---

## Networking Modes

### Mode A — IP Testing (default, no DNS changes)

- Testers add EC2 public IP to `/etc/hosts` pointing at the staging domain names
- Caddy serves HTTP (no TLS certificate required)
- No DNS record changes needed
- IP changes on instance stop/start unless Elastic IP is enabled

### Mode B — Public HTTPS (stakeholder demos)

- Real DNS A records point to EC2 public IP (via external DNS — Route 53 is blocked by guardrail)
- Caddy automatically obtains Let's Encrypt TLS certificates on first request
- Requires a stable IP (Elastic IP recommended for Mode B)

---

## Guardrail Conflicts

| Guardrail | Conflict | Resolution |
|---|---|---|
| `DenyNonFreeTierEC2` (t2.micro only) | t3.micro blocked | Default `instance_type = "t2.micro"`. Amend guardrail to allow t3.micro if needed. |
| `DenyRoute53` | Cannot create DNS records | Use external DNS (Cloudflare or registrar). Not needed for Mode A. |
| `DenyIAMEscalation` | Blocks user/group/policy creation | IAM role creation is permitted. EC2 role + instance profile created by Terraform. ✓ |
| `DenyRDSNonFreeTier` | No conflict | Postgres runs in Docker; no RDS resource created. ✓ |
| `DenyECSFargate` | FALSE POSITIVE | Inspection confirmed this guardrail does not exist. (See ADR-028.) ✓ |

---

## Cost Estimate

Cash-spend target: R0.
AWS credits may be consumed.
Guaranteed zero cost: No.
Charges depend on Free Plan eligibility, remaining credits, plan expiry and actual service usage.

| Resource | Estimated cost | Notes |
|---|---|---|
| EC2 t2.micro | Metered; credit-funded while credits last | Not guaranteed free — verify in Billing console |
| EBS 20 GB gp3 | Metered; continues while instance is stopped | ~$0.08/GB-month in af-south-1; charges apply even when stopped |
| Public IPv4 address | ~$0.005/hr (~$3.60/month) when instance running | Applies since Feb 2024; not free-tier exempt |
| SSM Parameter Store | $0 | Standard params, ~12 parameters |
| ECR (within free tier) | ~$0 initially | Charges apply beyond 500 MB/month |
| NAT Gateway | $0 (not used) | — |
| ALB | $0 (not used) | Caddy handles routing |
| RDS | $0 (not used) | Postgres runs in Docker |
| Secrets Manager | $0 (not used) | SSM Parameter Store used instead |

**Estimated total: near $0 cash spend while credits and Free Plan eligibility last.**
**AWS credits will be consumed. See `docs/infrastructure/BETA-STAGING-COST-CONTROLS.md`.**

Full analysis: `docs/infrastructure/BETA-STAGING-COST-CONTROLS.md`

---

## ECS Fargate Comparison (S3-INFRA-01 vs S3-INFRA-02A)

| Dimension | S3-INFRA-01 ECS Fargate (staging) | S3-INFRA-02A EC2 Compose (beta) |
|---|---|---|
| Cost | ~$83–147/month | ~$0/month |
| HA | Multi-AZ capable | Single instance |
| Scaling | ECS service auto-scaling | Manual (t2.micro only) |
| Persistence | Aurora RDS | PostgreSQL in Docker volume |
| Secrets | AWS Secrets Manager | SSM Parameter Store |
| Access | ALB public endpoint | Caddy on EC2 |
| Operator access | ECS Exec | SSM Session Manager |
| Target | Production path | Beta review / internal testing |

S3-INFRA-01 is preserved unchanged and is the approved path to production.

---

## Terraform Validation Results

Validated via `terraform -chdir=infra/terraform/environments/beta-ec2 validate`:

```
Success! The configuration is valid.
```

Format: `terraform fmt -check -recursive infra/terraform` — PASS

---

## Pre-Deploy Checklist

Before running `terraform apply` for the first time:

- [ ] AWS Free Plan active and credits confirmed in Billing console
- [ ] ECR repositories created: `psl-one-beta-api`, `psl-one-beta-api-migrator`, `psl-one-beta-web`
- [ ] SSM parameters stored under `/psl-one/beta/*`
- [ ] GitHub secret `AWS_BETA_DEPLOY_ROLE_ARN` set (OIDC role for deploy workflow)
- [ ] GitHub secret `BETA_EC2_INSTANCE_ID` set after Terraform apply
- [ ] GitHub secret `BETA_API_BASE_URL` set (for web image build-arg)
- [ ] GitHub secret `BETA_EC2_IP` set (for smoke test)
- [ ] GitHub secret `DOCKER_BUILD_CLOUD_ENDPOINT` set (for Docker Build Cloud)
- [ ] Instance type confirmed as `t2.micro` (guardrail-safe)
- [ ] `backend.tf` configured or local state accepted for initial apply

---

## Stop Point

This story delivers authored infrastructure only. No AWS resources have been created.

Next steps requiring owner approval:
1. Create ECR repositories
2. Store SSM parameters
3. Run `terraform apply` in `infra/terraform/environments/beta-ec2`
4. Build and push images using Docker Build Cloud
5. Run `bootstrap-data.sh` to initialise the database
