# Sprint 6 Data Model Plan

## New Model: PredictionChallenge

Table: `prediction_challenges`  
Migration: `20260621000002_prediction_challenge_token`

### Purpose
Shareable token-based challenge where the creator doesn't need to know the acceptor's email upfront. The challenge is valid for 72 hours from creation.

### Fields
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| token | TEXT UNIQUE | crypto.randomBytes(24).base64url |
| fixture_id | TEXT FK | → fixtures.id |
| creator_user_id | TEXT FK | → users.id |
| creator_home_score | INT | Creator's predicted home score |
| creator_away_score | INT | Creator's predicted away score |
| acceptor_user_id | TEXT FK? | → users.id (null until accepted) |
| acceptor_home_score | INT? | Acceptor's prediction |
| acceptor_away_score | INT? | Acceptor's prediction |
| status | PredictionChallengeStatus | PENDING on creation |
| expires_at | TIMESTAMP | now() + 72h |
| accepted_at | TIMESTAMP? | Set on acceptance |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

### Status Transitions
- PENDING → ACCEPTED (when acceptor submits scores)
- PENDING → EXPIRED (when expiresAt passes)
- PENDING → CANCELLED (future: creator cancels)
- PENDING → LOCKED (when fixture starts before acceptance)

## AuditEvent Extensions
- `CHALLENGE_TOKEN_CREATED` — recorded when creator calls POST /predictions/challenges
- `CHALLENGE_TOKEN_ACCEPTED` — recorded when acceptor calls POST /predictions/challenges/:token/accept

## No New Models Needed
- Onboarding status is derived from existing data (FanProfile, ScorePrediction counts, PredictionChallenge counts)
- Analytics uses structured logging only — no persistence table in preview mode
