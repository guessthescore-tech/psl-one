# Sprint 4 — Rollback Plan

**Branch:** `feature/sprint-4-premium-activation`  
**Date:** 2026-06-20

---

## Rollback Scope

Sprint 4 makes only frontend changes to `apps/experience` plus documentation. There are:
- No schema migrations
- No database changes
- No AWS infrastructure changes
- No production deployments
- No PSL season activation

The only deployed change would be a Vercel preview deployment of `apps/experience` — which is separate from the operational beta on AWS EC2.

---

## Rollback Steps

### If: Vercel Preview Deployment Has Issues

```bash
# Delete the Vercel preview deployment from the dashboard
# OR simply push a revert commit to the branch
git revert HEAD --no-edit
git push origin feature/sprint-4-premium-activation
```

Vercel will auto-redeploy from the reverted commit.

### If: Branch Has Broken Tests or Typecheck

```bash
# On the sprint branch
git checkout main
git branch -D feature/sprint-4-premium-activation
git checkout -b feature/sprint-4-premium-activation a58c38b
```

This returns to the starting SHA without touching main.

### If: main is Mistakenly Merged

The PR has branch protection — it cannot be merged without owner approval. If this somehow occurs:

```bash
git checkout main
git revert -m 1 <merge-commit-sha>
git push origin main
```

### If: AWS EC2 Beta Affected

The AWS EC2 beta (`16.28.84.11`) is **not affected by Sprint 4**. Sprint 4 only touches `apps/experience` (Vercel preview). The AWS beta runs `apps/web` + `apps/api`.

If the AWS beta shows issues (unrelated to Sprint 4):
- See `docs/handover/PSL-ONE-ROLLBACK.md` (S3-INFRA-02F procedures)
- EC2 image is pinned; re-run the deploy pipeline with the previous image tag

---

## Files Changed by Sprint 4

Sprint 4 added/modified only these files (no deletions):

### New files (all additive — no risk)
```
apps/experience/vercel.json
apps/experience/.env.example
apps/experience/src/app/predict/challenge/page.tsx
apps/experience/src/app/predict/challenge/accept/page.tsx
apps/experience/src/app/account/notifications/page.tsx
apps/experience/docs/SPRINT-4-*.md (multiple)
apps/experience/src/lib/experience.spec.ts (additions)
docs/sprints/SPRINT-4-*.md (multiple)
docs/handover/SPRINT-4-*.md (multiple)
docs/data/SPRINT-4-*.md (multiple)
tools/data-provider-spike/ (new directory)
```

### Modified files
```
apps/experience/src/app/predict/page.tsx (was "Coming soon")
apps/experience/src/app/layout.tsx (added robots meta)
apps/experience/src/components/account/AccountNav.tsx (added notifications link)
docs/handover/PSL-ONE-CURRENT-STATE.md (updated)
```

---

## No-Rollback Items

The following were NOT changed in Sprint 4 and cannot be "rolled back":
- `apps/api/` — no changes
- `apps/web/` — no changes
- Terraform infrastructure — no changes
- CI/CD workflows — no changes
- Database schema — no changes
- AWS resources — no changes
