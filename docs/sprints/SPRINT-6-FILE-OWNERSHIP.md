# Sprint 6 File Ownership

## New API Files

| File | Story | Owner |
|------|-------|-------|
| `apps/api/src/prediction-challenges/prediction-challenges.service.ts` | S6-02 | Backend |
| `apps/api/src/prediction-challenges/prediction-challenges.controller.ts` | S6-02 | Backend |
| `apps/api/src/prediction-challenges/prediction-challenges.module.ts` | S6-02 | Backend |
| `apps/api/src/prediction-challenges/dto/create-prediction-challenge.dto.ts` | S6-02 | Backend |
| `apps/api/src/prediction-challenges/dto/accept-prediction-challenge.dto.ts` | S6-02 | Backend |
| `apps/api/src/prediction-challenges/prediction-challenges.service.spec.ts` | S6-02 | Backend |
| `apps/api/src/data-provider/provider-adapter.interface.ts` | S6-01 | Backend |
| `apps/api/src/data-provider/sportmonks.adapter.ts` | S6-01 | Backend |
| `apps/api/src/data-provider/no-op.adapter.ts` | S6-01 | Backend |
| `apps/api/src/data-provider/data-provider.service.ts` | S6-01 | Backend |
| `apps/api/src/data-provider/data-provider.controller.ts` | S6-01 | Backend |
| `apps/api/src/data-provider/data-provider.module.ts` | S6-01 | Backend |
| `apps/api/src/data-provider/data-provider.service.spec.ts` | S6-01 | Backend |
| `apps/api/src/preview-analytics/preview-analytics.service.ts` | S6-04 | Backend |
| `apps/api/src/preview-analytics/preview-analytics.controller.ts` | S6-04 | Backend |
| `apps/api/src/preview-analytics/preview-analytics.module.ts` | S6-04 | Backend |
| `apps/api/src/preview-analytics/dto/track-event.dto.ts` | S6-04 | Backend |
| `apps/api/src/preview-analytics/preview-analytics.service.spec.ts` | S6-04 | Backend |
| `apps/api/src/account/account-onboarding.service.ts` | S6-03 | Backend |
| `apps/api/src/account/account-onboarding.service.spec.ts` | S6-03 | Backend |

## Modified API Files

| File | Change | Story |
|------|--------|-------|
| `apps/api/prisma/schema.prisma` | Added PredictionChallenge model, PredictionChallengeStatus enum, AuditEvent extensions | S6-02 |
| `apps/api/src/app.module.ts` | Added 3 new module imports | S6-01/02/04 |
| `apps/api/src/account/account.controller.ts` | Added GET /account/onboarding route | S6-03 |
| `apps/api/src/account/account.module.ts` | Added AccountOnboardingService provider | S6-03 |

## New Frontend Files

| File | Story |
|------|-------|
| `apps/experience/src/app/account/onboarding/page.tsx` | S6-03 |
| `apps/experience/src/lib/analytics.ts` | S6-04 |

## Modified Frontend Files

| File | Change | Story |
|------|--------|-------|
| `apps/experience/src/app/predict/challenge/page.tsx` | Wired to POST /predictions/challenges | S6-02 |
| `apps/experience/src/app/predict/challenge/accept/page.tsx` | Wired to GET/POST /predictions/challenges/:token | S6-02 |
| `apps/experience/src/lib/experience.spec.ts` | Added S6-01..S6-04 test suites | All |

## New Migration

| File | Story |
|------|-------|
| `apps/api/prisma/migrations/20260621000002_prediction_challenge_token/migration.sql` | S6-02 |
