# Session Handoff — 2026-06-08 — Sprint 0 IAM Policy Split

**Date:** 2026-06-08  
**Session:** Sprint 0 AWS IAM least-privilege policy design and split  
**Handed off to:** Next Claude Code session  
**AWS Account:** `844513166932`  
**IAM User:** `psl-one-admin`

---

## 1. Current Project State

PSL One is in Sprint 0 (infrastructure bootstrap). No application code has been written. No Terraform has been applied. No AWS resources have been created by Claude. The project is a NestJS modular monolith targeting AWS free tier / $100 budget.

The codebase contains:
- Architecture and domain design documents
- STORY-01 fan registration work package (design complete, blocked on 5 critical security findings)
- AWS access model design
- Split IAM policy JSON files (6 files, ready to apply manually)
- Checklist documents for safe manual policy application

---

## 2. What Was Completed in This Session

- Wrote `docs/work-packages/story-01/story-01-security-review.md` — 43 findings across 10 security areas, 5 critical pre-build blockers identified
- Designed a least-privilege AWS access model for Sprint 0 (`docs/planning/aws-access-model.md`)
- Wrote the original monolithic IAM policy JSON (`infra/iam/pslone-sprint0-policy.json`) — now superseded
- Wrote `docs/planning/aws-policy-apply-checklist.md` (v1, superseded)
- Diagnosed the LimitExceeded and inline policy failures (see sections 5 and 6)
- Designed and wrote all 6 split IAM policy files
- Wrote `docs/planning/aws-policy-apply-checklist-v2.md` — the authoritative application guide

---

## 3. Files Created or Modified

### Created this session

| File | Purpose |
|------|---------|
| `docs/work-packages/story-01/story-01-security-review.md` | Security review — 43 findings, 5 critical blockers |
| `docs/planning/aws-access-model.md` | 10-section least-privilege strategy + appendices |
| `infra/iam/pslone-sprint0-policy.json` | Original monolithic policy — **superseded, do not apply** |
| `docs/planning/aws-policy-apply-checklist.md` | v1 checklist — **superseded, do not use** |
| `infra/iam/pslone-sprint0-deny-guardrails-policy.json` | Split policy 1 of 6 — DENY-only guardrails |
| `infra/iam/pslone-sprint0-readonly-policy.json` | Split policy 2 of 6 — read-only |
| `infra/iam/pslone-sprint0-networking-policy.json` | Split policy 3 of 6 — networking + IAM roles |
| `infra/iam/pslone-sprint0-storage-policy.json` | Split policy 4 of 6 — S3, ECR, CloudWatch Logs, DynamoDB |
| `infra/iam/pslone-sprint0-app-runtime-policy.json` | Split policy 5 of 6 — Cognito, Secrets Manager, ECS, SNS, SES, Budgets |
| `infra/iam/pslone-sprint0-database-policy.json` | Split policy 6 of 6 — RDS (t3.micro only), ElastiCache |
| `docs/planning/aws-policy-apply-checklist-v2.md` | **Authoritative** step-by-step application guide |
| `docs/planning/session-handoff-2026-06-08-sprint0-iam.md` | This file |
| `docs/planning/next-session-start-here.md` | Quick-start for next session |

### Modified this session

| File | Change |
|------|--------|
| `docs/planning/aws-access-model.md` | Replaced all `ACCOUNT_ID` placeholders with `844513166932` |

---

## 4. Current IAM Policy Problem

The user attempted to apply the original monolithic `pslone-sprint0-policy.json` to IAM user `psl-one-admin`. Two separate AWS limits were exceeded, causing both the inline and managed policy creation approaches to fail. The solution is a 6-file split where each policy stays well under AWS limits.

---

## 5. Why the Original Single IAM Policy Failed

**Error:** `LimitExceeded` on `aws iam create-policy`

AWS customer-managed IAM policies have a hard limit of **6,144 non-whitespace characters** per policy document. The original 35-statement monolithic policy exceeded this limit. It cannot be reduced to fit within the limit while retaining all required Sprint 0 permissions.

---

## 6. Why the Inline Policy Failed

**Error:** `aws iam put-user-policy` failed — policy exceeds 2,048 byte inline policy limit

AWS IAM inline user policies have an even tighter limit of **2,048 bytes**. The Sprint 0 policy is far too large for inline attachment. Inline policies are not the right mechanism here.

