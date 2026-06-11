# STORY-01 — Database Schema

**Schema namespace:** `identity`  
**Database:** `psl_one_dev` (single RDS instance, see ADR-011)  
**Engine:** PostgreSQL 16  
**Prisma schema block:** `@@schema("identity")`

---

## Tables

### `identity.fans`

The primary fan record. One row per registered user.

```sql
CREATE TABLE identity.fans (
  id              UUID        NOT NULL DEFAULT gen_random_uuid(),
  email           TEXT        NOT NULL,
  display_name    TEXT        NOT NULL,
  date_of_birth   DATE        NOT NULL,
  mobile          TEXT,
  cognito_id      TEXT        NOT NULL,
  registered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fans_pkey          PRIMARY KEY (id),
  CONSTRAINT fans_email_unique  UNIQUE (email),
  CONSTRAINT fans_cognito_unique UNIQUE (cognito_id),
  CONSTRAINT fans_email_length  CHECK (char_length(email) <= 254),
  CONSTRAINT fans_name_length   CHECK (char_length(display_name) BETWEEN 2 AND 50)
);
```

**Column notes:**

| Column | Notes |
|---|---|
| `email` | Stored lowercase. Application normalises before insert. Unique constraint enforces no duplicates. |
| `display_name` | Trimmed. Application removes leading/trailing whitespace before insert. |
| `date_of_birth` | DATE (no time component). Used for age calculation only. |
| `mobile` | E.164 format if provided. `NULL` permitted — mobile is optional at registration. |
| `cognito_id` | Cognito `sub` claim. Set when `adminCreateUser` succeeds. Never null. |
| `registered_at` | UTC timestamp. Set by DB default — not passed in from the application layer. |

---

### `identity.consent_records`

Append-only POPIA consent log. A new row is created for every consent event. Rows are **never** updated or deleted.

```sql
CREATE TABLE identity.consent_records (
  id                 UUID        NOT NULL DEFAULT gen_random_uuid(),
  fan_id             UUID        NOT NULL,
  consent_terms      BOOLEAN     NOT NULL,
  consent_marketing  BOOLEAN     NOT NULL DEFAULT FALSE,
  consent_analytics  BOOLEAN     NOT NULL DEFAULT FALSE,
  ip_address         TEXT,
  user_agent         TEXT,
  recorded_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT consent_records_pkey    PRIMARY KEY (id),
  CONSTRAINT consent_records_fan_fk  FOREIGN KEY (fan_id)
                                     REFERENCES identity.fans(id)
                                     ON DELETE RESTRICT,
  CONSTRAINT consent_terms_required  CHECK (consent_terms = TRUE)
);
```

**Column notes:**

| Column | Notes |
|---|---|
| `consent_terms` | CHECK constraint enforces `TRUE`. A false value cannot be stored — if terms not accepted, registration is rejected at the application layer before reaching the DB. |
| `ip_address` | Captured from `X-Forwarded-For` (first IP) or `REMOTE_ADDR`. Stored for POPIA audit evidence. |
| `user_agent` | HTTP User-Agent header value. Truncated to 512 chars if longer. |
| `recorded_at` | UTC. Set by DB default. |

**POPIA immutability rules:**

```sql
-- Block UPDATE on consent_records (DB-level enforcement, not just application convention)
CREATE RULE no_update_consent_records
  AS ON UPDATE TO identity.consent_records
  DO INSTEAD NOTHING;

-- Block DELETE on consent_records
CREATE RULE no_delete_consent_records
  AS ON DELETE TO identity.consent_records
  DO INSTEAD NOTHING;
```

*Why RULE not TRIGGER: A RULE silently discards the operation without raising an exception. This prevents noisy errors when ORMs (e.g. Prisma) attempt cascade operations. The application layer must never issue UPDATE/DELETE on this table — the rule is a safety net, not the primary enforcement mechanism.*

---

## Indexes

```sql
-- Lookup fan by email (login, duplicate check)
CREATE INDEX idx_fans_email
  ON identity.fans (email);

-- Lookup fan by Cognito ID (JWT validation → fan lookup)
CREATE INDEX idx_fans_cognito_id
  ON identity.fans (cognito_id);

-- Lookup consent history for a fan (POPIA data export)
CREATE INDEX idx_consent_fan_id
  ON identity.consent_records (fan_id);

-- Latest consent for a fan (ORDER BY recorded_at DESC LIMIT 1)
CREATE INDEX idx_consent_fan_recorded
  ON identity.consent_records (fan_id, recorded_at DESC);
```

---

## OutboxEvent: `identity.fan.registered`

