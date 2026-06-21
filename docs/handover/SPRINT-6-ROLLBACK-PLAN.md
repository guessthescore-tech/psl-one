# Sprint 6 Rollback Plan

## If Rollback Is Needed

### Step 1: Revert the merge commit

```bash
git revert -m 1 <merge-commit-sha>
git push origin main
```

This is safe because all Sprint 6 changes are additive.

### Step 2: Roll back the DB migration

The migration added one table (`prediction_challenges`) and two enum values (`CHALLENGE_TOKEN_CREATED`, `CHALLENGE_TOKEN_ACCEPTED`).

To roll back manually (requires DBA access):

```sql
-- Remove new AuditEvent enum values (requires recreate on PostgreSQL)
-- Only do this if the values have never been written to audit_logs

DROP TABLE IF EXISTS prediction_challenges;

-- PostgreSQL does not support DROP VALUE from enum
-- If CHALLENGE_TOKEN_CREATED / CHALLENGE_TOKEN_ACCEPTED are unused,
-- recreate the enum without them. Otherwise leave in place (harmless).
```

Recommendation: Leave the enum values in place. The table can be dropped safely as it has no dependents other than FK to existing tables (which cascade on user/fixture delete).

### Step 3: Remove SSM parameter (if Sportmonks key was set)

```bash
aws ssm delete-parameter --name /psl-one/staging/SPORTMONKS_API_KEY
```

Only needed if the key was actually stored. As of Sprint 6 it was NOT set.

## Low-Risk Assessment

Sprint 6 changes are low-risk for rollback because:
1. `PredictionChallenge` table is new — no existing data depends on it
2. `DataProviderModule` is read-only (no data writes)
3. `PreviewAnalyticsModule` only logs to stdout — no persistent state
4. `AccountOnboardingService` is derived read-only — no new tables
5. Frontend changes are progressive enhancement (legacy URL params still work)

The only irreversible action would be if challenges are created by fans and accepted — that data would be lost on table drop. In staging this is acceptable. In production, export data first.
