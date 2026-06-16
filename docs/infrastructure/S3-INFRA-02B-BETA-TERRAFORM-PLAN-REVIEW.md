# S3-INFRA-02B — Beta Terraform Plan Review

Story: S3-INFRA-02B
Status: PLAN_REVIEW_ONLY — NOT DEPLOYED
Date: 2026-06-16
Baseline commit: 546bed2ac36ef410b098dcde6fa79c363889b612
Author: Infrastructure / Claude Code
Account: `Guess__The_Score` (844513166932)

GENERATE_FRESH_PLAN_IMMEDIATELY_BEFORE_APPLY=true

---

## Account Classification

| Field | Value |
|---|---|
| AWS account | 844513166932 (`Guess__The_Score`) |
| IAM caller | `arn:aws:iam::844513166932:user/psl-one-admin` |
| Root user | NO |
| MFA | YES — U2F hardware key (enabled 2026-06-08) |
| AWS Plan | Free Plan — ACTIVE |
| Active credit balance | USD 120.00 |
| Credits used (MTD) | USD 0.00 |
| Credit expiry | 2027-06-08 |
| Credit composition | USD 100 (Free Tier) + USD 20 (Budgets setup) |
| Automatic paid upgrade | NOT AUTHORISED |
| Cash-spend target | R0 |
| Maximum approved cash exposure | R0 |
| Approved planning ceiling | USD 40 (credit-use threshold, not permission to spend) |
| Target deployment region | af-south-1 (Cape Town) |

---

## Terraform Metadata

| Field | Value |
|---|---|
| Terraform version | v1.15.6 (darwin_amd64) |
| Backend | `local` (no remote state configured for plan) |
| Plan flags | `-refresh=false -input=false` |
| Plan file | `/tmp/psl-one-beta.tfplan` (not committed) |
| Vars file | `/tmp/psl-one-beta-plan.tfvars` (not committed) |
| fmt check | PASS |
| validate | Success! The configuration is valid. |

---

## Approved Non-Secret Plan Inputs

| Variable | Value | Source |
|---|---|---|
| `aws_region` | `af-south-1` | Owner approved |
| `instance_type` | `t2.micro` | Owner approved; guardrail-safe |
| `root_volume_size` | `20` GB | Owner approved |
| `root_volume_type` | `gp3` | Default |
| `create_elastic_ip` | `false` | Owner approved |
| `key_pair_name` | `""` | SSM-only access; no key pair |
| `subnet_id` | `subnet-0972d64b0be296aa3` | af-south-1b; explicit — **REQUIRED BEFORE APPLY** |
| `api_domain` | `api.staging.pslone.co.za` | Default (Mode A) |
| `web_domain` | `staging.pslone.co.za` | Default (Mode A) |
| `allowed_beta_cidrs` | `["169.0.126.211/32"]` | **OWNER CONFIRMATION REQUIRED** — see below |

### CIDR Confirmation Required

The public IPv4 detected at plan time was `169.0.126.211`.
Proposed CIDR: `169.0.126.211/32`
Verification result: `CIDR_STATUS=MATCH` (confirmed at remediation time)

**Owner must reconfirm this IP immediately before apply.** Reasons:
- ISP-assigned dynamic IPs can change between sessions.
- If the IP has rotated, port 80/443 access will fail and `terraform apply` must be re-run.
- To confirm: `curl -sf https://checkip.amazonaws.com` immediately before apply.
- If additional reviewer IPs are needed, add them to `allowed_beta_cidrs` as a list.

No `0.0.0.0/0` in the plan. Mode B (public HTTPS) requires a separate explicit owner approval.

### Subnet Selection

`EXPLICIT_SUBNET_INPUT_REQUIRED_BEFORE_APPLY=true`

The plan uses an explicit `subnet_id = "subnet-0972d64b0be296aa3"` (af-south-1b).
The Terraform `subnet_id` variable was added in this story to eliminate nondeterministic
`data.aws_subnets.default_public.ids[0]` resolution, which can return different subnets
across plan runs depending on API response ordering.

Rules:
- Approved apply must include `subnet_id = "subnet-0972d64b0be296aa3"` in the vars file.
- Changing to another subnet requires a fresh plan and owner re-approval.
- The `ids[0]` fallback remains for exploratory planning only; never for apply.
- Other available subnets: `subnet-03fb978d90f785dc7` (af-south-1c), `subnet-0dcab52a25864644d` (af-south-1a).

---

## Discovered Networking

