# PSL One — AWS Policy Application Pack

**Date:** 2026-06-08  
**IAM User:** `psl-one-admin`  
**AWS Account:** `844513166932`  
**Region:** `af-south-1`  
**Policy name:** `PSLOneSprintZeroInfrastructure`  
**Policy ARN:** `arn:aws:iam::844513166932:policy/PSLOneSprintZeroInfrastructure`  
**Source file:** `infra/iam/pslone-sprint0-policy.json`

> This pack is for **human execution only**. Do not pass these commands to Claude to run. Do not run `terraform apply`. Do not create production resources.

---

## Section 1 — Pre-Application Checklist

Complete every item before running any AWS CLI command.

- [ ] You are logged in as `psl-one-admin` (not root): `aws sts get-caller-identity`
- [ ] The working directory is the repository root: `pwd` shows `.../psl-one`
- [ ] `infra/iam/pslone-sprint0-policy.json` exists: `ls infra/iam/`
- [ ] The policy JSON is valid: `python3 -m json.tool infra/iam/pslone-sprint0-policy.json > /dev/null && echo "valid"`
- [ ] AWS CLI version is 2.x: `aws --version`
- [ ] Root account MFA is enabled (verify in console — do not proceed without this)
- [ ] `psl-one-admin` IAM user MFA is enabled (verify in console)
- [ ] No other policies are attached to `psl-one-admin` that could grant wider access

---

## Section 2 — Policy Validation

Verify the policy file before upload.

```bash
# 2.1 Confirm no ACCOUNT_ID placeholders remain
grep -c "ACCOUNT_ID" infra/iam/pslone-sprint0-policy.json
# Expected output: 0
# If you see any non-zero number, stop — do not proceed

# 2.2 Count the statements (should be 35)
python3 -c "
import json
with open('infra/iam/pslone-sprint0-policy.json') as f:
    p = json.load(f)
stmts = p['Statement']
allows = [s for s in stmts if s['Effect'] == 'Allow']
denies = [s for s in stmts if s['Effect'] == 'Deny']
print(f'Total statements: {len(stmts)}')
print(f'Allow statements: {len(allows)}')
print(f'Deny statements:  {len(denies)}')
"
# Expected output:
# Total statements: 35
# Allow statements: 26
# Deny statements:  9

# 2.3 Confirm the critical deny guardrails are present
python3 -c "
import json
with open('infra/iam/pslone-sprint0-policy.json') as f:
    p = json.load(f)
sids = [s['Sid'] for s in p['Statement']]
required = [
    'DenyEC2NonFreeTierInstances',
    'DenyRDSNonFreeTierClass',
    'DenyRDSClusterAurora',
    'DenyRDSMultiAZ',
    'DenyS3PublicAccess',
    'DenyIAMPrivilegeEscalation',
    'DenyRoute53',
    'DenyMSKKafka',
    'DenyElastiCache',
]
missing = [r for r in required if r not in sids]
if missing:
    print(f'MISSING DENY GUARDRAILS: {missing}')
else:
    print('All deny guardrails present')
"
# Expected output: All deny guardrails present

# 2.4 Confirm t2.micro allow condition is present
python3 -c "
import json
with open('infra/iam/pslone-sprint0-policy.json') as f:
    p = json.load(f)
for s in p['Statement']:
    if s['Sid'] == 'EC2LaunchT2MicroOnly':
        cond = s.get('Condition', {})
        val = cond.get('StringEquals', {}).get('ec2:InstanceType')
        print(f'EC2 instance type condition: {val}')
        break
"
# Expected output: EC2 instance type condition: t2.micro

# 2.5 Confirm db.t3.micro allow condition is present
python3 -c "
import json
with open('infra/iam/pslone-sprint0-policy.json') as f:
    p = json.load(f)
for s in p['Statement']:
    if s['Sid'] == 'RDSCreateT3MicroOnly':
        cond = s.get('Condition', {})
        val = cond.get('StringEquals', {}).get('rds:DatabaseClass')
        print(f'RDS database class condition: {val}')
        break
"
# Expected output: RDS database class condition: db.t3.micro
```

All 5 validation steps must pass before proceeding.

---

## Section 3 — Policy Creation

