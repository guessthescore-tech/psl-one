# Domain: Fan Onboarding

## Overview

The onboarding system derives progress from existing data — no new database table is required.

## Onboarding Steps

| Step | Field | Data Source |
|------|-------|-------------|
| profileCreated | `FanProfile.displayName` is not null | fanProfile query |
| favouriteTeamSet | `FanProfile.preferredTeamId` is not null | fanProfile query |
| firstPredictionMade | `ScorePrediction` count > 0 | count query |
| firstChallengeCreated | `PredictionChallenge` count where creatorUserId | count query |

## API

```
GET /account/onboarding   (requires JWT)
Response:
{
  isComplete: boolean,
  steps: {
    profileCreated: boolean,
    favouriteTeamSet: boolean,
    firstPredictionMade: boolean,
    firstChallengeCreated: boolean
  },
  completedSteps: number,
  totalSteps: number (= 4)
}
```

## Frontend

Page: `/account/onboarding`
- Shows progress bar with 4 segments
- Each step is a link to the relevant action page
- Completed steps show strikethrough + gold checkmark
- DESIGN_REVIEW_DATA mode shows sample 2/4 progress
- Unauthenticated users see design-review sample

## Favourite Team (already live)

The favourite team step is wired via:
- `apps/experience/src/app/account/favourite-team/page.tsx`
- Calls `updateProfile({ preferredTeamId: teamId })` via `@/lib/profile-api`
- Backend: `PATCH /profile` → `ProfileService.updateProfile`
- No changes needed in Sprint 6 — already working
