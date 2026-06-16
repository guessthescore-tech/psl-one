#!/bin/bash
# PSL One Beta — Run Prisma migrations then optionally seed.
#
# Migration runs first via 'docker compose run --rm migrate' (the migrate service),
# not via the api container. This avoids waiting for api health and matches the
# compose.beta.yaml startup contract.
#
# Seeding is manual — this script does NOT seed automatically to avoid
# inadvertently activating a PSL season, triggering provider calls, or
# creating real-money state. Run seed manually when the data is known to be safe.
#
# Call this script:
#   - Once after first deploy (both migration and seed).
#   - After a database restore that needs a schema re-apply (migration only).
#   - Seed twice if idempotency across upserts needs verification.
#
# PSL season remains INACTIVE. No provider activation. No real-money state.
set -euo pipefail

APP_DIR="/opt/psl-one"
ENV_FILE="${APP_DIR}/.env.beta"
COMPOSE_CMD="docker compose -f ${APP_DIR}/compose.beta.yaml --env-file ${ENV_FILE}"

if [ ! -f "${ENV_FILE}" ]; then
  echo "ERROR: ${ENV_FILE} not found. Run bootstrap-ec2.sh first."
  exit 1
fi

# ── Step 1: Run Prisma migrate deploy via the migrate service ─────────────────
# Migration runs from the migrator image — same SHA as the api and web images.
# Failure is intentional: if migration fails, deployment must not continue.
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Running Prisma migrate deploy via migrate service"
${COMPOSE_CMD} run --rm migrate

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Migration complete"

# ── Step 2: Verify api is healthy before offering seed guidance ───────────────
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Waiting for api service to become healthy (up to 90s)"
API_HEALTHY=false
for i in $(seq 1 18); do
  sleep 5
  STATUS=$(${COMPOSE_CMD} ps --format json api 2>/dev/null \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('Health','unknown'))" 2>/dev/null \
    || echo "unknown")
  echo "  attempt ${i}/18 — api health: ${STATUS}"
  if [ "${STATUS}" = "healthy" ]; then
    API_HEALTHY=true
    break
  fi
done

if [ "${API_HEALTHY}" = "false" ]; then
  echo ""
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] WARNING: api did not become healthy within 90s."
  echo "  This does not mean migration failed (migration ran before api started)."
  echo "  Check logs: docker compose -f compose.beta.yaml logs api"
fi

echo ""
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Migration complete. Seeding is MANUAL."
echo ""
echo "  To seed (first deploy only — keeps PSL season inactive):"
echo "    ${COMPOSE_CMD} exec api npx prisma db seed --schema=apps/api/prisma/schema.prisma"
echo ""
echo "  To verify idempotency, run seed a second time:"
echo "    ${COMPOSE_CMD} exec api npx prisma db seed --schema=apps/api/prisma/schema.prisma"
echo ""
echo "  Do NOT activate the PSL season. Do NOT trigger provider calls."
echo "  Do NOT create real-money wallet state."
