# AWS Policy Apply Checklist v2 — Split Policies

**IAM User:** `psl-one-admin`  
**Account ID:** `844513166932`  
**Region:** `af-south-1` (or your target region — confirm before running)

> **STOP:** Do not run `terraform apply` until all 6 policies are attached and Section 6 guardrail tests pass.

---

## Policy Inventory

| # | Policy Name | File | ARN |
|---|-------------|------|-----|
| 1 | PSLOneSprintZeroDenyGuardrails | `infra/iam/pslone-sprint0-deny-guardrails-policy.json` | `arn:aws:iam::844513166932:policy/PSLOneSprintZeroDenyGuardrails` |
| 2 | PSLOneSprintZeroReadOnly | `infra/iam/pslone-sprint0-readonly-policy.json` | `arn:aws:iam::844513166932:policy/PSLOneSprintZeroReadOnly` |
| 3 | PSLOneSprintZeroNetworking | `infra/iam/pslone-sprint0-networking-policy.json` | `arn:aws:iam::844513166932:policy/PSLOneSprintZeroNetworking` |
| 4 | PSLOneSprintZeroStorage | `infra/iam/pslone-sprint0-storage-policy.json` | `arn:aws:iam::844513166932:policy/PSLOneSprintZeroStorage` |
| 5 | PSLOneSprintZeroAppRuntime | `infra/iam/pslone-sprint0-app-runtime-policy.json` | `arn:aws:iam::844513166932:policy/PSLOneSprintZeroAppRuntime` |
| 6 | PSLOneSprintZeroDatabase | `infra/iam/pslone-sprint0-database-policy.json` | `arn:aws:iam::844513166932:policy/PSLOneSprintZeroDatabase` |

---

## Section 1 — Validate JSON Files

Run each command from the repo root. Exit code 0 = valid JSON. Exit code non-zero = malformed — do not proceed.

```bash
python3 -m json.tool infra/iam/pslone-sprint0-deny-guardrails-policy.json > /dev/null && echo "PASS: deny-guardrails" || echo "FAIL: deny-guardrails"

python3 -m json.tool infra/iam/pslone-sprint0-readonly-policy.json > /dev/null && echo "PASS: readonly" || echo "FAIL: readonly"

python3 -m json.tool infra/iam/pslone-sprint0-networking-policy.json > /dev/null && echo "PASS: networking" || echo "FAIL: networking"

python3 -m json.tool infra/iam/pslone-sprint0-storage-policy.json > /dev/null && echo "PASS: storage" || echo "FAIL: storage"

python3 -m json.tool infra/iam/pslone-sprint0-app-runtime-policy.json > /dev/null && echo "PASS: app-runtime" || echo "FAIL: app-runtime"

python3 -m json.tool infra/iam/pslone-sprint0-database-policy.json > /dev/null && echo "PASS: database" || echo "FAIL: database"
```

Non-whitespace character count check (each must be under 6,144):

```bash
python3 -c "
import json, sys
files = [
    'infra/iam/pslone-sprint0-deny-guardrails-policy.json',
    'infra/iam/pslone-sprint0-readonly-policy.json',
    'infra/iam/pslone-sprint0-networking-policy.json',
    'infra/iam/pslone-sprint0-storage-policy.json',
    'infra/iam/pslone-sprint0-app-runtime-policy.json',
    'infra/iam/pslone-sprint0-database-policy.json',
]
for f in files:
    with open(f) as fh:
        raw = fh.read()
    count = sum(1 for c in raw if not c.isspace())
    status = 'PASS' if count < 6144 else 'FAIL — TOO LARGE'
    print(f'{status} ({count:,} chars): {f}')
"
```

---

## Section 2 — Create Managed Policies

Run in order. **Policy 1 (deny guardrails) must be created and attached first.**

