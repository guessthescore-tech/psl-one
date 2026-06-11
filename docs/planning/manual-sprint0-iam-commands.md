# Manual Sprint 0 IAM Commands

**Account ID:** `844513166932`
**IAM User:** `psl-one-admin`
**Region:** `af-south-1`
**Prepared:** 2026-06-08

Run all commands from the repository root. Confirm working directory before starting each section.

Complete all sections in order. Do not skip sections. Do not run `terraform init`, `terraform plan`, or `terraform apply` until Sections 1 through 9 are complete and no stop condition has been triggered.

---

## Section 1 — Validate All Six Policy JSON Files

Confirms each file is syntactically valid JSON before making any AWS API calls. No AWS credentials required.

```bash
python3 -m json.tool infra/iam/pslone-sprint0-deny-guardrails-policy.json > /dev/null && echo "PASS deny-guardrails" || echo "FAIL deny-guardrails"
python3 -m json.tool infra/iam/pslone-sprint0-readonly-policy.json > /dev/null && echo "PASS readonly" || echo "FAIL readonly"
python3 -m json.tool infra/iam/pslone-sprint0-networking-policy.json > /dev/null && echo "PASS networking" || echo "FAIL networking"
python3 -m json.tool infra/iam/pslone-sprint0-storage-policy.json > /dev/null && echo "PASS storage" || echo "FAIL storage"
python3 -m json.tool infra/iam/pslone-sprint0-app-runtime-policy.json > /dev/null && echo "PASS app-runtime" || echo "FAIL app-runtime"
python3 -m json.tool infra/iam/pslone-sprint0-database-policy.json > /dev/null && echo "PASS database" || echo "FAIL database"
```

**Expected output:**

```
PASS deny-guardrails
PASS readonly
PASS networking
PASS storage
PASS app-runtime
PASS database
```

**Stop if:** Any line prints FAIL. Do not proceed to Section 2. Contact Claude Code session for file repair.

---

## Section 2 — Check Policy Character Counts

Each policy must contain fewer than 6,144 non-whitespace characters to satisfy the AWS managed policy document size limit. The script prints PASS or FAIL for each file.

```bash
python3 -c "
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
    status = 'PASS' if count < 6144 else 'FAIL TOO LARGE'
    print(f'{status} ({count:,} chars): {f}')
"
```

**Expected output:** All six lines begin with PASS. Character counts should each be well under 4,000.

**Stop if:** Any line begins with FAIL. Do not proceed to Section 3. Contact Claude Code session.

---

## Section 3 — Create the Six Customer-Managed IAM Policies

Creates each policy in account 844513166932. The deny guardrails policy is created first. Each successful command returns a JSON block. The response includes the policy ARN — save the terminal output before proceeding to Section 4.

```bash
aws iam create-policy \
    --policy-name PSLOneSprintZeroDenyGuardrails \
    --policy-document file://infra/iam/pslone-sprint0-deny-guardrails-policy.json \
    --description "PSL One Sprint 0 explicit deny guardrails" \
    --tags Key=Project,Value=psl-one Key=Sprint,Value=sprint-0 Key=ManagedBy,Value=manual

aws iam create-policy \
    --policy-name PSLOneSprintZeroReadOnly \
    --policy-document file://infra/iam/pslone-sprint0-readonly-policy.json \
    --description "PSL One Sprint 0 read-only permissions" \
    --tags Key=Project,Value=psl-one Key=Sprint,Value=sprint-0 Key=ManagedBy,Value=manual

aws iam create-policy \
    --policy-name PSLOneSprintZeroNetworking \
    --policy-document file://infra/iam/pslone-sprint0-networking-policy.json \
    --description "PSL One Sprint 0 networking permissions" \
    --tags Key=Project,Value=psl-one Key=Sprint,Value=sprint-0 Key=ManagedBy,Value=manual

aws iam create-policy \
    --policy-name PSLOneSprintZeroStorage \
    --policy-document file://infra/iam/pslone-sprint0-storage-policy.json \
    --description "PSL One Sprint 0 storage permissions" \
    --tags Key=Project,Value=psl-one Key=Sprint,Value=sprint-0 Key=ManagedBy,Value=manual

aws iam create-policy \
    --policy-name PSLOneSprintZeroAppRuntime \
    --policy-document file://infra/iam/pslone-sprint0-app-runtime-policy.json \
    --description "PSL One Sprint 0 app runtime permissions" \
    --tags Key=Project,Value=psl-one Key=Sprint,Value=sprint-0 Key=ManagedBy,Value=manual

aws iam create-policy \
    --policy-name PSLOneSprintZeroDatabase \
    --policy-document file://infra/iam/pslone-sprint0-database-policy.json \
    --description "PSL One Sprint 0 database permissions" \
    --tags Key=Project,Value=psl-one Key=Sprint,Value=sprint-0 Key=ManagedBy,Value=manual
```

