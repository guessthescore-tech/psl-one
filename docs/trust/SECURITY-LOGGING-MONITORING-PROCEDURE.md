# Security Logging & Monitoring Procedure

**Status: NOT_SOC2_CERTIFIED — procedure in draft**
Version: 1.0-draft | Date: 2026-06

---

## Audit Log Coverage

### AdminAuditLog (Database)

| Event Category | Examples | Table |
|---------------|----------|-------|
| Import operations | WORLD_CUP_FIXTURE_IMPORT_*, PARSE_PSL_INGEST_* | AdminAuditLog |
| Season switching | SEASON_ACTIVATION_*, SEASON_ROLLBACK | AdminAuditLog |
| Fixture publication | FIXTURE_PUBLISHED, FIXTURE_UNPUBLISHED | AdminAuditLog |
| Status refresh | WORLD_CUP_FIXTURE_STATUS_REFRESH | AdminAuditLog |
| Auth events | LOGIN_SUCCESS, LOGIN_FAILED, PASSWORD_RESET | authAuditLog |
| Provider operations | DATA_PROVIDER_HEALTH_CHECK | AdminAuditLog |

### Application Logs (NestJS Logger → CloudWatch)

| Log Level | Content | Retention |
|-----------|---------|-----------|
| ERROR | Exceptions, provider failures, audit write failures | TBD (90 days recommended) |
| WARN | Missing env vars, degraded state, rate limit hits | TBD |
| LOG | Service operations, import summaries, smoke events | TBD |
| DEBUG | Not enabled in staging/production | N/A |

---

## CloudWatch Setup (Basic)

- Log group: `/psl-one/api` (to be configured in staging)
- EC2 instance: logs via `docker logs` piped to CloudWatch agent
- Current status: basic Docker logging only; CloudWatch agent not yet installed

---

## Alert Thresholds (Defined, Not Yet Wired)

| Alert | Threshold | Action |
|-------|----------|--------|
| Auth failures | >10 in 5 min from same IP | Trigger AuthThrottleGuard; review IP |
| 5xx errors | >5 in 1 min | Page on-call engineer |
| CPU > 85% | Sustained 5 min | Scale review |
| Memory > 90% | Sustained 5 min | Restart container |
| Smoke test failure | Any check FAIL | Block deploy |

---

## Log Retention Policy (Draft)

| Log Type | Recommended Retention | Current Status |
|----------|----------------------|----------------|
| Security/audit logs | 1 year | NOT_CONFIGURED |
| Application logs | 90 days | NOT_CONFIGURED |
| CI/CD logs | 30 days | GitHub default |
| AdminAuditLog (DB) | Indefinite (no purge) | ACTIVE |

**Owner action required:** Configure CloudWatch log retention and alerting.

---

## What Is NOT Logged

- Raw JWT tokens (never logged)
- Provider API keys (never logged)
- User passwords (never logged — bcrypt hash only)
- Fan PII in admin audit log metadata (only IDs)
