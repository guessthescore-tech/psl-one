#!/bin/bash
# PSL One Beta — PostgreSQL backup.
# Uses 'docker compose exec' so no guessed container names are required.
# Run on EC2 via SSM Session Manager or scheduled cron.
# Backups are written to /opt/psl-one/backups/ (same EBS volume as the database).
# LIMITATION: backup and database share the same EBS volume. For off-instance
# durability, copy completed backups to S3 using the procedure in BETA-EC2-BACKUP-RESTORE.md.
set -euo pipefail
# Preserve pipeline failures (e.g. pg_dump pipe to gzip)
set -o pipefail

APP_DIR="/opt/psl-one"
ENV_FILE="${APP_DIR}/.env.beta"
BACKUP_DIR="${APP_DIR}/backups"
COMPOSE_CMD="docker compose -f ${APP_DIR}/compose.beta.yaml --env-file ${ENV_FILE}"

if [ ! -f "${ENV_FILE}" ]; then
  echo "ERROR: ${ENV_FILE} not found. Run bootstrap-ec2.sh first."
  exit 1
fi

# Read credentials without logging them
source <(grep -E '^(POSTGRES_USER|POSTGRES_DB)=' "${ENV_FILE}")
POSTGRES_USER="${POSTGRES_USER:-psl_admin}"
POSTGRES_DB="${POSTGRES_DB:-psl_beta}"

# Check available disk space (require at least 500 MB free)
AVAIL_KB=$(df -k "${APP_DIR}" | awk 'NR==2{print $4}')
AVAIL_MB=$(( AVAIL_KB / 1024 ))
if [ "${AVAIL_MB}" -lt 500 ]; then
  echo "ERROR: Insufficient disk space. Available: ${AVAIL_MB} MB, required: 500 MB."
  echo "Run: docker image prune -f   to free space."
  exit 1
fi
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Disk available: ${AVAIL_MB} MB"

# Create backup directory with restricted permissions
mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"

TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)
BACKUP_FILE="${BACKUP_DIR}/psl-one-beta-${TIMESTAMP}.sql.gz"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Starting backup of ${POSTGRES_DB} to ${BACKUP_FILE}"

# pg_dump via Compose service exec — no hardcoded container names
${COMPOSE_CMD} exec -T postgres \
  pg_dump \
  --username "${POSTGRES_USER}" \
  --no-password \
  --format=plain \
  "${POSTGRES_DB}" \
  | gzip > "${BACKUP_FILE}"

chmod 600 "${BACKUP_FILE}"

SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Backup complete: ${BACKUP_FILE} (${SIZE})"

# Retain only the last 7 backups
cd "${BACKUP_DIR}"
TOTAL=$(ls -t psl-one-beta-*.sql.gz 2>/dev/null | wc -l)
if [ "${TOTAL}" -gt 7 ]; then
  ls -t psl-one-beta-*.sql.gz | tail -n +8 | xargs rm -f --
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Pruned old backups; retaining last 7"
fi
REMAINING=$(ls psl-one-beta-*.sql.gz 2>/dev/null | wc -l)
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Backup directory: ${REMAINING} backup(s)"
