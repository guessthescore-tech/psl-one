# Sprint 25 — Owner Review Guide

## What to Review

Sprint 25 is a documentation and tooling sprint. There is nothing to visually test in the browser. Review the following:

---

## 1. Tool Scripts (2 files)

**`tools/staging/sprint-25-psl-fixture-availability-check.mjs`**
- Calls `POST /admin/data-provider/parse-psl/fixtures/ingest` with `dryRun=true` always
- Reads `ADMIN_TOKEN` from env — never prints the token
- Interprets `SOURCE_EMPTY` as info, not failure
- Exits 0 for both SOURCE_EMPTY and candidates-found
- Exits non-zero only for auth failures or server errors

**`tools/staging/sprint-25-team-resolution-readiness.mjs`**
- Reads `/clubs` endpoint — no writes
- Compares seeded club names against expected PSL canonical names
- Normalised matching handles common suffix variations ("FC", "United", etc.)
- Reports `TEAM_RESOLUTION_READY` or `TEAM_RESOLUTION_WARNINGS`

---

## 2. Confirm Safety Constraints

Verify the following by reading tool source code:

- [ ] Both tools use `dryRun=true` in all API calls — no `dryRun:false` anywhere
- [ ] Neither tool triggers `confirmWrite:true`
- [ ] Neither tool activates PSL or creates a season record
- [ ] Neither tool enables scheduled or production ingestion
- [ ] Neither tool calls any wallet production endpoint

---

## 3. Staging Docs

Read `docs/staging/SPRINT-25-OWNER-APPROVAL-GATES.md` and confirm:

- [ ] All Gate Set A gates are listed as BLOCKED or NOT YET
- [ ] No gate has been marked as approved without your sign-off
- [ ] The immutable constraints section is correct

---

## 4. Activation Boundary

Read `docs/staging/SPRINT-25-PSL-ACTIVATION-BOUNDARY.md` and confirm:

- [ ] The boundary table correctly shows "NO" for all write operations
- [ ] PSL activation prerequisites list is accurate

---

## 5. CI Checks

Once the PR is pushed, confirm 7/7 CI checks pass:
- test-api
- test-experience
- security-scan
- lint (if applicable)
- typecheck-api
- typecheck-experience
- build-experience

---

## Owner Sign-Off

If satisfied, the PR may be merged. No EC2 deployment is needed for Sprint 25 (docs/tooling only).

If any issue is found, file it as a Gap in `SPRINT-25-KNOWN-GAPS.md` and determine if it is a blocker.

## Platform Safety Status

PSL remains inactive. Wallet remains sandbox-only. No real-money functionality. No production ingestion.
