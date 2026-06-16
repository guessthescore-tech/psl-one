# S3-INFRA-02C — Beta Pre-Deploy Prerequisites Review

Status: PREDEPLOY_PREREQUISITES — NO COMPUTE DEPLOYED
Date: 2026-06-16
Story: S3-INFRA-02C
Baseline commit: 119d6bbe5eebc9a60fce86c80ba56f749d55fe64
AWS Account: 844513166932 (Guess__The_Score)
AWS Region: af-south-1
Caller identity: arn:aws:iam::844513166932:user/psl-one-admin (not root)

---

## ECR Repositories

Three private repositories created. No images pushed.

| Repository | ARN | URI |
|---|---|---|
| psl-one-beta-api | arn:aws:ecr:af-south-1:844513166932:repository/psl-one-beta-api | 844513166932.dkr.ecr.af-south-1.amazonaws.com/psl-one-beta-api |
| psl-one-beta-api-migrator | arn:aws:ecr:af-south-1:844513166932:repository/psl-one-beta-api-migrator | 844513166932.dkr.ecr.af-south-1.amazonaws.com/psl-one-beta-api-migrator |
| psl-one-beta-web | arn:aws:ecr:af-south-1:844513166932:repository/psl-one-beta-web | 844513166932.dkr.ecr.af-south-1.amazonaws.com/psl-one-beta-web |

### ECR Configuration

| Setting | Value |
|---|---|
| Visibility | PRIVATE |
| Image tag mutability | IMMUTABLE |
| Scan on push | ENABLED |
| Encryption | AES256 (AWS-managed) |

### ECR Lifecycle Policy (all three repos)

- Rule 1 (priority 1): Expire untagged images after 7 days
- Rule 2 (priority 2): Retain newest 10 images; expire older
- Tag `latest` is not in use; all images are tagged with the full 40-character SHA

### ECR Workflow Compatibility Findings

**Finding ECR-01 (Medium): Cache tag mutability conflict — RESOLVED**

Remediation applied in `deploy-beta-ec2.yml`: replaced all three `cache-from: type=registry`
and `cache-to: type=registry,ref=<repo>:cache` lines with GitHub Actions cache using three
separate named scopes:

| Build | cache-from | cache-to |
|---|---|---|
| API image | `type=gha,scope=beta-api` | `type=gha,mode=max,scope=beta-api` |
| Migrator image | `type=gha,scope=beta-api-migrator` | `type=gha,mode=max,scope=beta-api-migrator` |
| Web image | `type=gha,scope=beta-web` | `type=gha,mode=max,scope=beta-web` |

Each build has a unique scope — no shared default GHA cache bucket that would mix layer hits
across different images. GitHub Actions cache is free, mutable, and requires no separate
repository. ECR release repositories remain IMMUTABLE.
`RELEASE_REPOSITORIES_REMAIN_IMMUTABLE=true`

**Finding ECR-02 (High): Docker Build Cloud endpoint not provisioned — RESOLVED**

Remediation applied in `deploy-beta-ec2.yml`: removed `driver: cloud` and
`endpoint: ${{ secrets.DOCKER_BUILD_CLOUD_ENDPOINT }}` from the buildx setup step.
GitHub-hosted Buildx (`docker/setup-buildx-action@v3` with no driver override) is now
the default. No paid Docker plan is required. No seven-day trial is assumed.
`DOCKER_BUILD_CLOUD_ENDPOINT` is no longer a required or optional secret in the workflow.
All three images build with explicit `platforms: linux/amd64`.
Image build status: NOT_RUN. Deployment status: NOT_DEPLOYED.

---

## SSM Parameter Store

Path prefix: `/psl-one/beta/`
Region: af-south-1
KMS key for SecureStrings: alias/aws/ssm (AWS-managed CMK)

### Parameters Created (9 of 12)