| Resource | Value |
|---|---|
| Default VPC | `vpc-03d01af618a6d8c22` (172.31.0.0/16) |
| Selected subnet | `subnet-0972d64b0be296aa3` (af-south-1b, 172.31.32.0/20) |
| Availability zone | `af-south-1b` |
| Subnet available IPs | 4,091 |
| `MapPublicIpOnLaunch` | true (ephemeral public IP assigned) |
| Other available subnets | subnet-03fb978d90f785dc7 (af-south-1c), subnet-0dcab52a25864644d (af-south-1a) |

---

## Plan Summary

```
Plan: 10 to add, 0 to change, 0 to destroy.
```

| Counter | Count |
|---|---|
| Resources to add | **10** |
| Resources to change | **0** |
| Resources to destroy | **0** |

---

## Resource Inventory

Exact ten planned resources:

| # | Terraform address | Kind | Key attributes |
|---|---|---|---|
| 1 | `aws_iam_role.beta_ec2` | IAM role | Name: `psl-one-beta-ec2`; assume by `ec2.amazonaws.com` only |
| 2 | `aws_iam_role_policy_attachment.ssm_core` | Managed policy attachment | `AmazonSSMManagedInstanceCore` only |
| 3 | `aws_iam_role_policy.ecr_pull` | Inline policy | `ECRToken` on `*` (token only); pull on 3 specific repos |
| 4 | `aws_iam_role_policy.ssm_params` | Inline policy | GetParameter* on `/psl-one/beta/*` only |
| 5 | `aws_iam_instance_profile.beta` | Instance profile | Name: `psl-one-beta-ec2` |
| 6 | `aws_security_group.beta_ec2` | Security group (1) | No port 22; no port 3001/4000/5432 |
| 7 | `aws_vpc_security_group_ingress_rule.http["169.0.126.211/32"]` | Ingress rule | Port 80, TCP, `169.0.126.211/32` only |
| 8 | `aws_vpc_security_group_ingress_rule.https["169.0.126.211/32"]` | Ingress rule | Port 443, TCP, `169.0.126.211/32` only |
| 9 | `aws_vpc_security_group_egress_rule.all_outbound` | Egress rule | All outbound (required for SSM, ECR pull, system updates) |
| 10 | `aws_instance.beta` | EC2 t2.micro | AMI: `ami-0c45a4a1d0c378234` (AL2023 x86_64); IMDSv2; EBS 20 GB gp3 encrypted; subnet: `subnet-0972d64b0be296aa3` |

Security group breakdown: **1 security group resource + 2 ingress-rule resources + 1 egress-rule resource.**

**Not in plan (confirmed zero):**

| Resource type | Count | Note |
|---|---|---|
| Elastic IP | 0 | `create_elastic_ip = false` |
| NAT Gateway | 0 | Not in configuration |
| ALB | 0 | Caddy handles routing |
| ECS cluster | 0 | Not in configuration |
| RDS | 0 | Postgres runs in Docker |
| CloudFront | 0 | Not in configuration |
| SSH ingress (port 22) | 0 | Intentionally excluded |
| Public PostgreSQL (port 5432) | 0 | Internal Docker only |

---

## Security Review

| Check | Result |
|---|---|
| IMDSv2 required | PASS — `http_tokens = "required"` |
| EBS encrypted | PASS — `encrypted = true` |
| Root volume `delete_on_termination` | PASS — `true` |
| Port 22 absent | PASS — not in any ingress rule |
| Ports 3001, 4000, 5432 absent | PASS — internal Docker only |
| Port 80 restricted | PASS — `169.0.126.211/32` only |
| Port 443 restricted | PASS — `169.0.126.211/32` only |
| No `0.0.0.0/0` on ingress | PASS |
| ECR pull scoped | PASS — 3 repos only; `GetAuthorizationToken` on `*` is AWS-required and unavoidable |
| SSM params scoped | PASS — `/psl-one/beta/*` only |
| No `AdministratorAccess` on instance role | PASS |
| No production resource names or tags | PASS — all tagged `Environment=beta` |
| AMI architecture | PASS — `x86_64` (AL2023 x86_64) |
| instance_type | PASS — `t2.micro` (guardrail-safe) |
| No key pair attached | PASS — `key_name` is `null` |
| SSM access path | PASS — `AmazonSSMManagedInstanceCore` attached |
| Outbound egress | PASS — all outbound required (SSM, ECR, system updates) |
| Subnet explicit | PASS — `subnet-0972d64b0be296aa3` pinned in plan |

**One AWS-required exception:**

