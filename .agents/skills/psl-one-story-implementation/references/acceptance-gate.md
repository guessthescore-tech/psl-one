# PSL One — Story Acceptance Gate

## Gate Commands

Run all nine in order. All must pass. No tolerance for failures.

```bash
# 1. First seed run
pnpm --filter @psl-one/api db:seed

# 2. Second seed run — confirms idempotency (must succeed on an already-seeded database)
pnpm --filter @psl-one/api db:seed

# 3. Prisma schema validation
pnpm --filter @psl-one/api prisma validate

# 4. API type check
pnpm --filter @psl-one/api typecheck

# 5. API unit tests (all must pass; count must increase over baseline)
pnpm --filter @psl-one/api test

# 6. API production build
pnpm --filter @psl-one/api build

# 7. Web type check
pnpm --filter @psl-one/web typecheck

# 8. Web unit tests
pnpm --filter @psl-one/web test

# 9. Web production build
pnpm --filter @psl-one/web build
```

## Pass Criteria

| Gate | Pass criterion |
|------|---------------|
| API db:seed | Exit code 0; idempotent on second run |
| API prisma validate | Exit code 0; schema reports valid |
| API typecheck | Exit code 0; zero TypeScript errors |
| API test | Exit code 0; all tests passing; count ≥ baseline + expected new tests |
| API build | Exit code 0; `dist/` produced without errors |
| Web typecheck | Exit code 0; zero TypeScript errors |
| Web test | Exit code 0; all web tests passing |
| Web build | Exit code 0; `.next/` produced without warnings about missing pages |

## Baseline (as of S3-INFRA-00, 2026-06-14)

| Metric | Baseline |
|--------|---------|
| API spec files | 61 |
| API tests passing | 1,645 |
| Web pages | 337 |
| Prisma migrations | 39 |

Every story must increase API spec file count and API test count. Stories with new web pages must increase the web page count.

## Optional: Migration status check (when schema changes present)

```bash
pnpm --filter @psl-one/api prisma migrate status
# Expected output: all migrations applied
```

## Seed idempotency (run twice)

```bash
pnpm --filter @psl-one/api db:seed   # first run
pnpm --filter @psl-one/api db:seed   # second run — must also succeed
```

## After the gate passes

Report results to the user. Do NOT commit. Wait for explicit "commit this" instruction.

Do NOT push. Wait for explicit "push it" instruction.

Commit message format when instructed:
```
feat: <short description of what was delivered>
fix: <short description of what was fixed>
```