---

## 7. The New Split-Policy Approach

The original 35-statement policy is split into 6 purpose-separated customer-managed policies, each well under 4,000 non-whitespace characters:

1. **Deny guardrails** — explicit DENY-only statements (free tier enforcement, no IAM escalation, no public S3, no Route53, no Kafka)
2. **Read-only** — all `Describe*`, `List*`, `Get*` operations Terraform needs for plan/apply
3. **Networking** — EC2 launch (t2.micro only via condition), security groups, IAM instance profiles and `pslone-*` roles, PassRole to EC2 only
4. **Storage** — S3 `psl-one-*`/`pslone-*` buckets, ECR, CloudWatch Logs write, DynamoDB Terraform lock tables
5. **App runtime** — Cognito user pools, Secrets Manager `pslone/dev/*`, ECS dev skeleton, SNS `pslone-*`, SES, Budgets
6. **Database** — RDS `db.t3.micro` only (enforced via condition), ElastiCache dev

**Key design principle:** Deny guardrails are in a separate policy and must be attached first. AWS evaluates all policies simultaneously, but the operational discipline of attaching deny guardrails before any Allow policies is important.

---

## 8. All Split IAM Policy Files

| # | File | Policy Name | ARN |
|---|------|-------------|-----|
| 1 | `infra/iam/pslone-sprint0-deny-guardrails-policy.json` | `PSLOneSprintZeroDenyGuardrails` | `arn:aws:iam::844513166932:policy/PSLOneSprintZeroDenyGuardrails` |
| 2 | `infra/iam/pslone-sprint0-readonly-policy.json` | `PSLOneSprintZeroReadOnly` | `arn:aws:iam::844513166932:policy/PSLOneSprintZeroReadOnly` |
| 3 | `infra/iam/pslone-sprint0-networking-policy.json` | `PSLOneSprintZeroNetworking` | `arn:aws:iam::844513166932:policy/PSLOneSprintZeroNetworking` |
| 4 | `infra/iam/pslone-sprint0-storage-policy.json` | `PSLOneSprintZeroStorage` | `arn:aws:iam::844513166932:policy/PSLOneSprintZeroStorage` |
| 5 | `infra/iam/pslone-sprint0-app-runtime-policy.json` | `PSLOneSprintZeroAppRuntime` | `arn:aws:iam::844513166932:policy/PSLOneSprintZeroAppRuntime` |
| 6 | `infra/iam/pslone-sprint0-database-policy.json` | `PSLOneSprintZeroDatabase` | `arn:aws:iam::844513166932:policy/PSLOneSprintZeroDatabase` |

---

## 9. AWS Commands Executed by Claude

**None.** Claude did not execute any AWS CLI commands, did not run Terraform, and did not apply any policies. All files were written to disk only. All AWS commands in the checklist documents are for manual execution by the user.

---

## 10. AWS Commands You Manually Ran

Based on the session, the user ran the following commands that produced errors:

```bash
aws iam get-policy --policy-arn <arn>          # Returned: NoSuchEntity (policy not yet created)
aws iam put-user-policy ...                    # Failed: inline policy exceeds 2,048 byte limit
aws iam create-policy --policy-document file://infra/iam/pslone-sprint0-policy.json  # Failed: LimitExceeded
```

---

## 11. AWS Commands That Failed

| Command | Error | Root Cause |
|---------|-------|-----------|
| `aws iam get-policy` | `NoSuchEntity` | Pre-creation check — policy had not been created yet |
| `aws iam put-user-policy` | Limit exceeded | Inline user policy limit is 2,048 bytes |
| `aws iam create-policy` | `LimitExceeded` | Managed policy document exceeds 6,144 non-whitespace char limit |

---

## 12. What Still Needs to Be Done Manually

1. Validate all 6 JSON files (Section 1 of checklist v2)
2. Create all 6 managed policies in AWS IAM (Section 2)
3. Attach all 6 policies to `psl-one-admin` (Section 3)
4. Verify all 6 policies are attached (Section 4)
5. Run all 6 deny guardrail tests — must all return `AccessDenied` (Section 6)
6. Run Terraform read permission tests (Section 7)
7. Bootstrap Terraform state S3 bucket and DynamoDB lock table (Section 8)
8. Confirm all 14 checklist items before any `terraform plan`

---

## 13. Exact Next Manual AWS Commands to Run

