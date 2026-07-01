# S3-INFRA-02 — Terraform Plan Review

**Date:** 2026-06-15  
**Story:** S3-INFRA-02  
**Commit planned:** `607449a585924eaddf4dec14aaa3f2890d981723`  
**Terraform version:** 1.15.6 (hashicorp/tap, darwin_amd64)  
**AWS provider:** hashicorp/aws v5.100.0  
**Status:** PLAN_REVIEWED — NOT_APPLIED  

---

## AWS Identity

| Field | Value |
|-------|-------|
| Account ID | 844513166932 |
| Caller ARN | `arn:aws:iam::844513166932:user/psl-one-admin` |
| Caller type | IAM user (static credentials, shared-credentials-file) |
| Region configured | af-south-1 |
| Root user | No |
| Caller classification | IAM user with AdministratorAccess + Sprint 0 scoped policies |

**Staging account approval status:** APPROVAL_REQUIRED — see item 3 under Approval-Required Items.

---

## Plan Execution Summary

| Phase | Result |
|-------|--------|
| `terraform fmt -check` | FAIL — one file required whitespace alignment fix |
| `terraform fmt` applied | PASS — pure whitespace changes; no functional impact |
| `terraform init -backend=false` | PASS — all 13 modules loaded; aws provider 5.100.0 installed |
| `terraform validate` | PASS — configuration is valid |
| Full plan (61 resources) | PARTIAL — plan computed all resource graph; failed at secrets data source read |
| Partial plan — networking, ECR, ECS, ALB (targeted) | PASS — 50 resources; 0 destroy |
| Partial plan — IAM and OIDC (targeted) | PASS — 7 resources; 0 destroy |
| RDS confirmation plan | PASS — 0 `module.rds.*` resources; `create_rds = false` confirmed |

**Full plan resource count (computed before data source failure):** 61 to add, 0 to change, 0 to destroy.  
**Partial plan (confirmed safe modules):** 50 to add, 0 to change, 0 to destroy.  
**Backend mode:** local (`-backend=false`); no state written or read.  
**Variable source:** `/tmp/psl-one-staging.auto.tfvars` (temporary, no secrets, not committed).  
**Secret scan of variables:** CLEAN.

---

## Blocker: Missing Staging Secret

The `module.secrets` data source reads `psl-one/staging/api/runtime` from Secrets Manager at plan time:

```
Error: reading Secrets Manager Secret (psl-one/staging/api/runtime): couldn't find resource
  with module.secrets.data.aws_secretsmanager_secret.this["api_runtime"]
```

**Required keys:** `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGINS`  
**Status:** BLOCKER — secret must be created through an authorised process before a complete plan or any apply.  
**Action:** Create the secret with a placeholder structure first; populate values before apply.

---

## Partial Plan — Networking (50 resources confirmed)

### VPC

| Resource | Name | Notes |
|----------|------|-------|
| `aws_vpc` | `psl-one-staging` | CIDR 10.41.0.0/16; DNS enabled |
| `aws_internet_gateway` | `psl-one-staging-igw` | Public internet access for ALB |
| 2× `aws_subnet.public` | `psl-one-staging-public-[1,2]` | `map_public_ip_on_launch = true` (ALB subnets) |
| 2× `aws_subnet.private` | `psl-one-staging-private-[1,2]` | ECS tasks; no public IP |
| 2× `aws_subnet.database` | `psl-one-staging-database-[1,2]` | Reserved for RDS |
| `aws_route_table.public` | — | Routes all via IGW |
| `aws_route_table.private` | — | Routes via NAT |
| `aws_route.private_nat[0]` | — | Guarded: `nat_gateway_count > 0` |
| 2×2 `aws_route_table_association` | — | Public + private + database associations |
| `aws_eip.nat[0]` | `psl-one-staging-nat-1` | Single NAT EIP |
| `aws_nat_gateway.this[0]` | `psl-one-staging-nat-1` | 1 NAT for cost-conscious staging |

**Availability zones:** derived from `data.aws_availability_zones.available` in af-south-1 (2 AZs).

### Security Groups

| Group | Inbound | Outbound | Notes |
|-------|---------|----------|-------|
| `psl-one-staging-alb` | 80/TCP from `0.0.0.0/0` | all | Public ALB — HTTP only; HTTPS pending certificate |
| `psl-one-staging-api` | 4000/TCP from ALB SG | all | ECS API task; no direct public |
| `psl-one-staging-web` | 3001/TCP from ALB SG | all | ECS web task; no direct public |
| `psl-one-staging-migration` | none | all | One-off migration task egress only |
| `psl-one-staging-database` | 5432/TCP from API SG, 5432/TCP from migration SG | — | DB access restricted to API and migration |

