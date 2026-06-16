#!/bin/bash
# PSL One Beta — PostgreSQL restore from a named backup file.
# Usage: sudo ./restore-postgres.sh <backup-file>
#   e.g. sudo ./restore-postgres.sh /opt/psl-one/backups/psl-one-beta-20260616T100000Z.sql.gz
#
# WARNING: This drops and recreates the target database.
# The api, web, and caddy services are stopped before restore and restarted only on success.
# If the drop/recreate succeeds but the restore fails, the database is empty.
# Take a backup with backup-postgres.sh before running this script.
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <backup-file.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "ERROR: Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

APP_DIR="/opt/psl-one"
ENV_FILE="${APP_DIR}/.env.beta"
COMPOSE_CMD="docker compose -f ${APP_DIR}/compose.beta.yaml --env-file ${ENV_FILE}"

if [ ! -f "${ENV_FILE}" ]; then
  echo "ERROR: ${ENV_FILE} not found. Run bootstrap-ec2.sh first."
  exit 1
fi

source <(grep -E '^(POSTGRES_USER|POSTGRES_DB)=' "${ENV_FILE}")
POSTGRES_USER="${POSTGRES_USER:-psl_admin}"
POSTGRES_DB="${POSTGRES_DB:-psl_beta}"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] WARNING: This will DROP and recreate the database: ${POSTGRES_DB}"
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Restoring from: ${BACKUP_FILE}"
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Services api, web, and caddy will be stopped."
echo ""
read -r -p "Type YES to confirm: " CONFIRM
if [ "${CONFIRM}" != "YES" ]; then
  echo "Aborted."
  exit 1
fi

# Stop api, web, caddy — leave postgres running
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Stopping api, web, caddy"
${COMPOSE_CMD} stop api web caddy || true

# Drop and recreate the database
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Dropping and recreating database: ${POSTGRES_DB}"
${COMPOSE_CMD} exec -T postgres \
  psql --username "${POSTGRES_USER}" --dbname postgres \
  -c "DROP DATABASE IF EXISTS \"${POSTGRES_DB}\";" \
  -c "CREATE DATABASE \"${POSTGRES_DB}\";"

# Restore
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Restoring data from ${BACKUP_FILE}"
if ! gunzip -c "${BACKUP_FILE}" | ${COMPOSE_CMD} exec -T postgres \
  psql --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" --quiet; then
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] ERROR: Restore failed. Database ${POSTGRES_DB} may be empty."
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Do NOT restart api/web until a known-good restore completes."
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Retry with a different backup or re-bootstrap with bootstrap-data.sh."
  exit 1
fi

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Restore complete. Verifying database health."

# Verify the database responds
${COMPOSE_CMD} exec -T postgres \
  psql --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" \
  -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" \
  --quiet

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Database health check passed. Restarting services."
${COMPOSE_CMD} up -d --no-deps api web caddy

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Done. Monitor with:"
echo "  docker compose -f ${APP_DIR}/compose.beta.yaml logs -f"
