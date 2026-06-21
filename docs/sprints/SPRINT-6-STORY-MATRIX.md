# Sprint 6 Story Matrix

## S6-01: Provider Trial Boundary

- **Goal:** Establish clean adapter interface for live data provider (Sportmonks trial)
- **Files:** `apps/api/src/data-provider/` (5 files)
- **API:** `/admin/data-provider/health`, `/admin/data-provider/discovery/*`
- **Safe mode:** NoOpAdapter returns empty arrays when `SPORTMONKS_API_KEY` is unset
- **Security:** API key never forwarded to frontend, never in `NEXT_PUBLIC_*` env vars

## S6-02: Durable Prediction Challenge Backend

- **Goal:** Replace localStorage-only challenge links with server-backed token challenges
- **Files:** `apps/api/src/prediction-challenges/` (6 files), migration 41
- **Token:** `crypto.randomBytes(24).base64url` — unguessable
- **Guards:** self-accept blocked, duplicate accept blocked, expired blocked, locked blocked
- **Audit:** CHALLENGE_TOKEN_CREATED, CHALLENGE_TOKEN_ACCEPTED
- **Frontend:** `/predict/challenge/page.tsx` calls `POST /predictions/challenges`
- **Frontend:** `/predict/challenge/accept/page.tsx` loads via `GET /predictions/challenges/:token`

## S6-03: Fan Onboarding Journey

- **Goal:** Show fans their progress through key onboarding steps
- **Files:** `apps/api/src/account/account-onboarding.service.ts`, `/account/onboarding/page.tsx`
- **API:** `GET /account/onboarding` — derived from existing data, no new tables
- **Steps:** profileCreated, favouriteTeamSet, firstPredictionMade, firstChallengeCreated
- **Favourite team:** Already wired via `PATCH /profile` + `profile-api.ts`

## S6-04: Preview Analytics Adapter

- **Goal:** Structured event tracking for beta user journey analysis
- **Files:** `apps/api/src/preview-analytics/` (4 files), `apps/experience/src/lib/analytics.ts`
- **Security:** sanitizes password, token, wallet, apiKey, secret, authorization
- **Backend:** structured log only in preview mode — no third-party calls
- **Frontend:** fire-and-forget, swallows errors silently
