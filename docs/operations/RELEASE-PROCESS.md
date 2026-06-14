# PSL One — Release Process

**Purpose:** How stories are completed and changes released  
**Audience:** Engineers, delivery team  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Current Release Process (Sprint 2)

Sprint 2 used a direct-to-main workflow. Each story was:

1. Developed with all tests passing
2. Validated against acceptance criteria
3. Accepted by product
4. Committed to `main` with `feat:` prefix commit message

No feature branches, no PRs, no staging environment in Sprint 2.

---

## Story Acceptance Criteria

Before a story is accepted:

- [ ] All new service methods have tests
- [ ] Tests passing: `pnpm --filter @psl-one/api test`
- [ ] TypeCheck passing: `pnpm --filter @psl-one/api typecheck` and `pnpm --filter @psl-one/web typecheck`
- [ ] Build passing: `pnpm --filter @psl-one/api build` and `pnpm --filter @psl-one/web build`
- [ ] Admin audit logs written for all admin mutations
- [ ] RBAC guard on all admin routes
- [ ] No business logic in frontend
- [ ] No PSL season activated
- [ ] No real money movement
- [ ] Relevant documentation updated

---

## Planned Release Process (Sprint 3)

Sprint 3 will introduce:

1. **Feature branches** — `feature/<story-name>`
2. **Pull Requests** — required review before merge
3. **CI gate** — all checks must pass on PR
4. **Staging deployment** — automatic on merge to `main`
5. **Production deployment** — manual trigger after staging validation

---

## Version Tracking

Programme state is tracked in:

- `BetaFeedbackService.getProgrammeState()` — current story, test count, page count
- `docs/project/CURRENT-STATE.md` — authoritative totals
- `docs/project/STORY-INDEX.md` — story-by-story status

---

## Story Numbering

Stories follow `STORY-NN` format:

- STORY-00 through STORY-25: Sprint 0 and Sprint 1
- STORY-26 through STORY-39: Sprint 2
- STORY-40: RESERVED — Official PSL Data Finalisation
- STORY-41+: Sprint 3 stories (not yet assigned)

---

## Commit Message Convention

```
feat: <short description of what was delivered>
```

Examples:
```
feat: add psl beta launch readiness and frontend showcase
feat: add live match intelligence and social prediction gaming
feat: add media sponsor campaigns and wallet activation foundation
```

One commit per story. Stories are not squashed.

---

## Hotfix Process

For urgent fixes in the current sprint:

1. Fix in the development environment
2. Run full test suite
3. Commit with `fix:` prefix: `fix: correct player externalId lookup to use findFirst`
4. Document if the fix reveals a pattern to avoid in future

---

## Documentation Update Rule

When a story ships, update:

- `docs/project/CURRENT-STATE.md` — verified counts
- `docs/project/STORY-INDEX.md` — story status
- Relevant domain docs if new capabilities added
- `BetaFeedbackService` programme state method
- `AdminOperationsService` module readiness array
