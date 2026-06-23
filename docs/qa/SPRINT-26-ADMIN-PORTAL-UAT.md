# Sprint 26 — Admin Portal UAT

**Date:** 2026-06-23
**Sprint:** 26 (Controlled User Testing)
**Overall Status:** CONDITIONAL_PASS

PSL: INACTIVE | Wallet: SANDBOX | Fantasy: POINTS_ONLY | GTS: POINTS_ONLY

---

## Validation Checklist

| Check                                           | Result         | Notes                                              |
|-------------------------------------------------|----------------|----------------------------------------------------|
| PSL INACTIVE badge visible on overview          | PASS           | Badge present in admin overview safety copy        |
| SANDBOX badge visible on wallet pages           | PASS           | Wallet sandbox copy confirmed in admin             |
| POINTS_ONLY copy on GTS rules page              | PASS           | GTS points-only label confirmed                    |
| POINTS_ONLY copy on Fantasy rules page          | PASS           | Fantasy points-only label confirmed                |
| Source-empty state shown (no PSL fixtures)      | PASS           | SOURCE_EMPTY shown on fixture readiness page       |
| Owner-gated actions disabled (PSL activate)     | OWNER_GATE     | PSL activation button disabled; requires owner auth|
| Owner-gated actions disabled (fixture write)    | OWNER_GATE     | Fixture import write disabled; requires owner auth |
| No admin JWT token values in pages              | PASS           | No JWTs exposed in frontend                        |
| No provider keys exposed                        | PASS           | API keys are backend-only, not in frontend         |

---

## Route Matrix

| Route                         | Expected Behaviour                              | Status         | Notes                                    |
|-------------------------------|--------------------------------------------------|----------------|------------------------------------------|
| `/admin`                      | Root; redirect to overview or show dashboard     | PASS           | Shell renders                            |
| `/admin/overview`             | Platform health, PSL INACTIVE badge, SANDBOX     | PASS           | Safety copy confirmed in spec            |
| `/admin/competitions`         | List competitions; PSL INACTIVE, activate gated  | CONDITIONAL_PASS | PSL activate button must be disabled    |
| `/admin/seasons`              | List/manage seasons; World Cup 2026 active       | PASS           | Season data present                      |
| `/admin/fixtures`             | Browse fixtures; SOURCE_EMPTY for PSL            | PASS           | SOURCE_EMPTY state shown                 |
| `/admin/teams`                | Browse teams; 16 PSL clubs + WC teams            | PASS           | Teams seeded                             |
| `/admin/players`              | Browse players; 96 provisional PSL players        | PASS           | Players seeded                           |
| `/admin/clubs`                | Manage PSL clubs; 16 clubs seeded                | PASS           | Club data present                        |
| `/admin/rules/guess-the-score`| GTS rules config; POINTS_ONLY label              | PASS           | Points-only copy confirmed               |
| `/admin/rules/fantasy`        | Fantasy rules config; POINTS_ONLY label          | PASS           | Points-only copy confirmed               |
| `/admin/points`               | Points ledger overview                           | PASS           | Admin read-only view                     |
| `/admin/points/simulation`    | Points simulation tool                           | PASS           | Simulation is read-only                  |
| `/admin/leaderboards`         | Global leaderboard view                          | PASS           | Season-scoped leaderboards               |
| `/admin/challenges`           | Challenge list and status                        | PASS           | Challenge admin view                     |
| `/admin/campaigns`            | Campaign management list                         | PASS           | Campaign admin view                      |
| `/admin/sponsors`             | Sponsor management                               | PASS           | Sponsor admin view                       |
| `/admin/users`                | User management                                  | PASS           | User list view                           |
| `/admin/roles`                | Role assignment                                  | PASS           | RBAC role management                     |
| `/admin/audit`                | Audit log viewer                                 | PASS           | AdminAuditLog entries                    |
| `/admin/settings`             | Platform settings                                | PASS           | Settings admin view                      |
| `/admin/readiness`            | PSL fixture readiness / activation pre-flight    | PASS           | SOURCE_EMPTY shown                       |
| `/admin/rules`                | Rules config root                                | PASS           | Redirects to GTS or Fantasy rules        |

**Total routes:** 22 (21 unique paths + root)

---

## Key Safety Verifications

### PSL INACTIVE
- PSL season status is `INACTIVE` — displayed on admin overview and readiness page.
- PSL activation is owner-gated. The activate button must remain disabled until owner approval.
- No fixture has been published from PSL source (SOURCE_EMPTY — expected until ~July/Aug 2026).

### SANDBOX Wallet
- Wallet adapter is `SiliconEnterpriseSandboxWalletAdapter`.
- All wallet operations are sandboxed — no real funds move.
- SANDBOX badge displayed on wallet-related admin pages.

### POINTS_ONLY
- GTS (Guess the Score) is `POINTS_ONLY` — no cash prizes, no odds, no betting language.
- Fantasy is `POINTS_ONLY` — no real-money prizes.
- Copy confirmed in `apps/experience/src/app/admin/rules/guess-the-score/page.tsx`.
- Copy confirmed in `apps/experience/src/app/admin/rules/fantasy/page.tsx`.

---

## Overall Status: CONDITIONAL_PASS

**Conditions for full PASS:**
1. Owner approves PSL activation (OWNER_GATE)
2. Owner approves fixture import write (OWNER_GATE)
3. PSL fixtures published by psl.co.za (expected ~July/Aug 2026)

**No blocker issues found. Admin portal is safe and functional for controlled testing.**
