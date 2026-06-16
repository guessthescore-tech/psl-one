# S3-INFRA-02E — t3.micro Pre-Apply Correction

**Story:** S3-INFRA-02E
**Status:** `PREAPPLY_CONFIGURATION_CORRECTED — IAM GUARDRAIL BLOCKS APPLY`
**Date:** 2026-06-16
**Baseline commit:** `e0b0ad7ee257d97bb1c464ea752241244511ffa7`
**AWS account:** 844513166932
**AWS region:** af-south-1

SUPERSEDES_T2_MICRO_PLAN_ASSUMPTION=true
GENERATE_FRESH_PLAN_IMMEDIATELY_BEFORE_APPLY=true
IAM_GUARDRAIL_AMENDMENT_REQUIRED_BEFORE_APPLY=true

---

## Finding

Previous plan reviews (S3-INFRA-02B, S3-INFRA-02D) assumed `instance_type = "t2.micro"`.

Live verification confirmed that **`t2.micro` is not offered in `af-south-1`**:

```bash
aws ec2 describe-instance-type-offerings \
  --region af-south-1 \
  --location-type region \
  --filters Name=instance-type,Values=t2.micro \
  --query 'InstanceTypeOfferings[].InstanceType' \
  --output text
# Result: (empty)
```

`terraform apply` with `instance_type = "t2.micro"` would have failed immediately
with an unsupported instance type error. This was not caught at plan time because
Terraform plan-phase validation does not query EC2 instance type availability.

---

## t3.micro Availability Confirmed

```bash
aws ec2 describe-instance-type-offerings \
  --region af-south-1 \
  --location-type region \
  --filters Name=instance-type,Values=t3.micro \
  --query 'InstanceTypeOfferings[].InstanceType' \
  --output text
# Result: t3.micro

aws ec2 describe-instance-type-offerings \
  --region af-south-1 \
  --location-type availability-zone \
  --filters Name=location,Values=af-south-1b Name=instance-type,Values=t3.micro \
  --query 'InstanceTypeOfferings[].{Type:InstanceType,Location:Location}' \
  --output json
# Result: [{"Type": "t3.micro", "Location": "af-south-1b"}]
```

Available af-south-1 t-series: t3.nano, t3.micro, t3.small, t3.medium, t3.large,
t3.xlarge, t3.2xlarge, t4g.nano, t4g.micro, t4g.small, t4g.medium, t4g.large,
t4g.xlarge, t4g.2xlarge. No t2 family.

---

## Guardrail Status — APPLY BLOCKER

`PSLOneSprint0DenyGuardrails` was verified via AWS IAM API (2026-06-16).

**Finding: The policy IS effectively attached to `psl-one-admin`** through the
`PSLOneSprint0Infra` IAM group:

```
psl-one-admin → member of → PSLOneSprint0Infra
PSLOneSprint0Infra → has attached → PSLOneSprint0DenyGuardrails
```

Verified via:
```bash
aws iam list-groups-for-user --user-name psl-one-admin
# → Groups: [PSLOneSprint0Infra]

aws iam list-attached-group-policies --group-name PSLOneSprint0Infra
# → Policies include: PSLOneSprint0DenyGuardrails

aws iam list-entities-for-policy \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprint0DenyGuardrails
# → PolicyGroups: [{GroupName: PSLOneSprint0Infra}]
```

The `DenyNonFreeTierEC2` statement denies `ec2:RunInstances` on any instance
whose type is not `t2.micro`:

```json
{
  "Sid": "DenyNonFreeTierEC2",
  "Effect": "Deny",
  "Action": "ec2:RunInstances",
  "Resource": "arn:aws:ec2:*:*:instance/*",
  "Condition": {
    "StringNotEquals": {
      "ec2:InstanceType": "t2.micro"
    }
  }
}
```