```bash
# 1. Deny Guardrails
aws iam create-policy \
  --policy-name PSLOneSprintZeroDenyGuardrails \
  --policy-document file://infra/iam/pslone-sprint0-deny-guardrails-policy.json \
  --description "PSL One Sprint 0 — explicit deny guardrails (free tier, no IAM escalation, no public S3)" \
  --tags Key=Project,Value=psl-one Key=Sprint,Value=sprint-0 Key=ManagedBy,Value=terraform

# 2. Read Only
aws iam create-policy \
  --policy-name PSLOneSprintZeroReadOnly \
  --policy-document file://infra/iam/pslone-sprint0-readonly-policy.json \
  --description "PSL One Sprint 0 — read-only (EC2, RDS, IAM, CloudWatch, STS, CloudTrail, SecretsManager list)" \
  --tags Key=Project,Value=psl-one Key=Sprint,Value=sprint-0 Key=ManagedBy,Value=terraform

# 3. Networking
aws iam create-policy \
  --policy-name PSLOneSprintZeroNetworking \
  --policy-document file://infra/iam/pslone-sprint0-networking-policy.json \
  --description "PSL One Sprint 0 — networking (SGs, EC2 t2.micro launch, IAM instance profiles and pslone-* roles)" \
  --tags Key=Project,Value=psl-one Key=Sprint,Value=sprint-0 Key=ManagedBy,Value=terraform

# 4. Storage
aws iam create-policy \
  --policy-name PSLOneSprintZeroStorage \
  --policy-document file://infra/iam/pslone-sprint0-storage-policy.json \
  --description "PSL One Sprint 0 — storage (S3 psl-one-*/pslone-* buckets, ECR, CloudWatch Logs write, DynamoDB Terraform lock)" \
  --tags Key=Project,Value=psl-one Key=Sprint,Value=sprint-0 Key=ManagedBy,Value=terraform

# 5. App Runtime
aws iam create-policy \
  --policy-name PSLOneSprintZeroAppRuntime \
  --policy-document file://infra/iam/pslone-sprint0-app-runtime-policy.json \
  --description "PSL One Sprint 0 — app runtime (Cognito, Secrets Manager dev, ECS skeleton, SNS, SES, Budgets)" \
  --tags Key=Project,Value=psl-one Key=Sprint,Value=sprint-0 Key=ManagedBy,Value=terraform

# 6. Database
aws iam create-policy \
  --policy-name PSLOneSprintZeroDatabase \
  --policy-document file://infra/iam/pslone-sprint0-database-policy.json \
  --description "PSL One Sprint 0 — database (RDS db.t3.micro only, ElastiCache dev)" \
  --tags Key=Project,Value=psl-one Key=Sprint,Value=sprint-0 Key=ManagedBy,Value=terraform
```

---

## Section 3 — Attach Policies to psl-one-admin

**Attach deny guardrails first.** AWS evaluates all policies simultaneously but attaching first is the correct operational order.

```bash
# 1. Deny Guardrails — ATTACH FIRST
aws iam attach-user-policy \
  --user-name psl-one-admin \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroDenyGuardrails

# 2. Read Only
aws iam attach-user-policy \
  --user-name psl-one-admin \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroReadOnly

# 3. Networking
aws iam attach-user-policy \
  --user-name psl-one-admin \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroNetworking

# 4. Storage
aws iam attach-user-policy \
  --user-name psl-one-admin \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroStorage

# 5. App Runtime
aws iam attach-user-policy \
  --user-name psl-one-admin \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroAppRuntime

# 6. Database
aws iam attach-user-policy \
  --user-name psl-one-admin \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroDatabase
```

---

## Section 4 — Verify Attachments

