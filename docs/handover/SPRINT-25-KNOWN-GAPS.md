# Sprint 25 — Known Gaps

## GAP-25-01: PSL Fixtures Not Yet Available

**Severity:** INFO — expected behaviour
**Status:** OPEN — monitoring

The Parse PSL adapter returns `INGESTION_SOURCE_EMPTY_NOOP` because psl.co.za has not published the 2026/27 fixture schedule yet.

**Expected resolution:** ~July/August 2026 when psl.co.za publishes the schedule.

**Action:** Run `sprint-25-psl-fixture-availability-check.mjs` weekly. When `PSL_FIXTURE_CANDIDATES_FOUND`, proceed to Sprint 26 fixture import.

---

## GAP-25-02: API-Football PSL Account Suspended

**Severity:** LOW — backup provider unavailable
**Status:** OPEN — ongoing from Sprint 13

The API-Football adapter for PSL (competition ID 288) returns HTTP 200 but account is SUSPENDED. The primary provider chain falls through to ParsePslAdapter (psl.co.za).

**Impact:** If ParsePslAdapter fails, there is no active fallback with PSL fixtures. NoOpAdapter returns empty results.

**Action:** Owner to decide whether to renew API-Football account or proceed with Parse-only. Tracked since Sprint 13.

---

## GAP-25-03: No PSL 2026/27 Season Record

**Severity:** MEDIUM — blocks PSL activation
**Status:** OPEN — by design

No `Season` record exists for PSL 2026/27. The WC2026 season is active. PSL activation requires:
1. PSL 2026/27 season record created
2. Gameweeks defined
3. Fixtures imported and published

**Action:** Create PSL 2026/27 season record as first step of future PSL activation sprint.

---

## GAP-25-04: No Gameweeks for PSL 2026/27

**Severity:** MEDIUM — blocks PSL activation
**Status:** OPEN — by design

No gameweeks have been created for PSL 2026/27. Gameweek creation requires the fixture schedule to be known first.

**Action:** Create gameweeks once PSL 2026/27 fixtures are imported.

---

## Previously Open Gaps (Carried Forward)

| Gap | Description | Status |
|-----|-------------|--------|
| GAP-23-03 | PSL fixture data ~July/August | OPEN (now GAP-25-01) |
| GAP-23-04 | Provider key rotation runbook | OPEN |

---

## Resolved Gaps This Sprint

None — Sprint 25 is monitoring/tooling only, not fixing gaps.

## Platform Safety Status

PSL remains inactive. Wallet remains sandbox-only. No real-money functionality. No production ingestion.
