# Sprint 13 — Rollback Plan

## Summary

Sprint 13 has no DB migrations and no changes to active request paths. Rollback is always available and has no service impact.

## Rollback Scenarios

### Scenario 1 — Remove ProviderRouterService from codebase

`ProviderRouterService` is additive. It is not imported by `DataProviderService`, `AppModule`, or any active controller. Removing it has no impact on running services.

**Steps:**
1. Delete `apps/api/src/data-provider/provider-router.service.ts`
2. Remove any import in `DataProviderModule` if added
3. No migration required
4. No restart required

### Scenario 2 — Revert to NoOpAdapter for all competitions

`DataProviderService` global behaviour is unchanged. The `DATA_PROVIDER` environment variable controls the single global provider. Setting it to empty or `noop` returns to `NoOpAdapter` for all requests.

**Steps:**
```bash
# In apps/api/.env
DATA_PROVIDER=
```
Restart the API service. No DB changes required.

### Scenario 3 — Revert entire Sprint 13 branch

No DB migrations were added in Sprint 13. A `git revert` or branch reset will not require any schema rollback.

**Steps:**
```bash
git revert <sprint-13-commit-sha>
# or
git checkout main
```

## What Sprint 13 Does NOT Change

| Item | Status |
|---|---|
| DB schema | No migrations added |
| DataProviderService | Unchanged |
| NoOpAdapter | Remains default |
| Active HTTP routes | No new routes |
| Kafka events | No new events |
| Seed data | No changes |
| Frontend pages | No changes |

## Discovery Tools Rollback

Discovery tools in `tools/discovery/` are fire-and-forget scripts. They have no runtime impact. Removing them requires no service restart or DB change.

## Related Documents

- `docs/handover/SPRINT-13-HANDOVER.md`
- `docs/handover/SPRINT-13-KNOWN-GAPS.md`
- `docs/data/SPRINT-13-PER-COMPETITION-ROUTING.md`
- `docs/handover/SPRINT-12-ROLLBACK-PLAN.md` — prior sprint for reference
