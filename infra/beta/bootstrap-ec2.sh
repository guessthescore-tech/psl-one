#!/bin/bash
# PSL One Beta — EC2 bootstrap (user_data).
# Runs once on first launch (Amazon Linux 2023, x86_64).
# Reads runtime secrets from SSM Parameter Store /psl-one/beta/*.
#
# Git credentials: the repository is cloned without a personal access token.
# If the repository is private, a GitHub Deploy Key should be stored in SSM as
# /psl-one/beta/github-deploy-key (SSH private key, SecureString) and loaded
# here before clone. For a public repository, no credential is required.
#
# Deploy SHA: retrieved from SSM /psl-one/beta/git-sha and checked out in
# detached mode. If the parameter is absent or set to "unknown" on first boot
# (before any deploy workflow has run), the script clones main and logs a
# prominent warning — no images will start until a deploy workflow sets the URIs.
set -euo pipefail

LOG=/var/log/psl-one-bootstrap.log
exec > >(tee -a "${LOG}") 2>&1
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] PSL One beta bootstrap starting"

# ── Identity ──────────────────────────────────────────────────────────────────
# Export so that subshells (ecr-login.sh, systemd ExecStartPre) can inherit them.
export AWS_REGION="${AWS_DEFAULT_REGION:-af-south-1}"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
APP_DIR="/opt/psl-one"
COMPOSE_FILE="${APP_DIR}/compose.beta.yaml"
ENV_FILE="${APP_DIR}/.env.beta"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Account: ${ACCOUNT_ID}, Region: ${AWS_REGION}"

# ── System packages ───────────────────────────────────────────────────────────
dnf update -y --quiet
# curl-minimal is pre-installed on AL2023 and conflicts with the full curl package.
# Installing the full curl alongside curl-minimal causes dnf to abort with a conflict
# error, which terminates the script under set -euo pipefail. Drop curl from the
# install list; curl-minimal already provides /usr/bin/curl for all runtime uses here.
dnf install -y git jq unzip

# ── Swap ──────────────────────────────────────────────────────────────────────
# t3.micro has 1 GiB RAM — tight for three Docker services.
# Provision a 2 GiB swap file idempotently before workloads start.
if ! swapon --show=NAME --noheadings | grep -qx '/swapfile'; then
  if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
  fi
  swapon /swapfile
  if ! grep -qE '^/swapfile[[:space:]]' /etc/fstab; then
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
  fi
fi
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Swap: $(swapon --show=SIZE --noheadings /swapfile 2>/dev/null || echo already-active)"

# AL2023 ships a native 'docker' package. The docker.com RHEL CE repo uses RHEL
# version numbers (e.g. rhel/9) but AL2023 reports version strings like
# '2023.12.20260611', which do not match any RHEL repo path — producing a 404.
# Use the AL2023 native docker package and install the Compose v2 plugin from
# the docker/compose GitHub release (verified at runtime on 2026-06-17).
if ! command -v docker &>/dev/null; then
  dnf install -y docker
fi

# Docker Compose v2 plugin — AL2023 native repos do not include this package.
# Installed from docker/compose GitHub releases using curl-minimal (/usr/bin/curl).
COMPOSE_DIR="/usr/local/lib/docker/cli-plugins"
COMPOSE_BIN="${COMPOSE_DIR}/docker-compose"
if [ ! -f "${COMPOSE_BIN}" ]; then
  COMPOSE_VERSION="v2.29.1"
  mkdir -p "${COMPOSE_DIR}"
  curl -fsSL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-x86_64" \
    -o "${COMPOSE_BIN}"
  chmod +x "${COMPOSE_BIN}"
fi

systemctl enable docker
systemctl start docker

# Allow ec2-user and the SSM session user to run docker without sudo
usermod -aG docker ec2-user
usermod -aG docker ssm-user 2>/dev/null || true

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Docker $(docker --version) installed"

# ── SSM helper ────────────────────────────────────────────────────────────────
ssm_get() {
  aws ssm get-parameter \
    --region "${AWS_REGION}" \
    --name "$1" \
    --with-decryption \
    --query "Parameter.Value" \
    --output text
}

