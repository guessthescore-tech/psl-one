# Beta EC2 Backup and Restore

Database: PostgreSQL 16 (Docker named volume `psl-one-beta-postgres`)
Backup location: `/opt/psl-one/backups/` on the EC2 instance
Retention: last 7 backups

---

## 1. Manual Backup

Connect via SSM and run:

```bash
aws ssm start-session --target <INSTANCE_ID>
cd /opt/psl-one
sudo bash scripts/beta/backup-postgres.sh
```

Output example:
```
[2026-06-16T10:00:00Z] Starting PostgreSQL backup
[2026-06-16T10:00:03Z] Backup complete: /opt/psl-one/backups/psl-one-beta-20260616T100000Z.sql.gz (1.2M)
[2026-06-16T10:00:03Z] Backup directory contains 3 backup(s)
```

---

## 2. Automated Backup (Optional)

Add to `/etc/cron.d/psl-one-backup` on the EC2 instance:

```cron
# Daily backup at 02:00 SAST (00:00 UTC)
0 0 * * * root bash /opt/psl-one/scripts/beta/backup-postgres.sh >> /var/log/psl-one-backup.log 2>&1
```

---

## 3. Copying a Backup Off-Instance

```bash
# From your local machine — copy via SSM (S3 intermediary)
BACKUP_FILE="psl-one-beta-20260616T100000Z.sql.gz"
INSTANCE_ID="i-0abc123..."
BUCKET="your-secure-backup-bucket"

# Upload from EC2 to S3
aws ssm send-command \
  --instance-ids "${INSTANCE_ID}" \
  --document-name "AWS-RunShellScript" \
  --parameters "commands=[
    'aws s3 cp /opt/psl-one/backups/${BACKUP_FILE} s3://${BUCKET}/beta-backups/${BACKUP_FILE}'
  ]"

# Download from S3 locally
aws s3 cp "s3://${BUCKET}/beta-backups/${BACKUP_FILE}" ./
```

---

## 4. Restore

> **Warning:** Restore drops and recreates the database. Stop external traffic before proceeding.

Connect via SSM:
```bash
aws ssm start-session --target <INSTANCE_ID>
cd /opt/psl-one
sudo bash scripts/beta/restore-postgres.sh \
  /opt/psl-one/backups/psl-one-beta-20260616T100000Z.sql.gz
```

The script:
1. Prompts for confirmation (`YES`)
2. Stops `api`, `web`, and `caddy` containers
3. Drops and recreates the database
4. Streams the backup through gunzip into `psql`
5. Restarts `api`, `web`, and `caddy`

---

## 5. Restore Followed by Image Rollback

If restoring to a backup taken before a migration, the current API image may fail schema checks. Roll back the image after restoring the database:

1. Restore the backup (step 4 above)
2. Follow `BETA-EC2-ROLLBACK-RUNBOOK.md` to redeploy the image from before the migration

---

## 6. Volume Inspection

Check volume size and contents:
```bash
docker volume inspect psl-one-beta-postgres
cd /opt/psl-one
docker compose --env-file .env.beta -f compose.beta.yaml exec -T postgres \
  psql --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" \
  -c "\dt"
```

---

## 7. Backup Before Every Deploy

As a discipline, take a manual backup before deploying new code that includes migrations:

```bash
sudo bash /opt/psl-one/scripts/beta/backup-postgres.sh
```

Record the backup filename in the deployment notes.
