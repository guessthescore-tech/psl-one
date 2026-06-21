# Sprint 8 — Preview Status

## Status: FRONTEND_READY_BACKEND_STAGING_MIGRATION_PENDING

## Current preview
URL: https://psl-one-experience-preview-cxb5urftw-guess-the-score.vercel.app

## What is ready (frontend)
- Homepage with live fixture list
- /predict — Guess the Score
- /predict/challenge — Create token challenge
- /predict/challenge/accept — Accept challenge + view settled result
- /predict/challenge/result — Challenge result (routes to accept with token)
- /fantasy — Fantasy hub (design review data)
- /account — Account management
- All pages gated as noindex (X-Robots-Tag: noindex)

## What is pending (backend staging)
- Migrations 41–43 applied to staging DB (additive, safe)
- Sportmonks replacement token placed in staging SSM
- Settlement auto-trigger wired in staging (requires migration 43)

## Data mode
DESIGN_REVIEW_DATA — WC2026 mock data; PSL INACTIVE

## Instructions for owner
1. No action needed to view the preview — it is already live
2. To test live challenge settlement, staging backend migration must be applied first
3. See docs/handover/SPRINT-8-STAGING-MIGRATION-RUNBOOK.md
