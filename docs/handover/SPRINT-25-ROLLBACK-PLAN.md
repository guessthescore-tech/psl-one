# Sprint 25 — Rollback Plan

**Status:** Documented
**Date:** 2026-06-23

## Platform Safety Constraints

- PSL remains inactive. World Cup 2026 remains active beta context.
- Wallet remains sandbox-only. No production wallet activation.
- Fantasy remains points-only. No real-money integration.
- Guess the Score remains points-only. No real-money integration.
- Sponsor rewards remain non-financial (points, badges, digital experiences only).
- No production ingestion. No scheduled ingestion.
- No real-money functionality.

## Rollback Scope

Sprint 25 adds only frontend pages, components, API clients, and documentation. There are no:
- Database migrations
- Backend code changes
- Schema changes
- Environment variable changes
- Infrastructure changes

This makes rollback straightforward.

## Rollback Steps

### Option 1: Revert PR (Recommended)

If the PR is merged and a rollback is needed:

```bash
git revert <merge-commit-sha> --no-commit
git commit -m "revert: rollback sprint-25-production-portals-ui"
git push origin main
```

### Option 2: Delete Portal Routes

If only specific portals need rollback, remove the page files:

```bash
rm -rf apps/experience/src/app/admin/overview
rm -rf apps/experience/src/app/admin/competitions
# ... etc for specific pages
```

### Option 3: Feature Flag (Future)

For future sprints, consider gating portal pages behind an environment variable:
```typescript
if (!process.env.NEXT_PUBLIC_PORTALS_ENABLED) { redirect('/'); }
```

## Risk Assessment

- **Data risk:** None — no migrations, no schema changes
- **Auth risk:** None — RBAC unchanged at backend
- **Safety risk:** None — no PSL activation, no wallet changes
- **Rollback time:** < 15 minutes for any option