**Expected:** Each command returns a JSON object. The `"Arn"` field in each response must match exactly:

```
arn:aws:iam::844513166932:policy/PSLOneSprintZeroDenyGuardrails
arn:aws:iam::844513166932:policy/PSLOneSprintZeroReadOnly
arn:aws:iam::844513166932:policy/PSLOneSprintZeroNetworking
arn:aws:iam::844513166932:policy/PSLOneSprintZeroStorage
arn:aws:iam::844513166932:policy/PSLOneSprintZeroAppRuntime
arn:aws:iam::844513166932:policy/PSLOneSprintZeroDatabase
```

**Stop if:** Any command returns `LimitExceeded` — contact Claude Code session, the policy file needs splitting. Any command returns `MalformedPolicyDocument` — contact Claude Code session, the JSON has a structural error. Any command returns `EntityAlreadyExists` — run the full Section 10 rollback to remove partial state, then contact Claude Code session before retrying.

---

## Section 4 — Attach the Six Policies to psl-one-admin

Attaches all six policies to IAM user psl-one-admin. The deny guardrails policy is attached first. Successful attach commands produce no output.

```bash
aws iam attach-user-policy \
    --user-name psl-one-admin \
    --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroDenyGuardrails

aws iam attach-user-policy \
    --user-name psl-one-admin \
    --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroReadOnly

aws iam attach-user-policy \
    --user-name psl-one-admin \
    --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroNetworking

aws iam attach-user-policy \
    --user-name psl-one-admin \
    --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroStorage

aws iam attach-user-policy \
    --user-name psl-one-admin \
    --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroAppRuntime

aws iam attach-user-policy \
    --user-name psl-one-admin \
    --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroDatabase
```

**Expected:** No output from any command. AWS returns nothing on success for attach operations.

**Stop if:** Any command returns an error. If `NoSuchEntity` is returned for a policy ARN, that policy was not created in Section 3 — check terminal history, run Section 10 rollback, and restart from Section 3. If any other error is returned, contact Claude Code session before proceeding.

---

## Section 5 — Verify All Six Policies Are Attached

Confirms psl-one-admin has exactly six policies attached and that each policy is active and correctly scoped to account 844513166932.

```bash
aws iam list-attached-user-policies \
    --user-name psl-one-admin \
    --output table

aws iam get-policy \
    --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroDenyGuardrails \
    --query "Policy.{Name:PolicyName,Attachments:AttachmentCount,Attachable:IsAttachable}" \
    --output table

aws iam get-policy \
    --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroReadOnly \
    --query "Policy.{Name:PolicyName,Attachments:AttachmentCount,Attachable:IsAttachable}" \
    --output table

aws iam get-policy \
    --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroNetworking \
    --query "Policy.{Name:PolicyName,Attachments:AttachmentCount,Attachable:IsAttachable}" \
    --output table

aws iam get-policy \
    --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroStorage \
    --query "Policy.{Name:PolicyName,Attachments:AttachmentCount,Attachable:IsAttachable}" \
    --output table

aws iam get-policy \
    --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroAppRuntime \
    --query "Policy.{Name:PolicyName,Attachments:AttachmentCount,Attachable:IsAttachable}" \
    --output table

aws iam get-policy \
    --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroDatabase \
    --query "Policy.{Name:PolicyName,Attachments:AttachmentCount,Attachable:IsAttachable}" \
    --output table

aws sts get-caller-identity --output table
```

**Expected:**
- `list-attached-user-policies` shows exactly 6 policies — no more, no fewer
- Each `get-policy` shows `AttachmentCount: 1` and `Attachable: True`
- `get-caller-identity` shows `Account: 844513166932`

**Stop if:** Fewer than 6 policies are listed. Any policy shows `Attachable: False`. The caller identity shows a different account number. Contact Claude Code session before proceeding to Section 6.

---

## Section 6 — Deny Guardrail Tests

These commands use `aws iam simulate-principal-policy` to verify that the deny guardrails are actively blocking each protected action. No real AWS resources are created, modified, or deleted. These commands are safe to run repeatedly.

`simulate-principal-policy` evaluates the full set of policies currently attached to psl-one-admin and returns the IAM policy engine's decision without making any API call to the target service. Run these commands using the same administrative credentials used in Sections 3 and 4. The `--policy-source-arn` parameter identifies psl-one-admin as the entity being simulated — the calling user does not need to be psl-one-admin.

