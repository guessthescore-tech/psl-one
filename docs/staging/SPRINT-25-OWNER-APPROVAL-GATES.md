# Sprint 25 — Owner Approval Gates

This document lists all gates that require explicit owner approval before any write operations can proceed. Sprint 25 is read-only. No gates have been opened yet.

---

## Gate Set A: Fixture Import Write

All 10 gates must be cleared before `dryRun:false` is authorised.

| Gate | Trigger Condition | Current Status |
|------|-------------------|----------------|
| A01 | Dry-run returns candidates | BLOCKED — SOURCE_EMPTY |
| A02 | Team resolution READY | BLOCKED — awaiting fixtures |
| A03 | Owner reviews dry-run candidates | BLOCKED — awaiting A01 |
| A04 | No duplicate fixtures in DB | BLOCKED — awaiting A01 |
| A05 | Target seasonId confirmed | BLOCKED — PSL inactive |
| A06 | Season state is PRE_SEASON | BLOCKED — PSL inactive |
| A07 | Latest code deployed to EC2 | Requires deploy run |
| A08 | Scheduled ingestion disabled | CONFIRMED disabled |
| A09 | Rollback plan reviewed | NOT YET |
| A10 | Owner explicitly authorises write | NOT YET |

---

## Gate Set B: Fixture Publication

All B-gates require Gate Set A complete first.

| Gate | Trigger Condition | Current Status |
|------|-------------------|----------------|
| B01 | Import write verified (count matches) | BLOCKED |
| B02 | Kickoff times all valid | BLOCKED |
| B03 | Teams all resolved | BLOCKED |
| B04 | Owner fixture review in admin UI | BLOCKED |
| B05 | PSL season preflight all-green | BLOCKED |
| B06 | Owner authorises publication | BLOCKED |

---

## Gate Set C: PSL Season Activation

PSL season activation is a SEPARATE, LATER sprint. No C-gates are relevant to Sprint 25.

---

## How to Open a Gate

Owner communicates gate approval via direct message or email to the engineering lead. Gate approvals must reference:

- Gate ID (e.g., A10)
- Sprint number (e.g., Sprint 25)
- Explicit scope ("authorise `dryRun:false` + `confirmWrite:true` for PSL 2026/27 fixture import only")

Implicit or retroactive approvals are not accepted. The gate must be opened before the action, not after.

---

## Immutable Constraints (Not Gates)

These cannot be opened by any gate — they apply for the life of the platform:

- **No betting, odds, stakes, wagers, payouts, deposits, withdrawals, cash prizes, or real-money rewards**
- **Never bypass RBAC**
- **Never bypass audit logs**
- **Never store business logic in frontend**
