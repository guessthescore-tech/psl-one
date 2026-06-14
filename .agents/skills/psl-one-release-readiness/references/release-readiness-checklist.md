# PSL One — Release Readiness Checklist

## Section 1: Code Quality Gate

Run all nine commands in order. All must exit 0.

```bash
pnpm --filter @psl-one/api db:seed          # first seed run
pnpm --filter @psl-one/api db:seed          # second seed run — confirms idempotency
pnpm --filter @psl-one/api prisma validate  # valid schema
pnpm --filter @psl-one/api typecheck        # zero type errors
pnpm --filter @psl-one/api test             # all tests pass
pnpm --filter @psl-one/api build            # clean build
pnpm --filter @psl-one/web typecheck        # zero type errors
pnpm --filter @psl-one/web test             # all web tests pass
pnpm --filter @psl-one/web build            # clean build
```

| Gate | Baseline | Required |
|------|---------|---------|
| API spec files | 61 | ≥ 61 + new files |
| API tests passing | 1,645 | ≥ 1,645 + new tests |
| Web pages | 337 | ≥ 337 + new pages |
| Migrations | 39 | 39 + any new migrations |

---

## Section 2: Non-Negotiable Rules

- [ ] Every admin controller has `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles('PSL_ADMIN')`
- [ ] Every admin mutation writes `AdminAuditLog`
- [ ] No business logic in `apps/web/src/lib/` or web pages
- [ ] No module accesses another module's Prisma tables
- [ ] Every new service method has at least one test

---

## Section 3: Safety Invariants

- [ ] PSL season (`PSL Premiership 2026/27`) remains NOT activated
- [ ] World Cup 2026 data unchanged
- [ ] No season activation endpoint added
- [ ] No real-money path added
- [ ] Fantasy, predictions, social prediction: points-only
- [ ] Wallet: `SiliconEnterpriseSandboxWalletAdapter` only
- [ ] No production live-data provider calls
- [ ] No provider secrets in source files

---

## Section 4: Database

- [ ] All migrations are additive (no DROPs)
- [ ] Migration applied and verified: `pnpm --filter @psl-one/api prisma migrate status`
- [ ] Seed is idempotent (run twice, both succeed)
- [ ] No migration files rewritten

---

## Section 5: Documentation

- [ ] `docs/reference/API-ROUTES.md` updated with new routes
- [ ] `docs/reference/DATABASE-MODELS.md` updated with new models
- [ ] `docs/reference/MIGRATIONS.md` updated with new migrations
- [ ] `docs/project/CURRENT-STATE.md` counts updated
- [ ] ADR created if qualifying architectural decision made (next: ADR-028)
- [ ] `docs/adr/README.md` updated if ADR added

---

## Section 6: Security (S3-INFRA-00 Controls)

Verify these controls are still present after every story:

- [ ] `AuthThrottleGuard` still registered in `AuthModule`
- [ ] `parseCorsOrigins()` still used in `main.ts`
- [ ] `trustProxy` still conditional on `nodeEnv`
- [ ] Security headers `onSend` hook still present
- [ ] Password reset token still stored as SHA-256 hash

---

## Section 7: Commit Readiness

- [ ] `git status` is clean (no uncommitted changes)
- [ ] `git diff --stat` shows only the intended files
- [ ] No `.env` files staged
- [ ] No generated files staged (`node_modules/`, `dist/`, `.next/`)
- [ ] Awaiting explicit "commit this" instruction

---

## Section 8: Staging Prerequisites (when infrastructure exists)

Not yet applicable — S3-INFRA-01 containerisation not deployed.

When staging is live, additionally verify:
- [ ] Docker image builds successfully
- [ ] ECS task definition updated
- [ ] `prisma migrate deploy` succeeds against staging database
- [ ] Smoke test plan passes (24 items in `docs/platform/PSL-BETA-SMOKE-TEST-PLAN.md`)
- [ ] Security headers verified via curl against staging URL
- [ ] Season switching readiness: all 13 checks pass

---

## Story Completion Report Template

```
## Story: STORY-XX — [Title]

### Acceptance gate
- API typecheck: PASS
- API test: PASS (X tests, up from Y)
- API build: PASS
- Web typecheck: PASS
- Web build: PASS
- Prisma validate: PASS

### Counts
- Spec files: XX (was YY)
- Tests passing: XXXX (was YYYY)
- Web pages: XXX (was YYY)
- Migrations: XX (was YY)

### Non-negotiable rules: ALL SATISFIED
### Safety invariants: ALL SATISFIED

### Awaiting: "commit this"
```
