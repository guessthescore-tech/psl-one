# Sprint 25 — Sponsor Portal Scope

**Status:** Beta Ready
**Date:** 2026-06-23

## Platform Safety Constraints

- PSL remains inactive. World Cup 2026 remains active beta context.
- Wallet remains sandbox-only. No production wallet activation.
- Fantasy remains points-only. No real-money integration.
- Guess the Score remains points-only. No real-money integration.
- Sponsor rewards remain non-financial (points, badges, digital experiences only). No cash payouts.
- No production ingestion. No scheduled ingestion.
- No real-money functionality.

## Scope

The Sponsor Portal provides SPONSOR_ADMIN users with campaign management, audience targeting, and analytics.

### Pages (13 total)

| Route | Purpose |
|---|---|
| /sponsor | Redirect to /sponsor/overview |
| /sponsor/overview | Sponsor dashboard with non-financial declaration |
| /sponsor/profile | Brand profile management |
| /sponsor/campaigns | Campaign list |
| /sponsor/campaigns/new | New campaign creator — non-financial rewards only |
| /sponsor/audiences | Audience segments |
| /sponsor/activations | Campaign trigger history |
| /sponsor/rewards | Reward catalogue — NON-FINANCIAL ONLY declaration prominent |
| /sponsor/analytics | Campaign performance analytics |
| /sponsor/clubs | PSL club partnerships (INACTIVE) |
| /sponsor/assets | Brand asset management |
| /sponsor/billing-placeholder | Sandbox billing placeholder |
| /sponsor/settings | Sponsor settings |

### SPONSOR_REWARDS_NON_FINANCIAL Enforcement

Every rewards-adjacent page declares that all sponsor rewards are:
- Points (PSL points with no financial value)
- Badges (digital badges)
- Digital experiences

The sponsor rewards page explicitly lists the non-financial declaration and prohibits:
- Cash payouts
- Prize money
- Vouchers with monetary value
- Any gambling or wagering activity

The billing page is a sandbox placeholder — no real transactions.