`ecr:GetAuthorizationToken` must be scoped to `Resource: ["*"]` — AWS does not support resource-level
restriction for this action. This is the same pattern used in the AWS-managed
`AmazonEC2ContainerRegistryReadOnly` policy. All pull actions are fully scoped to the 3 beta repos.

---

## AMI Details

| Field | Value |
|---|---|
| AMI ID | `ami-0c45a4a1d0c378234` |
| Name pattern | `al2023-ami-2023.*-x86_64` |
| Owner | Amazon |
| Architecture | x86_64 |
| State | available |
| Selection | Most recent at plan time |
| `ignore_changes` | `[ami]` — frozen after first apply to prevent unintended instance replacement |

---

## Cost Estimates

### Pricing Basis (af-south-1, June 2026)

| Resource | Rate | Notes |
|---|---|---|
| EC2 t2.micro | ~$0.0116/hr | Standard on-demand; credits cover while eligible |
| EBS 20 GB gp3 | ~$0.08/GB-month = $1.60/month | Charged even when instance is stopped |
| Public IPv4 (ephemeral) | $0.005/hr | Only when instance is running; released on stop |
| ECR storage | ~$0 initially | First 500 MB/month free; 3 images ≈ 150–300 MB |
| SSM Session Manager | ~$0 | No per-session charge for EC2 |
| CloudWatch | ~$0 | No CW agent; Docker logs to stderr only |
| Data transfer out | ~$0 | Low for restricted-CIDR internal review |

```
Cash-spend target: R0
AWS credits may be consumed: YES
Guaranteed zero cost: NO
Active credits: USD 120.00
Approved planning ceiling: USD 40 credit use
Credit expiry: 2027-06-08
```

### Monthly Estimates by Usage Pattern

| Scenario | Hours/month | EC2 | IPv4 | EBS | Total/month |
|---|---|---|---|---|---|
| Limited (8h/day × 5d/week) | ~172 h | ~$2.00 | ~$0.86 | $1.60 | **~$4.46** |
| Business (12h/day × 5d/week) | ~258 h | ~$2.99 | ~$1.29 | $1.60 | **~$5.88** |
| 24/7 continuous | ~744 h | ~$8.63 | ~$3.72 | $1.60 | **~$13.95** |
| Stopped (no running hours) | 0 h | $0 | $0 | $1.60 | **~$1.60** |

### Credit-Life Estimates

| Scenario | Monthly cost | USD 120 lasts | Note |
|---|---|---|---|
| Limited hours | ~$4.46 | ~26.9 months | Credits expire 2027-06-08 first |
| Business hours | ~$5.88 | ~20.4 months | Credits expire 2027-06-08 first |
| 24/7 continuous | ~$13.95 | ~8.6 months | Balance exhausted ~Mar 2027 |
| Stopped only | ~$1.60 | ~75 months | Credits expire 2027-06-08 first |

**Recommendation:** Use Limited or Business hours mode. Stop the instance between review
sessions. All four scenarios remain within the USD 40 planning ceiling for several months.

**Credit expiry is the binding constraint, not balance.** Plan the beta review cycle to
conclude before 2027-06-08.

Budget and anomaly alerts are **notification only**. They do not automatically stop AWS
spending or terminate the instance. The owner must respond to alerts manually.

---

## Billing Safeguards (Verified Read-Only)

| Control | Limit | Status | Health |
|---|---|---|---|
| `psl-one-beta-001-usd` budget | >$1.00 actual/month | ACTIVE | HEALTHY |
| `psl-one-beta-005-usd` budget | >$5.00 actual/month | ACTIVE | HEALTHY |
| `psl-one-beta-010-usd` budget | >$10.00 actual/month | ACTIVE | HEALTHY |
| `psl-one-beta-daily-anomaly-alerts` | ≥$1 anomaly impact | ACTIVE | CONFIRMED |
| `Default-Services-Subscription` | ≥$100 AND ≥40% | ACTIVE (existing) | CONFIRMED |

Alert email: `guessthescore2@gmail.com` (all controls)

---

## Owner Approvals Required Before Apply

| # | Item | Status |
|---|---|---|
| 1 | Reconfirm `169.0.126.211/32` is correct at time of apply (`curl https://checkip.amazonaws.com`) | **REQUIRED** |
| 2 | Confirm AWS credit balance is still USD 120.00 in Billing console | **REQUIRED** |
| 3 | Confirm credits have not expired (expiry: 2027-06-08) | **REQUIRED** |
| 4 | Confirm `backend.tf` is configured (S3 remote state or local state accepted) | **REQUIRED** |
| 5 | Confirm ECR repositories exist before deploy workflow runs | **REQUIRED** |
| 6 | Confirm SSM parameters are stored under `/psl-one/beta/*` | **REQUIRED** |
| 7 | Confirm GitHub secrets are set in `beta` environment | **REQUIRED** |
| 8 | Confirm no automatic paid plan upgrade in Account Settings | **REQUIRED** |
| 9 | Accept that EBS charges (~$1.60/month) begin immediately on apply | **REQUIRED** |
| 10 | Accept that public IPv4 charges (~$0.005/hr) begin when instance is running | **REQUIRED** |
| 11 | Authorise `terraform apply` after reviewing this document and running a fresh plan | **REQUIRED** |

