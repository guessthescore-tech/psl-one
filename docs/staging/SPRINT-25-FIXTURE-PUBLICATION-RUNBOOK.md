# Sprint 25 — Fixture Publication Runbook

> **STATUS: NOT AUTHORISED**
>
> Fixture publication (`isPublished = true`) may only occur after:
> 1. Fixture import write has been completed and verified (see `SPRINT-25-FIXTURE-IMPORT-WRITE-RUNBOOK.md`)
> 2. Owner has reviewed imported fixtures and approved publication
> 3. All publication gates below are satisfied
>
> None of these steps may be executed during Sprint 25.

---

## Pre-Publication Gates

| Gate | Description | Status |
|------|-------------|--------|
| P01 | Fixture import write complete and verified | NOT YET |
| P02 | Fixture count matches expected season schedule | NOT YET |
| P03 | All fixtures have valid kickoff times (not null/past) | NOT YET |
| P04 | All fixtures have resolved homeTeam and awayTeam | NOT YET |
| P05 | Owner reviews all fixtures in admin UI | NOT YET |
| P06 | PSL season preflight passes (all 13+ checks green) | NOT YET |
| P07 | Owner explicitly authorises publication | NOT YET |

---

## Publication Procedure (Owner-Authorised Only)

### Step 1: Preflight check

```bash
curl -s http://localhost:4000/admin/psl/preflight \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"
```

All checks must be green before publication.

### Step 2: Publish fixtures for a gameweek or batch

```bash
# Publish individual fixture (OWNER AUTHORISED ONLY)
curl -s -X PATCH http://localhost:4000/admin/fixtures/<fixture-id>/publish \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"confirm": true}'
```

Or use the admin fixture management UI at `/admin/fixtures`.

### Step 3: Verify publication

```bash
# Fixtures published count should match
curl -s http://localhost:4000/admin/fixtures/imported \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"
```

### Step 4: PSL season activation (SEPARATE GATE)

Fixture publication does **NOT** activate the PSL season. Season activation is a separate, later step requiring the full activation preflight (13+ checks). Do not conflate publication with activation.

---

## Rollback (Publication)

To un-publish a fixture:

```bash
curl -s -X PATCH http://localhost:4000/admin/fixtures/<fixture-id>/unpublish \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"
```

Un-publishing removes the fixture from the fan-facing endpoints but does not delete it.

---

## Safety Constraints (Immutable)

- Publication does not activate PSL season
- Published fixtures are visible to fans (fixture list, predictions eligibility)
- Unpublished fixtures are invisible to fans
- No real-money, no betting, no odds at any point
