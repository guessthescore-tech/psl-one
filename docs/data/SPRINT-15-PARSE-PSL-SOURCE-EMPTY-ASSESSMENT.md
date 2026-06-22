# Sprint 15 — Parse PSL Source-Empty Assessment

## Assessment Status: PENDING_KEY — Cannot Confirm Until PARSE_API_KEY Set

Once the key is set, the source-empty state can be confirmed by running:
```bash
node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-fixtures.mjs
```

## What Source-Empty Means

When the Parse PSL adapter calls `get_fixtures` and receives an empty array `[]`, this is called **source-empty**.

Source-empty does not mean the adapter is broken. It means psl.co.za has not published the fixtures for the upcoming season.

## When Source-Empty Is Expected

The Betway Premiership (PSL) season typically runs August–May. Fixture lists for the new season are usually published 1–2 months before the August kick-off.

As of 2026-06-22, a source-empty result is expected because:
- The 2025/26 season has recently ended.
- The 2026/27 season fixtures are unlikely to be published yet.
- psl.co.za historically publishes fixtures in June–July.

## Adapter Handling (Implemented)

`ParsePslAdapter.getFixtures()` handles source-empty correctly:

```typescript
const fixtures: PfFixture[] =
  (data as PfFixturesResponse).fixtures ?? (Array.isArray(data) ? (data as PfFixture[]) : []);
return fixtures.map(f => ({ ... }));
```

- Empty `[]` returned from `get_fixtures` → `getFixtures()` returns `[]` → callers handle empty gracefully.
- No exception is thrown.
- Health check is not marked failed on source-empty.

## Owner Decision When Fixtures Are Available

Once psl.co.za publishes new-season fixtures, the owner should:
1. Re-run `sprint-14-parse-psl-fixtures.mjs` to confirm `PARSE_PSL_FIXTURES_AVAILABLE`.
2. Run `sprint-15-parse-fixture-dry-run.mjs` to preview normalised fixture data.
3. Review `docs/data/SPRINT-15-FIXTURE-INGESTION-DESIGN.md` and approve the ingestion design.
4. Authorise the first manual ingestion run (separate owner-approved action).

## Alternative Paths If Source-Empty Persists

| Option | Risk | Notes |
|--------|------|-------|
| Wait for PSL to publish | Low | Expected seasonal cycle |
| Use football-data.org for WC only | None | Already live |
| Activate API-Football after account reactivation | Medium | Account still suspended |
| Scrape PSL historical results for testing | Medium | Parse `get_results` may have prior data |

## Related Documents

- `docs/data/SPRINT-15-PARSE-PSL-LIVE-VALIDATION.md`
- `docs/data/SPRINT-15-FIXTURE-INGESTION-DESIGN.md`
- `docs/handover/SPRINT-14-KNOWN-GAPS.md` — G7
