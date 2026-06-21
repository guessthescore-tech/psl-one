# Sprint 6 Owner Review Guide

## Things to Verify

### 1. Challenge Flow

Visit `https://psl-one-experience.vercel.app/predict` (or local)

1. Select a fixture → Predict → should navigate to `/predict/challenge?fixture=...&h=1&a=1`
2. On challenge page: if not signed in → click Create → should show sign-in prompt
3. If signed in → click Create → should call `POST /predictions/challenges` → show share sheet with `?token=` URL
4. Share the token URL, open in a different browser/incognito → should load challenge via `GET /predictions/challenges/:token`
5. Try to accept → if not signed in → shows sign-in prompt
6. Accept with different score → should succeed
7. Try to accept again → should say "already accepted"
8. Try to accept your own challenge → should say "cannot accept own challenge"

### 2. Onboarding Page

Visit `/account/onboarding`
- Should show 4 steps with progress bar
- Signed-in fan with no profile: all steps unchecked
- After setting favourite team: step 2 checked
- After making a prediction: step 3 checked
- After creating a challenge: step 4 checked

### 3. Provider Health (Admin)

```
GET /admin/data-provider/health   (requires admin JWT)
Expected: { available: false, provider: "no-op", message: "No provider configured" }
```

### 4. Analytics Event

```
POST /analytics/events
Body: { event: "prediction_submitted", properties: { fixtureId: "xxx" } }
Expected: 202 { accepted: true }
```

## No-Regret Checks

- [ ] PSL season is INACTIVE (run `GET /football/seasons` — check `isActive: false` for PSL)
- [ ] No wallet amounts shown to fans (search UI for "R " or "ZAR")
- [ ] Challenge token URLs do not appear in API error responses
- [ ] Analytics events do not include password/token/secret fields