---

## Exact Blockers Before Apply

Beyond owner approvals above, the following infrastructure prerequisites must exist before
`terraform apply` can succeed and the deploy workflow can complete:

1. `backend.tf` created from `infra/terraform/environments/beta-ec2/backend.tf.example`
   — configure S3 bucket + DynamoDB table for remote state, or accept local state.

2. A **fresh Terraform plan** must be generated immediately before apply:
   ```bash
   terraform -chdir=infra/terraform/environments/beta-ec2 plan \
     -refresh=true -input=false \
     -var-file=<path>/terraform.tfvars \
     -out=<path>/beta.tfplan
   ```
   The plan file in `/tmp` from this review session must not be used for apply —
   it was produced with `-refresh=false` and may be stale.

3. ECR repositories created (one-time, owner action):
   - `psl-one-beta-api`
   - `psl-one-beta-api-migrator`
   - `psl-one-beta-web`

4. SSM parameters stored under `/psl-one/beta/*` — 12 parameters required.
   These do not yet exist. They are deployment blockers, not documentation-commit blockers.
   Values must **not** be stored in Terraform source. Passwords and JWT secret must use
   `SecureString` type. Parameter creation requires explicit owner approval.

   | SSM parameter path | Type | Description |
   |---|---|---|
   | `/psl-one/beta/postgres-user` | String | PostgreSQL username |
   | `/psl-one/beta/postgres-db` | String | PostgreSQL database name |
   | `/psl-one/beta/postgres-password` | SecureString | PostgreSQL password |
   | `/psl-one/beta/jwt-secret` | SecureString | JWT signing secret |
   | `/psl-one/beta/caddy-acme-email` | String | Let's Encrypt registration email |
   | `/psl-one/beta/api-image-uri` | String | ECR URI for API image |
   | `/psl-one/beta/migration-image-uri` | String | ECR URI for migrator image |
   | `/psl-one/beta/web-image-uri` | String | ECR URI for web image |
   | `/psl-one/beta/git-sha` | String | Deployed commit SHA (updated per deploy) |
   | `/psl-one/beta/api-domain` | String | API virtual host (e.g. api.staging.pslone.co.za) |
   | `/psl-one/beta/web-domain` | String | Web virtual host (e.g. staging.pslone.co.za) |
   | `/psl-one/beta/cors-origins` | String | CORS allowed origins |

5. GitHub Actions secrets set in the `beta` environment:
   - `AWS_BETA_DEPLOY_ROLE_ARN` — OIDC deploy role ARN (not `psl-one-admin` credentials)
   - `BETA_EC2_INSTANCE_ID` — obtained from Terraform outputs after apply
   - `BETA_API_BASE_URL` — e.g. `http://169.0.126.211`
   - `BETA_WEB_BASE_URL` — e.g. `http://169.0.126.211`
   - `BETA_EC2_IP` — EC2 public IP for smoke test Host header injection

6. OIDC identity provider for `token.actions.githubusercontent.com` configured in the AWS account.

7. IAM OIDC deploy role created with trust policy for `repo:guessthescore-tech/psl-one:environment:beta`
   and scoped deploy permissions (SSM Run Command, ECR describe, EC2 describe).

8. Docker images built and pushed to ECR (via GitHub Actions `deploy-beta-ec2.yml`).

9. `bootstrap-data.sh` run on instance after first launch to initialise the database.

---

## Stop Point

This document covers planning and approval only.

```
PLAN_REVIEW_ONLY — NOT DEPLOYED
GENERATE_FRESH_PLAN_IMMEDIATELY_BEFORE_APPLY=true
EXPLICIT_SUBNET_INPUT_REQUIRED_BEFORE_APPLY=true
```

No AWS resources have been created by this story.
No Terraform apply has been executed.
No ECR repositories exist.
No SSM parameters have been stored.
No EC2 instance is running.
No IAM OIDC role exists.

Next step: owner reviews this document, provides apply approval, and follows
the blockers list above before running `terraform apply`.
