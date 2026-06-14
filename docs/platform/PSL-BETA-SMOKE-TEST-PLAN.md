# PSL Beta Smoke Test Plan

> Status: READY  
> Last updated: 2026-06-14 (STORY-39)  
> Registry: 24 tests across 16 areas — all non-destructive — no activation routes

## Overview

The smoke test registry (`BetaLaunchSmokeTestService`) provides a 24-item descriptive inventory of key API routes to verify before and after beta cohort invite. All tests:
- Are `destructive: false`
- Use only GET or (safe) POST methods for read-only checks
- Do not include any activation route
- Return `activationRouteAbsent: true` in the summary

## Running Smoke Tests

```
GET  /admin/beta-launch/smoke-tests        # view registry
POST /admin/beta-launch/smoke-tests/run    # log audit event + return summary
```

Both require `PSL_ADMIN` role.

## Registry

| # | Area | Route | Method | Expected |
|---|------|-------|--------|----------|
| 1 | authentication | /health | GET | 200 |
| 2 | fan home | / | GET | 200 |
| 3 | active season | /seasons/admin/context | GET | 200 |
| 4 | prepared season | /seasons/admin/switching/readiness/:id | GET | 200 |
| 5 | clubs | /clubs | GET | 200 |
| 6 | players | /players | GET | 200 |
| 7 | fixtures | /fixtures | GET | 200 |
| 8 | standings | /match-centre/standings/:seasonId | GET | 200 |
| 9 | Match Centre | /admin/match-centre/capability-status | GET | 200 |
| 10 | Fantasy | /fantasy/team | GET | 200 |
| 11 | Fantasy | /admin/fantasy/rules | GET | 200 |
| 12 | Guess the Score | /predictions | GET | 200 |
| 13 | social predictions | /social-predictions/leaderboard | GET | 200 |
| 14 | social predictions | /social-predictions/listings | GET | 200 |
| 15 | direct challenges | /social-prediction/challenges/incoming | GET | 200 |
| 16 | leaderboards | /leaderboards | GET | 200 |
| 17 | Fan Value | /fan-value/ledger | GET | 200 |
| 18 | campaigns | /campaigns | GET | 200 |
| 19 | rewards | /rewards | GET | 200 |
| 20 | wallet sandbox | /wallet/status | GET | 200 |
| 21 | notifications | /notifications | GET | 200 |
| 22 | admin operations | /admin/operations/readiness | GET | 200 |
| 23 | season switching | /seasons/admin/context | GET | 200 |
| 24 | rollback readiness | /admin/beta-launch/overview | GET | 200 |

## Safety Guarantees

- `activationRouteAbsent: true` — confirmed programmatically; no route contains 'activate'
- `allNonDestructive: true` — all registry items have `destructive: false`
- `destructiveRoutesAbsent: true` — confirmed programmatically
- Running `POST /admin/beta-launch/smoke-tests/run` only writes an `AdminAuditLog` entry; it does not execute HTTP calls against the API in production context

## Pre-Beta Sign-off

Before inviting the beta cohort, confirm:
- [ ] Registry returns 24 items
- [ ] `activationRouteAbsent: true`
- [ ] `allNonDestructive: true`
- [ ] Audit log entry written for smoke test run
- [ ] No `status: 'FAIL'` items (all start as `NOT_RUN`)
