# Sprint 25 — Rollback Plan

## Rollback Necessity Assessment

Sprint 25 contains:
- 2 new staging tool scripts (read-only, no API changes)
- 8 staging docs (markdown only)
- 5 handover docs (markdown only)
- 1 story matrix doc (markdown only)
- ~20 experience tests
- 0 migrations
- 0 schema changes
- 0 route changes
- 0 API changes
- 0 EC2 deployments

**Rollback risk: VERY LOW** — there are no runtime changes to roll back.

---

## Code Rollback (If Needed)

To revert Sprint 25 from main:

```bash
git revert <sprint-25-merge-commit>
```

This removes the tool scripts and docs. No DB changes are made.

---

## EC2 Rollback

Sprint 25 does not deploy to EC2. EC2 remains on the Sprint 24 deploy (run `28015195029`, SHA `c731c494`).

If EC2 needs to roll back independently of Sprint 25, see `docs/staging/SPRINT-24-STAGING-ROLLBACK-CHECKLIST.md`.

---

## DB Rollback

Not applicable — Sprint 25 has 0 migrations and 0 DB writes.

---

## Safety State Post-Rollback

All safety constraints remain unchanged regardless of rollback:

```
PSL:                    INACTIVE
WC2026:                 ACTIVE
Wallet:                 SANDBOX
Scheduled ingestion:    DISABLED
Production ingestion:   DISABLED
Real-money:             NONE
Migrations:             42
```
