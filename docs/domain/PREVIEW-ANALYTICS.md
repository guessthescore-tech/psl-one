# Domain: Preview Analytics

## Purpose

Structured event tracking for the beta period. Provides visibility into the fan onboarding funnel and key interactions without requiring a third-party analytics platform.

## Architecture

```
Frontend (experience app)
  → analytics.ts (sanitize + fire-and-forget)
  → POST /analytics/events

Backend (NestJS)
  → PreviewAnalyticsController (unauthenticated)
  → PreviewAnalyticsService
  → Structured JSON log (no database, no third-party)
```

## Allowed Events

| Event | When to fire |
|-------|-------------|
| registration_started | Fan clicks sign up |
| registration_completed | Fan successfully registers |
| sign_in_completed | Fan logs in |
| favourite_team_selected | Fan saves favourite team |
| onboarding_started | Fan visits /account/onboarding |
| onboarding_step_completed | Fan completes a step |
| onboarding_completed | All 4 steps done |
| prediction_submitted | Fan makes a prediction |
| challenge_created | Fan creates a challenge link |
| challenge_accepted | Fan accepts a challenge |
| share_clicked | Fan taps a share button |
| share_completed | Native share completed |
| league_created | Fan creates a fantasy league |
| league_joined | Fan joins a fantasy league |
| account_deletion_requested | Fan requests account deletion |
| password_changed | Fan changes password |

## Security

Forbidden fields (stripped before sending):
- password
- token
- wallet
- apiKey / api_key
- secret
- authorization
- Bearer

## Production Considerations

- In preview/beta mode: logs to NestJS logger as structured JSON
- No PII in event properties (user ID is handled server-side if needed)
- Frontend uses `trackEvent()` which never throws — analytics failures are silent
- `PREVIEW_ANALYTICS_ENABLED=false` in production disables logging