Condition-based denies (EC2 instance type, RDS database class) require `--context-entries` to supply the request attribute values the policy engine evaluates against. Without context entries the condition cannot be evaluated, so they are passed explicitly for those two tests.

The expected `Decision` value for every row in every table is `explicitDeny`. This confirms an explicit Deny statement matched, which is stronger than the default implicit deny. `allowed` means the guardrail is not blocking. `implicitDeny` means the deny guardrails policy may not be attached — verify Section 4 and Section 5 before proceeding.

```bash
aws iam simulate-principal-policy \
    --policy-source-arn arn:aws:iam::844513166932:user/psl-one-admin \
    --action-names ec2:RunInstances \
    --resource-arns arn:aws:ec2:af-south-1:844513166932:instance/i-00000000000000000 \
    --context-entries ContextKeyName=ec2:InstanceType,ContextKeyValues=t3.large,ContextKeyType=string \
    --query "EvaluationResults[].{Action:EvalActionName,Decision:EvalDecision}" \
    --output table

aws iam simulate-principal-policy \
    --policy-source-arn arn:aws:iam::844513166932:user/psl-one-admin \
    --action-names rds:CreateDBInstance \
    --resource-arns arn:aws:rds:af-south-1:844513166932:db:simulation-test \
    --context-entries ContextKeyName=rds:DatabaseClass,ContextKeyValues=db.t3.small,ContextKeyType=string \
    --query "EvaluationResults[].{Action:EvalActionName,Decision:EvalDecision}" \
    --output table

aws iam simulate-principal-policy \
    --policy-source-arn arn:aws:iam::844513166932:user/psl-one-admin \
    --action-names iam:CreateUser \
    --resource-arns arn:aws:iam::844513166932:user/simulation-test-user \
    --query "EvaluationResults[].{Action:EvalActionName,Decision:EvalDecision}" \
    --output table

aws iam simulate-principal-policy \
    --policy-source-arn arn:aws:iam::844513166932:user/psl-one-admin \
    --action-names s3:PutBucketAcl s3:DeletePublicAccessBlock \
    --resource-arns arn:aws:s3:::pslone-simulation-test-bucket \
    --query "EvaluationResults[].{Action:EvalActionName,Decision:EvalDecision}" \
    --output table

aws iam simulate-principal-policy \
    --policy-source-arn arn:aws:iam::844513166932:user/psl-one-admin \
    --action-names route53:ListHostedZones \
    --resource-arns "*" \
    --query "EvaluationResults[].{Action:EvalActionName,Decision:EvalDecision}" \
    --output table

aws iam simulate-principal-policy \
    --policy-source-arn arn:aws:iam::844513166932:user/psl-one-admin \
    --action-names kafka:ListClusters \
    --resource-arns "*" \
    --query "EvaluationResults[].{Action:EvalActionName,Decision:EvalDecision}" \
    --output table
```

**Expected:** Each command produces a table. The `Decision` column must show `explicitDeny` for every row across all six commands:

```
ec2:RunInstances          explicitDeny
rds:CreateDBInstance      explicitDeny
iam:CreateUser            explicitDeny
s3:PutBucketAcl           explicitDeny
s3:DeletePublicAccessBlock  explicitDeny
route53:ListHostedZones   explicitDeny
kafka:ListClusters        explicitDeny
```

**Stop if:**
- Any row shows `allowed` — the deny guardrail is not blocking that action. Do not proceed to Section 7. Run Section 10 rollback and contact Claude Code session.
- Any row shows `implicitDeny` — no explicit Deny matched. The deny guardrails policy may not be attached. Go back to Section 5 and confirm all six policies are attached. If they are attached, contact Claude Code session.
- Any simulation command itself returns `AccessDenied` — the calling credentials do not have `iam:SimulatePrincipalPolicy` permission. Switch to administrative credentials and re-run Section 6 before proceeding.

If any stop condition triggers: do not proceed to Section 7. Contact Claude Code session before retrying.

---

## Section 7 — Allow and Read Permission Tests

These tests confirm that Terraform's minimum read permissions are working before any `terraform plan` is attempted. All commands must complete without `AccessDenied`. These are read-only operations with no cost or side effects.

```bash
aws sts get-caller-identity \
    --output table

aws ec2 describe-vpcs \
    --region af-south-1 \
    --output table

aws rds describe-db-instances \
    --region af-south-1 \
    --output table

aws s3 ls

aws secretsmanager list-secrets \
    --region af-south-1 \
    --output table

aws ecr describe-repositories \
    --region af-south-1 \
    --output table

aws iam list-policies \
    --scope Local \
    --output table
```