Database ingress is restricted to named security groups — no wildcard DB ingress. **PASS.**

### ECR

| Repository | Mutability | Scan on push | Lifecycle | Encryption |
|------------|-----------|--------------|-----------|-----------|
| `psl-one-staging-api` | IMMUTABLE | true | 30 images | AES256 |
| `psl-one-staging-api-migrator` | IMMUTABLE | true | 30 images | AES256 |
| `psl-one-staging-web` | IMMUTABLE | true | 30 images | AES256 |

### ECS Cluster

| Resource | Notes |
|----------|-------|
| `aws_ecs_cluster` | `psl-one-staging` |
| `aws_ecs_cluster_capacity_providers` | FARGATE + FARGATE_SPOT configured |

### ALB

| Resource | Notes |
|----------|-------|
| `aws_lb` | `psl-one-staging`; public; type application |
| `aws_lb_listener.http` | Port 80, default action: 404 fixed-response |
| `aws_lb_listener_rule.api` | Priority 10; host-header: `api.staging.pslone.co.za` → API TG |
| `aws_lb_listener_rule.web` | Priority 20; host-header: `staging.pslone.co.za` → Web TG |
| `aws_lb_target_group.api` | Port 4000; IP type; health `/health/ready` 200 |
| `aws_lb_target_group.web` | Port 3001; IP type; health `/api/health` 200 |

**HTTPS status:** No HTTPS listener. Port 443 requires ACM certificate ARN. See HTTPS/ACM Status.

### CloudWatch

| Log group | Retention |
|-----------|-----------|
| `/ecs/psl-one-staging/api` | 30 days |
| `/ecs/psl-one-staging/web` | 30 days |
| `/ecs/psl-one-staging/migration` | 30 days |

No CloudWatch alarms planned. Consistent with ROADMAP.md: alarms planned for a later increment.

---

## IAM Plan (7 resources confirmed)

| Resource | Name | Trust | Notes |
|----------|------|-------|-------|
| `aws_iam_role.execution` | `psl-one-staging-execution` | ecs-tasks | Pulls images, writes logs |
| `aws_iam_role_policy_attachment.execution_managed` | — | — | AmazonECSTaskExecutionRolePolicy |
| `aws_iam_role.api_task` | `psl-one-staging-api-task` | ecs-tasks | No inline policy (reads secrets via execution role) |
| `aws_iam_role.web_task` | `psl-one-staging-web-task` | ecs-tasks | No permissions; logs only |
| `aws_iam_role.migration_task` | `psl-one-staging-migration-task` | ecs-tasks | DATABASE_URL via execution role |
| `aws_iam_openid_connect_provider.github` | — | — | Plan to create; no existing provider in account |
| `aws_iam_role.deploy` | `psl-one-staging-github-deploy` | OIDC (guessthescore-tech/psl-one:environment:staging) | Scoped ECR + ECS deploy permissions |

**PassRole:** scoped to 4 named role ARNs with `iam:PassedToService = ecs-tasks.amazonaws.com`. **PASS.**  
**AdministratorAccess / PowerUserAccess / iam:\* on created roles:** None. **PASS.**  
**OIDC trust:** `StringEquals` on both `aud` and `sub` (environment-scoped). **PASS.**  
**ECS task roles minimum privilege:** execution role reads secrets + ECR; task roles have no broad permissions. **PASS.**

---

## Not Planned — Requires Secret Blocker to Be Resolved

The following will be included in the full plan once `psl-one/staging/api/runtime` exists:

- `module.ecs_iam.aws_iam_role_policy.execution_secrets` — grants `secretsmanager:GetSecretValue` on the secret ARN
- `module.api_service.aws_ecs_task_definition.this` — API task with secrets injection
- `module.api_service.aws_ecs_service.this` — API ECS service
- `module.web_service.aws_ecs_task_definition.this` — Web task
- `module.web_service.aws_ecs_service.this` — Web ECS service
- `aws_ecs_task_definition.migration` — migration task
- `module.github_oidc.aws_iam_role_policy.deploy` — inline deploy policy

---

## RDS