```bash
# 3.1 Create the customer managed policy
aws iam create-policy \
  --policy-name PSLOneSprintZeroInfrastructure \
  --policy-document file://infra/iam/pslone-sprint0-policy.json \
  --description "Sprint 0 least-privilege policy. Do not widen. See docs/planning/aws-access-model.md." \
  --tags '[
    {"Key":"Project","Value":"pslone"},
    {"Key":"Sprint","Value":"0"},
    {"Key":"Environment","Value":"dev"},
    {"Key":"ManagedBy","Value":"terraform-only"}
  ]'

# Expected response includes:
#   "PolicyArn": "arn:aws:iam::844513166932:policy/PSLOneSprintZeroInfrastructure"
#   "PolicyName": "PSLOneSprintZeroInfrastructure"
#   "CreateDate": "<timestamp>"

# 3.2 Save the ARN to a local variable for the commands below
POLICY_ARN="arn:aws:iam::844513166932:policy/PSLOneSprintZeroInfrastructure"
```

---

## Section 4 — Policy Attachment

```bash
# 4.1 Attach the policy to psl-one-admin
aws iam attach-user-policy \
  --user-name psl-one-admin \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroInfrastructure

# Expected: no output (success is silent)
# If you see an error, do not proceed

# 4.2 Verify the attachment
aws iam list-attached-user-policies \
  --user-name psl-one-admin \
  --output table

# Expected output includes:
#   PSLOneSprintZeroInfrastructure | arn:aws:iam::844513166932:policy/...
# No other policy should be listed unless previously reviewed
```

---

## Section 5 — Guardrail Tests (Allow)

These commands should succeed. If any of them fail, the policy is missing a required allow and must be reviewed before using Terraform.

```bash
# 5.1 Identity — basic auth check
aws sts get-caller-identity
# Expected: JSON with Account: "844513166932", UserId matching psl-one-admin

# 5.2 EC2 read — Terraform needs this on every plan
aws ec2 describe-instances \
  --region af-south-1 \
  --output text
# Expected: empty or existing instances, exit code 0

# 5.3 RDS read
aws rds describe-db-instances \
  --region af-south-1 \
  --output text
# Expected: empty or existing DB instances, exit code 0

# 5.4 S3 list
aws s3api list-buckets \
  --output table
# Expected: table of buckets (may be empty), exit code 0

# 5.5 ECR — needed for docker push on deploy
aws ecr describe-repositories \
  --region af-south-1 \
  --output text
# Expected: empty or existing repos, exit code 0

# 5.6 Secrets Manager list
aws secretsmanager list-secrets \
  --region af-south-1 \
  --output text
# Expected: empty or existing secrets, exit code 0

# 5.7 Cognito — needed for User Pool creation
aws cognito-idp list-user-pools \
  --max-results 10 \
  --region af-south-1 \
  --output text
# Expected: empty or existing pools, exit code 0

# 5.8 CloudWatch Logs
aws logs describe-log-groups \
  --region af-south-1 \
  --output text
# Expected: empty or existing log groups, exit code 0

# 5.9 Budgets
aws budgets describe-budgets \
  --account-id 844513166932 \
  --output text
# Expected: empty or existing budgets, exit code 0
```

---

## Section 6 — Guardrail Tests (Deny)

These commands MUST fail with an authorization error. If any of them succeed, stop immediately — a deny guardrail is not working and Terraform must not be used until the policy is corrected.

