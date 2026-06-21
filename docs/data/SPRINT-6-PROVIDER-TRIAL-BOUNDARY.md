# Sprint 6: Provider Trial Boundary

## Principle

The live data provider API key (`SPORTMONKS_API_KEY`) must NEVER appear in:
- Frontend source code
- `NEXT_PUBLIC_*` environment variables
- Browser network requests (directly)
- Git history

All provider calls go through the PSL One NestJS API, which acts as a secure proxy.

## Adapter Architecture

```
Admin request → DataProviderController (admin-only, JWT + RBAC)
             → DataProviderService
             → SportmonksAdapter (if SPORTMONKS_API_KEY set)
             → NoOpAdapter (if key not set — safe empty responses)
```

## Safe Mode

If `SPORTMONKS_API_KEY` is not set in the environment:
- `health()` returns `{ available: false, message: 'No provider configured' }`
- All data methods return empty arrays `[]`
- No network calls are made
- No errors are thrown

This ensures the backend can start and operate in staging/CI without a real API key.

## Current Status

- Trial API key: NOT YET ACQUIRED (as of Sprint 6)
- Adapter: NoOpAdapter active
- Admin health endpoint: responds with `available: false`
- Production data ingestion: NOT enabled

## Next Steps (Future Sprints)

1. Acquire Sportmonks trial/production API key
2. Set `SPORTMONKS_API_KEY` in SSM at `/psl-one/staging/SPORTMONKS_API_KEY`
3. Implement `getFixtures()` and `getTeams()` in SportmonksAdapter
4. Build admin ingestion job to sync fixtures from provider to DB
5. ADR-030 (DRAFT) covers provider selection rationale
