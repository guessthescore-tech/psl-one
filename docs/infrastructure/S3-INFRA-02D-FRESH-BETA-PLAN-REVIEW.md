# S3-INFRA-02D — Fresh Beta EC2 Terraform Plan Review

**Story:** S3-INFRA-02D
**Status:** `FRESH_PLAN_REVIEW_ONLY — APPLY NOT AUTHORISED`
**Date:** 2026-06-16
**Plan timestamp:** 2026-06-16T17:48:02Z
**Baseline commit:** `c6d2e222ee389f12dda231a971214e9fb2e58615`
**Terraform version:** 1.15.6 (darwin/amd64)
**AWS provider:** hashicorp/aws v5.100.0

---

## Identity and Scope

| Field | Value |
|---|---|
| AWS Account | 844513166932 |
| Region | af-south-1 |
| Caller | arn:aws:iam::844513166932:user/psl-one-admin |
| Terraform root | infra/terraform/environments/beta-ec2 |
| Variable file | /tmp/psl-one-beta-fresh-plan.tfvars (temporary, not committed) |
| State backend | local (no backend.tf; acceptable for temporary beta) |

---

## Public IP and CIDR

| Field | Value |
|---|---|
| Current public IP | 169.0.126.211 |
| Approved CIDR | 169.0.126.211/32 |
| CIDR status | MATCH |
| Ingress | HTTP (80) and HTTPS (443) restricted to 169.0.126.211/32 only |

---

## Explicit Subnet

| Field | Value |
|---|---|
| Subnet ID | subnet-0972d64b0be296aa3 |
| Availability zone | af-south-1b |
| VPC | vpc-03d01af618a6d8c22 (default VPC) |
| CIDR | 172.31.32.0/20 |
| State | available |
| MapPublicIpOnLaunch | true |

---

## Plan Summary

| Metric | Count |
|---|---|
| Resources to add | **10** |
| Resources to change | **0** |
| Resources to destroy | **0** |

`GENERATE_FRESH_PLAN_IMMEDIATELY_BEFORE_APPLY=true`

---

## Exact Resource Inventory

| # | Resource address | Action |
|---|---|---|
| 1 | `aws_iam_instance_profile.beta` | create |
| 2 | `aws_iam_role.beta_ec2` | create |
| 3 | `aws_iam_role_policy.ecr_pull` | create |
| 4 | `aws_iam_role_policy.ssm_params` | create |
| 5 | `aws_iam_role_policy_attachment.ssm_core` | create |
| 6 | `aws_instance.beta` | create |
| 7 | `aws_security_group.beta_ec2` | create |
| 8 | `aws_vpc_security_group_egress_rule.all_outbound` | create |
| 9 | `aws_vpc_security_group_ingress_rule.http["169.0.126.211/32"]` | create |
| 10 | `aws_vpc_security_group_ingress_rule.https["169.0.126.211/32"]` | create |

No other resources are planned.

---

## EC2 Instance Review

| Property | Planned value | Assessment |
|---|---|---|
| AMI | ami-0c45a4a1d0c378234 (Amazon Linux 2023, af-south-1) | PASS |
| Instance type | t2.micro | PASS — Free Tier eligible; DenyNonFreeTierEC2 compatible |
| Subnet | subnet-0972d64b0be296aa3 | PASS — matches approved explicit subnet |
| Key name | (none — empty string) | PASS — no SSH key; SSM access only |
| IAM profile | psl-one-beta-ec2 | PASS — attaches scoped instance role |
| IMDSv2 | `http_tokens = "required"` | PASS — enforced; no IMDSv1 access |
| `http_endpoint` | enabled | PASS — required for IMDSv2 |
| Public IP | associate_public_ip_address = true | EXPECTED — no EIP; direct public IPv4 for Caddy ingress |
| User data hash | 86c53119... | PASS — bootstrap script present |
| Tags | Name=psl-one-beta, Project=psl-one, Environment=beta, ManagedBy=terraform, Story=S3-INFRA-02A | PASS |

---

## EBS Root Volume Review

| Property | Planned value | Assessment |
|---|---|---|
| Size | 20 GB | PASS |
| Type | gp3 | PASS |
| Encrypted | true | PASS |
| delete_on_termination | true | DELIBERATE — beta instance; no persistent data off-instance; database is in Docker volume on same EBS; accepted for temporary beta |
| KMS key | AWS-managed default (known after apply) | PASS — no custom KMS cost |

---

## Security Group Review

