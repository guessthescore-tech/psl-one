# Sprint 7 — Rollback Plan

## Code Rollback

If Sprint 7 changes need to be reverted:

```bash
# Option 1: Revert the sprint 7 commits
git log --oneline | head -10  # Find sprint 7 commits
git revert <commit-sha> --no-edit  # Revert each sprint 7 commit

# Option 2: Reset to last known good commit
git reset --hard <pre-sprint-7-sha>
git push origin feature/sprint-7-provider-settlement-staging --force  # WITH OWNER APPROVAL ONLY
```

## Database Rollback

See `SPRINT-7-STAGING-MIGRATION-ROLLBACK.md` for SQL rollback steps.

## Key Rollback Impacts

| Component | Rollback Impact |
|-----------|----------------|
| `ChallengeSettlementService` | Removed — settle/result routes return 404 |
| `SportmonksAdapter` | Reverts to empty skeleton (returns `[]` for all methods) |
| `PredictionChallengeStatus.SETTLED` | Enum value remains in DB (PostgreSQL limitation) |
| `AuditEvent.CHALLENGE_SETTLED` | Enum value remains in DB (PostgreSQL limitation) |
| Settlement columns | Can be dropped manually if needed (see rollback SQL) |

## Safe Rollback Window

- Rollback is safe before any challenge is settled in production
- If challenges have been settled, removing `SETTLED` status will break those records
- Recommend: only roll back code if no settlements have occurred

## Emergency Contact

Contact platform owner before executing any rollback in production.
