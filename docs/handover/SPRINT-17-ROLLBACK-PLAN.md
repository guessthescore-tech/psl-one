# Sprint 17 — Rollback Plan

## Risk Assessment

Sprint 17 is low-risk:
- No new Prisma migrations.
- No schema changes.
- No new Kafka events.
- No new background processes or schedulers.
- All new routes are admin-only (RBAC-gated).
- Source is currently empty — no fixture data has been written.

## Rollback Scenarios

### Scenario A — Dry-run causes unexpected API error

**Symptom:** Admin triggers dry-run, API returns 500.
**Rollback:**
1. Check `AdminAuditLog` for `PARSE_PSL_FIXTURE_INGESTION_FAILED` events.
2. Check API logs for the underlying error.
3. If Parse PSL key is invalid: rotate key in `apps/api/.env` on EC2.
4. No database changes to undo (dry-run is read-only).

### Scenario B — Write-run creates unwanted fixtures

**Symptom:** Write run executed; fixtures created with wrong seasonId or wrong team names.
**Rollback:**
1. No migration needed — use SQL to delete the ingested fixtures:
   ```sql
   DELETE FROM "Fixture"
   WHERE "providerSource" = 'parse-psl'
   AND "importedAt" > '<timestamp of the write run>';
   ```
2. Confirm deletion via admin UI.
3. Re-run dry-run to verify candidates before a corrected write run.

### Scenario C — New endpoint breaks existing data-provider routes

**Symptom:** `GET /admin/data-provider/health` or other existing routes fail.
**Rollback:**
1. Revert the DataProviderController to the pre-Sprint-17 version.
2. The new `POST parse-psl/fixtures/ingest` route is additive — reverting it does not affect other routes.

### Scenario D — Experience admin page causes build failure

**Symptom:** `pnpm --filter experience build` fails after merge.
**Rollback:**
1. Remove `apps/experience/src/app/admin/data-provider/parse-psl/page.tsx`.
2. Remove `apps/experience/src/lib/admin-ingestion-api.ts`.
3. These files are additive — no other experience files import them.

## Rollback Command

If full revert is needed:

```bash
git revert <sprint-17-merge-commit> --no-commit
git commit -m "revert: Sprint 17 Parse PSL ingestion workflow"
```

No database migration reversal needed (no new migrations in Sprint 17).