| Rule | Direction | Port | Source | Assessment |
|---|---|---|---|---|
| HTTP | Ingress | 80/tcp | 169.0.126.211/32 | PASS — reviewer-only |
| HTTPS | Ingress | 443/tcp | 169.0.126.211/32 | PASS — reviewer-only |
| SSH (22) | Ingress | — | — | NOT PRESENT — PASS |
| Port 4000 (API) | Ingress | — | — | NOT PRESENT — Caddy reverse-proxies; PASS |
| Port 3001 (Web) | Ingress | — | — | NOT PRESENT — Caddy reverse-proxies; PASS |
| PostgreSQL (5432) | Ingress | — | — | NOT PRESENT — PASS |
| All outbound | Egress | all | 0.0.0.0/0 | EXPECTED — required for ECR pull, SSM, updates |

Security group description: "PSL One beta EC2 — HTTP/HTTPS via Caddy only; no SSH; both ports restricted by allowed_beta_cidrs"

---

## IAM Review

### Instance Role: psl-one-beta-ec2

**Trust:** `ec2.amazonaws.com` — `sts:AssumeRole`

**Attached managed policy:** `AmazonSSMManagedInstanceCore` (AWS-managed)
→ Enables SSM Session Manager, Run Command, Parameter Store reads via SSM agent

**Inline policy: psl-one-beta-ecr-pull**

| Sid | Action | Resource |
|---|---|---|
| ECRToken | `ecr:GetAuthorizationToken` | `*` (required by ECR; no repo-level scoping possible for this action) |
| ECRPullBetaRepos | `ecr:BatchCheckLayerAvailability`, `ecr:GetDownloadUrlForLayer`, `ecr:BatchGetImage` | 3 specific ARNs: psl-one-beta-api, psl-one-beta-api-migrator, psl-one-beta-web |

**Inline policy: psl-one-beta-ssm-params**

| Sid | Action | Resource |
|---|---|---|
| ReadBetaParameters | `ssm:GetParameter`, `ssm:GetParameters`, `ssm:GetParametersByPath` | `arn:aws:ssm:af-south-1:844513166932:parameter/psl-one/beta/*` |

**Assessment:**
- No AdministratorAccess — PASS
- No `iam:*` — PASS
- No `ec2:*` — PASS
- No `s3:*` — PASS
- ECR pull scoped to 3 exact repo ARNs (except GetAuthorizationToken which is IAM-unscoped by AWS) — PASS
- SSM param access scoped to `/psl-one/beta/*` — PASS
- No production resources reachable — PASS

---

## Zero-Footprint Confirmation

| Resource type | Count in plan |
|---|---|
| NAT Gateway | 0 |
| ALB / NLB | 0 |
| ECS Cluster / Service / Task | 0 |
| RDS Instance / Cluster | 0 |
| CloudFront Distribution | 0 |
| Elastic IP | 0 |
| Route 53 Record | 0 |
| ACM Certificate | 0 |
| Secrets Manager Secret | 0 |
| VPC / Subnet / IGW | 0 (using default VPC) |
| S3 Bucket | 0 |
| SSH ingress rule | 0 |

---

## Cost and Credit Estimates

