# SOC2 Readiness Roadmap

**Status: NOT_SOC2_CERTIFIED**
Evidence collection started: 2026-06
Planned audit date: TBD (owner decision required)

> IMPORTANT: This document describes readiness activities only. PSL One is NOT SOC2 certified.
> Do not use this as evidence of certification.

---

## Trust Service Criteria Scope

| Criteria | Description | Status |
|----------|-------------|--------|
| CC (Security) | Logical access, authentication, monitoring, change management | IN_PROGRESS |
| A1 (Availability) | Uptime targets, capacity, incident response | IN_PROGRESS |
| C1 (Confidentiality) | Data classification, encryption at rest/transit, access controls | IN_PROGRESS |
| PI1 (Processing Integrity) | Complete, valid, accurate data processing | NOT_STARTED |

**Out of scope for initial audit:** Privacy (PI) criteria — POPIA is the relevant privacy regulation and is handled separately.

---

## Evidence Collection Timeline

| Phase | Target Date | Status |
|-------|-------------|--------|
| Control identification | 2026-06 | COMPLETE |
| Control matrix draft | 2026-06 | COMPLETE |
| Evidence register draft | 2026-06 | COMPLETE |
| Gap analysis | 2026-06 | IN_PROGRESS |
| Control testing | TBD | NOT_STARTED |
| External auditor engagement | TBD | NOT_STARTED |
| SOC2 Type I report | TBD | NOT_STARTED |
| SOC2 Type II observation period | TBD | NOT_STARTED |

---

## Current Gap Analysis

| Gap | Category | Priority | Mitigation |
|-----|----------|----------|------------|
| No formal penetration test | Security | HIGH | Schedule with approved vendor |
| Tokens without exp accepted | Auth | MEDIUM | Add verifyOptions enforcement |
| Log retention not formalised | Monitoring | MEDIUM | Define CloudWatch retention policy |
| Change management not fully documented | Change Management | MEDIUM | See CHANGE-MANAGEMENT-PROCEDURE.md |
| No formal BCP/DR test | Availability | LOW | EC2 restore runbook exists |
| Vendor security assessments incomplete | Vendor Mgmt | LOW | See VENDOR-MANAGEMENT-PROCEDURE.md |

---

## Next Steps (Owner Actions Required)

1. Assign Security Lead role
2. Approve external auditor engagement budget
3. Define log retention policy (recommend 90 days minimum)
4. Schedule penetration test
5. Approve SOC2 Type I target date
