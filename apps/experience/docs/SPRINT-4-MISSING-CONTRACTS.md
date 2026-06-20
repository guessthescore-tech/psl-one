# Sprint 4 — Missing Backend Contracts

**Story:** STORY-S4-03, STORY-S4-04  
**Date:** 2026-06-20

The following backend API contracts are referenced by `apps/experience` frontend pages but do not yet have backend implementations. Each entry documents: the domain model, API contract, database impact, acceptance criteria, tests, and implementation status.

---

## CONTRACT-01: Password Change

**Frontend route:** `/account/security`  
**Priority:** HIGH  
**Risk:** LOW — standard auth pattern, no new models needed

### Domain Model
No new model. Operates on `User` entity (email + hashed password).

### API Contract
```
POST /auth/password/change
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": string,
  "newPassword": string    // min 8 chars, complexity TBD
}

Response 200: { message: "Password updated" }
Response 400: { message: "Current password incorrect" }
Response 422: { message: "New password too weak" }
```

### Database Impact
- None. Updates existing `User.password` hash.
- No migration required.

### Acceptance Criteria
- Validates current password matches stored hash
- New password meets strength requirements
- Returns generic error to avoid enumeration
- Emits audit event

### Tests Required
- correct current password → 200
- wrong current password → 400
- weak new password → 422
- unauthenticated → 401

### Implementation Status
**MISSING** — `/account/security` uses `DESIGN_REVIEW_DATA` fallback

---

## CONTRACT-02: Account Deletion Request (POPIA)

**Frontend route:** `/account/delete`  
**Priority:** HIGH  
**Risk:** MEDIUM — POPIA implications; must not delete immediately

### Domain Model
```typescript
AccountDeletionRequest {
  id: string
  userId: string
  requestedAt: DateTime
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'WITHDRAWN'
  confirmedAt: DateTime?
  processedAt: DateTime?
  processedBy: string?  // admin user
  reason: string?
}
```

### API Contract
```
POST /account/deletion-request
Authorization: Bearer <token>
Content-Type: application/json

{
  "confirmationText": "DELETE MY ACCOUNT"  // explicit typing required
}

Response 201: {
  requestId: string,
  status: "PENDING",
  message: "Request received. Your account will be deleted within 30 days per POPIA."
}
```

### Database Impact
- New `AccountDeletionRequest` table (1 migration)
- Does NOT immediately delete user data
- Processing is done by admin after compliance review
- User data retained until `processedAt` per POPIA

### Acceptance Criteria
- Fan must type exact confirmation string
- Request creates audit log entry
- Fan receives email confirmation (via notifications)
- User cannot create multiple pending requests
- Admin can review and process via existing admin panel

### Tests Required
- valid confirmation → 201
- wrong confirmation text → 400
- duplicate pending request → 409
- unauthenticated → 401

### Implementation Status
**MISSING** — Page shows POPIA explanation but no submission

---

## CONTRACT-03: Awards Endpoint

**Frontend route:** `/stats/awards`  
**Priority:** MEDIUM  
**Risk:** LOW — read-only, no writes

### Domain Model
Reuses existing `Achievement` and `User` models.

### API Contract
```
GET /api/awards/season/:seasonId
(or GET /api/awards?seasonId=)

Response 200: {
  topScorer: { player: PlayerSummary, goals: number },
  topAssister: { player: PlayerSummary, assists: number },
  playerOfTheTournament: { player: PlayerSummary },
  goldenGlove: { player: PlayerSummary },
  teamOfTheTournament: PlayerSummary[],
}
```

### Database Impact
None. Aggregates from existing `PlayerMatchStats` and `Fixture` data.

### Acceptance Criteria
- Returns awards for the active season
- Handles no data (season in progress)
- Caches result 5 minutes

### Implementation Status
**MISSING** — Page uses design review data only

---

## CONTRACT-04: Hall of Fame Endpoint

**Frontend route:** `/stats/hall-of-fame`  
**Priority:** MEDIUM  
**Risk:** LOW — read-only

### API Contract
```
GET /api/hall-of-fame?type=all-time-scorers|season-winners|fan-champions
&limit=20
&seasonId=optional

Response 200: {
  entries: Array<{
    rank: number,
    player?: PlayerSummary,
    club?: ClubSummary,
    fan?: FanSummary,
    stat: string,
    value: number,
    season?: string,
  }>
}
```

### Database Impact
None. Aggregates existing data.

### Implementation Status
**MISSING** — Page uses design review data

---

## CONTRACT-05: Player Comparison

**Frontend route:** `/stats/compare`  
**Priority:** LOW  
**Risk:** LOW — read-only

### API Contract
```
GET /api/football/players/compare?ids=id1,id2&seasonId=seasonId

Response 200: {
  players: Array<{
    player: PlayerSummary,
    stats: PlayerSeasonStats,
    fantasyPoints: number,
    fantasyPrice: number,
  }>
}
```

### Database Impact
None. Aggregates from `PlayerMatchStats`.

### Implementation Status
**MISSING** — Page uses design review data

---

## CONTRACT-06: Fantasy Stats Summary

**Frontend route:** `/fantasy/stats`  
**Priority:** MEDIUM  
**Risk:** LOW — read-only

### API Contract
```
GET /fantasy/stats/summary
Authorization: Bearer <token>

Response 200: {
  totalPoints: number,
  globalRank: number,
  weeklyRank: number,
  teamValue: number,
  transfersMade: number,
  highestGameweekPoints: number,
  averagePoints: number,
  pointsHistory: Array<{ gameweek: number, points: number, rank: number }>
}
```

### Database Impact
None. Aggregates from `FantasyTeam`, `FantasyGameweekScore`, `FanValueLedger`.

### Implementation Status
**MISSING** — Page uses design review data

---

## CONTRACT-07: Fixture Difficulty Rating

**Frontend route:** `/fantasy/fixture-difficulty`  
**Priority:** LOW  
**Risk:** MEDIUM — FDR algorithm design needed

### Notes
The FDR algorithm requires:
1. Home/away advantage weighting
2. Current team form
3. Defensive record
4. Head-to-head history

This is a substantial algorithm that needs ADR before implementation.

### Implementation Status
**MISSING** — Algorithm design deferred. Page uses design review data with a static FDR matrix.

---

## Safe Assumptions Applied

- All missing contracts fall back to `DESIGN_REVIEW_DATA` — no production claims
- No missing contract blocks access to any core journey
- High priority contracts (password change, deletion request) affect security/POPIA but do not block beta preview
- All missing contracts have typed interfaces in the frontend; they will fall back to design review data if the API call fails

---

## Deferred Backend Contracts (Not Sprint 4 Scope)

| Contract | Reason Deferred |
|---------|----------------|
| Quiz engine | Requires content authoring system |
| Badge QR scan | Requires physical event infrastructure |
| Sponsor impression tracking | Requires real sponsor campaigns |
| Push notification device registration | Requires FCM/APNs setup |
| Media article full text | Requires CMS integration |