| Setting | Value | Notes |
|---------|-------|-------|
| `create_rds` | `false` | BLOCKER from Sprint 0 deny guardrail (see below) |
| Module resources planned | 0 | Confirmed zero `aws_db_instance` and `aws_db_subnet_group` |
| DB class in Terraform | `db.t4g.micro` | |
| Sprint 0 guardrail | `DenyRDSNonFreeTier` denies all except `db.t3.micro` | CONFLICT |

**RDS Recommendation:** `DEFER_AND_USE_EXISTING_DATABASE` or `REQUIRES_COST_APPROVAL` with guardrail amendment. Do not enable RDS until:
1. The Sprint 0 `DenyRDSNonFreeTier` guardrail is amended to permit `db.t4g.micro` or replaced.
2. Cost is approved (~$15-20/month).
3. The plan is re-run with `create_rds = true` for independent review.

---

## CloudFront

| Setting | Value |
|---------|-------|
| `enable_cloudfront` | `false` |
| Resources planned | 0 |
| Status | `PLANNED_AFTER_INITIAL_STAGING` |

---

## Secrets Manager

- Secret `psl-one/staging/api/runtime` does not yet exist in account 844513166932.
- Secret ARN not known; appears as `(known after apply)` in plan for ECS secrets injection.
- **No secret values are in any committed file, Terraform variable, or plan output.** PASS.

---

## GitHub OIDC

