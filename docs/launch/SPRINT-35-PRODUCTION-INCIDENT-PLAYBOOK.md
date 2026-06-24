# Sprint 35 — Production Incident Playbook

## Severity Definitions

| P1 | Platform completely unavailable to fans |
| P2 | Core feature unavailable (fantasy, predictions, live match) |
| P3 | Degraded performance or minor feature outage |
| P4 | Cosmetic issue or low-priority bug |

---

## P1 Response: Platform Down

**Timeline: Respond within 15 minutes**

1. Check health endpoint:
   ```bash
   curl https://api.psl.co.za/health
   ```
2. Check EC2 instance status in AWS Console.
3. Check Caddy/Docker logs on EC2:
   ```bash
   ssh ec2-user@<IP> "sudo docker logs psl-api --tail 100"
   ```
4. Check RDS connectivity:
   ```bash
   ssh ec2-user@<IP> "sudo docker exec psl-api node -e \"require('./db').test()\""
   ```
5. If API container crashed: restart it:
   ```bash
   ssh ec2-user@<IP> "sudo docker-compose restart api"
   ```
6. If DB connection failed: check `DATABASE_URL` in SSM, verify security group allows EC2 → RDS.
7. Communicate to fans via social media if outage > 15 minutes.
8. Escalate to owner if unresolved within 30 minutes.

---

## P2 Response: Feature Outage

**Timeline: Respond within 1 hour**

1. Identify affected service from logs.
2. Check if a recent deployment caused the issue:
   ```bash
   git log origin/main --oneline -5
   ```
3. If deployment-related: initiate rollback via GitHub Actions (re-deploy previous SHA).
4. Check relevant Kafka topic if event-driven feature is affected.
5. If DB schema issue: run `prisma migrate status` and apply pending migrations.

---

## P3 Response: Performance Degradation

**Timeline: Respond within 4 hours**

1. Check CloudWatch metrics for DB query times and API latency.
2. Consider flushing in-memory cache:
   ```bash
   curl -X POST https://api.psl.co.za/admin/cache/flush \
     -H "Authorization: Bearer $PSL_ADMIN_TOKEN"
   ```
   (Route to be implemented; call `CacheInvalidationService.invalidateAll()`)
3. Check for slow queries in RDS Performance Insights.
4. If load-related: review auto-scaling configuration.

---

## Post-Incident

1. Write incident report within 24 hours (what happened, why, resolution, prevention).
2. Update monitoring thresholds if alert was too sensitive or too late.
3. Create GitHub issue for root cause fix if code change needed.
