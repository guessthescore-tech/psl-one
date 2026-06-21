# Sprint 7 — Experience API Wiring Matrix

## Challenge Routes (Updated Sprint 7)

| Route | Method | Wired To | Auth Required | Sprint |
|-------|--------|----------|---------------|--------|
| `/predict/challenge/accept?token=:token` | GET page | `GET /predictions/challenges/:token` | No | S4 |
| `/predict/challenge/accept?token=:token` | Accept action | `POST /predictions/challenges/:token/accept` | Yes | S4 |
| `/predict/challenge/accept?token=:token` | Result fetch (SETTLED) | `GET /predictions/challenges/:token/result` | No | **S7** |

## New in Sprint 7

### Challenge Settlement Result
- Page: `apps/experience/src/app/predict/challenge/accept/page.tsx`
- When `challenge.status === 'SETTLED'`:
  1. Fetch `GET /predictions/challenges/:token/result`
  2. Display final fixture score
  3. Display creator and acceptor predictions with points
  4. Display winner or draw announcement
  5. Show "Points only · no real money" disclaimer

### Settlement Data Shape
```typescript
type ChallengeResult = {
  id: string;
  status: 'SETTLED';
  creatorHomeScore: number;
  creatorAwayScore: number;
  acceptorHomeScore: number | null;
  acceptorAwayScore: number | null;
  creatorPoints: number | null;
  acceptorPoints: number | null;
  winnerUserId: string | null;
  settlementReason: string | null;
  settledAt: string | null;
  fixture: {
    id: string;
    status: string;
    homeScore: number | null;
    awayScore: number | null;
    homeTeam: { id: string; name: string; shortName: string; slug: string };
    awayTeam: { id: string; name: string; shortName: string; slug: string };
  };
}
```

## Security Notes

- Provider API key (`SPORTMONKS_API_KEY`) is NOT used anywhere in experience app
- No `NEXT_PUBLIC_SPORTMONKS*` vars
- All provider calls go through `apps/api` only
