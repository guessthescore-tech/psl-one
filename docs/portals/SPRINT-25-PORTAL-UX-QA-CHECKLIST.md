# Sprint 25 — Portal UX/QA Checklist

**Status:** Beta Ready
**Date:** 2026-06-23

## Platform Safety Constraints

- PSL remains inactive. World Cup 2026 remains active beta context.
- Wallet remains sandbox-only. No production wallet activation.
- Fantasy remains points-only. No real-money integration.
- Guess the Score remains points-only. No real-money integration.
- Sponsor rewards remain non-financial (points, badges, digital experiences only).
- No production ingestion. No scheduled ingestion.
- No real-money functionality.

## QA Checklist

### Safety Checks (Must Pass Before Owner Review)

- [ ] PSL INACTIVE badge visible on admin/overview
- [ ] No activation buttons exposed without owner gate
- [ ] GTS rules page shows POINTS ONLY declaration
- [ ] Fantasy rules page shows POINTS ONLY declaration
- [ ] Sponsor rewards page shows NON-FINANCIAL declaration
- [ ] Billing page shows SANDBOX MODE badge
- [ ] Club portal overview shows no league activation controls
- [ ] No provider keys in any frontend source
- [ ] No ADMIN_TOKEN in any frontend source

### Admin Portal

- [ ] /admin redirects to /admin/overview
- [ ] /admin/overview shows all 5 safety flags
- [ ] /admin/overview shows open owner gates list
- [ ] /admin/competitions shows PSL as INACTIVE
- [ ] /admin/seasons shows PSL INACTIVE warning
- [ ] /admin/fixtures shows SOURCE_EMPTY notice
- [ ] /admin/readiness shows pass/pending/fail counts

### Club Portal

- [ ] /club redirects to /club/overview
- [ ] /club/overview shows PSL INACTIVE notice
- [ ] /club/overview does NOT show league activation button
- [ ] /club/squad shows empty state with PSL activation note
- [ ] /club/fixtures shows SOURCE_EMPTY notice

### Sponsor Portal

- [ ] /sponsor redirects to /sponsor/overview
- [ ] /sponsor/overview shows NON-FINANCIAL declaration
- [ ] /sponsor/rewards shows full non-financial declaration list
- [ ] /sponsor/campaigns/new only shows non-financial reward options
- [ ] /sponsor/billing-placeholder shows SANDBOX MODE badge

### Accessibility

- [ ] All buttons have accessible labels
- [ ] All form inputs have associated labels
- [ ] All tables have aria-labels
- [ ] Dialog has role="dialog" aria-modal="true"

### Responsiveness

- [ ] Sidebar is visible on desktop
- [ ] Tables scroll horizontally on mobile
- [ ] Metric cards wrap on small screens
