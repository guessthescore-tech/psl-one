# PSL One — AWS Access Model: Sprint 0

**Date:** 2026-06-08  
**Authority:** Programme Director + Architecture Review Board  
**Status:** APPROVED — do not apply until human reviews IAM policy JSON  
**Scope:** Sprint 0 infrastructure only (EC2, RDS, S3, ECR, CloudWatch, Cognito, Secrets Manager)

---

## 1. Account Access Strategy

### Account topology

Sprint 0 operates in a single AWS account. Multi-account AWS Organizations is deferred to post-funding Phase 2 (per ADR-011). The account runs in `af-south-1` (Cape Town). Free tier eligibility applies per-account, not per-region, for EC2 and RDS.

### Identity planes

| Plane | Who | Mechanism | Status |
|---|---|---|---|
| Human operator | Developer / Programme Director | IAM user + MFA + access keys | Created — this document governs |
| CI/CD | GitHub Actions deploy workflow | IAM Role via OIDC trust | To be created in Sprint 0 |
| Application runtime | EC2 instance | IAM instance profile (role) | To be created via Terraform |
| Root account | Nobody | Disabled (MFA, no access keys) | Must verify on Day 1 |

### Day 1 account hardening checklist (human, not Terraform)

These must be completed before `terraform apply` runs for the first time:

- [ ] Root account has MFA enabled
- [ ] Root account has no active access keys
- [ ] IAM user has MFA enabled
- [ ] AWS CloudTrail enabled (1 trail, `af-south-1`, free tier, S3 log destination)
- [ ] AWS Config NOT enabled (not free — defer)
- [ ] AWS Budget alert created at $50 and $80 thresholds (Terraform will also create this)
- [ ] Billing Alerts enabled in account preferences (free, email only)
- [ ] Root account email confirmed as active

---

## 2. IAM User vs Role Recommendation

### Sprint 0 position: accept the IAM user that has been created

An IAM user with static access keys is acceptable for Sprint 0 because:
- The team is one or two people
- SSO/Identity Center requires AWS Organizations (deferred)
- Free tier has no identity federation included without cost

**However**, three constraints apply immediately:

1. **The IAM user gets the least-privilege policy in Section 3** and nothing broader.
2. **MFA must be enforced** on the IAM user before the access keys are used for the first time.
3. **Access keys rotate every 30 days** (add to the Sprint 0 calendar).

### CI/CD: OIDC role — not access keys

GitHub Actions must **not** use the IAM user's access keys. GitHub Actions uses an OIDC trust relationship to assume a scoped IAM role. This means:
- No long-lived AWS credentials stored in GitHub Secrets
- Role session expires after 1 hour per deploy
- Role has narrower permissions than the developer user (ECR push + EC2 SSH trigger only)

The OIDC role definition is in Appendix B.

### Future recommendation (Sprint 1 planning): IAM Identity Center

After the platform has traction and a second developer joins:
- Enable AWS IAM Identity Center (formerly SSO)
- Issue each developer a permission set, not personal access keys
- Revoke static access keys
- This is a 1-hour migration with no infrastructure changes

---

## 3. Least-Privilege IAM Policy Design Principles

The Sprint 0 policy applies four layered controls:

**Layer 1 — Explicit Allow** covers only the services and actions needed for Sprint 0 resources. Anything not listed is implicitly denied.

**Layer 2 — Resource conditions** restrict allowed actions to named resource patterns (`psl-one-*`, `pslone-*`) where IAM supports resource-level permissions.

**Layer 3 — Condition keys** enforce instance type (`ec2:InstanceType = t2.micro`) and database class (`rds:DatabaseClass = db.t3.micro`) at the API level, preventing accidental creation of expensive resources even if a Terraform config changes.

**Layer 4 — Explicit Deny** overrides any Allow for the highest-risk operations (public buckets, Aurora clusters, IAM escalation, Route53, MSK, non-free-tier instance types). Explicit Deny cannot be overridden by another Allow.

---

## 4. Resources Claude May Manage

All management is via Terraform only. No direct console or CLI changes to production state.

| Resource | Constraint | Notes |
|---|---|---|
| **EC2 instances** | `t2.micro` only, enforced by condition key | One instance: `psl-api` |
| **Security Groups** | Resources in default VPC only | `psl-api-sg`, `psl-rds-sg` |
| **Elastic IPs** | Max 1 | For `api.pslone.co.za` |
| **Key Pairs** | Named `pslone-*` | SSH access to EC2 |
| **RDS instances** | `db.t3.micro` only, enforced by condition key | PostgreSQL 16, no multi-AZ, no public access |
| **RDS subnet groups** | Named `pslone-*` | Private subnet placement |
| **S3 buckets** | Named `psl-one-*` or `pslone-*` | Terraform state, media — no public ACL |
| **ECR repositories** | Any name | `psl-api` image repository |
| **CloudWatch log groups** | Any name | EC2 app logs, RDS logs |
| **CloudWatch alarms** | Any name | CPU, memory, error count |
| **Secrets Manager secrets** | Path `pslone/dev/*` only | DB password, Cognito config |
| **Cognito User Pools** | Any name | `psl-one-users-dev` |
| **Cognito App Clients** | Any name (tied to pool) | `psl-one-api` client |
| **Cognito Groups** | Any name | RBAC groups (FAN, PSL_ADMIN, etc.) |
| **IAM roles** | Named `pslone-*`, can only be passed to EC2 | EC2 instance profile role |
| **IAM instance profiles** | Named `pslone-*` | EC2 instance profile |
| **DynamoDB tables** | Named `psl-one-terraform-*` | Terraform state lock |
| **AWS Budgets** | Any | Cost alerts |
| **SNS topics** | Named `pslone-*` | Budget alert notifications |
| **SES email identities** | Verified domains/addresses only | `@pslone.co.za` |
| **CloudTrail** | Read + describe only | Audit visibility |

