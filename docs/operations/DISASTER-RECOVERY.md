# PSL One — Disaster Recovery

**Purpose:** Recovery objectives and procedures for major platform failures  
**Audience:** DevOps, engineering leadership  
**Status:** Planned — no production exists yet  
**Last verified:** 2026-06-14  

---

## Recovery Objectives (PLANNED)

| Metric | Target |
|--------|--------|
| RTO (Recovery Time Objective) | < 4 hours |
| RPO (Recovery Point Objective) | < 1 hour (RDS Multi-AZ + point-in-time) |

---

## Failure Scenarios and Recovery

### Scenario 1: API Container Failure

**Detection:** ALB health check fails, CloudWatch alarm triggers  
**Recovery:**
1. ECS service automatically restarts the task (built-in ECS recovery)
2. If recurring: check CloudWatch Logs for crash cause
3. Rollback to previous ECS task definition if new deployment caused it

**Expected recovery time:** < 5 minutes (auto-recovery)

---

### Scenario 2: Database Failure (Primary)

**Detection:** API returns 500 on all DB-dependent routes  
**Recovery (RDS Multi-AZ):**
1. RDS Multi-AZ automatically fails over to standby — typically < 2 minutes
2. DNS endpoint `pslone-prod.cluster-xxx.rds.amazonaws.com` updates automatically
3. API reconnects on next Prisma connection attempt

**Expected recovery time:** < 5 minutes (automatic failover)

---

### Scenario 3: Database Corruption

**Detection:** Data integrity errors, seed data missing, unexpected nulls  
**Recovery:**
1. Identify last known good timestamp from `AdminAuditLog`
2. Point-in-time restore to that timestamp (see [Backup and Restore](BACKUP-AND-RESTORE.md))
3. Validate restored data before switching traffic
4. Post-restore: replay any missing admin audit log entries from application logs

**Expected recovery time:** 2–4 hours

---

### Scenario 4: Accidental Season Activation

**Detection:** `Season.isActive` changed for the wrong season; fan behaviour disrupted  
**Recovery:**
1. Admin access to `POST /admin/season-switching/:seasonId/rollback-dry-run` (check impact)
2. Execute rollback: swap `isActive` back
3. Write corrective `SeasonSwitchAudit` record
4. Notify affected fans if any live gameplay was disrupted

**Note:** Season activation is not yet available via API. This scenario applies post-Sprint 3.

---

### Scenario 5: Deployment Gone Wrong

**Detection:** Build deploys but API health check fails, or new routes broken  
**Recovery:**
1. ECS rollback to previous task definition:
   ```bash
   aws ecs update-service \
     --cluster pslone-prod \
     --service pslone-api \
     --task-definition pslone-api:<previous-version>
   ```
2. Verify health check recovers
3. Investigate the failed deployment in staging before re-attempting

---

### Scenario 6: Complete Region Failure

**Detection:** AWS af-south-1 unavailable  
**Recovery (PLANNED — multi-region not yet designed):**
1. No automatic failover in Sprint 3 plan
2. Best effort: restore from latest RDS snapshot in af-south-1 once region recovers
3. Long-term: multi-region strategy is a future sprint decision

---

## Data Safety Invariants

Regardless of failure mode, these invariants must always be true after recovery:

1. `PredictionPointsLedger` rows match settled predictions
2. `SocialPredictionPointsEntry` balance matches challenge results
3. `AdminAuditLog` is complete and immutable
4. Exactly one `Season.isActive = true`
5. World Cup historical data intact

Post-recovery validation script (to be built in Sprint 3) should verify these.

---

## Quarterly DR Drill (PLANNED)

Once production exists:
- Quarterly restore drill from RDS snapshot
- Validate data integrity invariants
- Measure actual RTO and RPO against targets
- Document results and adjust procedures
