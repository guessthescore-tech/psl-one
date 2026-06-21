# Privacy and POPIA Compliance

**Domain:** Account / Privacy
**Status:** IMPLEMENTED (Sprint 5)
**Compliance:** Protection of Personal Information Act (POPIA), South Africa

## Account Deletion Request Workflow

PSL One implements a non-destructive deletion **request** workflow in compliance with POPIA.
Deletion is not immediate — it is a formal request that is processed by the data team.

### Why non-immediate?

POPIA requires that personal data is deleted within a reasonable time after a valid request.
However, certain data categories must be retained for legal, financial, and platform-integrity reasons.
Immediate automated deletion risks destroying legally-required records.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/account/deletion-request` | Submit a deletion request |
| `GET` | `/account/deletion-request/status` | Check pending request status |
| `POST` | `/account/deletion-request/cancel` | Cancel a pending request |

### Deletion Request Lifecycle

```
PENDING -> CANCELLED (user action)
PENDING -> COMPLETED (admin fulfilment)
PENDING -> REJECTED (admin decision with reason)
```

### What Is Deleted

On fulfilment:
- Personal profile data (name, city, contact info)
- Fantasy team selections and transfer history
- Prediction records
- Notification preferences
- Activity feed items
- Fan achievements and badges (user-visible only)

### What Is Retained

Even after fulfilment:
- Financial audit records (legal requirement)
- Points ledger entries (platform integrity, anonymised)
- Consent records (legal requirement — proves consent was given)
- Security audit logs (security requirement)
- Compliance records

### POPIA Rights Honoured

| Right | How |
|-------|-----|
| Right to access | `GET /auth/me`, `GET /profile/me` |
| Right to correct | `PATCH /profile/me` |
| Right to delete | `POST /account/deletion-request` |
| Right to object | Cancel via `POST /account/deletion-request/cancel` |

### Data Model

See `AccountDeletionRequest` in `docs/reference/DATABASE-MODELS.md`.

## No Real-money Data

PSL One does not process real-money transactions in this sprint.
The wallet module uses `SiliconEnterpriseSandboxWalletAdapter` only.
No financial data subject to POPIA's special-category financial data rules is stored.
