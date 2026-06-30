# Beta EC2 Deployment Runbook

Environment: `beta`
Infrastructure: EC2 t3.micro + Docker Compose (`psl-one-beta`) + Caddy
Access: AWS SSM Session Manager only (no SSH)
Cost note: Cash-spend target R0. AWS credits may be consumed. Not guaranteed zero cost.

---

## Prerequisites

Operator must have:
- AWS CLI configured with credentials that have `ssm:StartSession` and `ssm:SendCommand`
- `BETA_EC2_INSTANCE_ID` (from Terraform output `instance_id`)
- ECR registry URL (from Terraform output `ami_used` or `instance_id`)
- GitHub Actions access to trigger `deploy-beta-ec2.yml`
- OIDC role ARN stored as GitHub secret `AWS_BETA_DEPLOY_ROLE_ARN`

---

## 1. First-Time Deployment

### Step 1 — Apply Terraform

```bash
cd infra/terraform/environments/beta-ec2
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars:
#   allowed_beta_cidrs = ["YOUR_REVIEWER_IP/32"]   (Mode A, restricted)
#   instance_type = "t3.micro"                     (t2.micro not offered in af-south-1)
#   create_elastic_ip = false
terraform init
terraform plan -out=beta-ec2.tfplan
# Review plan — verify no unexpected resources
terraform apply beta-ec2.tfplan
```

Record outputs:
```bash
terraform output instance_id         # -> i-0abc123...
terraform output instance_public_ip  # -> 13.x.x.x
```

### Step 2 — Store SSM parameters

```bash
# Use kebab-case names consistently
aws ssm put-parameter --name /psl-one/beta/postgres-user     --value "psl_admin"                --type String
aws ssm put-parameter --name /psl-one/beta/postgres-db       --value "psl_beta"                 --type String
aws ssm put-parameter --name /psl-one/beta/postgres-password --value "SECURE_VALUE"             --type SecureString
aws ssm put-parameter --name /psl-one/beta/jwt-secret        --value "SECURE_VALUE"             --type SecureString
aws ssm put-parameter --name /psl-one/beta/api-domain        --value "api.staging.pslone.co.za" --type String
aws ssm put-parameter --name /psl-one/beta/web-domain        --value "staging.pslone.co.za"     --type String
aws ssm put-parameter --name /psl-one/beta/caddy-acme-email  --value ""                         --type String
aws ssm put-parameter --name /psl-one/beta/cors-origins      --value "http://api.staging.pslone.co.za,http://staging.pslone.co.za" --type String
# Image URIs — set to PLACEHOLDER until first deploy workflow run
aws ssm put-parameter --name /psl-one/beta/api-image-uri       --value "PLACEHOLDER" --type String
aws ssm put-parameter --name /psl-one/beta/migration-image-uri --value "PLACEHOLDER" --type String
aws ssm put-parameter --name /psl-one/beta/web-image-uri       --value "PLACEHOLDER" --type String
aws ssm put-parameter --name /psl-one/beta/git-sha             --value "unknown"     --type String
```

### Email verification wiring

The beta `compose.beta.yaml` environment injects these values into the API container:

- `EMAIL_PROVIDER` from `/psl-one/beta/email-provider`
- `SMTP_HOST` from `/psl-one/beta/smtp-host`
- `SMTP_PORT` from `/psl-one/beta/smtp-port`
- `SMTP_SECURE` from `/psl-one/beta/smtp-secure`
- `SMTP_USER` from `/psl-one/beta/smtp-user`
- `SMTP_PASSWORD` from `/psl-one/beta/SMTP_PASSWORD`
- `SMTP_FROM` from `/psl-one/beta/smtp-from`

Current beta settings are wired for the cPanel mailbox at `mail.pslone.co.za` with `EMAIL_PROVIDER=smtp`. The API container verifies SMTP connectivity during deploy; if the mailbox changes, update the SSM values before the next `deploy-beta-ec2.yml` run.

### Step 3 — Wait for bootstrap

EC2 user_data (`infra/beta/bootstrap-ec2.sh`) runs on first boot (~3–5 min).

Monitor via SSM:
```bash
aws ssm start-session --target i-0abc123...
sudo journalctl -u psl-one-beta -f
# or
sudo tail -f /var/log/psl-one-bootstrap.log
```

### Step 4 — Build and push images via GitHub Actions

Trigger `deploy-beta-ec2.yml`:
- `git_sha`: exact 40-char lowercase hex SHA to deploy
- `run_migrations`: `true` (first deploy)
- `confirm`: `DEPLOY`

The workflow validates the SHA against `origin/main`, builds three images
(`psl-one-beta-api`, `psl-one-beta-api-migrator`, `psl-one-beta-web`) with the
full SHA as the tag, and deploys via SSM Run Command.

### Step 5 — Bootstrap data

After deploy workflow succeeds:
```bash
aws ssm start-session --target i-0abc123...
cd /opt/psl-one
sudo bash scripts/beta/bootstrap-data.sh
# Then manually seed (keeps PSL season inactive):
docker compose -f compose.beta.yaml --env-file .env.beta \
  exec api npx prisma db seed --schema=apps/api/prisma/schema.prisma
# Verify idempotency:
docker compose -f compose.beta.yaml --env-file .env.beta \
  exec api npx prisma db seed --schema=apps/api/prisma/schema.prisma
```

### Step 6 — Verify health