| Path | Type | Status |
|---|---|---|
| /psl-one/beta/postgres-user | String | CREATED |
| /psl-one/beta/postgres-db | String | CREATED |
| /psl-one/beta/postgres-password | SecureString | CREATED |
| /psl-one/beta/jwt-secret | SecureString | CREATED |
| /psl-one/beta/caddy-acme-email | String | CREATED |
| /psl-one/beta/git-sha | String | CREATED (119d6bbe5eebc9a60fce86c80ba56f749d55fe64) |
| /psl-one/beta/api-domain | String | CREATED (api.staging.pslone.co.za) |
| /psl-one/beta/web-domain | String | CREATED (staging.pslone.co.za) |
| /psl-one/beta/cors-origins | String | CREATED (http://staging.pslone.co.za) |

### Parameters Deferred (3 of 12)

| Path | Type | Status | Reason |
|---|---|---|---|
| /psl-one/beta/api-image-uri | String | DEFERRED | Bootstrap guard: `if [ -n "${API_IMAGE_URI}" ] && [ "${API_IMAGE_URI}" != "PLACEHOLDER" ]` treats any non-empty, non-PLACEHOLDER value as a deployable image and attempts `docker pull`. Absent parameter falls through to empty string via `|| echo ""`, which is safe. Create only after first ECR image is pushed. |
| /psl-one/beta/migration-image-uri | String | DEFERRED | Same bootstrap guard as above. |
| /psl-one/beta/web-image-uri | String | DEFERRED | Same bootstrap guard as above. |

### SSM Value Safety Confirmation

- Passwords and JWT secret generated locally using `openssl rand` (CSPRNG)
- Values passed directly to `aws ssm put-parameter --value` without intermediate file
- Shell tracing (`set -x`) was not active during generation
- Variables unset immediately with `unset` after AWS CLI call
- Values not printed to terminal, not stored in any file, not included in this document
- No plaintext secret stored in Git, shell history, or log

---

## GitHub OIDC Provider

| Field | Value |
|---|---|
| Provider ARN | arn:aws:iam::844513166932:oidc-provider/token.actions.githubusercontent.com |
| Audience | sts.amazonaws.com |
| Thumbprints | 22ff89586561fc2d52f77491e9f1eff1b80be33e, 6938fd4d98bab03faadb97b34396831e3780aea1 |
| Status | CREATED |

Note: As of June 2023, AWS no longer validates OIDC thumbprints for providers backed by
publicly trusted CAs (DigiCert, Baltimore). The thumbprint requirement is retained for
compatibility; two are registered as defensive redundancy.

---

## GitHub Beta Deployment IAM Role

| Field | Value |
|---|---|
| Role name | psl-one-beta-github-deploy |
| Role ARN | arn:aws:iam::844513166932:role/psl-one-beta-github-deploy |
| Max session duration | 3600 seconds (1 hour) |
| Managed policies | NONE |
| Inline policies | psl-one-beta-deploy |
| Status | CREATED |

### Trust Policy Summary

```
Principal: Federated — arn:aws:iam::844513166932:oidc-provider/token.actions.githubusercontent.com
Action: sts:AssumeRoleWithWebIdentity
Conditions (both required, StringEquals):
  token.actions.githubusercontent.com:aud = sts.amazonaws.com
  token.actions.githubusercontent.com:sub = repo:guessthescore-tech/psl-one:environment:beta
```

The trust is restricted to **exactly** the `beta` GitHub environment of exactly one repository.
Pull requests, other branches, other environments, and wildcard subjects are denied.

### Permissions Summary (inline policy: psl-one-beta-deploy)

| Sid | Action | Resource scope |
|---|---|---|
| ECRAuthToken | ecr:GetAuthorizationToken | * (AWS requirement — cannot be resource-scoped) |
| ECRPushBetaRepos | ecr:Batch*, ecr:Complete*, ecr:GetDownload*, ecr:Initiate*, ecr:PutImage, ecr:Upload* | 3 beta repos only |
| EC2ReadOnly | ec2:DescribeInstances, ec2:DescribeTags | * (Describe actions have no resource-level restriction) |
| SSMSendCommandDocument | ssm:SendCommand | arn:aws:ssm:af-south-1::document/AWS-RunShellScript only |
| SSMSendCommandInstance | ssm:SendCommand | EC2 instances tagged Name=psl-one-beta only |
| SSMCommandStatus | ssm:GetCommandInvocation, ssm:ListCommandInvocations | * (no resource-level restriction) |
| SSMParameterDeployWrite | ssm:PutParameter | 4 paths: api-image-uri, migration-image-uri, web-image-uri, git-sha |
| SSMParameterRollbackRead | ssm:GetParameter | 1 path: git-sha |

### Permissions Explicitly Absent

| Permission | Confirmed absent |
|---|---|
| AdministratorAccess | YES — no managed policy, no `*:*` action |
| PowerUserAccess | YES |
| IAM mutation (CreateRole, AttachPolicy, PutRolePolicy, etc.) | YES |
| EC2 creation (RunInstances, CreateInstance) | YES |
| EC2 termination | YES |
| Terraform provisioning (any resource:create beyond ECR push) | YES |
| Billing controls modification | YES |
| KMS key administration | YES |
| SSM SecureString read (postgres-password, jwt-secret) | YES |
| Production scope | YES — only beta repos and beta-tagged instance |

### SSM SendCommand Instance Scope Note

The `SSMSendCommandInstance` permission is scoped to instances with tag `Name=psl-one-beta`.
The Terraform `aws_instance.beta` resource applies `tags = { Name = "psl-one-beta" }` via
`local.name = "${var.project}-${var.environment}"`. This tag will be present after
`terraform apply`.

**Enhancement recommendation:** Add `Project = psl-one`, `Environment = beta`, and
`ManagedBy = terraform` tags to `aws_instance.beta` in `infra/terraform/environments/beta-ec2/main.tf`
before the first `terraform apply`. This enables more expressive tag conditions across all IAM policies.
No impact on SSM scope for this story since the `Name` tag is sufficient.

---

## GitHub Environment Configuration

### Status

`GITHUB_ENVIRONMENT_CONFIGURATION=OWNER_CONSOLE_ACTION_REQUIRED`

The `gh` CLI is not installed on this machine. All GitHub environment configuration requires
the owner to complete these steps via the GitHub web console or GitHub API.

### Required Owner Actions (GitHub Console)

1. Navigate to: https://github.com/guessthescore-tech/psl-one/settings/environments
2. Create environment named: `beta`
3. Add the following **Secret** (the only value that is sensitive):

| Secret name | Value source | Status |
|---|---|---|
| AWS_BETA_DEPLOY_ROLE_ARN | arn:aws:iam::844513166932:role/psl-one-beta-github-deploy | READY TO SET |

4. Add the following **Variables** (non-sensitive; the workflow reads these as `vars.*`):

| Variable name | Value | Status | How used |
|---|---|---|---|
| BETA_API_DOMAIN | api.staging.pslone.co.za | READY TO SET | Readiness check Host header; smoke test URL |
| BETA_WEB_DOMAIN | staging.pslone.co.za | READY TO SET | Smoke test URL |
| BETA_API_BASE_URL | http://api.staging.pslone.co.za | READY TO SET | Next.js NEXT_PUBLIC_API_BASE_URL build arg |
| BETA_WEB_BASE_URL | http://staging.pslone.co.za | READY TO SET | Smoke test base URL |
| BETA_EC2_INSTANCE_ID | From `terraform output instance_id` | DEFERRED — needs Terraform apply | SSM SendCommand target; release manifest |
| BETA_EC2_IP | From `terraform output public_ip` | DEFERRED — needs Terraform apply | Readiness check; smoke test |

Notes:
- `AWS_REGION` is hardcoded in the workflow (`env: AWS_REGION: af-south-1` at line 30). Setting
  it as a GitHub variable is optional/informational only — the workflow does not read `vars.AWS_REGION`.
- `DOCKER_BUILD_CLOUD_ENDPOINT` is no longer required or referenced in the workflow (Finding ECR-02 resolved).
- `BETA_EC2_INSTANCE_ID` and `BETA_EC2_IP` may be configured as secrets if preferred; their
  classification as vars is acceptable since instance IDs and IPs are not cryptographic material.
- Do not store AWS access keys, PostgreSQL password, JWT secret, or SSM SecureString values.

5. Consider enabling required reviewers for the `beta` environment as a deployment gate.

---

## Billing Controls Verification

| Control | Threshold | Status |
|---|---|---|
| psl-one-beta-001-usd | > USD 1.00/month actual | HEALTHY |
| psl-one-beta-005-usd | > USD 5.00/month actual | HEALTHY |
| psl-one-beta-010-usd | > USD 10.00/month actual | HEALTHY |
| psl-one-beta-daily-anomaly-alerts | >= USD 1 absolute, daily | CONFIRMED |
| Default-Services-Subscription | USD 100 AND 40%, daily | CONFIRMED (unchanged) |

Cash-spend target: R0. AWS credits may be consumed. Guaranteed zero cost: No.

---

## Zero Compute Confirmation

| Resource type | Count |
|---|---|
| EC2 instances (af-south-1) | 0 |
| RDS instances (af-south-1) | 0 |
| ECS clusters (af-south-1) | 0 |
| EBS volumes | 0 (no EC2) |
| Elastic IPs | 0 |

No compute resources were created by this story. The supporting prerequisites (ECR repos,
SSM parameters, IAM role, OIDC provider) are not compute resources.

---

## Validation Results

| Check | Result |
|---|---|
| docs:validate (18/18) | PASS |
| codex:validate (0 errors) | PASS |
| git diff --check | PASS (no whitespace errors) |
| Secret scan (AWS_ACCESS_KEY_ID, etc.) | CLEAN — matches in docs are references, not credentials |
| Sensitive artefact scan (.env, .tfstate, .tfplan) | CLEAN |
| Temporary secret file cleanup | CLEAN — no /tmp/psl-one-beta-secret* files |
| Tracked file modifications | NONE — application source unchanged |
| Git history inspection | CLEAN — no secrets in commits |

---

## Blockers Before Terraform Apply

1. Owner reconfirms `169.0.126.211/32` CIDR is still their current egress IP
   (`curl https://checkip.amazonaws.com` immediately before apply)
2. Owner confirms USD 120.00 credit balance remains in AWS Billing console
3. Owner confirms credit expiry 2027-06-08 not reached
4. Owner accepts that EBS (~$1.60/month) and public IPv4 charges begin on apply
5. Owner explicitly authorises `terraform apply` in writing
6. `backend.tf` created from `backend.tf.example` (or local state accepted)
7. Fresh plan generated (`terraform plan -refresh=true`) immediately before apply —
   the `/tmp/psl-one-beta.tfplan` plan from S3-INFRA-02B MUST NOT be reused
8. `EXPLICIT_SUBNET_INPUT_REQUIRED_BEFORE_APPLY=true` — confirm subnet_id is set
   in terraform.tfvars (preferred: `subnet-0972d64b0be296aa3`)

---

## Blockers Before Image Build / Push

1. ~~ECR cache strategy (Finding ECR-01)~~ — RESOLVED: GHA cache in use; ECR repos remain IMMUTABLE
2. ~~Docker Build Cloud endpoint (Finding ECR-02)~~ — RESOLVED: standard GitHub-hosted Buildx; no paid dependency
3. GitHub `beta` environment created with secrets and variables (owner console action — see GitHub Environment Configuration section above)
4. EC2 instance must exist (Terraform apply complete) before deploy workflow can use SSM SendCommand;
   `BETA_EC2_INSTANCE_ID` and `BETA_EC2_IP` variables can then be set

---

## Blockers Before Beta Deployment (End-to-End)

All Terraform apply blockers (above) +
All image build blockers (above) +
1. `BETA_EC2_INSTANCE_ID` variable set after Terraform apply
2. `BETA_EC2_IP` variable set after Terraform apply (or discovered via describe-instances)
3. Three image URI SSM parameters created after first ECR push:
   - /psl-one/beta/api-image-uri
   - /psl-one/beta/migration-image-uri
   - /psl-one/beta/web-image-uri
4. Database bootstrap: `scripts/beta/bootstrap-data.sh` run after first deploy
5. DNS and /etc/hosts configured for Mode A (reviewer IP testing) or Mode B (public DNS)

---

## Resources Created by This Story

| Resource | ARN / URI | Purpose |
|---|---|---|
| ECR repo | arn:aws:ecr:af-south-1:844513166932:repository/psl-one-beta-api | API image storage |
| ECR repo | arn:aws:ecr:af-south-1:844513166932:repository/psl-one-beta-api-migrator | Migrator image storage |
| ECR repo | arn:aws:ecr:af-south-1:844513166932:repository/psl-one-beta-web | Web image storage |
| OIDC provider | arn:aws:iam::844513166932:oidc-provider/token.actions.githubusercontent.com | GitHub Actions federation |
| IAM role | arn:aws:iam::844513166932:role/psl-one-beta-github-deploy | GitHub Actions deploy permissions |
| SSM params | /psl-one/beta/* (9 of 12) | Runtime configuration |

## Resources NOT Created by This Story

- EC2 instances
- EBS volumes
- Elastic IPs
- Security groups
- IAM instance profile (created by Terraform at apply time)
- S3 release bucket
- CloudFront distribution
- Route 53 records
- ACM certificates

---

## Independent Review Readiness

S3-INFRA-02C (including workflow remediation) is ready for independent review.

All prerequisites are deterministic and inspectable:
- `aws ecr describe-repositories --repository-names psl-one-beta-api psl-one-beta-api-migrator psl-one-beta-web --region af-south-1`
- `aws ssm get-parameters-by-path --path /psl-one/beta --recursive --no-with-decryption --region af-south-1`
- `aws iam list-open-id-connect-providers`
- `aws iam get-role --role-name psl-one-beta-github-deploy`
- `aws iam get-role-policy --role-name psl-one-beta-github-deploy --policy-name psl-one-beta-deploy`

Workflow changes inspectable via:
- `git diff 27d4e8c HEAD -- .github/workflows/deploy-beta-ec2.yml`

Both workflow compatibility findings (ECR-01, ECR-02) are RESOLVED — standard GitHub-hosted Buildx
with scoped GHA cache is in use; no owner decisions required before image build.
