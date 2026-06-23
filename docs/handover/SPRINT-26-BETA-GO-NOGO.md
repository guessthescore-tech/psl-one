# Sprint 26 — Beta Go/No-Go

**Date:** 2026-06-23
**Sprint:** 26 (Controlled User Testing)
**Decision:** CONDITIONAL_GO

---

## Platform Safety State

| Dimension                 | State                              |
|---------------------------|------------------------------------|
| PSL season                | INACTIVE — PSL remains inactive    |
| Beta context              | World Cup 2026 (active)            |
| Wallet                    | SANDBOX — wallet remains sandbox-only |
| GTS (Guess the Score)     | POINTS_ONLY — no real money        |
| Fantasy                   | POINTS_ONLY — no real money        |
| Sponsor rewards           | NON_FINANCIAL — no cash payouts    |
| Production ingestion      | DISABLED — no production ingestion |
| Scheduled ingestion       | DISABLED — no scheduled ingestion  |
| Real-money functionality  | NONE — no real-money functionality |

---

## CONDITIONAL_GO — All Conditions Stated

The following conditions are CONFIRMED:

- PSL remains inactive.
- World Cup 2026 remains active beta context.
- Wallet remains sandbox-only.
- Fantasy remains points-only.
- Guess the Score remains points-only.
- Sponsor rewards remain non-financial.
- No production ingestion.
- No scheduled ingestion.
- No real-money functionality.

---

## Full GO Requires All of the Following

1. PSL fixtures published by psl.co.za (expected ~July/August 2026)
2. Fixture dry-run returns confirmed candidates
3. Team resolution reviewed and confirmed by owner
4. Owner approves fixture import write
5. Owner approves fixture publication
6. PSL activation pre-flight reaches GO status
7. Owner separately approves PSL season activation
8. Club portal API contract gaps closed (6 endpoints — GAP-26-01)
9. Sponsor portal API contract gaps closed (7 endpoints — GAP-26-02)
10. CLUB_ADMIN staging RBAC smoke completed (GAP-26-03)
11. SPONSOR_ADMIN staging RBAC smoke completed (GAP-26-04)

---

## Current Sprint 26 Status

| Area                  | Status              |
|-----------------------|---------------------|
| Admin portal          | CONDITIONAL_PASS    |
| Club portal           | CONDITIONAL_PASS    |
| Sponsor portal        | CONDITIONAL_PASS    |
| Fan experience        | PASS                |
| RBAC — PSL_ADMIN      | PASS (8/0)          |
| RBAC — CLUB_ADMIN     | PENDING_TOKEN       |
| RBAC — SPONSOR_ADMIN  | PENDING_TOKEN       |
| Portal route smoke    | PASS (0 5xx)        |
| Typecheck (API)       | PASS                |
| Typecheck (Experience)| PASS                |
| API tests             | 1,968 PASS          |
| Experience tests      | 1,063+ PASS         |

---

## No-Go Triggers

The following actions must NOT be taken without explicit owner authorisation:

- Do NOT activate PSL season
- Do NOT run fixture import write
- Do NOT activate production wallet
- Do NOT enable scheduled ingestion
- Do NOT commit JWT token values or provider API keys
- Do NOT introduce real-money, betting, odds, wager, or cash prize language

---

## Recommended Next Steps

1. Owner provisions CLUB_ADMIN JWT for staging smoke
2. Owner provisions SPONSOR_ADMIN JWT for staging smoke
3. Sprint 27: Implement ClubPortalModule (6 endpoints)
4. Sprint 27: Implement SponsorPortalModule (7 endpoints)
5. Sprint 27: Author Sponsor Billing ADR
6. Monitor psl.co.za for fixture schedule publication (~July/Aug 2026)
