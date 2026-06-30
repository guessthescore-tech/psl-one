# Beta EC2 Rollback Runbook

Use this runbook when a deployment needs to be reverted to a previous image SHA.

---

## When to Roll Back

- API or web container fails health checks after deploy
- Critical regression discovered during beta review
- Migration resulted in data inconsistency (use BETA-EC2-BACKUP-RESTORE.md instead)

---

## 1. Quick Rollback — Previous SHA via GitHub Actions

Trigger `deploy-beta-ec2.yml` with:
- `git_sha`: the last known-good 40-char SHA (must be an ancestor of `origin/main`)
- `run_migrations`: `false` — do not re-run migrations during rollback
- `confirm`: `DEPLOY`

The workflow validates the SHA, rebuilds images from the exact commit, and redeploys.

---

## 2. Rollback via SSM (Manual)

```bash
aws ssm start-session --target <INSTANCE_ID>
cd /opt/psl-one

APP=/opt/psl-one
COMPOSE="docker compose -f ${APP}/compose.beta.yaml --env-file ${APP}/.env.beta"

# Previous known-good SHA (40 chars, lowercase hex)
PREV_SHA="<PREVIOUS_40_CHAR_SHA>"
REGISTRY="844513166932.dkr.ecr.af-south-1.amazonaws.com"

# ECR login
bash infra/beta/ecr-login.sh

# Update image URIs to previous SHA
sed -i "s|^API_IMAGE_URI=.*|API_IMAGE_URI=${REGISTRY}/psl-one-beta-api:${PREV_SHA}|" .env.beta
sed -i "s|^MIGRATION_IMAGE_URI=.*|MIGRATION_IMAGE_URI=${REGISTRY}/psl-one-beta-api-migrator:${PREV_SHA}|" .env.beta
sed -i "s|^WEB_IMAGE_URI=.*|WEB_IMAGE_URI=${REGISTRY}/psl-one-beta-web:${PREV_SHA}|" .env.beta
sed -i "s|^GIT_SHA=.*|GIT_SHA=${PREV_SHA}|" .env.beta

# Pull previous images
${COMPOSE} pull api migrate web

# Stop and restart (no migration on rollback)
${COMPOSE} stop api web caddy
${COMPOSE} up -d --no-deps api web caddy
```

Verify using the smoke suite (from your local machine after services restart):

```bash
# From the repo root on your local machine
SMOKE_ENVIRONMENT=beta \
BETA_API_BASE_URL=https://api.beta.pslone.co.za \
BETA_WEB_BASE_URL=https://beta.pslone.co.za \
EXPECTED_SHA="${PREV_SHA}" \
node scripts/smoke/staging-smoke.mjs
```

All 17 checks must pass before the rollback is considered complete. If the smoke suite still fails after rollback, escalate to the incident runbook.

---

## 3. Rollback After a Failed Migration

If a destructive migration was applied, image rollback alone is insufficient.

1. Take a backup of the current (possibly broken) state: `sudo bash scripts/beta/backup-postgres.sh`
2. Locate the pre-deploy backup (taken before the failed deploy)
3. Restore: `sudo bash scripts/beta/restore-postgres.sh /opt/psl-one/backups/<pre-deploy-backup>.sql.gz`
4. Roll back image to the SHA that matches the restored schema: trigger `deploy-beta-ec2.yml` with `run_migrations: false`

---

## 4. Finding Available Image SHAs in ECR

```bash
aws ecr describe-images \
  --repository-name psl-one-beta-api \
  --query "sort_by(imageDetails, &imagePushedAt)[-10:].imageTags[]" \
  --output text
```

---

## 5. Checking Running Image SHAs

```bash
aws ssm start-session --target <INSTANCE_ID>
grep -E '^(API_IMAGE_URI|MIGRATION_IMAGE_URI|WEB_IMAGE_URI|GIT_SHA)=' /opt/psl-one/.env.beta
docker compose -f /opt/psl-one/compose.beta.yaml --env-file /opt/psl-one/.env.beta \
  ps --format "table {{.Image}}\t{{.Status}}\t{{.Service}}"
```

---

## 6. Service Status Checks

```bash
APP=/opt/psl-one
COMPOSE="docker compose -f ${APP}/compose.beta.yaml --env-file ${APP}/.env.beta"

${COMPOSE} ps
${COMPOSE} logs --tail=50 api
${COMPOSE} logs --tail=50 web
${COMPOSE} logs --tail=50 caddy
```

---

## 7. Rollback Decision Matrix

| Symptom | Action |
|---|---|
| API health fails, web unaffected | Roll back API image only (`up -d --no-deps api`) |
| Web returns 5xx, API healthy | Roll back web image only (`up -d --no-deps web`) |
| Both unhealthy | Roll back both images |
| Schema error in API logs | Stop all services; restore pre-deploy database backup; roll back images |
| Caddy not routing | Restart caddy only (`restart caddy`); check Caddyfile mount |
| Migration failed (deploy aborted) | Images not updated; only need to fix migration and redeploy forward |
