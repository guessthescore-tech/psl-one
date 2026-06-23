# Sprint 25 — Owner Review Guide

**Status:** Ready for Owner Review
**Date:** 2026-06-23

## Platform Safety Constraints

- PSL remains inactive. World Cup 2026 remains active beta context.
- Wallet remains sandbox-only. No production wallet activation.
- Fantasy remains points-only. No real-money integration.
- Guess the Score remains points-only. No real-money integration.
- Sponsor rewards remain non-financial (points, badges, digital experiences only).
- No production ingestion. No scheduled ingestion.
- No real-money functionality.

## What to Review

This sprint adds 49 new portal pages across three portals. The owner should verify:

### 1. Admin Portal (visit /admin/overview)

- Confirm "PSL INACTIVE" badge is prominently displayed
- Confirm "WC 2026 ACTIVE" badge is shown
- Confirm "WALLET SANDBOX" badge is shown
- Confirm "GTS POINTS ONLY" and "FANTASY POINTS ONLY" badges are shown
- Review open owner gates list — these are the pending actions
- Visit /admin/readiness — review launch checklist

### 2. Rules Management

- Visit /admin/rules/guess-the-score
- Confirm "GTS_POINTS_ONLY Declaration" section is visible
- Confirm no cash or wagering language appears

- Visit /admin/rules/fantasy
- Confirm "FANTASY_POINTS_ONLY Declaration" section is visible
- Confirm no cash or wagering language appears

### 3. Club Portal (visit /club/overview)

- Confirm "PSL INACTIVE" notice is shown
- Confirm NO league activation button is visible (it's admin-only)
- Review squad, fixtures — both show "pending PSL activation" messages

### 4. Sponsor Portal (visit /sponsor/overview)

- Confirm "NON-FINANCIAL REWARDS" badge is shown
- Confirm SPONSOR_REWARDS_NON_FINANCIAL declaration is visible

- Visit /sponsor/rewards
- Confirm full non-financial declaration is visible
- Confirm no cash, prize money, or monetary vouchers are listed

- Visit /sponsor/billing-placeholder
- Confirm SANDBOX MODE badge is shown
- Confirm no real payment details are collected

### 5. Safety Scan

Run the secret scan to confirm no keys are committed:
```bash
grep -r "ADMIN_TOKEN\|PARSE_API_KEY\|API_FOOTBALL_KEY\|x-apisports-key" apps/experience/src/lib/
```
Expected: CLEAN (no results)

## Actions After Review

- If satisfied: Approve PR #25
- If changes needed: Comment on PR with specific feedback
- When ready to activate PSL: Provide explicit written authorisation to agent
- When ready to supply provider keys: Provide in secure channel (not in code)
