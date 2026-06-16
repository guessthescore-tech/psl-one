# Beta EC2 Incident Runbook

Use this runbook when the beta environment is unresponsive, degraded, or behaving unexpectedly.

---

## Severity Levels

| Level | Definition | Target Response |
|---|---|---|
| P1 | All services down, beta review blocked | Immediate |
| P2 | One service degraded, partial access | 30 min |
| P3 | Performance slow, non-critical errors | Next business day |

---

## 1. Initial Triage

### Check EC2 instance state

```bash
aws ec2 describe-instances \
  --instance-ids <INSTANCE_ID> \
  --query "Reservations[0].Instances[0].State.Name" \
  --output text
```

Expected: `running`. If `stopped` or `terminated`, see section 5.

### Check public IP

```bash
aws ec2 describe-instances \
  --instance-ids <INSTANCE_ID> \
  --query "Reservations[0].Instances[0].PublicIpAddress" \
  --output text
```

### Connect via SSM

```bash
aws ssm start-session --target <INSTANCE_ID>
```

If SSM connection fails, see section 6.

### Check container status

```bash
cd /opt/psl-one
docker compose --env-file .env.beta -f compose.beta.yaml ps
```

### Check logs (last 100 lines per service)

```bash
docker compose --env-file .env.beta -f compose.beta.yaml logs --tail=100 api
docker compose --env-file .env.beta -f compose.beta.yaml logs --tail=100 web
docker compose --env-file .env.beta -f compose.beta.yaml logs --tail=100 caddy
docker compose --env-file .env.beta -f compose.beta.yaml logs --tail=100 postgres
```

---

## 2. Service-Level Recovery

### Restart a single service

```bash
docker compose --env-file .env.beta -f compose.beta.yaml restart api
docker compose --env-file .env.beta -f compose.beta.yaml restart web
docker compose --env-file .env.beta -f compose.beta.yaml restart caddy
```

### Restart all services (preserves volumes)

```bash
docker compose --env-file .env.beta -f compose.beta.yaml down
docker compose --env-file .env.beta -f compose.beta.yaml up -d
```

### Check systemd service unit

```bash
sudo systemctl status psl-one-beta
sudo journalctl -u psl-one-beta -n 50
sudo systemctl restart psl-one-beta
```

---

## 3. Database Issues

### PostgreSQL not starting

```bash
docker compose --env-file .env.beta -f compose.beta.yaml logs --tail=100 postgres
```

Common cause: volume permissions or disk full. Check:
```bash
df -h /
docker system df
```

If disk full, prune unused images:
```bash
docker image prune -f
```

### Database corruption suspected

1. Stop all services except postgres
2. Run a backup: `sudo bash /opt/psl-one/scripts/beta/backup-postgres.sh`
3. Run pg_checkdb inside the container:
   ```bash
   cd /opt/psl-one
   COMPOSE="docker compose --env-file .env.beta -f compose.beta.yaml"
   ${COMPOSE} exec -T postgres \
     psql --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" \
     -c "SELECT datname, pg_size_pretty(pg_database_size(datname)) FROM pg_database;"
   ```
4. If corrupt, restore from last known-good backup (see `BETA-EC2-BACKUP-RESTORE.md`)

---

## 4. Caddy / TLS Issues

### Caddy not routing (Mode A — HTTP)

Check Caddyfile is mounted correctly:
```bash
cd /opt/psl-one
COMPOSE="docker compose --env-file .env.beta -f compose.beta.yaml"
${COMPOSE} exec -T caddy cat /etc/caddy/Caddyfile
```

Verify environment variables are set:
```bash
${COMPOSE} exec -T caddy env | grep -E '(API_DOMAIN|WEB_DOMAIN|CADDY_ACME_EMAIL)'
```

Restart Caddy:
```bash
docker compose --env-file .env.beta -f compose.beta.yaml restart caddy
```

### Let's Encrypt certificate not issued (Mode B)

Caddy logs will show ACME challenges. Common causes:
- DNS A record not propagated yet (wait, then restart Caddy)
- Port 80 blocked by security group (check `aws_vpc_security_group_ingress_rule.http`)
- Route 53 guardrail blocking DNS management (use external DNS provider)

Check certificate status:
```bash
cd /opt/psl-one
COMPOSE="docker compose --env-file .env.beta -f compose.beta.yaml"
${COMPOSE} exec -T caddy caddy list-certificates 2>/dev/null || \
  ${COMPOSE} exec -T caddy ls /data/caddy/certificates/
```

---

## 5. Instance Stopped or Terminated

### Stopped

```bash
aws ec2 start-instances --instance-ids <INSTANCE_ID>
# Wait ~60 seconds
aws ec2 describe-instances \
  --instance-ids <INSTANCE_ID> \
  --query "Reservations[0].Instances[0].PublicIpAddress" \
  --output text
```

Update reviewer `/etc/hosts` with new IP (if no Elastic IP).

The `psl-one-beta.service` systemd unit starts Docker Compose automatically on boot.

### Terminated

If the instance was accidentally terminated:

1. The EBS root volume is deleted (encryption at rest, `delete_on_termination = true`)
2. Named Docker volumes for postgres are gone — restore from backup if one exists off-instance
3. Re-apply Terraform: `terraform apply`
4. Re-run `bootstrap-data.sh` or restore from off-instance backup

---

## 6. SSM Session Manager Unavailable

If `aws ssm start-session` fails:

1. Verify instance is running (section 1)
2. Verify SSM agent is installed and running — check EC2 System Manager console
3. Verify IAM instance profile has `AmazonSSMManagedInstanceCore` attached (Terraform output: `instance_profile_name`)
4. Verify outbound internet access (security group egress rule `all_outbound` must be present)
5. If SSM agent is healthy but session initiation fails, check VPC endpoints or NAT configuration; wait 2–3 minutes and retry
6. SSM Run Command (`AWS-RunShellScript`) is available as an alternative to interactive Session Manager — use it for one-off diagnostic commands

SSH via port 22 is not a supported recovery path. Port 22 is not open by default and no key pair is attached. If SSM cannot be restored after the steps above, escalate to: re-launch the instance from Terraform with a fresh bootstrap, restoring data from the last off-instance backup. Do not open port 22 without explicit security approval, a specific approved-admin CIDR, key-based authentication only, and immediate removal after the incident.

---

## 7. Post-Incident Actions

After resolving any P1/P2 incident:

1. Take a fresh database backup
2. Document timeline and root cause in a brief incident note
3. Identify whether a Terraform, compose, or script change can prevent recurrence
4. Update this runbook if the resolution involved a step not listed here
