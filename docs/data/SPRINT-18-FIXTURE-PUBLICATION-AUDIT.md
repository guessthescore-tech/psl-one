# Sprint 18 — Fixture Publication Audit Trail

## Overview

Every fixture publication action (publish or unpublish) produces two `AdminAuditLog` entries: one when the operation is attempted, and one when it completes. This ensures complete traceability for compliance and debugging.

Pre-flight checks produce one `AdminAuditLog` entry per run.

---

## Audit Events

### FIXTURE_PUBLICATION_ATTEMPTED

Written before the DB mutation begins.

```json
{
  "action": "FIXTURE_PUBLICATION_ATTEMPTED",
  "entityType": "Fixture",
  "entityId": "batch",
  "route": "/admin/fixtures/publish",
  "metadata": {
    "fixtureIds": ["clu...", "clu..."],
    "publish": true,
    "requestedCount": 10
  }
}
```

### FIXTURE_PUBLICATION_COMPLETED

Written after the DB mutation completes.

```json
{
  "action": "FIXTURE_PUBLICATION_COMPLETED",
  "entityType": "Fixture",
  "entityId": "batch",
  "route": "/admin/fixtures/publish",
  "metadata": {
    "fixtureIds": ["clu..."],
    "publish": true,
    "requested": 10,
    "changed": 8,
    "skipped": 2,
    "published": 8,
    "unpublished": 0
  }
}
```

### PSL_PREFLIGHT_CHECK_RUN

Written after each pre-flight check.

```json
{
  "action": "PSL_PREFLIGHT_CHECK_RUN",
  "entityType": "Season",
  "entityId": "<seasonId>",
  "route": "/admin/psl/preflight",
  "metadata": {
    "seasonId": "...",
    "checks": 10,
    "blockers": 0,
    "warnings": 2
  }
}
```

---

## Audit Log Model

All audit events are stored in `AdminAuditLog`:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | CUID |
| `actorUserId` | string | User ID from JWT (or 'system' for automated) |
| `actorRole` | string | Role from JWT |
| `action` | string | Audit event name |
| `entityType` | string | 'Fixture', 'Season', etc. |
| `entityId` | string | ID of the affected entity |
| `route` | string | API route that triggered the event |
| `metadata` | JSON | Additional context |
| `createdAt` | DateTime | UTC timestamp |

---

## Failure Safety

Audit log writes are wrapped in try/catch in both `FixturePublicationService.writeAuditLog()` and `PslActivationPreflightService.writeAuditLog()`. A failure to write the audit log:

1. Is logged at WARN level via NestJS Logger
2. Does NOT block the operation — the fixture publication or pre-flight result is returned normally

This follows the failure-safe audit pattern established in Sprint 16.

---

## Querying Audit Logs (Admin)

Audit logs can be retrieved via the Admin Command Centre routes established in Sprint 24:

```
GET /admin/audit-logs?action=FIXTURE_PUBLICATION_COMPLETED&limit=50
GET /admin/audit-logs?action=PSL_PREFLIGHT_CHECK_RUN
```

---

## Compliance Notes

- Audit entries are immutable — never deleted or updated
- Actor identity (userId + role) is captured from the JWT for every operation
- Both attempted and completed events are recorded, enabling detection of interrupted operations
- This audit trail satisfies the PSL One RBAC audit requirement from CLAUDE.md

---

## Related Documents

- [SPRINT-18-FIXTURE-PUBLISHING-WORKFLOW.md](./SPRINT-18-FIXTURE-PUBLISHING-WORKFLOW.md)
- [SPRINT-18-PSL-ACTIVATION-PREFLIGHT.md](./SPRINT-18-PSL-ACTIVATION-PREFLIGHT.md)
