# Sprint 23 — Story Matrix

## Sprint Goal

Investigate and fix admin RBAC role mismatch (GAP-22-01). Confirm `.env` hygiene. Add guard test coverage.

## Stories

| Story | Title | Status |
|-------|-------|--------|
| S23-01 | RBAC investigation — `@Roles('ADMIN')` root cause | DONE |
| S23-02 | Fix — `@Roles('PSL_ADMIN')` in 3 controllers | DONE |
| S23-03 | HTTP-level guard tests — fixture publication | DONE |
| S23-04 | HTTP-level guard tests — data provider | DONE |
| S23-05 | HTTP-level guard tests — prediction challenges | DONE |
| S23-06 | `.env` hygiene investigation and confirmation | DONE |
| S23-07 | Security docs — investigation, fix, env hygiene | DONE |
| S23-08 | Handover docs | DONE |
| S23-09 | Experience tests | DONE |

## Test Counts

| Suite | Before | After | Delta |
|-------|--------|-------|-------|
| API tests | 1,932 | 1,968 | +36 |
| Experience tests | 861 | 884 | +23 |

## Migration Count

**Sprint 23 migrations added: 0**  
Cumulative total: **42**

## New Models / Enums / Routes / Pages

- New models: 0
- New enums: 0
- New API routes: 0
- New web pages: 0
- New security docs: 3
- New handover docs: 5
- New spec files: 3

## Key Technical Output

| Item | Detail |
|------|--------|
| Root cause | `@Roles('ADMIN')` — not a `UserRole` enum value |
| Files fixed | `fixture-publication.controller.ts`, `data-provider.controller.ts`, `prediction-challenges.controller.ts` |
| Decorators changed | 5 (`@Roles('ADMIN')` → `@Roles('PSL_ADMIN')`) |
| New spec files | `fixture-publication-admin-http.spec.ts`, `data-provider-admin-http.spec.ts`, `prediction-challenges-admin-http.spec.ts` |
| `.env` hygiene | Not tracked in git — correctly gitignored via `apps/*/.env` |

## Platform State

| Item | State |
|------|-------|
| PSL | INACTIVE |
| WC2026 | ACTIVE |
| Wallet | SANDBOX |
| Ingestion | DISABLED |
| Beta EC2 | RBAC fix not yet deployed (pending Sprint 24) |

## Beta Go/No-Go

**CONDITIONAL_GO**

Code fix complete, tests pass. Beta EC2 deployment pending owner authorisation in Sprint 24.
