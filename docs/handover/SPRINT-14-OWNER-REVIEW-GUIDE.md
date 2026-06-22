# Sprint 14 — Owner Review Guide

## Prerequisites

- Access to the Parse.bot dashboard to retrieve `PARSE_API_KEY`
- Local clone of the repo with dependencies installed (`pnpm install`)

---

## Steps

### 1. Set the API Key

Add the following to `apps/api/.env`:

```
PARSE_API_KEY=<your-key-here>
```

**Never commit this file to git.** It is covered by `.gitignore`.

---

### 2. Run the Health Check

```bash
node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-health.mjs
```

Expected: HTTP 200 with a valid JSON response confirming the API key is accepted.

---

### 3. Run the Fixtures Discovery Tool

```bash
node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-fixtures.mjs
```

Expected outcomes:
- `PARSE_PSL_FIXTURES_AVAILABLE` — psl.co.za has published new-season fixtures
- `PARSE_PSL_FIXTURES_SOURCE_EMPTY` — psl.co.za has not yet published fixtures; this is valid

If you see `PARSE_PSL_FIXTURES_SOURCE_EMPTY`, continue with steps 4 and 5. Do not treat this as a failure.

---

### 4. Run the Results Discovery Tool

```bash
node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-results.mjs
```

Expected: `PARSE_PSL_RESULTS_AVAILABLE` or `PARSE_PSL_RESULTS_EMPTY` (if no prior season results are available yet).

---

### 5. Run the Standings Discovery Tool

```bash
node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-standings.mjs
```

Expected: `PARSE_PSL_STANDINGS_AVAILABLE`.

---

### 6. Interpret Source-Empty Fixtures

If step 3 returned `PARSE_PSL_FIXTURES_SOURCE_EMPTY`:

- Confirm steps 4 and 5 returned data
- If results and standings are available, the adapter is healthy — the empty fixtures array is a source-data availability issue, not an adapter failure
- Record the state as `PARSE_PSL_FIXTURES_SOURCE_EMPTY` (accepted)
- Do not switch to another provider solely on this basis

---

### 7. Review Parse.bot Usage Terms

Review the Parse.bot service agreement and data usage policy before using live data in production. Confirm whether attribution of psl.co.za as the data source is required.

---

### 8. Review football-data.org Attribution Requirements

Review the football-data.org attribution requirements for World Cup 2026 data display. Confirm whether a logo or link is required on pages that show WC match data.

---

## What NOT to Do

| Action | Reason |
|---|---|
| Activate the PSL season | Premature — ingestion pipeline not yet built |
| Deploy to production with live provider keys | Pending EC2 migration and staging smoke |
| Apply EC2 migration without authorisation | Infrastructure change requiring explicit owner approval |
| Enable the data ingestion pipeline | Sprint 15 scope |
| Commit `.env` to git | Keys would be exposed publicly |
| Use Sportmonks | Rejected — do not provision a Sportmonks key |
| Enable betting or odds endpoints | Not implemented; must not be added |