Because `t2.micro` is not offered in `af-south-1`, and the corrected beta configuration
requires `t3.micro`, **Terraform apply is blocked** until the guardrail is explicitly
amended in a separately approved IAM change (S3-INFRA-02E-IAM, owner approval required).

The GitHub deploy role (`psl-one-beta-github-deploy`) does not have `ec2:RunInstances`
in its policy and is not the Terraform apply identity — this point remains accurate.

> **Correction note:** An earlier draft of this document incorrectly stated that the
> guardrail was not attached to `psl-one-admin`. That claim was based on checking only
> direct user-policy attachments and missed the group-membership path. The error has
> been corrected in all active files.

---

## Files Changed

| File | Change type | Change |
|---|---|---|
| `infra/terraform/environments/beta-ec2/variables.tf` | Active config | default `t2.micro` → `t3.micro`; description updated; validation block added |
| `infra/terraform/environments/beta-ec2/terraform.tfvars.example` | Active config | `instance_type = "t2.micro"` → `"t3.micro"`; comments updated |
| `infra/terraform/environments/beta-ec2/main.tf` | Active config | Comment block updated (lines 171–179); guardrail note corrected |
| `docs/infrastructure/S3-INFRA-02A-BETA-STAGING-PROFILE.md` | Operational doc | All t2.micro refs updated to t3.micro; guardrail table corrected |
| `docs/adr/ADR-029-FREE-PLAN-BETA-STAGING-PROFILE.md` | ADR | Status updated; Amendment section appended; historical body preserved |
| `docs/infrastructure/BETA-STAGING-COST-CONTROLS.md` | Operational doc | Cost rows, guardrail table, stop/start section updated |
| `docs/operations/BETA-EC2-DEPLOYMENT-RUNBOOK.md` | Operational doc | Header and Step 1 comment updated |
| `docs/infrastructure/S3-INFRA-02D-FRESH-BETA-PLAN-REVIEW.md` | Historical record | Supersession note appended; body preserved unchanged |
| `docs/infrastructure/S3-INFRA-02B-BETA-TERRAFORM-PLAN-REVIEW.md` | Historical record | Supersession note added at header; body preserved unchanged |
| `docs/infrastructure/S3-INFRA-02E-T3-MICRO-PREAPPLY-CORRECTION.md` | New document | This document; updated after Codex review to correct false guardrail claims |

---

## Fresh t3.micro Plan

**Plan generated:** 2026-06-16 (immediately after Terraform config correction)
**Variable file:** `/tmp/psl-one-beta-t3-final-plan.tfvars` (temporary, not committed)
**Plan binary:** `/tmp/psl-one-beta-t3-final.tfplan` (temporary, not committed)
**Terraform version:** 1.15.6 (darwin/amd64)
**AWS provider:** hashicorp/aws v5.100.0

### Plan Counts

```
Plan: 10 to add, 0 to change, 0 to destroy.
```

### Exact Resource Inventory

| # | Resource | Key properties |
|---|---|---|
| 1 | `aws_iam_instance_profile.beta` | name=psl-one-beta-ec2 |
| 2 | `aws_iam_role.beta_ec2` | name=psl-one-beta-ec2; trust=ec2.amazonaws.com |
| 3 | `aws_iam_role_policy.ecr_pull` | scoped to 3 beta ECR repos |
| 4 | `aws_iam_role_policy.ssm_params` | scoped to `/psl-one/beta/*` |
| 5 | `aws_iam_role_policy_attachment.ssm_core` | AmazonSSMManagedInstanceCore |
| 6 | `aws_instance.beta` | t3.micro, ami-0c45a4a1d0c378234, subnet-0972d64b0be296aa3 |
| 7 | `aws_security_group.beta_ec2` | no SSH; HTTP/HTTPS restricted by CIDR |
| 8 | `aws_vpc_security_group_egress_rule.all_outbound` | all protocols, 0.0.0.0/0 |
| 9 | `aws_vpc_security_group_ingress_rule.http["169.0.126.211/32"]` | TCP 80 |
| 10 | `aws_vpc_security_group_ingress_rule.https["169.0.126.211/32"]` | TCP 443 |