Run in this exact order. Full commands with flags are in `docs/planning/aws-policy-apply-checklist-v2.md`.

**Step 1 — Validate JSON (no AWS credentials needed):**
```bash
python3 -m json.tool infra/iam/pslone-sprint0-deny-guardrails-policy.json > /dev/null && echo PASS
python3 -m json.tool infra/iam/pslone-sprint0-readonly-policy.json > /dev/null && echo PASS
python3 -m json.tool infra/iam/pslone-sprint0-networking-policy.json > /dev/null && echo PASS
python3 -m json.tool infra/iam/pslone-sprint0-storage-policy.json > /dev/null && echo PASS
python3 -m json.tool infra/iam/pslone-sprint0-app-runtime-policy.json > /dev/null && echo PASS
python3 -m json.tool infra/iam/pslone-sprint0-database-policy.json > /dev/null && echo PASS
```

**Step 2 — Create policies (deny guardrails first):**
```bash
aws iam create-policy --policy-name PSLOneSprintZeroDenyGuardrails --policy-document file://infra/iam/pslone-sprint0-deny-guardrails-policy.json
aws iam create-policy --policy-name PSLOneSprintZeroReadOnly --policy-document file://infra/iam/pslone-sprint0-readonly-policy.json
aws iam create-policy --policy-name PSLOneSprintZeroNetworking --policy-document file://infra/iam/pslone-sprint0-networking-policy.json
aws iam create-policy --policy-name PSLOneSprintZeroStorage --policy-document file://infra/iam/pslone-sprint0-storage-policy.json
aws iam create-policy --policy-name PSLOneSprintZeroAppRuntime --policy-document file://infra/iam/pslone-sprint0-app-runtime-policy.json
aws iam create-policy --policy-name PSLOneSprintZeroDatabase --policy-document file://infra/iam/pslone-sprint0-database-policy.json
```

**Step 3 — Attach policies:**
```bash
aws iam attach-user-policy --user-name psl-one-admin --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroDenyGuardrails
aws iam attach-user-policy --user-name psl-one-admin --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroReadOnly
aws iam attach-user-policy --user-name psl-one-admin --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroNetworking
aws iam attach-user-policy --user-name psl-one-admin --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroStorage
aws iam attach-user-policy --user-name psl-one-admin --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroAppRuntime
aws iam attach-user-policy --user-name psl-one-admin --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroDatabase
```

---

## 14. Exact Verification Commands

```bash
# Confirm 6 policies attached
aws iam list-attached-user-policies --user-name psl-one-admin --output table

# Confirm caller identity
aws sts get-caller-identity --output table

# Confirm each policy exists
aws iam get-policy --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroDenyGuardrails
aws iam get-policy --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroReadOnly
aws iam get-policy --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroNetworking
aws iam get-policy --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroStorage
aws iam get-policy --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroAppRuntime
aws iam get-policy --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroDatabase
```

---

## 15. Exact Rollback Commands

If anything goes wrong, run in reverse order:

```bash
aws iam detach-user-policy --user-name psl-one-admin --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroDatabase
aws iam detach-user-policy --user-name psl-one-admin --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroAppRuntime
aws iam detach-user-policy --user-name psl-one-admin --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroStorage
aws iam detach-user-policy --user-name psl-one-admin --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroNetworking
aws iam detach-user-policy --user-name psl-one-admin --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroReadOnly
aws iam detach-user-policy --user-name psl-one-admin --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroDenyGuardrails

aws iam delete-policy --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroDatabase
aws iam delete-policy --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroAppRuntime
aws iam delete-policy --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroStorage
aws iam delete-policy --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroNetworking
aws iam delete-policy --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroReadOnly
aws iam delete-policy --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroDenyGuardrails
```

---

## 16. Guardrail Tests Still Required

All 6 must return `AccessDenied` before proceeding. Full commands in `docs/planning/aws-policy-apply-checklist-v2.md` Section 6.

| Test | Expected Result |
|------|----------------|
| Launch EC2 t3.large (non-free tier) | `AccessDenied` / `UnauthorizedOperation` |
| Create RDS db.t3.small (not approved class) | `AccessDenied` |
| Create IAM user | `AccessDenied` |
| Set S3 bucket ACL to public-read | `AccessDenied` |
| List Route53 hosted zones | `AccessDenied` |
| List Kafka clusters | `AccessDenied` |

