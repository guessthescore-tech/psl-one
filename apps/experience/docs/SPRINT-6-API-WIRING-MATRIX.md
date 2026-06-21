# Sprint 6 Frontend → Backend API Wiring Matrix

## Challenge Pages

| Frontend File | Action | API Call | Status |
|--------------|--------|----------|--------|
| `/predict/challenge/page.tsx` | Create challenge | `POST /predictions/challenges` | WIRED |
| `/predict/challenge/page.tsx` | Design review fallback | URL params (legacy) | WIRED |
| `/predict/challenge/accept/page.tsx` | Load challenge by token | `GET /predictions/challenges/:token` | WIRED |
| `/predict/challenge/accept/page.tsx` | Accept challenge | `POST /predictions/challenges/:token/accept` | WIRED |
| `/predict/challenge/accept/page.tsx` | Legacy URL params | No API call | WIRED |

## Onboarding Page

| Frontend File | Action | API Call | Status |
|--------------|--------|----------|--------|
| `/account/onboarding/page.tsx` | Load onboarding status | `GET /account/onboarding` | WIRED |
| `/account/favourite-team/page.tsx` | Save favourite team | `PATCH /profile` (via `profile-api.ts`) | ALREADY LIVE |

## Analytics

| Frontend File | Action | API Call | Status |
|--------------|--------|----------|--------|
| `src/lib/analytics.ts` | Track event | `POST /analytics/events` | WIRED |

## Auth Handling

All authenticated endpoints handle `UNAUTHORIZED` errors by:
1. Challenge page: showing sign-in prompt with return URL
2. Challenge accept page: showing sign-in prompt with token in return URL
3. Analytics: silently swallowed (fire-and-forget)

## Design Review Fallback

When `NEXT_PUBLIC_DATA_MODE=DESIGN_REVIEW_DATA` (or not set):
- Challenge create: uses legacy URL params, no API call
- Challenge accept: uses legacy URL params from URL, no API call
- Onboarding: shows sample 2/4 progress from `DESIGN_REVIEW_STATUS`
- Analytics: still calls API (not gated on mode)