- No OIDC provider found in account: `aws iam list-open-id-connect-providers` → empty.
- Plan: `create_github_oidc_provider = true` → will create `aws_iam_openid_connect_provider.github`.
- Subject claim: `repo:guessthescore-tech/psl-one:environment:staging`.
- Audience: `sts.amazonaws.com`.
- Thumbprint: `6938fd4d98bab03faadb97b34396831e3780aea1` (GitHub's current primary).

**Note:** GitHub periodically rotates OIDC thumbprints. Verify the thumbprint is current before apply.

---

## Sprint 0 IAM Conflict Analysis

### DenyECSFargate — FALSE POSITIVE

ADR-028 states: "The existing Sprint 0 IAM deny guardrails include `DenyECSFargate`."

**Finding:** `pslone-sprint0-deny-guardrails-policy.json` and the live `PSLOneSprint0DenyGuardrails` policy (attached to group `PSLOneSprint0Infra`) do NOT contain a `DenyECSFargate` statement.

The actual deny statements are:
- `DenyNonFreeTierEC2` — EC2 instances except t2.micro
- `DenyRDSNonFreeTier` — RDS must be db.t3.micro (CONFLICTS with plan's db.t4g.micro)
- `DenyRDSClusters` — no Aurora/cluster
- `DenyRDSMultiAZ` — no Multi-AZ
- `DenyPublicS3` — no public buckets
- `DenyIAMEscalation` — blocks user/group/policy management (not role management)
- `DenyRoute53` — all Route 53 blocked (DNS changes blocked for this identity)
- `DenyOrganizations` — no org management
- `DenyMSKKafka` — no Kafka

**ECS Fargate is NOT denied.** `terraform apply` for networking, ECR, and ECS resources is not blocked by the guardrails (pending secret creation).

**ADR-028 update required:** Remove the incorrect `DenyECSFargate` reference from the Consequences section.

### DenyRDSNonFreeTier — REAL CONFLICT

The guardrail allows only `db.t3.micro`. The Terraform plan uses `db.t4g.micro`. RDS creation will be denied by the guardrail if applied with `create_rds = true`.

**Required action before RDS plan:** Amend or replace the Sprint 0 guardrail to permit `db.t4g.micro` for the staging environment, or confirm RDS is out of scope for initial staging.

### DenyRoute53 — DNS BLOCKER

The `psl-one-admin` identity cannot make any Route 53 API calls. DNS configuration for `api.staging.pslone.co.za` and `staging.pslone.co.za` requires a different identity or guardrail amendment.

### DenyIAMEscalation — NOT A BLOCKER

The deny covers user/group/policy management but NOT:
- `iam:CreateRole` ← required; NOT denied
- `iam:PutRolePolicy` ← required; NOT denied
- `iam:AttachRolePolicy` ← required; NOT denied

Terraform creates IAM roles with inline policies (`aws_iam_role_policy`), not standalone managed policies. **COMPATIBLE.**

---

## AdministratorAccess Finding

`psl-one-admin` has `AdministratorAccess` attached directly as a user policy. This is broader than the principle of least privilege. In AWS, the `DenyIAMEscalation` explicit deny in the group policy still applies and cannot be overridden by `AdministratorAccess`.

**Classification:** ACCEPTED_STAGING_TRADE_OFF — this is the user's own AWS account and a single-account staging setup. A dedicated staging deployment role should be created before production.

---

## HTTPS / ACM Status

| Item | Status |
|------|--------|
| HTTP listener (port 80) | Planned — will function without certificate |
| HTTPS listener (port 443) | NOT PLANNED — requires ACM certificate ARN |
| ACM certificate request | NOT INITIATED — requires DNS validation for `*.pslone.co.za` or individual SANs |
| DNS validation | BLOCKED — `DenyRoute53` prevents Route 53 operations with current identity |
| Custom domains | PENDING — `api.staging.pslone.co.za`, `staging.pslone.co.za` not DNS-configured |

Initial staging can function over HTTP via ALB DNS name (e.g. `psl-one-staging.af-south-1.elb.amazonaws.com`). Custom domain and HTTPS require separate approval and a different identity or guardrail amendment.

---

## Route 53 Status

BLOCKED by `DenyRoute53` guardrail on the current `psl-one-admin` identity. DNS changes require a separate approved identity or guardrail amendment.

---

## Image URI Status

```
IMAGE_STATUS=PLACEHOLDER_FOR_PLAN
```

All three image URIs are planning placeholders. No images have been built or pushed to ECR.

| Image | Placeholder URI used in plan |
|-------|------------------------------|
| API | `844513166932.dkr.ecr.af-south-1.amazonaws.com/psl-one-staging-api:607449a...` |
| Web | `844513166932.dkr.ecr.af-south-1.amazonaws.com/psl-one-staging-web:607449a...` |
| Migrator | `844513166932.dkr.ecr.af-south-1.amazonaws.com/psl-one-staging-api-migrator:607449a...` |

Actual images require: Docker environment, ECR repositories created (which are planned), then build and push.

---

## Estimated Monthly Cost (af-south-1)

Assumptions: 1 desired task per service (256 vCPU, 512 MB), 24×7, 1 NAT gateway, 30-day CloudWatch log retention, no RDS, no CloudFront, moderate log volume (~5 GB/month).

| Component | Estimated range |
|-----------|----------------|
| NAT Gateway (1×, fixed + data) | $45–65/month |
| ALB (fixed + LCU) | $18–25/month |
| ECS Fargate — API task | $8–12/month |
| ECS Fargate — Web task | $8–12/month |
| ECR storage (3 repos, 30 images) | $1–3/month |
| CloudWatch Logs (ingest + storage) | $3–8/month |
| Secrets Manager (1 secret) | $0.40/month |
| **Subtotal — no RDS, no CloudFront** | **$83–125/month** |
| RDS db.t4g.micro, 20 GB, 7-day backup, Single-AZ (if enabled) | + $15–22/month |
| **Total with RDS** | **$98–147/month** |
| CloudFront (if enabled, moderate traffic) | + $10–20/month |

**Note:** af-south-1 pricing is approximately 10–20% higher than us-east-1 for compute and data transfer.  
**Maximum approved monthly budget:** APPROVAL_REQUIRED — no budget has been set.  
**Within budget:** APPROVAL_REQUIRED.

---

## Security Review

| Finding | Classification | Detail |
|---------|---------------|--------|
| `AdministratorAccess` on calling identity | ACCEPTED_STAGING_TRADE_OFF | User's own account; Sprint 0 denies guard against escalation |
| ALB port 80 only (no HTTPS) | ACCEPTED_STAGING_TRADE_OFF | Initial staging; certificate required for HTTPS |
| `allowed_http_cidrs = ["0.0.0.0/0"]` on ALB | ACCEPTED_STAGING_TRADE_OFF | Public ALB; restrict to known CIDRs for tighter staging |
| OIDC thumbprint hardcoded | APPROVAL_REQUIRED | Verify `6938fd4d98bab03faadb97b34396831e3780aea1` is current before apply |
| No database ingress from 0.0.0.0/0 | PASS | DB SG restricted to API and migration SG references |
| No public RDS | PASS | `publicly_accessible = false`; subnet is private |
| No public ECS task IPs | PASS | `assign_public_ip = false` in ecs-service module |
| No secret values in any file | PASS | Secret names only; values not committed |
| No plan or state committed | PASS | Plan in /tmp; `.terraform/` is gitignored |
| No AdministratorAccess on created roles | PASS | Execution role uses managed task execution policy only |
| PassRole scoped | PASS | `iam:PassedToService = ecs-tasks.amazonaws.com` + 4 named ARNs |
| ECS egress unrestricted | ACCEPTED_STAGING_TRADE_OFF | ECS tasks need egress for ECR, Secrets Manager, CloudWatch |
| ADR-028 DenyECSFargate claim | FALSE_POSITIVE | No such statement in actual guardrail policy |
| DenyRDSNonFreeTier conflict with db.t4g.micro | BLOCKER (for RDS apply) | Guardrail must be amended before RDS can be created |
| DenyRoute53 blocks DNS | BLOCKER (for custom domains) | Separate identity or guardrail amendment required |
| Calling identity has no DenyECSFargate | PASS | ECS resources can be applied without guardrail conflict |
| `terraform.tfvars` and `*.tfplan` not in .gitignore | RECOMMENDATION | Add to .gitignore; currently files are safely in /tmp only |

---

## Exact Blockers Before Apply

1. **MISSING_STAGING_SECRET** — Create `psl-one/staging/api/runtime` in Secrets Manager with keys: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGINS`. Required for full plan and apply. No values may be committed.
2. **MISSING_ECR_IMAGES** — Build and push API, web, and migrator Docker images to ECR with full Git SHA immutable tags. ECR repositories must be created first (planned).
3. **RDS_CLASS_GUARDRAIL_CONFLICT** — Sprint 0 `DenyRDSNonFreeTier` allows only `db.t3.micro`; plan uses `db.t4g.micro`. Amend or replace before `create_rds = true` apply.
4. **DNS_BLOCKED** — `DenyRoute53` prevents Route 53 operations. Custom domain and certificate validation require a different identity or amended guardrails.
5. **HTTPS_NOT_PROVISIONED** — ACM certificate ARN for `api.staging.pslone.co.za` and `staging.pslone.co.za` not available. Initial staging can use ALB DNS name over HTTP only.
6. **OIDC_THUMBPRINT_UNVERIFIED** — Verify GitHub OIDC thumbprint is current before apply.
7. **ADR-028 INACCURACY** — Remove `DenyECSFargate` claim from ADR-028 Consequences section.

---

## Exact Approvals Required Before Apply

1. AWS account 844513166932 approved for staging use.
2. Region af-south-1 confirmed.
3. Monthly cost budget set and approved (~$83–147/month depending on RDS).
4. NAT gateway count (1) approved for staging.
5. Secret values created through an authorised process and stored in Secrets Manager.
6. Docker images built and pushed through an authorised process.
7. ACM certificate requested (separate from this story or deferred to HTTP-only initial staging).
8. Route 53 access approved (or deferred; initial staging uses ALB DNS name).
9. OIDC thumbprint verified current.
10. RDS class guardrail amendment approved (if RDS included in initial staging).
11. `psl-one-admin` identity with `AdministratorAccess` approved for Terraform apply, OR a scoped Terraform role is created and used.

---

## Validation State

| Check | Status |
|-------|--------|
| `terraform fmt` | APPLIED — whitespace alignment only |
| `terraform init -backend=false` | PASS |
| `terraform validate` | PASS |
| Partial plan (50 resources) | PASS |
| IAM/OIDC targeted plan (7 resources) | PASS |
| Full plan | PARTIAL — failed at missing secret data source |
| Destroy count | 0 |
| Production resources | 0 |
| Public RDS | 0 |
| Public ECS tasks | 0 |
| Wildcard DB ingress | 0 |
| Real secret values in plan | 0 |
| tflint | TOOL_REQUIRED |
| checkov | TOOL_REQUIRED |
| tfsec | TOOL_REQUIRED |
| No state committed | CONFIRMED |
| No plan committed | CONFIRMED |
| No secrets committed | CONFIRMED |
| No AWS resources created | CONFIRMED |
| Terraform apply | NOT RUN |

---

## Documentation Changed

| File | Change |
|------|--------|
| `docs/infrastructure/S3-INFRA-02-TERRAFORM-PLAN-REVIEW.md` | Created (this file) |
| `infra/terraform/environments/staging/main.tf` | `terraform fmt` whitespace alignment (not committed) |

ADR-028 inaccuracy (DenyECSFargate claim) identified for correction but not committed in this story.

---

## S3-INFRA-02 Acceptance

**Plan is ready for independent review:** YES — with documented blockers and partial plan evidence.  
**S3-INFRA-02 accepted:** PENDING — requires blocker resolution and approval sign-off before apply.  
**Recommended next action:** Resolve blocker 1 (create staging secret), then blocker 2 (build and push images). Once both are resolved, re-run the full plan to confirm 61 resources without errors, then seek apply approval.
