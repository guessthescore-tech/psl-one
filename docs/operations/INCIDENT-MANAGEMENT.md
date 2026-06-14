# PSL One — Incident Management

**Purpose:** How incidents are detected, classified, and resolved  
**Audience:** Engineers, DevOps, delivery team  
**Status:** Planned — no production exists yet  
**Last verified:** 2026-06-14  

---

## Severity Levels

| Level | Description | Example | Response Time |
|-------|-------------|---------|--------------|
| P0 — Critical | Platform completely down | API not responding | Immediate |
| P1 — High | Core fan feature broken | Predictions cannot be submitted | < 1 hour |
| P2 — Medium | Degraded experience | Leaderboard slow to load | < 4 hours |
| P3 — Low | Minor issue | Admin page shows wrong count | Next working day |

---

## Incident Response (PLANNED)

### Detection

- CloudWatch Alarms trigger PagerDuty alert
- Fan report via beta feedback form
- Admin report via internal Slack channel

### Initial Response

1. Acknowledge the alert in PagerDuty
2. Join incident Slack channel `#psl-one-incidents`
3. Assign Incident Commander (first responder from on-call rotation)
4. Post initial status in channel: severity, what's affected, investigation underway

### Investigation

1. Check CloudWatch Logs for errors
2. Check API health: `GET /health`
3. Check database connectivity
4. Check recent deployments (last 24 hours)
5. Check `AdminAuditLog` for any admin actions that may have caused the issue

### Resolution

1. Apply fix or rollback
2. Verify fix in production
3. Post resolution message with root cause summary
4. Update incident ticket with timeline

### Post-Incident

Within 48 hours:
- Write post-incident review
- Document root cause
- Identify preventive measures
- Create tickets for follow-up work

---

## Critical Safety Incidents

If any of the following occur, treat as P0 and escalate to CTO and product lead immediately:

- Real money moved unexpectedly
- PSL season activated without explicit authorisation
- World Cup historical data modified or deleted
- Admin RBAC bypassed
- User data exposed to other users
- Production database compromised

---

## Beta-Phase Incidents

During beta (current phase), incident response is informal:

1. Issue found → add to beta feedback tracker
2. P0/P1 → fix before next beta session
3. P2/P3 → prioritise in next sprint

---

## On-Call (PLANNED)

Formal on-call rotation will be established before production launch. Current sprint: engineering team monitors directly during development.
