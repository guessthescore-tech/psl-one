# PSL One — Observability Requirements

**Purpose:** What monitoring, logging, and alerting must exist before and after production  
**Audience:** Engineers, DevOps  
**Status:** Current as of S3-INFRA-00 — API request logging implemented, cloud observability pending  
**Last verified:** 2026-06-14  

---

## Current State

Structured JSON request logging is implemented in the API with request and correlation IDs. Cache stampede protection is implemented for HTTP response caching. CloudWatch, metric export, and distributed tracing remain pending.

---

## Logging Requirements

### API Logging

| Requirement | Priority | Notes |
|------------|---------|-------|
| Structured JSON logs | MUST | Fields: timestamp, level, requestId, route, method, statusCode, durationMs |
| Request/response logging | MUST | All routes — no PII in logs |
| Error logging | MUST | Stack trace, route, user ID (not email) |
| Admin action logging | MUST | Via `AdminAuditLog` table (already implemented) |
| Database query logging | SHOULD | Slow query threshold: >100ms |
| Startup logging | MUST | Modules loaded, DB connected, port bound |

### Log Levels

| Level | When |
|-------|------|
| ERROR | Unhandled exceptions, database failures |
| WARN | Validation failures, rate limit hits, slow queries |
| INFO | Request completed, admin actions, season switching |
| DEBUG | Not in production |

### What Must NOT be Logged

- User passwords or tokens
- Full request bodies containing PII
- Database connection strings
- JWT secrets

---

## Metrics Requirements

| Metric | Type | Notes |
|--------|------|-------|
| HTTP request count | Counter | By route, method, status code |
| HTTP request duration | Histogram | p50, p95, p99 per route |
| Database connection pool | Gauge | Active, idle, waiting connections |
| Error rate | Rate | Errors per minute, by type |
| Active fan count | Gauge | Fans logged in within last 30 min |
| Prediction count | Counter | Predictions per minute |
| Fantasy transfer count | Counter | Transfers per minute |
| Challenge acceptance count | Counter | Challenges accepted per minute |

---

## Alerting Requirements

| Alert | Threshold | Channel |
|-------|-----------|---------|
| API error rate | >1% over 5min | PagerDuty / Slack |
| API p95 latency | >1s over 5min | PagerDuty |
| Database connection pool exhausted | >90% | PagerDuty |
| Failed admin auth attempts | >10/min | PagerDuty + email |
| Season switch event | Any | Email to engineering + product |
| No health check response | 3 consecutive fails | PagerDuty |

---

## Health Check Endpoints

`GET /health` is process liveness and should return:

```json
{
  "status": "ok",
  "service": "api",
  "timestamp": "2026-06-15T10:00:00Z"
}
```

`GET /health/ready` is readiness and verifies database connectivity plus required configuration without exposing secret values.

ALB health checks for the API target group use `/health/ready`. Liveness remains available for process-level checks and local diagnostics.

---

## Planned Implementation (Sprint 3)

| Tool | Purpose |
|------|---------|
| NestJS Logger | Structured request logging (implemented in API) |
| CloudWatch Logs | Log aggregation |
| CloudWatch Metrics | Custom metric ingestion |
| CloudWatch Alarms | Threshold-based alerting |
| AWS X-Ray (DECISION_REQUIRED) | Distributed tracing |
| CloudWatch Dashboard | Real-time fan and system health |

---

## Fan Volume Metrics

At 2 million fans, these metrics need dashboards:

- Daily/weekly active fans (DAU/WAU)
- Predictions submitted per matchday
- Fantasy transfers on deadline day
- Challenge acceptance rate
- Leaderboard query load (expected spike on matchday +1)