Written to `outbox.outbox_events` in the same transaction as the Fan and ConsentRecord rows.

```sql
-- Row inserted into outbox.outbox_events
INSERT INTO outbox.outbox_events (topic, payload, status)
VALUES (
  'identity.fan.registered',
  '{
    "eventId":         "<UUID>",
    "eventType":       "identity.fan.registered",
    "version":         "1.0.0",
    "timestamp":       "<ISO8601>",
    "correlationId":   "<UUID>",
    "payload": {
      "fanId":              "<UUID>",
      "email":              "<lowercase email>",
      "displayName":        "<string>",
      "consentMarketing":   <boolean>,
      "consentAnalytics":   <boolean>,
      "registeredAt":       "<ISO8601>"
    }
  }',
  'PENDING'
);
```

**Invariant:** If the OutboxEvent insert fails, the entire transaction (Fan + ConsentRecord + OutboxEvent) must roll back.

---

## AuditLog Entries

Written to `audit.audit_log` (not in a transaction — best-effort, separate write).

**Events that require audit log entries:**

| Trigger | `action` | `resourceType` | `resourceId` |
|---|---|---|---|
| Fan registered | `FAN_REGISTERED` | `FAN` | `fan.id` |
| Fan logged in | `FAN_LOGIN` | `FAN` | `fan.id` |
| Fan logged out | `FAN_LOGOUT` | `FAN` | `fan.id` |
| GET /me/data accessed | `DATA_ACCESS` | `FAN` | `fan.id` |
| Consent updated | `CONSENT_UPDATED` | `CONSENT_RECORD` | new `consent_record.id` |
| Account anonymised | `ACCOUNT_ANONYMISED` | `FAN` | `fan.id` |

**AuditLog row shape:**
```sql
INSERT INTO audit.audit_log (
  fan_id, tenant_id, action, resource_type, resource_id,
  ip_address, correlation_id, changes
)
VALUES (
  '<fanId or NULL for pre-auth>',
  NULL,                         -- tenantId: NULL for fan-scoped actions in Sprint 1
  'FAN_REGISTERED',
  'FAN',
  '<fan.id>',
  '<ip>',
  '<correlationId>',
  NULL                          -- changes: NULL for creation events; JSON diff for updates
);
```

---

## Migration Order

Migrations must run in this order (single initial migration for Sprint 0 already creates `outbox` and `audit` schemas):

```
Migration 0001 (Sprint 0):  CREATE SCHEMA outbox, audit
                             CREATE TABLE outbox.outbox_events
                             CREATE TABLE audit.audit_log

Migration 0002 (STORY-01):  CREATE SCHEMA identity
                             CREATE TABLE identity.fans
                             CREATE TABLE identity.consent_records
                             CREATE RULE no_update_consent_records
                             CREATE RULE no_delete_consent_records
                             CREATE INDEX idx_fans_email
                             CREATE INDEX idx_fans_cognito_id
                             CREATE INDEX idx_consent_fan_id
                             CREATE INDEX idx_consent_fan_recorded
```

---

## Data Lifecycle

| Event | Action |
|---|---|
| Fan registers | INSERT into `fans`, INSERT into `consent_records` |
| Fan updates consent | INSERT new row into `consent_records` (no UPDATE) |
| Fan requests erasure (POPIA DELETE) | UPDATE `fans`: set `email`=`deleted-{id}@pslone.co.za`, `display_name`='Deleted User', `mobile`=NULL. ConsentRecords retained (legal obligation). |
| Fan account re-registration after erasure | Email address freed after anonymisation — a new registration with the same original email is technically possible (the original email is replaced). This is by design. |

---

## Constraints Summary

| Table | Constraint | Type | Rule |
|---|---|---|---|
| `fans` | `fans_pkey` | PK | `id` |
| `fans` | `fans_email_unique` | UNIQUE | `email` |
| `fans` | `fans_cognito_unique` | UNIQUE | `cognito_id` |
| `fans` | `fans_email_length` | CHECK | `char_length(email) <= 254` |
| `fans` | `fans_name_length` | CHECK | `char_length(display_name) BETWEEN 2 AND 50` |
| `consent_records` | `consent_records_pkey` | PK | `id` |
| `consent_records` | `consent_records_fan_fk` | FK | `fan_id → fans.id ON DELETE RESTRICT` |
| `consent_records` | `consent_terms_required` | CHECK | `consent_terms = TRUE` |
| `consent_records` | `no_update_consent_records` | RULE | Silently discards UPDATE |
| `consent_records` | `no_delete_consent_records` | RULE | Silently discards DELETE |