### Security Review

| Property | Value | Assessment |
|---|---|---|
| Instance type | t3.micro | PASS — offered in af-south-1b |
| Architecture | x86_64 (AL2023 AMI al2023-ami-2023.*-x86_64) | PASS — matches Dockerfile targets |
| AMI | ami-0c45a4a1d0c378234 | PASS — Amazon Linux 2023, af-south-1 |
| EBS | 20 GB gp3, encrypted=true | PASS |
| IMDSv2 | `http_tokens = "required"` | PASS — enforced |
| Subnet | subnet-0972d64b0be296aa3 (af-south-1b) | PASS — explicit; no random selection |
| Key pair | (none — empty string) | PASS — SSM access only |
| SSH port 22 | NOT PRESENT | PASS |
| Port 4000/3001/5432 | NOT PRESENT | PASS — internal to Docker |
| HTTP/HTTPS ingress | 169.0.126.211/32 only | PASS — owner IP /32 |
| Egress | all outbound | EXPECTED — ECR pull, SSM, OS updates |
| IAM | scoped to 3 ECR repos + /psl-one/beta/* SSM | PASS |
| Zero NAT/ALB/ECS/RDS/CloudFront/EIP | CONFIRMED | PASS |

### Dual-Render Consistency

Both renders completed with exit 0. Both produced 320 lines.
`diff -u` between the two rendered files: exit 0 — byte-for-byte identical.
Both contain `Plan: 10 to add, 0 to change, 0 to destroy`.
Plan explicitly contains `instance_type = "t3.micro"`.
Plan does NOT contain `instance_type = "t2.micro"`.

---

## Current Pricing Evidence (live, af-south-1, 2026-06-16)

Source: AWS Pricing API (`pricing.us-east-1.amazonaws.com`)

| Resource | Rate |
|---|---|
| t3.micro Linux on-demand | USD 0.0136/hr |
| Public IPv4 in-use | USD 0.005/hr |
| Public IPv4 idle | USD 0.005/hr |
| EBS gp3 storage | USD 0.1047/GB-month |
| ECR standard storage | USD 0.10/GB-month |
| Data transfer out | USD 0.147/GB (internet egress) |

### Cost Estimates

| Scenario | Hours/month | EC2 | IPv4 | EBS | Total |
|---|---|---|---|---|---|
| 8hr/day × 5 days (173.2 hrs) | 173.2 | $2.36 | $0.87 | $2.09 | **~$5.32** |
| 12hr/day × 5 days (259.8 hrs) | 259.8 | $3.53 | $1.30 | $2.09 | **~$6.92** |
| 24/7 (744 hrs) | 744 | $10.12 | $3.72 | $2.09 | **~$15.93** |
| Stopped (no EIP, ephemeral IP released) | 0 | $0 | $0 | $2.09 | **~$2.09** |

```
Cash-spend target:          R0
AWS credits may be consumed: YES
Guaranteed zero cost:        NO
Terraform apply authorised:  NO
```

---

## GitHub Beta Environment (confirmed read-only, 2026-06-16)

| Item | Status |
|---|---|
| Environment name | beta |
| Custom branch policies | true |
| Allowed branch | main |
| `AWS_BETA_DEPLOY_ROLE_ARN` secret | PRESENT |
| `BETA_API_DOMAIN` variable | PRESENT — api.staging.pslone.co.za |
| `BETA_WEB_DOMAIN` variable | PRESENT — staging.pslone.co.za |
| `BETA_API_BASE_URL` variable | PRESENT — http://api.staging.pslone.co.za |
| `BETA_WEB_BASE_URL` variable | PRESENT — http://staging.pslone.co.za |
| `BETA_EC2_INSTANCE_ID` | ABSENT — deferred until after apply |
| `BETA_EC2_IP` | ABSENT — deferred until after apply |

---

## Network Inputs

| Input | Value | Status |
|---|---|---|
| Current public IP | 169.0.126.211 | CIDR_STATUS=UNCHANGED_OK |
| Approved CIDR | 169.0.126.211/32 | MATCH |
| Subnet | subnet-0972d64b0be296aa3 | af-south-1b, vpc-03d01af618a6d8c22, available |

---

## Validation Results

| Check | Result |
|---|---|
| `terraform fmt -check` | PASS (exit 0) |
| `terraform init -upgrade=false` | PASS — hashicorp/aws v5.100.0 |
| `terraform validate` | PASS — "The configuration is valid." |
| `pnpm docs:validate` | PASS — all 18 checks |
| `pnpm codex:validate` | PASS — 0 errors, 0 warnings |
| `git diff --check` | PASS — no trailing whitespace |
| Secret scan (tfvars) | CLEAN |
| t2.micro in active plan | ABSENT |
| t3.micro in active plan | PRESENT |

---

## Required IAM Amendment (S3-INFRA-02E-IAM) — Owner Approval Required

Do not amend IAM without explicit owner authorisation in a separate task.

**Classification:** `S3-INFRA-02E-IAM — OWNER APPROVAL REQUIRED`

**Required change:** Update `DenyNonFreeTierEC2` in `PSLOneSprint0DenyGuardrails`
to permit `t3.micro` in addition to `t2.micro`, retaining all other deny conditions:

```json
{
  "Sid": "DenyNonFreeTierEC2",
  "Effect": "Deny",
  "Action": "ec2:RunInstances",
  "Resource": "arn:aws:ec2:*:*:instance/*",
  "Condition": {
    "StringNotEquals": {
      "ec2:InstanceType": ["t2.micro", "t3.micro"]
    }
  }
}
```

**Constraints on the amendment:**
- Retain an explicit deny for all other instance types
- Do not detach the whole `PSLOneSprint0DenyGuardrails` policy
- Do not grant broader EC2 permissions
- Retain all unrelated deny guardrails (RDS, S3, IAM escalation, Route53, etc.)
- Retain region restriction if already present in other statements

**Owner statement required:**
> "I approve amending `PSLOneSprint0DenyGuardrails.DenyNonFreeTierEC2` to allow
> `t3.micro` in addition to `t2.micro`. All other conditions and deny statements
> must be preserved unchanged."

---

## Remaining Blockers Before Apply

| # | Blocker | Status |
|---|---|---|
| 1 | `PSLOneSprint0DenyGuardrails.DenyNonFreeTierEC2` amended to permit `t3.micro` (S3-INFRA-02E-IAM) | NOT DONE — OWNER APPROVAL REQUIRED |
| 2 | Explicit owner `terraform apply` authorisation in conversation | NOT GRANTED |
| 3 | Owner cost acceptance confirmed at t3.micro rates | PENDING |
| 4 | Credit balance ≥ USD 120, expiry 2027-06-08 reconfirmed in AWS Billing console | OWNER_CONSOLE_CONFIRMATION_REQUIRED |
| 5 | Fresh plan re-run immediately before apply if >60 min elapsed or CIDR changed | PENDING AT APPLY TIME |

---

## Exclusions Confirmed

| Item | Status |
|---|---|
| No Terraform apply | CONFIRMED |
| No AWS resources created, modified, or deleted | CONFIRMED |
| No ECR images built or pushed | CONFIRMED |
| No GitHub Actions triggered | CONFIRMED |
| No secrets in repository files | CONFIRMED |
| No Terraform state committed | CONFIRMED |
| No plan binary committed | CONFIRMED |
| No PSL season activated | CONFIRMED |
| No real-money or production adapter enabled | CONFIRMED |
| STORY-40 reserved and not implemented | CONFIRMED |
