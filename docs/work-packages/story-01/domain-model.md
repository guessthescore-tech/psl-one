# STORY-01 — Domain Model

**Bounded context:** Identity  
**Layer:** Domain (no infrastructure, no framework)

---

## Entities

### Fan

The primary aggregate root. A Fan is a registered platform user.

| Field | Type | Nullable | Constraints |
|---|---|---|---|
| `id` | UUID | No | PK, generated |
| `email` | String | No | Unique, lowercase-normalised, max 254 chars |
| `displayName` | String | No | 2–50 chars, trimmed |
| `dateOfBirth` | Date | No | Must be 18+ years before `registeredAt` |
| `mobile` | String | Yes | E.164 format if provided (e.g. `+27821234567`) |
| `cognitoId` | String | No | Unique — Cognito `sub` claim |
| `registeredAt` | DateTime | No | UTC, set on creation |

**Identity:** A Fan is identified by `id`. Email and `cognitoId` are secondary unique keys.

**Lifecycle:** Created once on registration. Can be anonymised (POPIA erasure) but never deleted. An anonymised fan has email/displayName/mobile replaced with placeholder values; `id` and aggregate statistics are retained for leaderboard integrity.

---

### ConsentRecord

An immutable record of a fan's consent state at a point in time. Every change to consent creates a new row — existing rows are never modified.

| Field | Type | Nullable | Constraints |
|---|---|---|---|
| `id` | UUID | No | PK, generated |
| `fanId` | UUID | No | FK → Fan.id |
| `consentTerms` | Boolean | No | Must be `true` (registration blocked if false) |
| `consentMarketing` | Boolean | No | Fan's choice |
| `consentAnalytics` | Boolean | No | Fan's choice |
| `ipAddress` | String | Yes | IPv4 or IPv6, captured from request |
| `userAgent` | String | Yes | HTTP User-Agent header, captured from request |
| `recordedAt` | DateTime | No | UTC, set on creation |

**Identity:** `id`.

**Immutability invariant:** Once a `ConsentRecord` row is written, it must never be updated or deleted. The current consent state for a fan is determined by the most recent `ConsentRecord` row by `recordedAt`.

**POPIA note:** `consentTerms` is a legal agreement to the platform's Privacy Policy and Terms of Use. It is a prerequisite for registration and cannot be withdrawn without account deletion.

---

## Invariants

Business rules that must always be true. Any operation that would violate an invariant must be rejected.

| # | Invariant | Enforced by |
|---|---|---|
| INV-01 | A Fan must be 18 years or older at time of registration | Application (age check before Cognito call) + API validation |
| INV-02 | A Fan's `email` is globally unique | DB unique constraint |
| INV-03 | A Fan's `cognitoId` is globally unique | DB unique constraint |
| INV-04 | Registration must write Fan + ConsentRecord atomically — neither exists without the other | Single DB transaction |
| INV-05 | A Cognito user must not be created if the DB transaction will fail | Compensating action: delete Cognito user on transaction failure |
| INV-06 | `ConsentRecord` rows are immutable — no UPDATE, no DELETE | DB-level RULE (see database-schema.md) |
| INV-07 | `consentTerms` must be `true` for registration to proceed | Application validation |
| INV-08 | Email is stored in lowercase (normalised at write, not just at query) | Application layer before insert |

---

## Value Objects

### Age

Derived from `Fan.dateOfBirth` and a reference date (registration date).

```
Age = years elapsed between dateOfBirth and referenceDate
Minimum valid age for registration: 18 years
```

Edge case: a fan born on 2008-06-08 registering on 2026-06-08 is exactly 18 — **permitted**.  
A fan born on 2008-06-09 registering on 2026-06-08 is 17 years and 364 days — **rejected**.

### Email

Normalised form: lowercase, trimmed. `PERCY@EXAMPLE.COM` → `percy@example.com`.  
Validation: RFC 5321 basic format check. Max 254 characters.

### Mobile

Optional. If provided: E.164 format (`+` followed by country code and number).  
South African mobile: `+27` followed by 9 digits.  
No formatting beyond E.164 is enforced in this story.

---

## Domain Events

Events published to `outbox.outbox_events` after every state change. Shape follows `KafkaEventEnvelope` from `packages/event-schemas`.

### `identity.fan.registered`

Published when a Fan is successfully created.

| Field | Type | Notes |
|---|---|---|
| `eventId` | UUID | Unique per event |
| `eventType` | String | `"identity.fan.registered"` |
| `version` | String | `"1.0.0"` |
| `timestamp` | ISO8601 | UTC |
| `correlationId` | UUID | From request header `x-correlation-id` or generated |
| `payload.fanId` | UUID | |
| `payload.email` | String | Normalised |
| `payload.displayName` | String | |
| `payload.consentMarketing` | Boolean | |
| `payload.consentAnalytics` | Boolean | |
| `payload.registeredAt` | ISO8601 | |

**Consumers (other modules that react to this event):**
- `fan` module → creates FanProfile
- `loyalty` module → creates LoyaltyAccount, awards 100 welcome points
- `wallet` module → creates WalletAccount (Sprint 2)
- `notifications` module → sends welcome email (Sprint 4)

### `identity.fan.consent.updated`

Published when a fan updates their consent preferences (not at registration — registration uses `fan.registered`).

| Field | Type | Notes |
|---|---|---|
| `payload.fanId` | UUID | |
| `payload.consentMarketing` | Boolean | New value |
| `payload.consentAnalytics` | Boolean | New value |
| `payload.previousConsentMarketing` | Boolean | Previous value |
| `payload.previousConsentAnalytics` | Boolean | Previous value |

---

## Domain Services

Logic that does not belong to a single entity.

### RegistrationService (conceptual)

Orchestrates registration. Responsible for:
1. Validate input (age, email format, consent)
2. Create Cognito user (`adminCreateUser`)
3. Begin DB transaction
4. Write `Fan` row
5. Write `ConsentRecord` row
6. Write `OutboxEvent` (topic: `identity.fan.registered`)
7. Commit transaction
8. On transaction failure: delete Cognito user (compensating action)
9. On Cognito failure: abort, return error (no DB writes)

### AgeValidator (conceptual)

Pure function. No side effects.  
Input: `dateOfBirth: Date`, `referenceDate: Date`  
Output: `{ isEligible: boolean, ageInYears: number }`

### TokenService (conceptual)

Wraps Cognito auth flows. Responsible for:
- `initiateAuth` (login)
- `respondToAuthChallenge` (future: MFA, new password)
- `revokeToken` (logout)
- `initiateAuth` with `REFRESH_TOKEN_AUTH` flow (refresh)

---

## Aggregate Boundaries

The `Identity` bounded context owns:
- `Fan` (aggregate root)
- `ConsentRecord` (child of Fan)

The `Identity` bounded context does **not** own:
- Fan profile details (province, club affiliation) → `Fan` bounded context owns those
- Session metadata (devices, locations) → out of scope for Sprint 1
- Loyalty account → `Loyalty` bounded context
- Wallet → `Wallet` bounded context

Cross-context reads: Other contexts may read `Fan.id`, `Fan.email`, `Fan.displayName` via the `identity.fan.registered` event payload or via `GET /api/v1/auth/me`. They must **not** query the `identity` DB schema directly.
