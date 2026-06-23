# Sprint 25 — Beta Go/No-Go

**Decision: CONDITIONAL_GO**

Date: 2026-06-23

---

## Go Conditions

| # | Condition | Status |
|---|-----------|--------|
| 1 | All CI checks pass (7/7) | PENDING — awaiting PR push |
| 2 | Experience tests pass (≥ 905) | PENDING |
| 3 | API tests pass (≥ 1,968) | PENDING |
| 4 | No new HIGH/CRITICAL CVEs introduced | PENDING |
| 5 | All staging docs committed | DONE |
| 6 | Handover docs committed | DONE |
| 7 | PSL not accidentally activated | CONFIRMED |
| 8 | No fixture write operations in Sprint 25 | CONFIRMED |
| 9 | No real-money changes | CONFIRMED |
| 10 | RBAC: existing admin routes still 200 for PSL_ADMIN | CONFIRMED (from Sprint 24) |

---

## CONDITIONAL_GO Basis

Sprint 25 is documentation and tooling only:

- Two read-only staging tools created
- Eight staging docs created
- Five handover docs created
- Experience tests added
- Zero DB migrations
- Zero schema changes
- Zero route changes
- Zero EC2 deployments (Sprint 25 does not deploy)

The conditional is that CI must pass after PR push.

---

## No-Go Conditions

| Condition | Action |
|-----------|--------|
| CI fails | Fix failing checks before merging |
| New HIGH/CRITICAL CVE from new dependency | Address before merge |
| Accidental PSL activation | Immediate incident — revert and deactivate |
| Accidental fixture write | Immediate incident — delete batch, document |

---

## Platform State

```
PSL:                    INACTIVE (unchanged)
WC2026:                 ACTIVE (unchanged)
Wallet:                 SANDBOX (unchanged)
Scheduled ingestion:    DISABLED (unchanged)
EC2 beta deployed SHA:  c731c494 (Sprint 23 RBAC fix, from Sprint 24)
Migrations:             42 (unchanged)
```

---

## Next Sprint Trigger

Sprint 26 should begin when psl.co.za publishes the 2026/27 PSL fixture schedule and `PSL_FIXTURE_CANDIDATES_FOUND` is reported by the availability check tool.