# ── Fetch secrets from SSM Parameter Store ────────────────────────────────────
# Passwords and secrets are read into variables only; never echoed or logged.
POSTGRES_USER=$(ssm_get "/psl-one/beta/postgres-user"     2>/dev/null || echo "psl_admin")
POSTGRES_DB=$(ssm_get "/psl-one/beta/postgres-db"         2>/dev/null || echo "psl_beta")
POSTGRES_PASSWORD=$(ssm_get "/psl-one/beta/postgres-password")
JWT_SECRET=$(ssm_get "/psl-one/beta/jwt-secret")
CADDY_ACME_EMAIL=$(ssm_get "/psl-one/beta/caddy-acme-email" 2>/dev/null || echo "")
API_IMAGE_URI=$(ssm_get "/psl-one/beta/api-image-uri"     2>/dev/null || echo "")
WEB_IMAGE_URI=$(ssm_get "/psl-one/beta/web-image-uri"     2>/dev/null || echo "")
MIGRATION_IMAGE_URI=$(ssm_get "/psl-one/beta/migration-image-uri" 2>/dev/null || echo "")
GIT_SHA=$(ssm_get "/psl-one/beta/git-sha"                 2>/dev/null || echo "unknown")
API_DOMAIN=$(ssm_get "/psl-one/beta/api-domain"           2>/dev/null || echo "api.staging.pslone.co.za")
WEB_DOMAIN=$(ssm_get "/psl-one/beta/web-domain"           2>/dev/null || echo "staging.pslone.co.za")
CORS_ORIGINS=$(ssm_get "/psl-one/beta/cors-origins"       2>/dev/null || echo "http://${API_DOMAIN},http://${WEB_DOMAIN}")

ENCODED_POSTGRES_PASSWORD=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=''))" "${POSTGRES_PASSWORD}")
DATABASE_URL="postgresql://${POSTGRES_USER}:${ENCODED_POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Secrets loaded from SSM (passwords not logged)"

# ── Clone or update repository ────────────────────────────────────────────────
# Set SKIP_GIT_CLONE=true when the repository is private and no deploy key is
# available in SSM. The caller must pre-populate ${APP_DIR} with the required
# files (compose.beta.yaml, infra/beta/ecr-login.sh, infra/beta/Caddyfile)
# before invoking this script with SKIP_GIT_CLONE=true.
mkdir -p "${APP_DIR}"

if [ "${SKIP_GIT_CLONE:-false}" = "true" ]; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] SKIP_GIT_CLONE=true — repository files pre-populated externally"
else
  REPO_URL="https://github.com/guessthescore-tech/psl-one.git"

  if [ -d "${APP_DIR}/.git" ]; then
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Repo already present — fetching updates"
    cd "${APP_DIR}"
    git remote set-url origin "${REPO_URL}"
    git fetch origin --quiet
  else
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Cloning repository"
    GIT_TERMINAL_PROMPT=0 git clone "${REPO_URL}" "${APP_DIR}"
    cd "${APP_DIR}"
  fi

  # Checkout the exact approved SHA (detached HEAD).
  # If GIT_SHA is "unknown" (no deploy workflow has run yet), fall back to main
  # with a warning. Images will not start until API_IMAGE_URI is set via deploy.
  if [ "${GIT_SHA}" = "unknown" ] || [ -z "${GIT_SHA}" ]; then
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] WARNING: /psl-one/beta/git-sha not set."
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] WARNING: Checking out origin/main as initial placeholder."
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] WARNING: Run the deploy workflow to pin an exact SHA."
    git checkout --detach origin/main
  else
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Checking out exact SHA: ${GIT_SHA}"
    git checkout --detach "${GIT_SHA}"
    ACTUAL_SHA=$(git rev-parse HEAD)
    if [ "${ACTUAL_SHA}" != "${GIT_SHA}" ]; then
      echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] ERROR: SHA mismatch after checkout. Expected ${GIT_SHA}, got ${ACTUAL_SHA}."
      exit 1
    fi
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Repository at exact SHA: ${ACTUAL_SHA}"
  fi
fi