**If any test does NOT return AccessDenied — STOP. Do not run Terraform. Review the deny guardrails policy.**

---

## 17. Terraform Status

- **No Terraform has been run.** No `terraform init`, no `terraform plan`, no `terraform apply`.
- No Terraform configuration files exist yet (`infra/terraform/` directory is empty or does not exist).
- The Terraform state S3 bucket (`pslone-terraform-state-dev`) does not exist yet — must be bootstrapped manually (Section 8 of checklist v2) before `terraform init` can run.
- The DynamoDB lock table (`pslone-terraform-lock`) does not exist yet.

---

## 18. What Must NOT Be Done Yet

- **Do NOT run `terraform apply`** — policies not yet applied, state backend not yet bootstrapped
- **Do NOT run `terraform init`** — state S3 bucket does not exist yet
- **Do NOT run `terraform plan`** — same reason; also guardrail tests not yet run
- **Do NOT apply the original monolithic policy** (`infra/iam/pslone-sprint0-policy.json`) — it will fail with LimitExceeded
- **Do NOT use inline policies** — they also exceed the 2,048 byte limit
- **Do NOT widen any permissions** — all 6 split policies are already at minimum required scope
- **Do NOT proceed with STORY-01 code generation** — 5 critical security blockers must be resolved in the design first (see `docs/work-packages/story-01/story-01-security-review.md`)
- **Do NOT create production resources** of any kind

---

## 19. Safest Next Prompt for a Fresh Claude Code Session

Paste this verbatim into the new session:

```
Read the following files before doing anything else:
- docs/planning/next-session-start-here.md
- docs/planning/aws-policy-apply-checklist-v2.md
- infra/iam/pslone-sprint0-deny-guardrails-policy.json
- infra/iam/pslone-sprint0-readonly-policy.json
- infra/iam/pslone-sprint0-networking-policy.json
- infra/iam/pslone-sprint0-storage-policy.json
- infra/iam/pslone-sprint0-app-runtime-policy.json
- infra/iam/pslone-sprint0-database-policy.json

Context: I have manually run the AWS commands from the checklist and all 6 policies are now attached to IAM user psl-one-admin. All 6 guardrail tests returned AccessDenied. The Terraform state S3 bucket and DynamoDB lock table have been bootstrapped manually.

Your task: Bootstrap the Terraform configuration for Sprint 0. Create infra/terraform/main.tf, infra/terraform/backend.tf, infra/terraform/variables.tf, and infra/terraform/outputs.tf. Configure the S3 backend pointing to pslone-terraform-state-dev with DynamoDB lock table pslone-terraform-lock in af-south-1. Do not run terraform init. Do not run terraform apply. Do not create production resources.
```

> **Note:** Only use this prompt after you have manually confirmed all 14 checklist items in `docs/planning/aws-policy-apply-checklist-v2.md`.

---

## 20. Open Risks and Warnings

| Risk | Severity | Detail |
|------|----------|--------|
| STORY-01 blocked | HIGH | 5 critical pre-build findings in `story-01-security-review.md`. Custom Cognito claims, adminCreateUser flow, RBAC group assignment, age gate DB constraint, and IP legal basis all need design fixes before any code is written. |
| Guardrail tests not yet run | HIGH | The deny guardrails have been written but not tested against a live AWS account. The EC2 `ec2:InstanceType` condition and RDS `rds:DatabaseClass` condition must be verified against the actual IAM evaluation engine. |
| DenyPublicS3 may not block all cases | MEDIUM | The guardrails deny `PutBucketAcl`, `PutObjectAcl`, `DeletePublicAccessBlock`. Terraform's `aws_s3_bucket_public_access_block` uses `PutPublicAccessBlock` (allowed) — ensure the resource always sets all four block flags to `true`. |
| `IAMPassRoleToEC2Only` scope | MEDIUM | PassRole is restricted to `ec2.amazonaws.com`. ECS task execution will require a separate PassRole statement when ECS is activated — the current app-runtime policy doesn't include it. |
| Terraform state bucket region | LOW | All commands assume `af-south-1`. Confirm this is the correct target region before creating the state bucket — it cannot be moved after creation. |
| STORY-01 IP capture legal basis | LOW | Capturing IP address at registration consent requires a documented legal basis under POPIA. This is a design-level gap, not a code gap — needs a privacy notice update. |