---

## 5. Resources Forbidden Without Explicit Approval

These resources cannot be created by the Sprint 0 IAM policy. A policy amendment with Programme Director approval is required before any of these can be provisioned.

| Resource | Reason | Approval path |
|---|---|---|
| **Any EC2 instance type other than t2.micro** | Cost — minimum $0.023/hr → $17/month | ARB + cost model update |
| **Any RDS class other than db.t3.micro** | Cost — minimum ~$15/month | ARB + cost model update |
| **RDS Multi-AZ** | Cost doubles — ~$30/month | ARB approval |
| **Aurora (rds:CreateDBCluster)** | Cost ~$70+/month minimum | Blocked until Phase 2 |
| **RDS publicly accessible** | Security — database must never be internet-facing | Never |
| **MSK / Kafka** | Cost ~$626/month (ARB-001 finding 004-A) | Funding milestone |
| **ElastiCache** | Cost + not in Sprint 0 scope | Sprint 1 review |
| **ECS Fargate** | Not in Sprint 0 scope | Sprint 1 review |
| **GPU instances (p*, g*)** | Cost — minimum $0.90/hr | Never in free tier phase |
| **S3 bucket with public ACL** | Security — no fan data may be public | Never |
| **S3 bucket with public bucket policy** | Security | Architecture review |
| **Route53 domain changes** | Risk — DNS outage affects all users | Human-only, out-of-band |
| **IAM users, groups, or policies** | Privilege escalation risk | Human-only via console |
| **IAM AdministratorAccess** | Prohibited — CLAUDE.md rule | Never |
| **IAM wildcard permissions (`*:*`)** | Prohibited — CLAUDE.md rule | Never |
| **AWS Organizations changes** | Multi-account deferred | Phase 2 |
| **Production-tagged resources** | Not yet defined | Phase 2 |
| **CloudFront distributions** | Deferred — Vercel used | Sprint 3+ |
| **API Gateway** | Deferred — Monolith serves directly | Sprint 3+ |

---

## 6. Terraform-Only Workflow

**Rule: All AWS state changes happen through Terraform. No exceptions.**

### What this means in practice

- `terraform plan` is always run and reviewed before `terraform apply`
- Every infrastructure change is a Git commit to `infra/terraform/bootstrap/`
- No manual console changes. If the console is used to diagnose, any changes made must be immediately replicated in Terraform or reverted
- No `aws` CLI commands that create or modify resources (describe/get commands are fine)
- Terraform state is stored in S3 with DynamoDB locking — never local `.tfstate` files in production

### Terraform workflow for Claude

```
1. Read existing Terraform files
2. Propose changes in natural language
3. User approves proposed changes
4. Write/edit .tf files
5. Run: terraform fmt
6. Run: terraform validate
7. Run: terraform plan -out=plan.tfplan
8. STOP — hand plan output to user for review
9. User reviews plan, approves in writing
10. Run: terraform apply plan.tfplan
11. Capture outputs (IP addresses, endpoints)
12. Commit .tf changes (NOT .tfstate) to Git
```

Steps 1–8 may be done autonomously. Step 10 requires explicit human approval.

### State management

```hcl
terraform {
  backend "s3" {
    bucket         = "psl-one-terraform-state"
    key            = "bootstrap/terraform.tfstate"
    region         = "af-south-1"
    dynamodb_table = "psl-one-terraform-lock"
    encrypt        = true
  }
}
```

The state bucket must be created manually (bootstrapping problem) before `terraform init` runs:

```bash
# Run once, manually, before terraform init
aws s3api create-bucket \
  --bucket psl-one-terraform-state \
  --region af-south-1 \
  --create-bucket-configuration LocationConstraint=af-south-1

aws s3api put-bucket-versioning \
  --bucket psl-one-terraform-state \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption \
  --bucket psl-one-terraform-state \
  --server-side-encryption-configuration \
    '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

aws s3api put-public-access-block \
  --bucket psl-one-terraform-state \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

aws dynamodb create-table \
  --table-name psl-one-terraform-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region af-south-1
```

---

## 7. Human Approval Gates

### Gate 1 — Before `terraform apply` (every time)

Claude stops after `terraform plan` and presents the full plan. The human must respond with explicit approval before `terraform apply` runs. Approval must be in the conversation — no assumed approval from prior context.

**Claude's exact checkpoint message:**
> "Terraform plan complete. N resources to add, M to change, P to destroy. Please review the plan above and confirm with 'approved' before I run apply."

### Gate 2 — Before any RDS creation or deletion

RDS operations are irreversible or have significant cost/data implications. Claude must:
1. State the exact operation and its consequences
2. State the estimated monthly cost
3. Wait for explicit approval with the word "confirmed"

RDS deletion must additionally confirm: "This will destroy all data in the database and cannot be undone."

### Gate 3 — Before any IAM change

