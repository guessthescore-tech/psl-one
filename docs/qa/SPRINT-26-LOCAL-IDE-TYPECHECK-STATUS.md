# Sprint 26 — Local IDE Typecheck Status

**Date:** 2026-06-23
**Sprint:** 26 (Controlled User Testing)
**Branch:** feature/sprint-26-controlled-user-testing

## Summary

| Package               | Command                                          | Status |
|-----------------------|--------------------------------------------------|--------|
| `@psl-one/api`        | `pnpm --filter @psl-one/api typecheck`           | PASS   |
| `@psl-one/experience` | `pnpm --filter @psl-one/experience typecheck`    | PASS   |

No type errors present on this branch.

## Known Warning (Tech Debt)

TypeScript may emit the following deprecation notice:

```
Option 'moduleResolution' value 'node10' is deprecated and will stop functioning in TypeScript 7.0.
```

**Classification:** LOW tech debt — does NOT block builds, tests, or deployment.

**Decision:** Do NOT change `tsconfig.json` settings in this sprint. The `moduleResolution` change
requires validation across all Next.js + NestJS import paths and is deferred to a dedicated
tech-debt sprint.

**Tracking:** Logged as GAP-26-07 in `SPRINT-26-KNOWN-GAPS.md`.

## Safety Confirmations

- PSL remains inactive.
- Wallet remains sandbox-only.
- No typecheck fix introduced schema changes or API changes.
- No provider keys appear in compiled output.
