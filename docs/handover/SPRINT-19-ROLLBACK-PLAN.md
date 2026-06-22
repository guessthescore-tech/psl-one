# Sprint 19 — Rollback Plan

## Overview

Sprint 19 is tooling-only. It adds no API routes, no frontend pages, no Prisma migrations, and no schema changes. It is the lowest-risk sprint in the project from a rollback perspective.

---

## Rollback Trigger Conditions

Roll back Sprint 19 code if:

1. A security concern is found in a staging smoke tool (e.g., accidental key logging)
2. The migration status tool incorrectly applies migrations
3. A smoke tool triggers unintended DB writes on staging

These are extremely unlikely given the read-only nature of all Sprint 19 tools.

---

## Code Rollback

To roll back Sprint 19 from `main`:

```bash
git revert <sprint-19-merge-commit> --no-commit
git commit -m "revert: roll back Sprint 19 staging tooling"
git push origin main
```

Sprint 19 adds no API endpoints, so there is no running-service impact beyond the tools being removed.

---

## No EC2 Rollback Needed

Sprint 19 contains no deployable code changes. If Sprint 19 was merged but Sprint 18 was not yet deployed to EC2, nothing on EC2 is affected.

---

## No Database Rollback Needed

Sprint 19 adds zero Prisma migrations. No database rollback is required under any scenario.

---

## Staging Tool Safety

If a staging smoke tool is found to have an unintended side effect:

1. Do not run the tool again until the issue is investigated
2. Check the EC2 database for unintended records in `AdminAuditLog` or `Fixture`
3. If records were written by accident, they can be deleted via Prisma Studio or direct SQL (with owner authorization)

The `FixturePublicationService` writes are guarded by `confirmPublication: true`. No write can happen without this flag — the service throws before any DB call.

---

## Contact

All rollback actions on shared infrastructure require owner notification.
