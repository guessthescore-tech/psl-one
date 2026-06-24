# Sprint 35 — Monitoring & Alerting

## Current State

- **Application logs**: NestJS Logger → stdout → CloudWatch Logs (on EC2)
- **Health check**: `GET /health` → returns `{ status: 'ok' }` (always uncached)
- **Caddy access logs**: HTTP request/response times logged on EC2
- **Smoke suite**: 21-check automated smoke suite in `tools/staging/`

## Required Before Production Launch

### API Monitoring

| Metric                    | Tool              | Alert Threshold        |
|---------------------------|-------------------|------------------------|
| API error rate (5xx)      | CloudWatch        | > 1% over 5 minutes    |
| API p95 latency           | CloudWatch        | > 2000ms               |
| DB connection pool usage  | CloudWatch (RDS)  | > 80% pool utilisation |
| Memory usage (ECS/EC2)    | CloudWatch        | > 85%                  |
| CPU usage                 | CloudWatch        | > 80% sustained 10min  |

### Frontend Monitoring (Vercel)

| Metric         | Tool             | Target   |
|----------------|------------------|----------|
| Build failures | GitHub Actions   | Any fail → alert |
| Web Vitals LCP | Vercel Analytics | < 2.5s   |
| 404 rate       | Vercel           | < 0.5%   |

### Business Metrics (When PSL Active)

| Metric                   | Target              |
|--------------------------|---------------------|
| Fan registrations/day    | Track from day 1    |
| Fantasy team creation    | > 1000 in first 7 days |
| Prediction submissions   | > 5000 per match day |
| Error rate per match day | < 0.5%              |

## Alert Channels

| Severity | Channel       | Response SLA |
|----------|---------------|--------------|
| P1 (down)| SMS + call    | 15 minutes   |
| P2 (degraded)| Slack     | 1 hour       |
| P3 (warning) | Email     | 4 hours      |

## Incident Playbook

See `SPRINT-35-PRODUCTION-INCIDENT-PLAYBOOK.md` for step-by-step response procedures.

## Safety Constraints

- No production monitoring dashboard deployed in this sprint.
- CloudWatch alarms must be configured before OG-35-EC2-PROD gate.
- No PagerDuty or OpsGenie configured yet (planned for production launch).