```bash
# List all attached policies — should show exactly 6
aws iam list-attached-user-policies \
  --user-name psl-one-admin \
  --output table

# Verify each policy ARN exists and is active
aws iam get-policy \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroDenyGuardrails \
  --query 'Policy.{Name:PolicyName,Status:IsAttachable,Created:CreateDate}' \
  --output table

aws iam get-policy \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroReadOnly \
  --query 'Policy.{Name:PolicyName,Status:IsAttachable,Created:CreateDate}' \
  --output table

aws iam get-policy \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroNetworking \
  --query 'Policy.{Name:PolicyName,Status:IsAttachable,Created:CreateDate}' \
  --output table

aws iam get-policy \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroStorage \
  --query 'Policy.{Name:PolicyName,Status:IsAttachable,Created:CreateDate}' \
  --output table

aws iam get-policy \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroAppRuntime \
  --query 'Policy.{Name:PolicyName,Status:IsAttachable,Created:CreateDate}' \
  --output table

aws iam get-policy \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroDatabase \
  --query 'Policy.{Name:PolicyName,Status:IsAttachable,Created:CreateDate}' \
  --output table

# Confirm caller identity
aws sts get-caller-identity --output table
```

Expected: 6 policies listed, all `IsAttachable: true`.

---

## Section 5 — Rollback Commands

Run these in reverse attachment order if any guardrail test fails or you need to remove the policies.

```bash
# Detach all 6 policies
aws iam detach-user-policy \
  --user-name psl-one-admin \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroDatabase

aws iam detach-user-policy \
  --user-name psl-one-admin \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroAppRuntime

aws iam detach-user-policy \
  --user-name psl-one-admin \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroStorage

aws iam detach-user-policy \
  --user-name psl-one-admin \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroNetworking

aws iam detach-user-policy \
  --user-name psl-one-admin \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroReadOnly

aws iam detach-user-policy \
  --user-name psl-one-admin \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroDenyGuardrails

# Delete all 6 policies (only after detach completes)
aws iam delete-policy --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroDatabase
aws iam delete-policy --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroAppRuntime
aws iam delete-policy --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroStorage
aws iam delete-policy --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroNetworking
aws iam delete-policy --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroReadOnly
aws iam delete-policy --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroDenyGuardrails
```

---

## Section 6 — Guardrail Test Commands

These must all return `AccessDenied`. If any command succeeds, STOP — the deny guardrails are not effective.

### 6a. Non-free-tier EC2 denied

```bash
# Must return AccessDenied — t3.large is not free tier
aws ec2 run-instances \
  --image-id ami-00000000000000000 \
  --instance-type t3.large \
  --dry-run \
  2>&1 | grep -E "(AccessDenied|UnauthorizedOperation|DryRunOperation)"
```

Expected: `UnauthorizedOperation` or `AccessDenied`. `DryRunOperation` means the action was allowed (IAM check passed, dry-run stopped it) — this is a FAIL.

### 6b. Non-free-tier RDS denied

```bash
# Must return AccessDenied — db.t3.small is not the approved class
aws rds create-db-instance \
  --db-instance-identifier test-deny-check \
  --db-instance-class db.t3.small \
  --engine postgres \
  --master-username admin \
  --master-user-password TestOnly123! \
  --allocated-storage 20 \
  2>&1 | grep -E "(AccessDenied|not authorized)"
```

Expected: `AccessDenied` or `not authorized`.

### 6c. IAM user creation denied

```bash
# Must return AccessDenied
aws iam create-user \
  --user-name test-deny-check \
  2>&1 | grep -E "(AccessDenied|not authorized)"
```

Expected: `AccessDenied`.

### 6d. S3 public ACL denied

```bash
# Must return AccessDenied
aws s3api put-bucket-acl \
  --bucket pslone-test-bucket-that-does-not-exist \
  --acl public-read \
  2>&1 | grep -E "(AccessDenied|not authorized|NoSuchBucket)"
```

