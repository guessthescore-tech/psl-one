# Sprint 18 — Owner Review Guide

## Purpose

This guide helps the product owner review Sprint 18 changes and decide whether to merge and deploy.

---

## What to Review

### 1. New API Routes (RBAC)

Both new routes require an `ADMIN` role JWT. Verify:

```
GET  /admin/fixtures/imported  → @Roles('ADMIN') ✓
POST /admin/fixtures/publish   → @Roles('ADMIN') ✓
GET  /admin/psl/preflight      → @Roles('ADMIN') ✓
```

Source: `apps/api/src/fixture-import/fixture-publication.controller.ts`

### 2. Fixture Publication Does Not Activate PSL

Verify in `fixture-publication.service.ts`:
- `publishFixtures()` only calls `prisma.fixture.updateMany({ data: { isPublished: ... } })`
- No `season.update`, no `isActive: true`, no activation logic

### 3. Pre-Flight Is Read-Only

Verify in `psl-activation-preflight.service.ts`:
- All DB calls are `findFirst`, `findUnique`, `count` — no mutations
- Only `adminAuditLog.create` is a write, and it's in a try/catch

### 4. Wallet Check Is Correct

Verify the `wallet_sandbox_only` check uses `WalletProviderDetail` (the correct model):

```typescript
const nonSandboxProviders = await this.prisma.walletProviderDetail.count({
  where: { status: { not: 'SANDBOX' } },
});
```

### 5. No Provider Keys in Frontend

Verify `apps/experience/src/lib/fixture-publication-api.ts` and both admin pages contain no:
- `PARSE_API_KEY`
- `NEXT_PUBLIC_PARSE_API_KEY`

### 6. Admin Pages Are Client-Only

Both admin pages have `'use client'` at the top and make no SSR API calls.

### 7. confirmPublication Guard

Verify the `/admin/fixtures/publish` endpoint throws if `confirmPublication` is not `true`. This prevents accidental bulk-publish operations.

---

## Test Counts

- API tests: 1,932 PASS (added 43 new tests in Sprint 18)
- Experience tests: 766 PASS (added 25 new tests in Sprint 18)

---

## CI Checks

All 7 CI checks must be green before merging:
1. typecheck (api)
2. typecheck (experience)
3. test (api)
4. test (experience)
5. build (api)
6. build (experience)
7. codex:validate

---

## No Migrations

Sprint 18 adds no new Prisma migrations. Migration count remains at 42. No DB changes required on EC2.

---

## Owner Go / No-Go Questions

Before merging, confirm:

1. **Is this the right time to merge Sprint 18?** The fixture publishing workflow is ready but has no data to work with yet (PSL fixtures not published by psl.co.za until ~July/August 2026). Merging now is safe — it just adds admin tools that will be useful when data arrives.

2. **Is PSL activation still deferred?** YES — Sprint 18 does not activate PSL. Owner must explicitly trigger activation via Season Switching when all pre-flight checks pass.

3. **Is EC2 deployment authorised?** This must be separately authorised. Sprint 18 can be merged to `main` independently of EC2 deployment.

4. **Is the wallet in SANDBOX mode?** YES — the pre-flight check enforces this. No production wallet activation has occurred.

---

## Merge Instructions

When ready to merge:

1. Check all CI checks are green on the PR
2. Approve the PR
3. Merge with merge commit (no squash/rebase)
4. Do NOT delete the branch (per project convention)
5. Do NOT push to EC2 without separate authorisation