# ── Write .env.beta ───────────────────────────────────────────────────────────
# Created at runtime from SSM. Never committed to git.
# chmod 600 — readable only by root (the systemd service runs as root).
cat > "${ENV_FILE}" << ENVEOF
# Generated $(date -u +%Y-%m-%dT%H:%M:%SZ) by bootstrap-ec2.sh from SSM. Do not edit manually.
AWS_REGION=${AWS_REGION}
ECR_REGISTRY=${ECR_REGISTRY}
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=${POSTGRES_DB}
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
CORS_ORIGINS=${CORS_ORIGINS}
API_IMAGE_URI=${API_IMAGE_URI}
WEB_IMAGE_URI=${WEB_IMAGE_URI}
MIGRATION_IMAGE_URI=${MIGRATION_IMAGE_URI}
GIT_SHA=${GIT_SHA}
BUILD_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
API_DOMAIN=${API_DOMAIN}
WEB_DOMAIN=${WEB_DOMAIN}
CADDY_ACME_EMAIL=${CADDY_ACME_EMAIL}
ENVEOF

chmod 600 "${ENV_FILE}"
chown root:root "${ENV_FILE}"
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] .env.beta written (chmod 600)"

# ── Copy operational scripts ──────────────────────────────────────────────────
chmod +x "${APP_DIR}/infra/beta/ecr-login.sh"
chmod +x "${APP_DIR}/scripts/beta/"*.sh 2>/dev/null || true

# ── ECR login (initial pull) ──────────────────────────────────────────────────
bash "${APP_DIR}/infra/beta/ecr-login.sh"

# ── Pull images ───────────────────────────────────────────────────────────────
if [ -n "${API_IMAGE_URI}" ] && [ "${API_IMAGE_URI}" != "PLACEHOLDER" ]; then
  docker pull "${API_IMAGE_URI}"
  docker pull "${WEB_IMAGE_URI}"
  docker pull "${MIGRATION_IMAGE_URI}"
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Images pulled"
else
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] WARNING: Image URIs not set. Stack will not start."
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] WARNING: Run the deploy workflow after building images."
fi

# ── Systemd service ───────────────────────────────────────────────────────────
# ExecStartPre uses a dedicated script because systemd does not support piped
# shell commands in service unit directives without a shell wrapper.
cat > /etc/systemd/system/psl-one-beta.service << SVCEOF
[Unit]
Description=PSL One Beta Docker Compose Stack
Requires=docker.service
After=docker.service network-online.target
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${APP_DIR}
EnvironmentFile=${ENV_FILE}
ExecStartPre=/bin/sh -c 'bash ${APP_DIR}/infra/beta/ecr-login.sh'
ExecStart=docker compose -f compose.beta.yaml --env-file ${ENV_FILE} up -d --remove-orphans
ExecStop=docker compose -f compose.beta.yaml --env-file ${ENV_FILE} down
TimeoutStartSec=300
Restart=no

[Install]
WantedBy=multi-user.target
SVCEOF

systemctl daemon-reload
systemctl enable psl-one-beta

if [ -n "${API_IMAGE_URI}" ] && [ "${API_IMAGE_URI}" != "PLACEHOLDER" ]; then
  systemctl start psl-one-beta
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] PSL One beta stack started"
else
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Stack not started — run deploy workflow first"
fi

# ── Optional nightly stop cron ────────────────────────────────────────────────
# Stops the instance at 22:00 SAST (20:00 UTC) to reduce credit consumption.
# Uses IMDSv2 token to retrieve the instance ID from the metadata service.
# Uncomment the block below and run 'systemctl restart crond' to enable.
#
# cat > /etc/cron.d/psl-one-beta-stop << 'CRONEOF'
# SHELL=/bin/bash
# PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
# 0 20 * * * root \
#   TOKEN=$(curl -s -X PUT http://169.254.169.254/latest/api/token \
#     -H "X-aws-ec2-metadata-token-ttl-seconds: 60") && \
#   IID=$(curl -s -H "X-aws-ec2-metadata-token: ${TOKEN}" \
#     http://169.254.169.254/latest/meta-data/instance-id) && \
#   aws ec2 stop-instances --instance-ids "${IID}" --region af-south-1 \
#     >> /var/log/psl-one-beta-stop.log 2>&1
# CRONEOF
# chmod 644 /etc/cron.d/psl-one-beta-stop

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Bootstrap complete"