**Expected:** All commands return data or empty tables without errors. `sts get-caller-identity` shows `Account: 844513166932`. The `iam list-policies --scope Local` output includes the six PSLOneSprintZero policies created in Section 3.

**Stop if:** Any command returns `AccessDenied`. This indicates a missing Allow permission. Note which command failed and contact Claude Code session. Do not proceed to Section 8.

---

## Section 8 — Create the Terraform Backend Resources

Creates the S3 bucket for Terraform state and the DynamoDB table for state locking. Both must exist before `terraform init` can run. Terraform cannot create its own state bucket. Run each command and wait for success before running the next.

```bash
aws s3api create-bucket \
    --bucket pslone-terraform-state-dev \
    --region af-south-1 \
    --create-bucket-configuration LocationConstraint=af-south-1

aws s3api put-bucket-versioning \
    --bucket pslone-terraform-state-dev \
    --versioning-configuration Status=Enabled

aws s3api put-public-access-block \
    --bucket pslone-terraform-state-dev \
    --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

aws s3api put-bucket-encryption \
    --bucket pslone-terraform-state-dev \
    --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

aws dynamodb create-table \
    --table-name pslone-terraform-lock \
    --billing-mode PAY_PER_REQUEST \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --region af-south-1 \
    --tags Key=Project,Value=psl-one Key=Sprint,Value=sprint-0
```

**Expected:**
- `create-bucket` returns a JSON object with `"Location": "/pslone-terraform-state-dev"`
- `put-bucket-versioning` returns no output
- `put-public-access-block` returns no output
- `put-bucket-encryption` returns no output
- `create-table` returns a large JSON object with `"TableStatus": "CREATING"` — this transitions to `ACTIVE` within seconds

**Stop if:** `create-bucket` returns `BucketAlreadyExists` or `BucketAlreadyOwnedByYou`. If `BucketAlreadyOwnedByYou`, the bucket already exists in your account — proceed to verify in Section 9. If `BucketAlreadyExists`, another AWS account owns that bucket name globally — stop and contact Claude Code session immediately, as the bucket name must change. If any command returns `AccessDenied`, stop and contact Claude Code session.

---

## Section 9 — Verify Terraform Backend Resources

Confirms the S3 bucket is correctly configured and the DynamoDB table is active before handing off to Terraform.

```bash
aws s3api get-bucket-versioning \
    --bucket pslone-terraform-state-dev

aws s3api get-public-access-block \
    --bucket pslone-terraform-state-dev

aws s3api get-bucket-encryption \
    --bucket pslone-terraform-state-dev

aws dynamodb describe-table \
    --table-name pslone-terraform-lock \
    --region af-south-1 \
    --query "Table.{Name:TableName,Status:TableStatus,BillingMode:BillingModeSummary.BillingMode}" \
    --output table
```

**Expected:**
- Versioning: `"Status": "Enabled"`
- Public access block: all four values are `true`
- Encryption: `"SSEAlgorithm": "AES256"`
- DynamoDB table: `Status: ACTIVE`, `BillingMode: PAY_PER_REQUEST`

**Stop if:** Versioning status is not `Enabled`. Any public access block value is `false`. Encryption is not set. DynamoDB table status is not `ACTIVE` (wait 10 seconds and re-run the describe-table command — if still not ACTIVE after 60 seconds, contact Claude Code session).

Do not run `terraform init` until all four checks pass.

---

## Section 10 — Rollback Commands

Run these only if a stop condition was triggered in Sections 3 through 6, or if you need to remove all policies for any reason.

Detach all six policies first, then delete them. A policy cannot be deleted while it is attached to a user. Commands that return `NoSuchEntity` on detach are safe to ignore — it means that policy was not attached. Run all detach commands before running any delete commands.

```bash
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

aws iam delete-policy \
    --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroDatabase

aws iam delete-policy \
    --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroAppRuntime

aws iam delete-policy \
    --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroStorage

aws iam delete-policy \
    --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroNetworking

aws iam delete-policy \
    --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroReadOnly

aws iam delete-policy \
    --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroDenyGuardrails
```

**Expected:** All detach commands return no output or `NoSuchEntity`. All delete commands return no output.

**Stop if:** A delete command returns `DeleteConflict` — the policy is still attached to something. Re-run the matching detach command for that policy and try the delete again. If the error persists, contact Claude Code session.