Expected: `AccessDenied`. `NoSuchBucket` is also acceptable (it means IAM check passed but bucket doesn't exist — review if this occurs).

### 6e. Route53 denied

```bash
aws route53 list-hosted-zones \
  2>&1 | grep -E "(AccessDenied|not authorized)"
```

Expected: `AccessDenied`.

### 6f. Kafka denied

```bash
aws kafka list-clusters \
  2>&1 | grep -E "(AccessDenied|not authorized)"
```

Expected: `AccessDenied`.

---

## Section 7 — Terraform Permission Tests

Run these after guardrail tests pass. They confirm Terraform's minimum read permissions work before any `terraform plan`.

```bash
# Terraform needs STS to resolve its own identity
aws sts get-caller-identity

# Terraform reads EC2 state
aws ec2 describe-vpcs --output table

# Terraform reads RDS state
aws rds describe-db-instances --output table

# Terraform reads S3 state
aws s3 ls

# Terraform reads Secrets Manager list (path enumeration only)
aws secretsmanager list-secrets --output table

# Terraform reads ECR repositories
aws ecr describe-repositories --output table

# Terraform reads IAM policies
aws iam list-policies --scope Local --output table

# Terraform state backend — S3 bucket must be manually pre-created
# before terraform init. Check it exists:
aws s3 ls s3://pslone-terraform-state-dev 2>&1 | head -5

# Terraform state lock — DynamoDB table must also be pre-created:
aws dynamodb describe-table \
  --table-name pslone-terraform-lock \
  --query 'Table.{Name:TableName,Status:TableStatus}' \
  --output table
```

If `s3 ls` or `dynamodb describe-table` returns `NoSuchBucket`/`ResourceNotFoundException`, the Terraform state backend must be bootstrapped manually before `terraform init`. Terraform cannot create its own state bucket.

---

## Section 8 — Terraform State Bootstrap (Pre-terraform-init)

The state S3 bucket and DynamoDB lock table must be created manually. Run these **once only**:

```bash
# Create Terraform state bucket
aws s3api create-bucket \
  --bucket pslone-terraform-state-dev \
  --region af-south-1 \
  --create-bucket-configuration LocationConstraint=af-south-1

# Enable versioning on state bucket
aws s3api put-bucket-versioning \
  --bucket pslone-terraform-state-dev \
  --versioning-configuration Status=Enabled

# Block all public access on state bucket
aws s3api put-public-access-block \
  --bucket pslone-terraform-state-dev \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# Enable SSE on state bucket
aws s3api put-bucket-encryption \
  --bucket pslone-terraform-state-dev \
  --server-side-encryption-configuration \
    '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

# Create DynamoDB lock table
aws dynamodb create-table \
  --table-name pslone-terraform-lock \
  --billing-mode PAY_PER_REQUEST \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --tags Key=Project,Value=psl-one Key=Sprint,Value=sprint-0
```

---

## Section 9 — Final Verification Checklist

Run through this checklist before giving approval to proceed with `terraform plan`.

- [ ] All 6 JSON files validated (Section 1 — all PASS, all under 6,144 chars)
- [ ] All 6 policies created without error (Section 2)
- [ ] All 6 policies attached to `psl-one-admin` (Section 3)
- [ ] `list-attached-user-policies` shows exactly 6 policies (Section 4)
- [ ] `sts get-caller-identity` returns Account `844513166932` (Section 4)
- [ ] t3.large EC2 attempt denied (Section 6a)
- [ ] db.t3.small RDS attempt denied (Section 6b)
- [ ] IAM user creation denied (Section 6c)
- [ ] S3 public-read ACL denied (Section 6d)
- [ ] Route53 list denied (Section 6e)
- [ ] Kafka list denied (Section 6f)
- [ ] STS, EC2 Describe, RDS Describe, S3 list all succeed (Section 7)
- [ ] Terraform state S3 bucket exists and versioning enabled (Section 8)
- [ ] Terraform DynamoDB lock table exists (Section 8)

**All 14 items must be checked before proceeding.**

---

## HARD STOP

```
DO NOT RUN terraform apply until all 14 checklist items above are confirmed.
DO NOT expand permissions during Terraform runs.
DO NOT create production resources.
DO NOT create resources outside the psl-one-* / pslone-* naming pattern.
```

---

## Safest Next Prompt After Successful Attachment

Once all 14 checklist items are confirmed:

> "All 6 policies are attached and all guardrail tests passed. Bootstrap the Terraform state backend configuration for Sprint 0 in `infra/terraform/`. Configure the S3 backend pointing to `pslone-terraform-state-dev` with DynamoDB lock table `pslone-terraform-lock`. Do not run terraform init or terraform apply yet."
