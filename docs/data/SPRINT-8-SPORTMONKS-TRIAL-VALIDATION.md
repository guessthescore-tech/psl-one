# Sprint 8 — Sportmonks Trial Validation

## Status: BLOCKED_BY_REPLACEMENT_TOKEN

The previously exposed token has been revoked (or must be revoked immediately — see security note below).
A replacement token has not yet been placed in the server-side environment.

## Security note
ANY Sportmonks token previously shared in chat or pasted outside the repository must be treated as
compromised. Revoke it immediately at https://app.sportmonks.com/api-tokens and generate a replacement.

## How to activate trial validation
1. Log in to MySportmonks and create a new API token
2. Place the new token ONLY in:
   - Local `.env` file as `SPORTMONKS_API_KEY=<value>` (never commit this file)
   - OR staging SSM parameter `/psl-one/staging/SPORTMONKS_API_KEY` (if owner authorizes)
3. Run: `pnpm --filter @psl-one/api exec ts-node tools/data-provider-spike/sportmonks-discovery.ts`
4. Record results (without the token value) in SPRINT-8-PROVIDER-COVERAGE-RESULTS.md

## No-key validation (confirmed passing)
All adapter methods return safe empty arrays when no key is configured:
- `health()` → `{ available: false, message: "API key not configured — safe disabled mode" }`
- `getSeasons()` → `[]`
- `getFixtures(seasonId)` → `[]`
- `getTeams(seasonId)` → `[]`
- `getPlayers(teamId)` → `[]`
- `getStandings(seasonId)` → `[]`

Error handling confirmed working:
- 401: returns `[]` / `{ available: false }`
- 403: returns `[]` / `{ available: false }`
- 429: returns `[]` / `{ available: false }`
- Network error: returns `[]` / `{ available: false }`

## Frontend provider isolation confirmed
- No `SPORTMONKS_API_KEY` in any frontend file
- No `NEXT_PUBLIC_SPORTMONKS_*` variables
- No provider API calls from browser