```bash
# 6.1 DENY: EC2 t3.small — should be denied by DenyEC2NonFreeTierInstances
# The --dry-run flag means EC2 never launches — only tests authorization
aws ec2 run-instances \
  --image-id ami-00000000000000000 \
  --instance-type t3.small \
  --count 1 \
  --region af-south-1 \
  --dry-run 2>&1
# Expected output contains: "UnauthorizedOperation"
# BAD output would contain: "DryRunOperation" (means it would have succeeded)

# 6.2 DENY: EC2 t3.micro — also denied (only t2.micro is allowed)
aws ec2 run-instances \
  --image-id ami-00000000000000000 \
  --instance-type t3.micro \
  --count 1 \
  --region af-south-1 \
  --dry-run 2>&1
# Expected output contains: "UnauthorizedOperation"

# 6.3 DENY: EC2 m5.large — expensive, must be denied
aws ec2 run-instances \
  --image-id ami-00000000000000000 \
  --instance-type m5.large \
  --count 1 \
  --region af-south-1 \
  --dry-run 2>&1
# Expected output contains: "UnauthorizedOperation"

# 6.4 DENY: EC2 t2.micro dry run — this SHOULD return DryRunOperation (allow is working)
# This is an inverse check to confirm the allow path is not broken
aws ec2 run-instances \
  --image-id ami-00000000000000000 \
  --instance-type t2.micro \
  --count 1 \
  --region af-south-1 \
  --dry-run 2>&1
# Expected output contains: "DryRunOperation" (means t2.micro is permitted)
# BAD output would contain: "UnauthorizedOperation" (means allow is broken)

# 6.5 DENY: Route53 — must be completely denied
aws route53 list-hosted-zones 2>&1
# Expected output contains: "AccessDenied" or "not authorized"

# 6.6 DENY: MSK/Kafka — must be denied
aws kafka list-clusters \
  --region af-south-1 2>&1
# Expected output contains: "AccessDenied" or "not authorized"

# 6.7 DENY: ElastiCache — must be denied
aws elasticache describe-cache-clusters \
  --region af-south-1 2>&1
# Expected output contains: "AccessDenied" or "not authorized"

# 6.8 DENY: IAM CreateUser — privilege escalation must be denied
aws iam create-user \
  --user-name test-deny-user 2>&1
# Expected output contains: "AccessDenied" or "not authorized"
# This user will NOT be created — IAM CreateUser is denied

# 6.9 DENY: S3 PutBucketAcl — public bucket creation must be denied
aws s3api put-bucket-acl \
  --bucket psl-one-terraform-state \
  --acl public-read 2>&1
# Expected output contains: "AccessDenied" or "not authorized"
# (Safe to run even if bucket doesn't exist — will fail at auth before checking the bucket)
```

**Pass criteria:** All 6.1–6.3 return `UnauthorizedOperation`. Step 6.4 returns `DryRunOperation`. Steps 6.5–6.9 return `AccessDenied`.

---

## Section 7 — Rollback Commands

Run these ONLY if you need to remove the policy. Order matters.

```bash
# Step 1: Detach from user (do this first — leaves policy available to re-attach)
aws iam detach-user-policy \
  --user-name psl-one-admin \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroInfrastructure

# Confirm detachment
aws iam list-attached-user-policies \
  --user-name psl-one-admin
# Expected: PSLOneSprintZeroInfrastructure no longer listed

# Step 2: Delete the policy (only if you want to remove it entirely)
# WARNING: This is irreversible. Only run if you are replacing the policy with a revised version.
aws iam delete-policy \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroInfrastructure

# If delete fails with "EntityTemporarilyUnmodifiable", wait 30 seconds and retry.
# If delete fails with "DeleteConflict", the policy has non-default versions — delete them first:
aws iam list-policy-versions \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroInfrastructure

# For each non-default version (e.g. v2, v3):
aws iam delete-policy-version \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroInfrastructure \
  --version-id v2
# Then re-run the delete-policy command above
```

---

## Section 8 — Verification Checklist (Post-Application)

Run this after Sections 3–6 are complete. Tick every box before handing back to Claude.

- [ ] `aws sts get-caller-identity` returns `psl-one-admin` and account `844513166932`
- [ ] `aws iam list-attached-user-policies --user-name psl-one-admin` shows `PSLOneSprintZeroInfrastructure`
- [ ] No other policies are attached to `psl-one-admin` (check the same list)
- [ ] Section 5 — all 9 allow tests passed (exit code 0)
- [ ] Section 6 — t3.small `run-instances --dry-run` returned `UnauthorizedOperation`
- [ ] Section 6 — t2.micro `run-instances --dry-run` returned `DryRunOperation`
- [ ] Section 6 — `route53 list-hosted-zones` returned `AccessDenied`
- [ ] Section 6 — `kafka list-clusters` returned `AccessDenied`
- [ ] Section 6 — `elasticache describe-cache-clusters` returned `AccessDenied`
- [ ] Section 6 — `iam create-user` returned `AccessDenied`
- [ ] Section 6 — `s3api put-bucket-acl --acl public-read` returned `AccessDenied`