IAM changes (role creation, policy attachment) are shown in full before apply. Claude must state:
- What role is being created
- What trust policy it has (who can assume it)
- What policies are attached
- Why it is needed

### Gate 4 — Any `terraform destroy`

`terraform destroy` is never run autonomously. It requires a separate explicit instruction: "Run terraform destroy for [specific resource]" followed by confirmation of the specific resources being destroyed.

### Gate 5 — Cost estimate before any net-new resource

Before creating any resource not previously in the plan, Claude states the estimated monthly cost and waits for acknowledgement.

---

## 8. Cost Guardrails

### Hard guardrails (enforced by IAM policy)

| Resource | Hard limit | Enforcement |
|---|---|---|
| EC2 instance type | `t2.micro` only | `ec2:InstanceType` condition key + explicit deny |
| RDS instance class | `db.t3.micro` only | `rds:DatabaseClass` condition key + explicit deny |
| Aurora | Blocked | Deny `rds:CreateDBCluster` |
| MSK | Blocked | Deny `kafka:*` |
| Public S3 | Blocked | Deny `s3:PutBucketAcl`, `s3:PutObjectAcl` |

### Soft guardrails (monitoring + process)

| Control | Implementation |
|---|---|
| AWS Budget alert at $50 | Terraform creates `aws_budgets_budget` with SNS email alert |
| AWS Budget alert at $80 | Second alert — triggers sprint pause for cost review |
| Budget at $100 | Third alert — hard stop, no new resources until reviewed |
| Free tier usage alerts | Enable in AWS Billing console (manual, Day 1 task) |
| Cost review cadence | Weekly during Sprint 0 (Monday morning, 5 min) |
| Terraform plan includes cost estimate | Use `infracost` CLI before every apply |

### Sprint 0 expected costs

From `docs/architecture/bootstrap-cost-model.md`:
- Free tier period (first 12 months): $0/month
- Post-free-tier: ~$33.64/month
- `af-south-1` note: af-south-1 is not in the AWS free tier for new accounts created after February 2022. Verify account eligibility. If not eligible, budget $33.64/month from Day 1.

### Cost anomaly response

If the AWS Budget alert fires at $50:
1. Stop all `terraform apply` operations immediately
2. Run `aws ce get-cost-and-usage` to identify the source
3. Terminate the offending resource if it was created in error
4. Do not resume without Programme Director review

---

## 9. Security Guardrails

### Network security

- RDS is in a private subnet with no public endpoint (`publicly_accessible = false` in Terraform)
- EC2 security group allows inbound 80/443 from `0.0.0.0/0` only (web traffic)
- RDS security group allows inbound 5432 only from the EC2 security group ID (no CIDR range)
- No security group rule permits `0.0.0.0/0` on port 22 — SSH access requires the developer's specific IP
- SSH access key is a 4096-bit RSA or ED25519 key pair, stored only in Secrets Manager and the developer's local machine

### Data security

- All S3 buckets have `BlockPublicAcls = true`, `BlockPublicPolicy = true`, `IgnorePublicAcls = true`, `RestrictPublicBuckets = true`
- All S3 buckets have SSE-S3 encryption enabled
- RDS has storage encryption enabled (`storage_encrypted = true`)
- Secrets Manager secrets are encrypted with the default KMS key
- Terraform state S3 bucket has SSE-AES256 enabled

### IAM security

- No inline policies on the IAM user — managed policy only
- The IAM user's access keys are never committed to Git, never in `.env` files in the repo, never in Terraform files
- EC2 instance roles are named `pslone-*` and can only be passed to `ec2.amazonaws.com`
- EC2 instance roles cannot be assumed by humans (trust policy restricts to EC2 service principal)
- `iam:CreateUser`, `iam:CreateAccessKey`, `iam:AttachUserPolicy` are explicitly denied

### Secrets handling on EC2

The EC2 instance does **not** have the developer's IAM access keys. The EC2 instance profile gives it:
- `secretsmanager:GetSecretValue` on `pslone/dev/*` (to read DB password, Cognito config)
- `ecr:GetAuthorizationToken`, `ecr:BatchGetImage` (to pull Docker images)
- `ses:SendEmail`, `ses:SendRawEmail` (for transactional email)
- `logs:PutLogEvents` (to send logs to CloudWatch)
- `s3:GetObject`, `s3:PutObject` on the media bucket only

The EC2 instance profile policy (Appendix C) is tighter than the developer policy.

---

## 10. Credential Handling Rules

### Developer IAM access keys

| Rule | Detail |
|---|---|
| Storage | AWS CLI credentials file (`~/.aws/credentials`), profile named `pslone-dev` |
| Never stored in | `.env` files, Git repository, Slack, email, code comments |
| Rotation | Every 30 days — add to calendar on Day 1 |
| Usage scope | `terraform plan`, `terraform apply`, `aws` CLI describe operations only |
| MFA | Required — configure MFA policy on the IAM user |
| Revocation | Immediately on device theft, team change, or suspected compromise |

### How Claude uses credentials

Claude does not store credentials. When running Terraform or AWS CLI commands:
- Claude calls `terraform` or `aws` CLI tools which read from `~/.aws/credentials`
- Claude never outputs or logs the values of environment variables containing credentials
- If a credential value appears in command output, Claude redacts it before displaying

### GitHub Actions

The deploy workflow uses OIDC — no access keys in GitHub Secrets. The only AWS-related GitHub Secret is `AWS_ROLE_TO_ASSUME` which contains the IAM Role ARN (not a credential).

