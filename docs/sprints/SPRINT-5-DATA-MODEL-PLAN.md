# Sprint 5 — Data Model Plan

## Models Added

### AccountDeletionRequest

| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | PK |
| userId | String | FK → users.id |
| status | DeletionRequestStatus | Default PENDING |
| reason | String? | Optional, max 500 chars |
| requestedAt | DateTime | Default now() |
| cancelledAt | DateTime? | Set on cancel |
| completedAt | DateTime? | Set by admin on fulfilment |
| createdAt | DateTime | Default now() |
| updatedAt | DateTime | Auto-updated |

### DeletionRequestStatus Enum

| Value | Meaning |
|-------|---------|
| PENDING | Submitted, awaiting admin fulfilment |
| CANCELLED | User cancelled before processing |
| COMPLETED | Admin fulfilled (data removed) |
| REJECTED | Rejected by admin with reason |

## AuditEvent Enum Extensions

| Value | Trigger |
|-------|---------|
| PASSWORD_CHANGED | Successful password change |
| PASSWORD_CHANGE_FAILED | Failed password change (wrong current password) |
| ACCOUNT_DELETION_REQUESTED | User submitted deletion request |
| ACCOUNT_DELETION_CANCELLED | User cancelled pending deletion request |

## Non-destructive Guarantee

No existing data is modified by this migration.
The migration is additive: new enum values, new enum, new table.
No existing tables, columns, or relations are altered.