**All 11 boxes must be ticked before Terraform is used.**

---

## Section 9 — Risk Checklist Before First `terraform apply`

This is a separate gate. Complete this after Section 8.

### Account hardening (verify in AWS console — cannot be done via CLI as psl-one-admin)
- [ ] Root account has MFA enabled
- [ ] Root account has no active access keys
- [ ] `psl-one-admin` has MFA enabled on the IAM console
- [ ] AWS CloudTrail is enabled with at least 1 active trail in `af-south-1`
- [ ] AWS Billing Alerts are enabled in account preferences

### Cost protection
- [ ] AWS Budget alert created at $50 (email: guessthescore2@gmail.com)
- [ ] AWS Budget alert created at $80 (email: guessthescore2@gmail.com)
- [ ] Confirm both budget alert emails have been received (check inbox)
- [ ] `af-south-1` free tier eligibility confirmed — run `aws ce get-cost-and-usage` or check Billing console

### Terraform bootstrap (must be done BEFORE `terraform init`)
- [ ] S3 state bucket created manually (see Section 2 of `aws-access-model.md`):
  ```bash
  aws s3api list-buckets | grep "psl-one-terraform-state"
  # Expected: the bucket name appears
  ```
- [ ] State bucket has versioning enabled:
  ```bash
  aws s3api get-bucket-versioning --bucket psl-one-terraform-state
  # Expected: "Status": "Enabled"
  ```
- [ ] State bucket has public access blocked:
  ```bash
  aws s3api get-public-access-block --bucket psl-one-terraform-state
  # Expected: all four values "true"
  ```
- [ ] State bucket has encryption enabled:
  ```bash
  aws s3api get-bucket-encryption --bucket psl-one-terraform-state
  # Expected: SSEAlgorithm AES256 or aws:kms
  ```
- [ ] DynamoDB lock table exists:
  ```bash
  aws dynamodb describe-table \
    --table-name psl-one-terraform-lock \
    --region af-south-1 \
    --query "Table.TableStatus"
  # Expected: "ACTIVE"
  ```

### Repository safety
- [ ] `infra/terraform/bootstrap/.gitignore` contains:
  ```
  *.tfstate
  *.tfstate.backup
  .terraform/
  .terraform.lock.hcl
  *.tfvars
  ```
- [ ] No `.env` files, credentials, or secrets exist anywhere in the repository
- [ ] `git status` shows clean working tree before any Terraform commands

### Terraform workflow gate
- [ ] `terraform init` succeeded with no errors
- [ ] `terraform validate` returns `Success! The configuration is valid.`
- [ ] **`terraform plan -out=plan.tfplan` output has been reviewed line-by-line**
- [ ] Plan shows only resources listed in Section 4 of `aws-access-model.md`
- [ ] Plan shows 0 resources to destroy on first apply
- [ ] Estimated cost has been checked (infracost or manual review)
- [ ] Human has explicitly approved the plan in writing before `terraform apply` is run

---

## Section 10 — Reference

| Item | Value |
|---|---|
| Policy ARN | `arn:aws:iam::844513166932:policy/PSLOneSprintZeroInfrastructure` |
| Policy file | `infra/iam/pslone-sprint0-policy.json` |
| IAM user | `psl-one-admin` |
| Account ID | `844513166932` |
| Region | `af-south-1` |
| Allowed EC2 class | `t2.micro` only |
| Allowed RDS class | `db.t3.micro` only |
| Secrets namespace | `pslone/dev/*` |
| IAM role prefix | `pslone-*` (can only be passed to ec2.amazonaws.com) |
| Forbidden services | MSK, ElastiCache, Route53, ECS, Aurora, Organizations |
| Forbidden S3 | Public ACLs, DeletePublicAccessBlock |
| Forbidden IAM | CreateUser, CreatePolicy, AttachUserPolicy, CreateAccessKey |
| Access model doc | `docs/planning/aws-access-model.md` |
| Amendment process | See Appendix E of access model doc |
| Policy version | 1.0.0 — Sprint 0 baseline |
| Next review | Sprint 1 planning (2026-06-29) |
