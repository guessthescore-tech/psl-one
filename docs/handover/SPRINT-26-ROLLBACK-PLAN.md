# Sprint 26 — Rollback Plan

**Date:** 2026-06-23
**Sprint:** 26 (Controlled User Testing)

PSL remains inactive. Wallet remains sandbox-only.

---

## Rollback Complexity: TRIVIAL

Sprint 26 contains **only documentation and smoke tools**. No code changes to rollback.

---

## What Changed in Sprint 26

| Type                  | What                                      | Count |
|-----------------------|-------------------------------------------|-------|
| Markdown documents    | `docs/qa/` and `docs/handover/` docs      | 16    |
| Smoke tools           | `tools/staging/sprint-26-*.mjs`           | 2     |
| Test additions        | `experience.spec.ts` appended tests       | 1     |
| Schema changes        | None                                      | 0     |
| Migrations            | None                                      | 0     |
| API endpoints         | None                                      | 0     |
| Frontend pages        | None                                      | 0     |
| Infrastructure changes| None                                      | 0     |

---

## Rollback Procedure

### Option 1: Revert the PR

If Sprint 26 PR is merged and needs to be rolled back:

```bash
git revert -m 1 <sprint-26-merge-commit>
git push origin main
```

This removes all Sprint 26 docs and tools without touching any other code.

### Option 2: Revert to pre-Sprint-26 commit

```bash
git checkout main
git reset --hard <pre-sprint-26-sha>  # e.g. 64f623c
git push --force-with-lease origin main  # requires owner approval
```

**Note:** Force push to main requires owner approval.

---

## What Does NOT Need Rollback

- **No schema changes** — no database rollback needed.
- **No migrations** — migration history is unchanged.
- **No API changes** — no endpoint changes to revert.
- **No EC2 redeployment needed** — no infrastructure changes.
- **No environment variable changes** — `.env` is unchanged.
- **No provider configuration changes** — adapter settings unchanged.

---

## Post-Rollback Verification

After rollback, confirm:

1. `docs/qa/SPRINT-26-*.md` files no longer exist
2. `docs/handover/SPRINT-26-*.md` files no longer exist
3. `tools/staging/sprint-26-*.mjs` files no longer exist
4. API tests still pass: `pnpm --filter @psl-one/api test`
5. Experience tests still pass: `pnpm --filter @psl-one/experience test`

---

## Safety Confirmations (unchanged by rollback)

- PSL remains inactive — rollback does not change this.
- Wallet remains sandbox-only — rollback does not change this.
- No production ingestion — rollback does not change this.
- No real-money functionality — rollback does not change this.

These platform constraints are enforced by backend code, not by Sprint 26 documents.
Rolling back Sprint 26 removes the documentation, but the safety constraints remain in effect.