```bash
# From EC2 via SSM
docker compose -f /opt/psl-one/compose.beta.yaml --env-file /opt/psl-one/.env.beta ps
curl http://localhost:4000/health/ready
curl http://localhost:3001/api/health

# From local (Mode A — requires /etc/hosts entry)
# Add: <EC2_IP>  api.staging.pslone.co.za  staging.pslone.co.za
curl -H "Host: api.staging.pslone.co.za" http://<EC2_IP>/health/ready
curl -H "Host: staging.pslone.co.za"     http://<EC2_IP>/
```

---

## 2. Subsequent Deployments

### Via GitHub Actions (recommended)

Trigger `deploy-beta-ec2.yml`:
- `git_sha`: the exact 40-char SHA to deploy (must be an ancestor of `origin/main`)
- `run_migrations`: `true` if schema changed, otherwise `false`
- `confirm`: `DEPLOY`

Migration failure stops deployment. API and web do not restart after a failed migration.

Step 4 runs smoke checks automatically; any failure marks the run red.

### Via SSM manually

```bash
aws ssm start-session --target i-0abc123...
cd /opt/psl-one

# Update image URIs (obtain from ECR or prior deploy workflow run)
NEW_SHA="<40_CHAR_SHA>"
REGISTRY="844513166932.dkr.ecr.af-south-1.amazonaws.com"

AWS_REGION=$(grep -m1 '^AWS_REGION=' .env.beta | cut -d= -f2-)
ECR_REGISTRY=$(grep -m1 '^ECR_REGISTRY=' .env.beta | cut -d= -f2-)
bash infra/beta/ecr-login.sh

sed -i "s|^API_IMAGE_URI=.*|API_IMAGE_URI=${REGISTRY}/psl-one-beta-api:${NEW_SHA}|" .env.beta
sed -i "s|^MIGRATION_IMAGE_URI=.*|MIGRATION_IMAGE_URI=${REGISTRY}/psl-one-beta-api-migrator:${NEW_SHA}|" .env.beta
sed -i "s|^WEB_IMAGE_URI=.*|WEB_IMAGE_URI=${REGISTRY}/psl-one-beta-web:${NEW_SHA}|" .env.beta
sed -i "s|^GIT_SHA=.*|GIT_SHA=${NEW_SHA}|" .env.beta

# Refresh the repo checkout to the exact deployed SHA so the mounted Caddyfile
# and other runtime files match the images being deployed.
# Fetch the exact SHA — do not use 'origin main' (main may have moved on).
git fetch origin "${NEW_SHA}" --quiet
git checkout --detach "${NEW_SHA}"
test "$(git rev-parse HEAD)" = "${NEW_SHA}"
test ! -f infra/beta/Caddyfile || ! grep -q 'auto_https off' infra/beta/Caddyfile

docker compose -f compose.beta.yaml --env-file .env.beta pull api migrate web
docker compose -f compose.beta.yaml --env-file .env.beta stop api web caddy
# Migration (failure stops here intentionally — do not add || true):
docker compose -f compose.beta.yaml --env-file .env.beta run --rm migrate
docker compose -f compose.beta.yaml --env-file .env.beta up -d --no-deps api web caddy
```

For production-equivalent deploys, use the workflow — it gates on smoke automatically.

---

## 3. Mode A vs Mode B

| Mode | DNS | HTTPS | Use case |
|---|---|---|---|
| A — IP testing | `/etc/hosts` on reviewer's machine | No | Internal review |
| B — Public HTTPS | Real A record → EC2 IP (external DNS) | Yes (Caddy ACME) | External testers, stakeholder demos |

**Mode A setup (reviewer machine):**
```
# Add to /etc/hosts:
<EC2_IP>  api.staging.pslone.co.za  staging.pslone.co.za
```
Access: `http://staging.pslone.co.za` (port 80, restricted to approved CIDRs)

**Mode B setup (explicit owner approval required):**
1. Owner approves Mode B in writing
2. Update Terraform: `allowed_beta_cidrs = ["0.0.0.0/0"]` and `create_elastic_ip = true`
3. Apply Terraform
4. Create DNS A records: both hostnames → Elastic IP (via external DNS — Route 53 blocked)
5. Set `CADDY_ACME_EMAIL` in .env.beta and SSM
6. Rebuild web image with `NEXT_PUBLIC_API_BASE_URL=https://api.staging.pslone.co.za`
7. Caddy provisions TLS on first request

---

## 4. Stopping and Starting the Instance

```bash
# Stop (preserves EBS data; ephemeral IP released; EBS charges continue)
aws ec2 stop-instances --instance-ids i-0abc123...

# Start
aws ec2 start-instances --instance-ids i-0abc123...

# Get new public IP (may change on each start if no Elastic IP)
aws ec2 describe-instances \
  --instance-ids i-0abc123... \
  --query "Reservations[0].Instances[0].PublicIpAddress" \
  --output text
```

After start: update `/etc/hosts` on reviewer machines if using Mode A without Elastic IP.
The `psl-one-beta.service` systemd unit starts Docker Compose automatically on instance boot.

---

## 5. Service Management

```bash
APP=/opt/psl-one
COMPOSE="docker compose -f ${APP}/compose.beta.yaml --env-file ${APP}/.env.beta"

# Status
${COMPOSE} ps

# Logs
${COMPOSE} logs --tail=100 api
${COMPOSE} logs --tail=100 web
${COMPOSE} logs --tail=100 caddy
${COMPOSE} logs --tail=100 postgres

# Restart a single service
${COMPOSE} restart api

# Full stack restart (preserves volumes)
${COMPOSE} down && ${COMPOSE} up -d
```
