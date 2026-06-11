# Sprint Handover Skill

## When to use

Create a sprint handover at the end of every sprint, before committing sprint work and before starting the next story. The handover is the formal acceptance record for the sprint.

## Required sections

Every `SPRINT-N-HANDOVER.md` must include:

1. Sprint Summary
2. Completed Stories — table with story ID, title, Accepted / In Progress / Not Accepted
3. Acceptance Criteria Status — per-story criteria table
4. Key Files Changed
5. Database Changes
6. Prisma Migrations Created — full list with migration name and content summary
7. Seed Data Changes
8. API Contracts Delivered
9. Frontend Routes / Screens Delivered
10. Environment Variable Changes
11. Local Run Instructions — exact commands for install, migrate, seed, build, start
12. Quality Gates Run — table of every command run and its result
13. Test Results — file count, test count, pass/fail
14. Known Issues
15. Technical Debt
16. Security Notes
17. Deployment Notes
18. Recommended Next Sprint / Next Story

Optional but recommended:
- Platform Documentation Snapshot
- Project Learnings
- Improvement Opportunities

## DevOps safety checks

Before creating the handover, confirm all of the following:

- [ ] `prisma validate` passes
- [ ] `db:seed` passes and reports expected row counts
- [ ] `typecheck` passes (API + web) — 0 errors
- [ ] `test` passes (API + web) — 0 failures
- [ ] `build` passes (API + web) — no compile errors
- [ ] Local API is running on expected port
- [ ] All new routes respond correctly (manual or scripted smoke test)
- [ ] FAN receives 403 on all admin routes
- [ ] PSL_ADMIN receives 200/201 on admin routes
- [ ] No `.next/`, `dist/`, or `node_modules/` files are staged for commit

## Do not claim tests passed unless they were run

If a gate command was not run, write **"Not run"** in the Quality Gates table. Never write "Pass" for a command that was not executed in the current session.

## Migration documentation requirement

Document every migration:
- Migration folder name (timestamp + slug)
- What tables/columns it adds or changes
- Which story it belongs to

If migrations were applied manually (e.g. `prisma db push`), document that explicitly.

## Local PostgreSQL documentation requirement

State clearly whether only local PostgreSQL was used. The standard for PSL One is:

> All work uses local PostgreSQL (`psl_identity_dev` on Homebrew). No RDS, no cloud DB, no production data was touched.

If any other database was used, document it explicitly with justification.

## AWS / Terraform / no-production-touch confirmation

The handover must explicitly state:

- Whether AWS commands were run (default: No)
- Whether Terraform was run (default: No)
- Whether production databases were touched (default: No)
- Whether external services were called (default: No)

If any of these are "Yes", explain what was done and why.

## Recommended output format

File name: `SPRINT-N-HANDOVER.md` at repo root

Write in Markdown. Use tables for stories, criteria, migrations, and gate results. Keep each section factual and concise — this is a handover record, not a planning document.

## Commit procedure after handover

1. Run `git status` — confirm no generated artifacts staged
2. Unstage `.next/`, `dist/`, `node_modules/` if present
3. Confirm migrations, source files, tests, and documentation are staged
4. Commit with message: `feat: complete sprint N <brief description>`
5. Report commit hash and final `git status`
