# Sprint 7 — Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Status |
|----|------|-----------|--------|------------|--------|
| R7-01 | Sportmonks API key exposed in frontend | LOW | CRITICAL | Key only used server-side; security scan in CI; NEXT_PUBLIC_ scan gated | MITIGATED |
| R7-02 | Settlement non-idempotent causing double-settle | LOW | HIGH | Early return if status === SETTLED before any mutation | MITIGATED |
| R7-03 | Fixture score null at settlement time | MEDIUM | MEDIUM | `homeScore ?? 0` fallback; FINISHED guard enforced | MITIGATED |
| R7-04 | Migration 42 fails on staging | LOW | HIGH | SQL uses `IF NOT EXISTS`; additive only; rollback documented | MITIGATED |
| R7-05 | Real-money language in settlement response | LOW | CRITICAL | Response contains only `points`, `winnerUserId`, `settlementReason`; financial language scan in CI | MITIGATED |
| R7-06 | PSL season accidentally activated | LOW | HIGH | PSL activation blocked; staging runbook explicitly forbids it | MITIGATED |
| R7-07 | Sportmonks trial rate limit (429) during discovery | MEDIUM | LOW | 429 handled gracefully; returns empty array; no throw | MITIGATED |
| R7-08 | acceptorUserId null at settlement time | LOW | MEDIUM | `acceptorUserId ?? null` used; audit log skipped if null acceptor | MITIGATED |

---

## Deferred Risks

- R7-D1: Real match data ingestion not yet wired — deferred to Sprint 8
- R7-D2: Wallet payout on challenge win — product decision: points-only in beta; deferred indefinitely
