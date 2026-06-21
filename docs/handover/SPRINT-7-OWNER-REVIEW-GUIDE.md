# Sprint 7 — Owner Review Guide

## What to Review

### 1. Challenge Settlement UI

Path: `/predict/challenge/accept?token=<token>`

To test with a settled challenge:
1. Create a challenge via the API: `POST /predictions/challenges`
2. Accept it via the API: `POST /predictions/challenges/:token/accept`
3. Mark the fixture as FINISHED in the DB (or wait for a real match to finish)
4. Admin: `POST /predictions/challenges/:token/settle`
5. Visit the accept page — should show settled state

What to check:
- Final score displayed correctly
- Points breakdown (creator vs acceptor)
- Winner name or "Draw!" displayed
- "Points only · no real money" visible
- No financial language anywhere

### 2. Sportmonks Adapter (API)

No visible UI — reviewed by:
1. Checking `GET /admin/data-provider/health` (returns `available: false` without API key)
2. Adding trial API key to `.env` and checking health returns `available: true`

### 3. Security Check

Run: `grep -RIn 'SPORTMONKS_API_KEY' apps/experience/src` — should return nothing.

---

## Files Changed This Sprint

See SPRINT-7-FILE-OWNERSHIP.md for complete list.

---

## Test Results

Run: `pnpm --filter @psl-one/api test` and `pnpm --filter @psl-one/experience test`

All tests should pass green.

---

## PR

See PR description for complete story list and security attestation.
