# Sprint 9 — Delivery Plan

## Goal
Make the beta/staging environment operationally ready, without production activation.

A beta operator should be able to:
- Apply migrations 41 and 42 to staging after explicit owner authorization
- Run provider validation using replacement server-side keys
- Compare Sportmonks vs SportsDataIO coverage
- Confirm challenge create/accept/settle/result flows against staging
- Run repeatable beta smoke tests
- Produce a go/no-go report for beta activation

## Branch
`feature/sprint-9-provider-validation-staging` from main `c4101fb9`

## Stories

| Story | Title | Description |
|-------|-------|-------------|
| S9-01 | Provider Replacement-Key Validation | Build safe discovery tooling; run when keys available |
| S9-02 | Staging Migration Apply Gate | Prepare runbook; apply only after explicit owner authorization |
| S9-03 | Staging Challenge Flow Smoke Suite | Idempotent staging-safe smoke scripts |
| S9-04 | Provider Decision Gate | Coverage comparison and recommendation |
| S9-05 | Beta Release Readiness Gate | Full go/no-go gate and handover package |

## Hard Constraints
- Do NOT activate PSL season
- Do NOT deploy production
- Do NOT activate production provider ingestion
- Do NOT run Terraform or mutate IAM
- Do NOT activate wallet production
- Do NOT add real-money functionality
- Do NOT commit provider key values
- Do NOT add NEXT_PUBLIC_* provider keys
- Do NOT apply staging migrations unless owner explicitly authorizes

## Owner Gates (require explicit authorization)
- Apply staging DB migrations
- Write provider keys to staging secret store
- Restart beta/staging services
- Deploy API/web to AWS beta
- Enable provider scheduled ingestion
- Activate PSL season

## Product State Going In
- PSL: INACTIVE
- World Cup 2026: ACTIVE (beta)
- Wallet: Sandbox-only
- Provider: NoOp (both Sportmonks and SportsDataIO BLOCKED_BY_REPLACEMENT_TOKEN)
- Staging migration: NOT APPLIED (migrations 41 and 42 pending)
- STORY-40: RESERVED
- API tests: 1,770 passing
- Experience tests: 500 passing
