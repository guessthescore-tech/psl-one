# STORY-01 — Identity: Register and Login

**Bounded context:** Identity  
**Status:** SPEC COMPLETE — awaiting approval  
**Sprint:** Sprint 1  
**Priority:** P0 — blocks every other story

---

## Story

```
As a South African football fan
I want to create an account and log in
So that I can access all platform features
```

---

## Artefacts

| File | Contents |
|---|---|
| [domain-model.md](./domain-model.md) | Entities, invariants, domain events |
| [api-contracts.md](./api-contracts.md) | Endpoint specs, request/response shapes, error codes |
| [database-schema.md](./database-schema.md) | DDL, indexes, constraints, immutability rules |
| [acceptance-criteria.md](./acceptance-criteria.md) | BDD scenarios (Given/When/Then) |
| [test-scenarios.md](./test-scenarios.md) | Unit, integration, and security test cases |

---

## Scope

**In scope:**
- Fan registration (email + password + display name + date of birth + POPIA consent)
- Email verification via AWS Cognito
- Email + password login
- JWT access token (RS256, issued by Cognito, validated via JWKS)
- Refresh token (httpOnly cookie)
- Token refresh and logout
- Authenticated "who am I" endpoint
- POPIA: age gate (18+), append-only consent record, audit log on data access

**Out of scope (Sprint 2+):**
- SMS / OTP verification
- Social login (Google, Apple)
- Password reset
- Profile photo upload
- Club affiliation selection at registration
- Session management / device list
- Account suspension / ban

---

## Dependencies

| Dependency | Direction | Reason |
|---|---|---|
| AWS Cognito User Pool | External | Auth tokens, user lifecycle |
| `packages/auth-guards` | Internal | JwtAuthGuard, RolesGuard already scaffolded |
| `packages/event-schemas` | Internal | `identity.fan.registered` event shape |
| `outbox.outbox_events` table | Internal | Written in Sprint 0 |
| `audit.audit_log` table | Internal | Written in Sprint 0 |

---

## Approval

- [ ] Domain model approved
- [ ] API contracts approved
- [ ] Database schema approved
- [ ] Acceptance criteria approved
- [ ] Test scenarios approved

**Approved by:** _______________  **Date:** _______________

Once all boxes are checked, generate code with: `generate STORY-01`
