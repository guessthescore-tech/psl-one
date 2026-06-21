# Domain: Prediction Challenges

## Two Challenge Systems

PSL One has two distinct challenge systems:

### 1. PeerChallenge (existing — Sprint 4/5)
- Requires knowing the opponent's email address
- Located in `apps/api/src/challenges/`
- Controller: `ChallengesController`
- Use case: challenging a known friend by email

### 2. PredictionChallenge (Sprint 6 — token-based)
- No opponent knowledge required at creation time
- Shareable link with a unique cryptographic token
- Located in `apps/api/src/prediction-challenges/`
- Controller: `PredictionChallengesController`
- Use case: sharing a challenge link via WhatsApp/social media

## PredictionChallenge Lifecycle

```
Creator POST /predictions/challenges
  → token generated (crypto.randomBytes(24).base64url)
  → status: PENDING, expiresAt: now() + 72h
  → AuditEvent: CHALLENGE_TOKEN_CREATED

Acceptor GET /predictions/challenges/:token
  → shows creator's scores and fixture details
  → if expired: status updated to EXPIRED
  → if fixture LIVE/HALF_TIME/FINISHED: status updated to LOCKED

Acceptor POST /predictions/challenges/:token/accept
  → validates: not expired, not self-challenge, fixture not started
  → sets acceptorUserId, acceptorHomeScore, acceptorAwayScore
  → status: ACCEPTED, acceptedAt: now()
  → AuditEvent: CHALLENGE_TOKEN_ACCEPTED
```

## Security Rules

1. Creator cannot accept their own challenge (`ForbiddenException`)
2. Only PENDING challenges can be accepted
3. Expired challenges (expiresAt < now) are auto-transitioned to EXPIRED
4. Locked challenges (fixture started) are auto-transitioned to LOCKED
5. Tokens are 192-bit entropy — not guessable
6. No monetary value, wagering, or betting — points only

## Non-Goals (Sprint 6)

- No settlement/scoring logic (post-match points attribution — planned for future)
- No leaderboard integration (future sprint)
- No notification to creator when accepted (future sprint)
