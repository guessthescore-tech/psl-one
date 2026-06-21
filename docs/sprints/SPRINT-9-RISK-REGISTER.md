# Sprint 9 — Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Status |
|----|------|-----------|--------|------------|--------|
| R1 | Provider replacement keys absent | HIGH (current state) | HIGH — cannot validate coverage | Owner generates replacement keys; tooling is BLOCKED_BY_REPLACEMENT_TOKEN safe | ACTIVE |
| R2 | Staging migration apply not authorized | HIGH (current state) | MEDIUM — beta DB missing settlement fields | Runbook ready; awaiting owner authorization | ACTIVE |
| R3 | Vercel CI blocked (non-blocking) | HIGH (known) | LOW — does not affect API/admin builds | Documented as non-blocking; preview URL already live | ACCEPTED |
| R4 | PSL activation attempted prematurely | LOW | HIGH — PSL is not ready for activation | Hard constraint enforced; STORY-40 reserved | MITIGATED |
| R5 | Real-money functionality accidentally added | LOW | CRITICAL — regulatory risk | No wallet production; points-only; daily scan | MITIGATED |
| R6 | Provider commercial terms not validated | MEDIUM | MEDIUM — cannot confirm licensing rights | Owner must check Sportmonks/SportsDataIO pricing before production ingestion | ACTIVE |
| R7 | Staging enum values irreversible after apply | LOW | LOW — additive migrations only | Documented in rollback plan; PostgreSQL limitation noted | DOCUMENTED |
| R8 | Live smoke cannot run without staging server | MEDIUM | LOW — smoke suite ready but untested live | File-level checks pass; live smoke gated on server availability | ACTIVE |