**NEEDS_CURRENT_PRICING_EVIDENCE** — Rates below were sourced during S3-INFRA-02 session and have not been independently reconfirmed against the live AWS af-south-1 price list. Reconfirm at [https://aws.amazon.com/ec2/pricing/on-demand/](https://aws.amazon.com/ec2/pricing/on-demand/) immediately before applying. All figures are estimates only.

**Pricing assumptions used (af-south-1, on-demand, approximate)**

| Component | Assumed rate | Basis |
|---|---|---|
| t2.micro compute | $0.0136/hr | On-demand; Free Tier: 750 hrs/month if eligible |
| 20 GB gp3 EBS | $0.088/GB-month → $1.76/month fixed | Always-on; independent of instance state |
| Public IPv4 (ephemeral, no EIP) | $0.005/hr while running | Per hour the instance runs with a public IP assigned |
| Data transfer out | $0.154/GB | Charged only on egress; minimal for reviewer testing |
| SSM Session Manager | $0.00 | No charge for EC2 managed instances |
| ECR storage | $0.10/GB-month | Negligible for initial image set |
| CloudWatch logs | $0.76/GB ingest | Docker logs not forwarded by default; zero unless explicitly configured |

**Fixed monthly costs (independent of runtime):** EBS $1.76 + ECR ~$0.10 = **~$1.86/month**

**Runtime-variable costs:** EC2 compute + public IPv4, charged per hour running

### Scenario estimates (USD/month, conservative)

Calculations use 4.33 weeks/month.

| Scenario | Runtime hours | EC2 ($0.0136/hr) | IPv4 ($0.005/hr) | EBS (fixed) | Formula | Estimate |
|---|---|---|---|---|---|---|
| 8 hrs/day, 5 days/week | 8 × 5 × 4.33 = **173.2 hrs** | 173.2 × $0.0136 = $2.36 | 173.2 × $0.005 = $0.87 | $1.76 | $2.36 + $0.87 + $1.76 | **~$5.00/month** |
| 12 hrs/day, 5 days/week | 12 × 5 × 4.33 = **259.8 hrs** | 259.8 × $0.0136 = $3.53 | 259.8 × $0.005 = $1.30 | $1.76 | $3.53 + $1.30 + $1.76 | **~$6.60/month** |
| 24/7 | **744 hrs** | 744 × $0.0136 = $10.12 | 744 × $0.005 = $3.72 | $1.76 | $10.12 + $3.72 + $1.76 | **~$15.60/month** |
| Instance stopped (EBS only) | 0 hrs | $0.00 | $0.00 | $1.76 | $0 + $0 + $1.76 | **~$1.76/month** |

**ZAR equivalent** (at ~R18.50/USD, illustrative rate — confirm current ZAR/USD before presenting):

| Scenario | USD/month | ZAR/month (~R18.50/USD) |
|---|---|---|
| 8 hrs/day, 5 days/wk | ~$5.00 | ~R92.50 |
| 12 hrs/day, 5 days/wk | ~$6.60 | ~R122.10 |
| 24/7 | ~$15.60 | ~R288.60 |
| Stopped | ~$1.76 | ~R32.60 |

**Notes:**
- AWS credits absorb costs before cash is charged. Credits sourced via Activate program (expiry 2027-06-08).
- At 8 hrs/day, 5 days/week: ~$5.00/month sits between the USD 1 and USD 5 budget alert thresholds.
- At 12 hrs/day, 5 days/week: ~$6.60/month exceeds the USD 5 alert but stays below USD 10.
- At 24/7: ~$15.60/month exceeds the USD 10 alert threshold — budget alert will fire.
- Recommended operating mode: start instance before testing sessions, stop afterward (~8 hrs/day, 5 days/week profile).

### Cost declarations

```
Cash-spend target:                                              R0
AWS credits may be consumed:                                    YES
Guaranteed zero cost:                                           NO
Terraform apply authorised:                                     NO
Pricing estimates require reconfirmation immediately before apply.
```

---

## Billing Safeguards (verified read-only)

| Safeguard | Status |
|---|---|
| USD 1.00 budget | PRESENT |
| USD 5.00 budget | PRESENT |
| USD 10.00 budget | PRESENT |
| Daily anomaly alert (threshold $1.00) | PRESENT |
| DenyNonFreeTierEC2 guardrail | ACTIVE (t2.micro is compliant) |
| DenyRDSClusters guardrail | ACTIVE (no RDS planned) |
| DenyMSKKafka guardrail | ACTIVE (no Kafka planned) |
| DenyRoute53 guardrail | ACTIVE (no DNS changes via this identity) |

---

## Local-State Protection

All Terraform artefacts are covered by `.gitignore` (verified with `git check-ignore`):

| Pattern | .gitignore rule | Lines |
|---|---|---|
| `.terraform/` directory | `**/.terraform/` | line 19 |
| `terraform.tfstate` | `**/*.tfstate` | line 20 |
| `terraform.tfstate.backup` | `**/*.tfstate.backup` | line 21 |
| `.terraform.lock.hcl` | `**/.terraform.lock.hcl` | line 22 |
| `terraform.tfvars` | `**/terraform.tfvars` | line 23 |
| `*.tfplan` | `**/*.tfplan` | line 24 |

`.example` files (`terraform.tfvars.example`, `backend.tf.example`) are **not** ignored and remain committable.

State will be written to `infra/terraform/environments/beta-ec2/terraform.tfstate` on apply. This file must not be committed. It must be preserved locally until the instance is terminated and destroyed.

---

## Plan Binary and Text Consistency

The fresh binary plan was rendered twice in the same validated Terraform session.
Both render commands completed successfully.
The two independently rendered text files were byte-for-byte identical.
Plan result: 10 add, 0 change, 0 destroy.

```
# Render 1
terraform -chdir=infra/terraform/environments/beta-ec2 \
  show -no-color /tmp/psl-one-beta-fresh.tfplan \
  > /tmp/psl-one-beta-fresh-plan.txt          # exit 0, 320 lines

# Render 2
terraform -chdir=infra/terraform/environments/beta-ec2 \
  show -no-color /tmp/psl-one-beta-fresh.tfplan \
  > /tmp/psl-one-beta-fresh-plan-render-2.txt # exit 0, 320 lines

# Comparison
diff -u /tmp/psl-one-beta-fresh-plan.txt /tmp/psl-one-beta-fresh-plan-render-2.txt
# exit 0 — byte-for-byte identical
```

No provider schema error in either render. No stale plan reuse. Plan generated fresh at 2026-06-16T17:48:02Z after clean `terraform init` (`.terraform` directory rebuilt from lock file; provider binary re-installed: hashicorp/aws v5.100.0, darwin_amd64, Mach-O 64-bit x86_64).

---

## Variable File Security Scan

File: `/tmp/psl-one-beta-fresh-plan.tfvars` (temporary, not in repository)

Secret-pattern scan result: **CLEAN**

No AWS credentials, database passwords, JWT secrets, database URLs, private keys, or production values are present in the variable file.

---

## Blockers Before Apply

The following must be satisfied before `terraform apply` may proceed:

| # | Blocker | Status |
|---|---|---|
| 1 | Explicit owner `terraform apply` authorisation in this conversation | REQUIRED — NOT GRANTED |
| 2 | GitHub `beta` environment created with `AWS_BETA_DEPLOY_ROLE_ARN` secret | OWNER_CONSOLE_ACTION_REQUIRED |
| 3 | GitHub `beta` environment variables set: `BETA_API_DOMAIN`, `BETA_WEB_DOMAIN`, `BETA_API_BASE_URL`, `BETA_WEB_BASE_URL` | OWNER_CONSOLE_ACTION_REQUIRED |
| 4 | GitHub `beta` environment deployment branch restriction set to `main` | OWNER_CONSOLE_ACTION_REQUIRED (P1 security control) |
| 5 | Owner cost acceptance confirmed for each line item | REQUIRED |
| 6 | Credit balance confirmed sufficient (expected ≥ USD 120, expiry 2027-06-08) | REQUIRED |
| 7 | Current af-south-1 pricing reconfirmed against live AWS price list | REQUIRED — rates marked NEEDS_CURRENT_PRICING_EVIDENCE |
| 8 | Fresh plan regenerated immediately before apply if >60 minutes elapsed, CIDR changed, or any infrastructure state changed (re-confirm `curl -fsS https://checkip.amazonaws.com` matches approved /32 before running plan) | SATISFIED for current session — must re-run before apply |

**Apply sequence once authorised:**

```bash
# 1. Confirm IP is still 169.0.126.211 immediately before apply
curl -fsS https://checkip.amazonaws.com

# 2. Re-run fresh plan (mandatory — do not reuse the plan binary if time has elapsed)
terraform -chdir=infra/terraform/environments/beta-ec2 plan \
  -refresh=true -input=false \
  -var-file=/tmp/psl-one-beta-fresh-plan.tfvars \
  -out=/tmp/psl-one-beta-fresh.tfplan

# 3. Apply only after explicit owner authorisation in conversation
terraform -chdir=infra/terraform/environments/beta-ec2 apply \
  /tmp/psl-one-beta-fresh.tfplan

# 4. Record outputs
terraform -chdir=infra/terraform/environments/beta-ec2 output -json
```

---

## Exclusions Confirmed

| Item | Status |
|---|---|
| No secrets in plan or variable file | CONFIRMED |
| No Terraform state committed | CONFIRMED |
| No plan binary committed | CONFIRMED |
| No AWS resources changed by this story | CONFIRMED — plan only |
| No ECR images built or pushed | CONFIRMED |
| No Docker containers started | CONFIRMED |
| No PSL season activated | CONFIRMED |
| No real-money or production adapter enabled | CONFIRMED |
| STORY-40 remains reserved and was not implemented | CONFIRMED |

---

## Independent Review Readiness

S3-INFRA-02D is ready for independent review.

All plan evidence is inspectable:

```bash
# Reproduce fresh plan
terraform -chdir=infra/terraform/environments/beta-ec2 plan \
  -refresh=true -input=false \
  -var-file=/tmp/psl-one-beta-fresh-plan.tfvars

# Review plan binary (generated during S3-INFRA-02D)
terraform -chdir=infra/terraform/environments/beta-ec2 \
  show -no-color /tmp/psl-one-beta-fresh.tfplan

# Review Terraform configuration
cat infra/terraform/environments/beta-ec2/main.tf
cat infra/terraform/environments/beta-ec2/variables.tf
cat infra/terraform/environments/beta-ec2/versions.tf
```
