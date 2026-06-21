# Account Security

**Domain:** Auth / Account
**Status:** IMPLEMENTED (Sprint 5)

## Password Change

### Endpoint

`POST /auth/password/change`

### Authentication

JWT required. Uses `JwtAuthGuard`.

### Request Body

```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, min 8 characters)"
}
```

### Responses

| Status | Body | When |
|--------|------|------|
| 200 | `{ "message": "Password changed successfully." }` | Success |
| 400 | `{ "message": "Current password is incorrect" }` | Wrong current password |
| 400 | `{ "message": "..." }` | Validation error (too short etc.) |
| 401 | Unauthorized | Not authenticated or inactive user |

### Audit Events

| Event | Trigger |
|-------|---------|
| `PASSWORD_CHANGED` | Success |
| `PASSWORD_CHANGE_FAILED` | Wrong current password |

### Security Guarantees

- Current password is verified with bcrypt.compare before any update
- New password is hashed with bcrypt (12 rounds) before storage
- No plaintext password appears in audit events, logs, or errors
- Existing JWT sessions remain valid after change (stateless JWT)

---

## Account Security Audit Log

All security events are recorded in `AuthAuditLog` (append-only):

| Event | Description |
|-------|-------------|
| `REGISTER` | New account registration |
| `LOGIN` | Login attempt (success or failure) |
| `LOGOUT` | User logout |
| `PASSWORD_RESET_REQUEST` | Password reset email requested |
| `PASSWORD_RESET_CONFIRM` | Password reset completed |
| `PASSWORD_CHANGED` | In-session password change (success) |
| `PASSWORD_CHANGE_FAILED` | In-session password change (wrong current password) |
| `ACCOUNT_DELETION_REQUESTED` | User submitted deletion request |
| `ACCOUNT_DELETION_CANCELLED` | User cancelled pending deletion request |

### Audit Payload Safety Rules

- No passwords
- No tokens
- No secrets
- No full request bodies
- userId + event + success + optional userAgent only
