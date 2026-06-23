# Sprint 26 — Fan Experience UAT

**Date:** 2026-06-23
**Sprint:** 26 (Controlled User Testing)
**Overall Status:** PASS (World Cup beta confirmed working)

PSL: INACTIVE | GTS: POINTS_ONLY | Fantasy: POINTS_ONLY | No betting / No cash prizes

---

## Summary

World Cup 2026 is the active beta context. Fan experience routes are fully functional with
points-only prediction, points-only fantasy, and no real-money, betting, or cash prize language.
PSL remains inactive and will be activated only after owner approval and fixture publication.

---

## Validation Checklist

| Check                                              | Result  | Notes                                        |
|----------------------------------------------------|---------|----------------------------------------------|
| World Cup beta works                               | PASS    | WC 2026 active, fixtures published           |
| GTS points-only (no cash)                         | PASS    | Points-only label on predict page            |
| Fantasy points-only (no cash)                     | PASS    | Points-only label on fantasy page            |
| No betting language on any fan page               | PASS    | No "betting", "odds", "wager", "stake"       |
| No cash prize language                            | PASS    | No "cash prize", "win money", "jackpot"      |
| No odds displayed                                 | PASS    | No odds anywhere in experience app           |
| PSL INACTIVE — no PSL fixtures visible to fans    | PASS    | PSL season inactive; WC2026 shown            |
| Predict page accessible to fans                   | PASS    | `/predict` renders                           |
| Challenge flow accessible to fans                 | PASS    | `/predict/challenge` renders                 |
| Challenge accept flow accessible to fans          | PASS    | `/predict/challenge/accept` renders          |
| Fantasy page accessible to fans                   | PASS    | `/fantasy` renders                           |
| Account page accessible to authenticated fans     | PASS    | `/account` renders                           |
| Homepage public (no auth required)                | PASS    | `/` returns 200 for anonymous visitors       |

---

## Route Matrix

| Route                        | Expected Behaviour                                        | Status  | Notes                              |
|------------------------------|-----------------------------------------------------------|---------|------------------------------------|
| `/`                          | World Cup 2026 homepage — public, no auth required        | PASS    | Hero, fixtures, feature hub shown  |
| `/predict`                   | Match prediction list — POINTS_ONLY, WC2026 fixtures      | PASS    | Points-only label present          |
| `/predict/challenge`         | Direct challenge creation — POINTS_ONLY                   | PASS    | Points-only, no cash language      |
| `/predict/challenge/accept`  | Accept incoming challenge — POINTS_ONLY                   | PASS    | Points-only, no cash language      |
| `/fantasy`                   | Fantasy team management — POINTS_ONLY                     | PASS    | Points-only label present          |
| `/account`                   | Fan profile, preferences, notifications                   | PASS    | Account management UI renders      |

---

## Key Safety Verifications

### POINTS_ONLY — GTS (Guess the Score)
- Prediction pages display "points-only" copy.
- No monetary rewards offered for predictions.
- No odds, spreads, or probabilities displayed to fans.
- Challenge results award points only.

### POINTS_ONLY — Fantasy
- Fantasy team management is points-only.
- No real-money entry fees.
- No cash prizes for league winners.
- Points and leaderboard position only.

### No Betting Language
The following terms must NOT appear in fan-facing pages:
- "betting" — NOT present
- "odds" — NOT present
- "wager" — NOT present
- "stake" (financial) — NOT present
- "bookmaker" — NOT present
- "cash prize" — NOT present
- "win money" — NOT present

Confirmed via spec tests in `experience.spec.ts`.

### World Cup 2026 Beta Context
- World Cup 2026 is the active season for beta testing.
- WC2026 fixtures are published and visible to fans.
- PSL season is INACTIVE — PSL fixtures not yet published (expected ~July/Aug 2026).

---

## Overall Status: PASS

**World Cup beta experience is working. Fan journey is safe, points-only, and ready for
controlled user testing.**

No conditions block fan testing. PSL content will be available once PSL activation is
owner-approved and PSL fixtures are published.