```yaml
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
    aws-region: af-south-1
```

### Incident response

If access keys are compromised or accidentally committed to Git:
1. **Immediately** deactivate the key in IAM console: `aws iam update-access-key --status Inactive`
2. Run `git filter-repo` or use GitHub's secret scanning to purge from history
3. Create new access keys
4. Notify Programme Director
5. Review CloudTrail for any unauthorised API calls in the last 24 hours

---

## Appendix A — Sprint 0 IAM Policy JSON

This policy is attached to the IAM user created for Sprint 0 infrastructure work. It is a **Customer Managed Policy** named `PSLOneSprintZeroInfrastructure`.

> **Before attaching:** replace `844513166932` with your 12-digit AWS account ID. Verify the bucket names match what you create (psl-one-terraform-state, psl-one-media-dev).

The complete policy is in `infra/iam/pslone-sprint0-policy.json`. Contents below for review:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EC2ReadOnly",
      "Effect": "Allow",
      "Action": [
        "ec2:Describe*",
        "ec2:GetConsoleOutput",
        "ec2:GetConsoleScreenshot",
        "ec2:GetPasswordData"
      ],
      "Resource": "*"
    },
    {
      "Sid": "EC2NetworkingManagement",
      "Effect": "Allow",
      "Action": [
        "ec2:CreateSecurityGroup",
        "ec2:DeleteSecurityGroup",
        "ec2:AuthorizeSecurityGroupIngress",
        "ec2:AuthorizeSecurityGroupEgress",
        "ec2:RevokeSecurityGroupIngress",
        "ec2:RevokeSecurityGroupEgress",
        "ec2:UpdateSecurityGroupRuleDescriptionsIngress",
        "ec2:UpdateSecurityGroupRuleDescriptionsEgress",
        "ec2:ModifySecurityGroupRules",
        "ec2:CreateTags",
        "ec2:DeleteTags",
        "ec2:CreateKeyPair",
        "ec2:ImportKeyPair",
        "ec2:DeleteKeyPair",
        "ec2:AllocateAddress",
        "ec2:AssociateAddress",
        "ec2:DisassociateAddress",
        "ec2:ReleaseAddress",
        "ec2:ModifyInstanceAttribute",
        "ec2:ModifyNetworkInterfaceAttribute"
      ],
      "Resource": "*"
    },
    {
      "Sid": "EC2LaunchT2MicroOnly",
      "Effect": "Allow",
      "Action": "ec2:RunInstances",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "ec2:InstanceType": "t2.micro"
        }
      }
    },
    {
      "Sid": "EC2InstanceLifecycle",
      "Effect": "Allow",
      "Action": [
        "ec2:StartInstances",
        "ec2:StopInstances",
        "ec2:RebootInstances",
        "ec2:TerminateInstances",
        "ec2:AssociateIamInstanceProfile",
        "ec2:DisassociateIamInstanceProfile",
        "ec2:ReplaceIamInstanceProfileAssociation"
      ],
      "Resource": "*"
    },
    {
      "Sid": "RDSReadOnly",
      "Effect": "Allow",
      "Action": [
        "rds:Describe*",
        "rds:List*",
        "rds:Download*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "RDSCreateT3MicroOnly",
      "Effect": "Allow",
      "Action": [
        "rds:CreateDBInstance",
        "rds:ModifyDBInstance"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "rds:DatabaseClass": "db.t3.micro"
        }
      }
    },
    {
      "Sid": "RDSOtherManagement",
      "Effect": "Allow",
      "Action": [
        "rds:DeleteDBInstance",
        "rds:RebootDBInstance",
        "rds:StartDBInstance",
        "rds:StopDBInstance",
        "rds:CreateDBSubnetGroup",
        "rds:DeleteDBSubnetGroup",
        "rds:ModifyDBSubnetGroup",
        "rds:CreateDBParameterGroup",
        "rds:DeleteDBParameterGroup",
        "rds:ModifyDBParameterGroup",
        "rds:ResetDBParameterGroup",
        "rds:CreateDBSnapshot",
        "rds:DeleteDBSnapshot",
        "rds:RestoreDBInstanceFromDBSnapshot",
        "rds:AddTagsToResource",
        "rds:RemoveTagsFromResource",
        "rds:ApplyPendingMaintenanceAction"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3TerraformState",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:GetBucketVersioning",
        "s3:PutBucketVersioning",
        "s3:GetBucketPolicy",
        "s3:PutBucketPolicy",
        "s3:DeleteBucketPolicy",
        "s3:GetBucketPublicAccessBlock",
        "s3:PutBucketPublicAccessBlock",
        "s3:GetEncryptionConfiguration",
        "s3:PutEncryptionConfiguration",
        "s3:GetBucketLogging",
        "s3:PutBucketLogging",
        "s3:GetBucketTagging",
        "s3:PutBucketTagging",
        "s3:GetBucketLocation",
        "s3:GetBucketAcl",
        "s3:ListBucket",
        "s3:ListBucketVersions",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:GetObjectVersion",
        "s3:DeleteObjectVersion"
      ],
      "Resource": [
        "arn:aws:s3:::psl-one-terraform-state",
        "arn:aws:s3:::psl-one-terraform-state/*",
        "arn:aws:s3:::pslone-terraform-state",
        "arn:aws:s3:::pslone-terraform-state/*"
      ]
    },
    {
      "Sid": "S3DevBuckets",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:GetBucketVersioning",
        "s3:PutBucketVersioning",
        "s3:GetBucketPolicy",
        "s3:PutBucketPolicy",
        "s3:DeleteBucketPolicy",
        "s3:GetBucketPublicAccessBlock",
        "s3:PutBucketPublicAccessBlock",
        "s3:GetEncryptionConfiguration",
        "s3:PutEncryptionConfiguration",
        "s3:GetBucketLogging",
        "s3:PutBucketLogging",
        "s3:GetBucketTagging",
        "s3:PutBucketTagging",
        "s3:GetBucketLocation",
        "s3:GetBucketAcl",
        "s3:GetBucketCORS",
        "s3:PutBucketCORS",
        "s3:ListBucket",
        "s3:ListBucketVersions",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:GetObjectVersion",
        "s3:DeleteObjectVersion",
        "s3:GetObjectTagging",
        "s3:PutObjectTagging"
      ],
      "Resource": [
        "arn:aws:s3:::psl-one-*",
        "arn:aws:s3:::psl-one-*/*",
        "arn:aws:s3:::pslone-*",
        "arn:aws:s3:::pslone-*/*"
      ]
    },
    {
      "Sid": "S3GlobalList",
      "Effect": "Allow",
      "Action": [
        "s3:ListAllMyBuckets",
        "s3:GetBucketLocation",
        "s3:HeadBucket"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ECRManagement",
      "Effect": "Allow",
      "Action": [
        "ecr:CreateRepository",
        "ecr:DeleteRepository",
        "ecr:DescribeRepositories",
        "ecr:ListImages",
        "ecr:BatchDeleteImage",
        "ecr:DescribeImages",
        "ecr:BatchGetImage",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:GetAuthorizationToken",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:PutImage",
        "ecr:GetRepositoryPolicy",
        "ecr:SetRepositoryPolicy",
        "ecr:DeleteRepositoryPolicy",
        "ecr:ListTagsForResource",
        "ecr:TagResource",
        "ecr:UntagResource",
        "ecr:PutLifecyclePolicy",
        "ecr:GetLifecyclePolicy",
        "ecr:PutImageTagMutability",
        "ecr:PutImageScanningConfiguration",
        "ecr:DescribeImageScanFindings"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudWatchLogsManagement",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:DeleteLogGroup",
        "logs:DescribeLogGroups",
        "logs:ListTagsLogGroup",
        "logs:TagLogGroup",
        "logs:UntagLogGroup",
        "logs:CreateLogStream",
        "logs:DeleteLogStream",
        "logs:DescribeLogStreams",
        "logs:PutLogEvents",
        "logs:GetLogEvents",
        "logs:FilterLogEvents",
        "logs:PutRetentionPolicy",
        "logs:DeleteRetentionPolicy",
        "logs:PutSubscriptionFilter",
        "logs:DescribeSubscriptionFilters",
        "logs:DeleteSubscriptionFilter",
        "logs:PutMetricFilter",
        "logs:DescribeMetricFilters",
        "logs:DeleteMetricFilter",
        "logs:StartQuery",
        "logs:StopQuery",
        "logs:GetQueryResults",
        "logs:DescribeQueries"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudWatchMetricsAndAlarms",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:PutMetricAlarm",
        "cloudwatch:DeleteAlarms",
        "cloudwatch:DescribeAlarms",
        "cloudwatch:DescribeAlarmsForMetric",
        "cloudwatch:GetMetricData",
        "cloudwatch:GetMetricStatistics",
        "cloudwatch:ListMetrics",
        "cloudwatch:PutDashboard",
        "cloudwatch:GetDashboard",
        "cloudwatch:DeleteDashboards",
        "cloudwatch:ListDashboards",
        "cloudwatch:EnableAlarmActions",
        "cloudwatch:DisableAlarmActions",
        "cloudwatch:TagResource",
        "cloudwatch:UntagResource",
        "cloudwatch:ListTagsForResource"
      ],
      "Resource": "*"
    },
    {
      "Sid": "SecretsManagerDevNamespace",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:CreateSecret",
        "secretsmanager:DeleteSecret",
        "secretsmanager:GetSecretValue",
        "secretsmanager:PutSecretValue",
        "secretsmanager:UpdateSecret",
        "secretsmanager:DescribeSecret",
        "secretsmanager:ListSecretVersionIds",
        "secretsmanager:TagResource",
        "secretsmanager:UntagResource",
        "secretsmanager:RotateSecret",
        "secretsmanager:CancelRotateSecret",
        "secretsmanager:RestoreSecret"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:pslone/dev/*"
    },
    {
      "Sid": "SecretsManagerListAll",
      "Effect": "Allow",
      "Action": "secretsmanager:ListSecrets",
      "Resource": "*"
    },
    {
      "Sid": "CognitoUserPoolManagement",
      "Effect": "Allow",
      "Action": [
        "cognito-idp:CreateUserPool",
        "cognito-idp:DeleteUserPool",
        "cognito-idp:DescribeUserPool",
        "cognito-idp:UpdateUserPool",
        "cognito-idp:ListUserPools",
        "cognito-idp:GetUserPoolMfaConfig",
        "cognito-idp:SetUserPoolMfaConfig",
        "cognito-idp:CreateUserPoolClient",
        "cognito-idp:DeleteUserPoolClient",
        "cognito-idp:DescribeUserPoolClient",
        "cognito-idp:UpdateUserPoolClient",
        "cognito-idp:ListUserPoolClients",
        "cognito-idp:CreateGroup",
        "cognito-idp:DeleteGroup",
        "cognito-idp:GetGroup",
        "cognito-idp:ListGroups",
        "cognito-idp:UpdateGroup",
        "cognito-idp:AddCustomAttributes",
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminDeleteUser",
        "cognito-idp:AdminGetUser",
        "cognito-idp:AdminUpdateUserAttributes",
        "cognito-idp:AdminAddUserToGroup",
        "cognito-idp:AdminRemoveUserFromGroup",
        "cognito-idp:AdminListGroupsForUser",
        "cognito-idp:AdminConfirmSignUp",
        "cognito-idp:AdminEnableUser",
        "cognito-idp:AdminDisableUser",
        "cognito-idp:AdminInitiateAuth",
        "cognito-idp:AdminRespondToAuthChallenge",
        "cognito-idp:AdminSetUserPassword",
        "cognito-idp:AdminForgetDevice",
        "cognito-idp:ListUsers",
        "cognito-idp:ListUsersInGroup",
        "cognito-idp:TagResource",
        "cognito-idp:UntagResource",
        "cognito-idp:ListTagsForResource",
        "cognito-idp:CreateResourceServer",
        "cognito-idp:DeleteResourceServer",
        "cognito-idp:DescribeResourceServer",
        "cognito-idp:ListResourceServers",
        "cognito-idp:UpdateResourceServer",
        "cognito-idp:CreateUserPoolDomain",
        "cognito-idp:DeleteUserPoolDomain",
        "cognito-idp:DescribeUserPoolDomain"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IAMInstanceProfileManagement",
      "Effect": "Allow",
      "Action": [
        "iam:CreateInstanceProfile",
        "iam:DeleteInstanceProfile",
        "iam:GetInstanceProfile",
        "iam:ListInstanceProfiles",
        "iam:ListInstanceProfilesForRole",
        "iam:AddRoleToInstanceProfile",
        "iam:RemoveRoleFromInstanceProfile",
        "iam:TagInstanceProfile",
        "iam:UntagInstanceProfile"
      ],
      "Resource": "arn:aws:iam::*:instance-profile/pslone-*"
    },
    {
      "Sid": "IAMEC2RoleManagement",
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:GetRole",
        "iam:ListRoles",
        "iam:ListRoleTags",
        "iam:TagRole",
        "iam:UntagRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:ListAttachedRolePolicies",
        "iam:PutRolePolicy",
        "iam:GetRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:ListRolePolicies"
      ],
      "Resource": "arn:aws:iam::*:role/pslone-*"
    },
    {
      "Sid": "IAMPassRoleToEC2ServiceOnly",
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": "arn:aws:iam::*:role/pslone-*",
      "Condition": {
        "StringEquals": {
          "iam:PassedToService": "ec2.amazonaws.com"
        }
      }
    },
    {
      "Sid": "IAMReadOnly",
      "Effect": "Allow",
      "Action": [
        "iam:GetPolicy",
        "iam:GetPolicyVersion",
        "iam:ListPolicies",
        "iam:ListPolicyVersions",
        "iam:ListEntitiesForPolicy",
        "iam:GetUser",
        "iam:ListUsers",
        "iam:ListGroups",
        "iam:ListUserPolicies",
        "iam:ListAttachedUserPolicies",
        "iam:GetAccountPasswordPolicy",
        "iam:GetAccountSummary",
        "iam:ListAccountAliases"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IAMServiceLinkedRoles",
      "Effect": "Allow",
      "Action": "iam:CreateServiceLinkedRole",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "iam:AWSServiceName": [
            "rds.amazonaws.com",
            "ec2.amazonaws.com",
            "budgets.amazonaws.com",
            "cognito-idp.amazonaws.com"
          ]
        }
      }
    },
    {
      "Sid": "DynamoDBTerraformStateLock",
      "Effect": "Allow",
      "Action": [
        "dynamodb:CreateTable",
        "dynamodb:DeleteTable",
        "dynamodb:DescribeTable",
        "dynamodb:DescribeTimeToLive",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:DeleteItem",
        "dynamodb:UpdateItem",
        "dynamodb:ListTables",
        "dynamodb:TagResource",
        "dynamodb:UntagResource",
        "dynamodb:ListTagsOfResource",
        "dynamodb:UpdateTimeToLive"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/psl-one-terraform-*",
        "arn:aws:dynamodb:*:*:table/pslone-terraform-*"
      ]
    },
    {
      "Sid": "BudgetsManagement",
      "Effect": "Allow",
      "Action": [
        "budgets:CreateBudget",
        "budgets:DeleteBudget",
        "budgets:DescribeBudget",
        "budgets:DescribeBudgets",
        "budgets:ModifyBudget",
        "budgets:ViewBudget",
        "budgets:CreateBudgetAction",
        "budgets:DeleteBudgetAction",
        "budgets:DescribeBudgetAction",
        "budgets:DescribeBudgetActionsForAccount",
        "budgets:DescribeBudgetActionsForBudget",
        "budgets:ExecuteBudgetAction",
        "budgets:UpdateBudgetAction",
        "budgets:DescribeBudgetPerformanceHistory",
        "budgets:DescribeBudgetNotificationsForAccount"
      ],
      "Resource": "*"
    },
    {
      "Sid": "SNSAlertsManagement",
      "Effect": "Allow",
      "Action": [
        "sns:CreateTopic",
        "sns:DeleteTopic",
        "sns:GetTopicAttributes",
        "sns:SetTopicAttributes",
        "sns:Subscribe",
        "sns:Unsubscribe",
        "sns:ListSubscriptions",
        "sns:ListSubscriptionsByTopic",
        "sns:ListTopics",
        "sns:Publish",
        "sns:TagResource",
        "sns:UntagResource",
        "sns:ListTagsForResource",
        "sns:GetSubscriptionAttributes",
        "sns:SetSubscriptionAttributes",
        "sns:ConfirmSubscription"
      ],
      "Resource": "arn:aws:sns:*:*:pslone-*"
    },
    {
      "Sid": "SESEmailManagement",
      "Effect": "Allow",
      "Action": [
        "ses:VerifyEmailIdentity",
        "ses:VerifyDomainIdentity",
        "ses:VerifyDomainDkim",
        "ses:DeleteIdentity",
        "ses:GetIdentityVerificationAttributes",
        "ses:GetIdentityDkimAttributes",
        "ses:ListIdentities",
        "ses:GetSendQuota",
        "ses:GetSendStatistics",
        "ses:SetIdentityFeedbackForwardingEnabled",
        "ses:SetIdentityNotificationTopic",
        "ses:GetIdentityNotificationAttributes",
        "ses:SendEmail",
        "ses:SendRawEmail",
        "ses:CreateConfigurationSet",
        "ses:DeleteConfigurationSet",
        "ses:DescribeConfigurationSet",
        "ses:ListConfigurationSets"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudTrailReadOnly",
      "Effect": "Allow",
      "Action": [
        "cloudtrail:DescribeTrails",
        "cloudtrail:GetTrailStatus",
        "cloudtrail:LookupEvents",
        "cloudtrail:ListTrails",
        "cloudtrail:GetTrail",
        "cloudtrail:ListTags"
      ],
      "Resource": "*"
    },
    {
      "Sid": "STSReadOnly",
      "Effect": "Allow",
      "Action": [
        "sts:GetCallerIdentity",
        "sts:GetSessionToken"
      ],
      "Resource": "*"
    },
    {
      "Sid": "DenyEC2NonFreeTierInstances",
      "Effect": "Deny",
      "Action": "ec2:RunInstances",
      "Resource": "arn:aws:ec2:*:*:instance/*",
      "Condition": {
        "StringNotEquals": {
          "ec2:InstanceType": "t2.micro"
        }
      }
    },
    {
      "Sid": "DenyRDSNonFreeTierClass",
      "Effect": "Deny",
      "Action": [
        "rds:CreateDBInstance",
        "rds:ModifyDBInstance",
        "rds:CreateDBInstanceReadReplica"
      ],
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "rds:DatabaseClass": "db.t3.micro"
        }
      }
    },
    {
      "Sid": "DenyRDSClusterAurora",
      "Effect": "Deny",
      "Action": [
        "rds:CreateDBCluster",
        "rds:RestoreDBClusterFromS3",
        "rds:RestoreDBClusterFromSnapshot",
        "rds:RestoreDBClusterToPointInTime",
        "rds:CreateGlobalCluster"
      ],
      "Resource": "*"
    },
    {
      "Sid": "DenyRDSPublicAccess",
      "Effect": "Deny",
      "Action": [
        "rds:CreateDBInstance",
        "rds:ModifyDBInstance"
      ],
      "Resource": "*",
      "Condition": {
        "Bool": {
          "rds:MultiAz": "true"
        }
      }
    },
    {
      "Sid": "DenyS3PublicAccess",
      "Effect": "Deny",
      "Action": [
        "s3:PutBucketAcl",
        "s3:PutObjectAcl",
        "s3:DeletePublicAccessBlock"
      ],
      "Resource": "*"
    },
    {
      "Sid": "DenyIAMPrivilegeEscalation",
      "Effect": "Deny",
      "Action": [
        "iam:CreateUser",
        "iam:DeleteUser",
        "iam:CreateGroup",
        "iam:DeleteGroup",
        "iam:CreatePolicy",
        "iam:DeletePolicy",
        "iam:CreatePolicyVersion",
        "iam:SetDefaultPolicyVersion",
        "iam:DeletePolicyVersion",
        "iam:AttachUserPolicy",
        "iam:DetachUserPolicy",
        "iam:PutUserPolicy",
        "iam:DeleteUserPolicy",
        "iam:AttachGroupPolicy",
        "iam:DetachGroupPolicy",
        "iam:PutGroupPolicy",
        "iam:DeleteGroupPolicy",
        "iam:CreateLoginProfile",
        "iam:UpdateLoginProfile",
        "iam:DeleteLoginProfile",
        "iam:CreateAccessKey",
        "iam:DeleteAccessKey",
        "iam:UpdateAccessKey",
        "iam:CreateVirtualMFADevice",
        "iam:EnableMFADevice",
        "iam:DeactivateMFADevice",
        "iam:UpdateAssumeRolePolicy"
      ],
      "Resource": "*"
    },
    {
      "Sid": "DenyRoute53",
      "Effect": "Deny",
      "Action": "route53:*",
      "Resource": "*"
    },
    {
      "Sid": "DenyOrganizations",
      "Effect": "Deny",
      "Action": "organizations:*",
      "Resource": "*"
    },
    {
      "Sid": "DenyMSKKafka",
      "Effect": "Deny",
      "Action": "kafka:*",
      "Resource": "*"
    },
    {
      "Sid": "DenyElastiCache",
      "Effect": "Deny",
      "Action": "elasticache:*",
      "Resource": "*"
    },
    {
      "Sid": "DenyECSFargate",
      "Effect": "Deny",
      "Action": [
        "ecs:CreateCluster",
        "ecs:CreateService",
        "ecs:RegisterTaskDefinition",
        "ecs:RunTask",
        "ecs:StartTask"
      ],
      "Resource": "*"
    },
    {
      "Sid": "DenyExpensiveAndGPUInstances",
      "Effect": "Deny",
      "Action": "ec2:RunInstances",
      "Resource": "arn:aws:ec2:*:*:instance/*",
      "Condition": {
        "StringLike": {
          "ec2:InstanceType": [
            "p*", "g*", "x*", "u*", "f*",
            "vt*", "trn*", "inf*", "mac*",
            "m*", "r*", "c*", "z*",
            "d*", "h*", "i3*", "i4*"
          ]
        }
      }
    }
  ]
}
```

---

## Appendix B — GitHub Actions OIDC Role

This IAM role is assumed by GitHub Actions for the deploy workflow. It has narrower permissions than the developer policy — ECR push only plus the ECR auth token action.

**Role name:** `pslone-github-actions-deploy`  
**Trust policy:** GitHub OIDC (no access keys in GitHub Secrets)

**Trust policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::844513166932:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/psl-one:*"
        }
      }
    }
  ]
}
```

**Permission policy (inline):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRPushOnly",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:PutImage",
        "ecr:DescribeRepositories",
        "ecr:ListImages"
      ],
      "Resource": "*"
    }
  ]
}
```

**GitHub Actions workflow snippet:**
```yaml
permissions:
  id-token: write
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
      aws-region: af-south-1
      role-session-name: pslone-deploy-${{ github.run_id }}
```

---

## Appendix C — EC2 Instance Profile Role Policy

The EC2 instance (`psl-api`) assumes this role via the instance profile. It is scoped to only what the NestJS application needs at runtime. The Terraform code in `infra/terraform/bootstrap/main.tf` creates this role.

**Role name:** `pslone-ec2-api-role`  
**Trust policy:** `ec2.amazonaws.com` only

**Inline policy (`pslone-ec2-api-policy`):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "SecretsManagerReadDev",
      "Effect": "Allow",
      "Action": "secretsmanager:GetSecretValue",
      "Resource": "arn:aws:secretsmanager:af-south-1:844513166932:secret:pslone/dev/*"
    },
    {
      "Sid": "ECRPullImages",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3MediaBucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::psl-one-media-dev",
        "arn:aws:s3:::psl-one-media-dev/*"
      ]
    },
    {
      "Sid": "SESTransactionalEmail",
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*",
      "Condition": {
        "StringLike": {
          "ses:FromAddress": "*@pslone.co.za"
        }
      }
    },
    {
      "Sid": "CloudWatchLogsWrite",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:af-south-1:844513166932:log-group:/pslone/*"
    },
    {
      "Sid": "SSMParameterReadOnly",
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath"
      ],
      "Resource": "arn:aws:ssm:af-south-1:844513166932:parameter/pslone/dev/*"
    }
  ]
}
```

**AWS managed policies to attach:**
- `arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore` — for SSH via Session Manager (no port 22 needed)
- `arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy` — for CloudWatch Agent metrics

---

## Appendix D — Policy Application Instructions

```bash
# 1. Create the customer managed policy
aws iam create-policy \
  --policy-name PSLOneSprintZeroInfrastructure \
  --policy-document file://infra/iam/pslone-sprint0-policy.json \
  --description "Least-privilege policy for Sprint 0 infrastructure provisioning"

# 2. Attach to the IAM user (replace IAM_USER_NAME)
aws iam attach-user-policy \
  --user-name IAM_USER_NAME \
  --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroInfrastructure

# 3. Verify attachment
aws iam list-attached-user-policies --user-name IAM_USER_NAME

# 4. Test the policy (run as the IAM user)
aws sts get-caller-identity
aws ec2 describe-instances --region af-south-1
aws rds describe-db-instances --region af-south-1

# 5. Verify deny works — this should be denied:
aws ec2 run-instances \
  --image-id ami-xxxxxxxx \
  --instance-type t3.small \
  --region af-south-1
# Expected: An error occurred (UnauthorizedOperation)
```

---

## Appendix E — Policy Amendment Process

When Sprint 1 requires additional resources (ElastiCache, ECS, MSK), the amendment process is:

1. Open a PR modifying `infra/iam/pslone-sprint0-policy.json`
2. The PR description states: what resource, why needed, estimated monthly cost
3. Programme Director reviews and approves the PR
4. Human applies the amended policy manually:
   ```bash
   aws iam create-policy-version \
     --policy-arn arn:aws:iam::844513166932:policy/PSLOneSprintZeroInfrastructure \
     --policy-document file://infra/iam/pslone-sprint0-policy.json \
     --set-as-default
   ```
5. Old policy version is deleted (max 5 versions per policy)

---

*Policy version: 1.0.0 — Sprint 0 baseline*  
*Next review: Sprint 1 planning (2026-06-29)*
