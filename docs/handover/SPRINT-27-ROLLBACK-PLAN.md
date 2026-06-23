# Sprint 27 — Rollback Plan

**Date:** 2026-06-23  

---

## Rollback Trigger Conditions

Roll back Sprint 27 if:
- Unexpected 5xx on any portal endpoint affecting existing functionality
- CI gate failures introduced by new modules
- Migration conflict (no migrations in Sprint 27 — unlikely)
- Security finding in new portal endpoints

---

## Rollback Procedure

Sprint 27 introduces **zero database migrations**. Rollback is clean.

```bash
# Revert to previous main commit
git revert <sprint-27-merge-commit>

# Or hard reset to pre-sprint SHA
git checkout main
git reset --hard a4a386c
git push --force origin main  # Owner authorisation required
```

No data loss risk — no schema changes, no seed changes.

---

## Impact Assessment

| Area | Impact of Rollback |
|------|--------------------|
| Database | None — zero migrations |
| Existing API routes | None — new modules only |
| Frontend portals | Revert to API_PENDING state |
| Staging EC2 | Re-deploy previous image |
| User data | None |

---

## Partial Rollback Option

If only one module is problematic:

1. Comment out `ClubPortalModule` OR `SponsorPortalModule` in `app.module.ts`
2. Remove the import
3. Redeploy without revert

---

## Safety Note

PSL remains INACTIVE throughout and after any rollback.
Wallet remains SANDBOX throughout and after any rollback.
No financial data exists to roll back.
