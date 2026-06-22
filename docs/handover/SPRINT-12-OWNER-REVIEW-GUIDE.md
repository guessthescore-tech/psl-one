# Sprint 12 — Owner Review Guide

Follow these steps in order. Do not skip steps. Do not commit any `.env` file at any point.

---

## Step 1: Set football-data.org key locally

Obtain a football-data.org API key from https://www.football-data.org/client/register (free tier is sufficient for WC).

Add to `apps/api/.env` (this file must never be committed):
```
FOOTBALL_DATA_API_KEY=<your-key-here>
```

---

## Step 2: Run the football-data.org health check

```bash
node --env-file=apps/api/.env tools/discovery/sprint-12-football-data-health.mjs
```

Expected: HTTP 200, account details returned, no authentication error. If this fails, check the key is correct and the account is active.

---

## Step 3: Run the football-data.org World Cup validation

```bash
node --env-file=apps/api/.env tools/discovery/sprint-12-football-data-worldcup.mjs
```

Expected: WC fixtures list, team list, and standings all returned without error. Record the result before proceeding.

---

## Step 4: Set the adapter selector locally

Add to `apps/api/.env`:
```
DATA_PROVIDER=football-data-org
```

This activates `FootballDataOrgAdapter` for local testing. The `NoOpAdapter` remains the default when this line is absent.

---

## Step 5: Verify no NEXT_PUBLIC_ keys in the frontend

```bash
grep -r "NEXT_PUBLIC_FOOTBALL_DATA\|NEXT_PUBLIC_API_FOOTBALL\|NEXT_PUBLIC_ESPN" apps/experience apps/web 2>/dev/null
```

Expected: no matches. If any matches are found, remove them immediately and raise it as a security issue.

---

## Step 6: Obtain an API-Football trial key

Register at https://api-sports.io and obtain a trial key for API-Football (v3).

Add to `apps/api/.env`:
```
API_FOOTBALL_KEY=<your-key-here>
```

---

## Step 7: Run the API-Football PSL validation

```bash
node --env-file=apps/api/.env tools/discovery/sprint-11-provider-coverage.mjs
```

Expected: league 288 (PSL) fixtures accessible, player stats present, standings returned. If league 288 returns no data or a 404, PSL cannot be activated via API-Football and G2/G6 in `SPRINT-12-KNOWN-GAPS.md` must be addressed.

---

## What NOT to Do Without Explicit Authorisation

| Action | Why it is blocked |
|---|---|
| Activate PSL (`approvalStatus = ACTIVE`) | PSL provider not yet confirmed (G2, G6) |
| Deploy to production | All six GO conditions must be met first |
| Apply EC2 staging migration | Requires fresh plan + explicit owner authorisation |
| Enable production data ingestion | Provider validation must pass first |
| Enable wallet production mode | Separate gate required |
| Re-engage Sportmonks | Rejected in Sprint 10; reversal requires new owner decision |
| Commit any `.env` file | Keys must never enter version control |
| Enable any odds or betting add-on | Platform is points-only — forbidden |
