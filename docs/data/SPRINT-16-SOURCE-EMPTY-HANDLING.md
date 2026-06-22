# Sprint 16 — Source-Empty Handling

## Confirmed State (2026-06-22)

Parse PSL API is reachable. `get_fixtures` returns `[]`.

This is `INGESTION_SOURCE_EMPTY_NOOP` — a valid seasonal state.

## Why Source-Empty Is Not An Error

1. The 2025/26 Betway Premiership season has concluded.
2. psl.co.za publishes new-season fixtures approximately 4–6 weeks before the August kick-off.
3. The Parse API correctly returns an empty array when psl.co.za has no fixture data published.
4. The adapter, service, and CLI all handle this case as a success.

## Code Handling

### Adapter (`parse-psl.adapter.ts`)

```typescript
const fixtures: PfFixture[] =
  (data as PfFixturesResponse).fixtures ?? (Array.isArray(data) ? (data as PfFixture[]) : []);
return fixtures.map(f => ({ ... }));
// Empty array returned for source-empty — no exception
```

### Service (`parse-psl-fixture-ingestion.service.ts`)

```typescript
if (providerFixtures.length === 0) {
  result.sourceStatus = 'SOURCE_EMPTY';
  // Returns immediately — no DB writes, no errors
  return result;
}
```

### CLI script (`sprint-16-parse-fixture-ingestion-dry-run.mjs`)

```javascript
if (rawFixtures.length === 0) {
  console.log('[INGESTION_SOURCE_EMPTY_NOOP] ...');
  process.exit(0); // Success — not a failure
}
```

## CI Behaviour

Source-empty does **not** fail CI. All tests mock the adapter to return `[]` and assert
`sourceStatus === 'SOURCE_EMPTY'` with no errors.

## When Fixtures Become Available

When psl.co.za publishes the 2026/27 season:

1. `sprint-14-parse-psl-fixtures.mjs` → `PARSE_PSL_FIXTURES_AVAILABLE`
2. `sprint-16-parse-fixture-ingestion-dry-run.mjs` → `INGESTION_DRY_RUN_NORMALIZED`
3. Owner reviews normalized output
4. Owner triggers write run: `POST /admin/data-provider/parse-psl/fixtures/ingest` with `dryRun=false`
5. No PSL season activation is triggered by ingestion

## Timeline Estimate

| Date | Expected State |
|------|---------------|
| June 2026 | `SOURCE_EMPTY` (current) |
| July 2026 | Likely still `SOURCE_EMPTY` |
| Late July / August 2026 | `FIXTURES_AVAILABLE` — re-run dry-run to confirm |
