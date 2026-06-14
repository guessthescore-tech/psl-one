# PSL One — Backup and Restore

**Purpose:** Data backup strategy and restore procedures  
**Audience:** DevOps, engineers  
**Status:** Planned — no production exists yet  
**Last verified:** 2026-06-14  

---

## Current State

No production backup strategy. Local PostgreSQL in Docker is ephemeral.

---

## Planned Backup Strategy (Sprint 3)

### RDS Automated Backups

| Setting | Value |
|---------|-------|
| Retention period | 14 days |
| Backup window | 02:00–03:00 SAST (low traffic) |
| Point-in-time recovery | Enabled |
| Multi-AZ | Enabled (failover) |
| Backup type | Automated snapshot |

### Manual Snapshots

Before any high-risk operation (migration, season switch, major release):

```bash
aws rds create-db-snapshot \
  --db-instance-identifier pslone-prod \
  --db-snapshot-identifier pre-migration-<date>
```

---

## Restore Procedure (PLANNED)

### Point-in-Time Restore

To restore to a specific timestamp:

1. Identify target timestamp
2. Create new RDS instance from point-in-time:
   ```bash
   aws rds restore-db-instance-to-point-in-time \
     --source-db-instance-identifier pslone-prod \
     --target-db-instance-identifier pslone-restore \
     --restore-time 2026-06-14T02:00:00Z
   ```
3. Validate restored data
4. Switch connection string if validated
5. Deprecate old instance

### Restore from Snapshot

```bash
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier pslone-restore \
  --db-snapshot-identifier pre-migration-<date>
```

---

## Restore Testing

Once production infrastructure is in place:

- Monthly restore drill using a restored snapshot
- Validate row counts match expected values
- Validate API health against restored DB
- Document restore time (target: < 2 hours)

---

## Data That Must Be Preserved

| Data | Criticality |
|------|-------------|
| User accounts and profiles | CRITICAL |
| Fan prediction history | CRITICAL |
| Fantasy team selections and scores | CRITICAL |
| Fan Value ledger (immutable) | CRITICAL |
| Achievement records | CRITICAL |
| Social prediction points ledger (immutable) | CRITICAL |
| Admin audit log (immutable) | CRITICAL |
| World Cup 2026 historical data | CRITICAL — must never be deleted |
| Season activation approval records | HIGH |
| Beta cohort membership | MEDIUM |

---

## Local Development Backup

For local development, to backup before a destructive operation:

```bash
pg_dump psl_identity_dev > backup-$(date +%Y%m%d).sql
```

To restore:

```bash
psql psl_identity_dev < backup-20260614.sql
```
