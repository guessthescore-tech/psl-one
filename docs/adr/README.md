# PSL One — Architecture Decision Records

**Purpose:** Index of all ADRs  
**Audience:** All engineers  
**Last verified:** 2026-06-14  

---

## Sprint 0 ADRs — ADR-001 through ADR-011

Created 2026-06-08 during Sprint 0 architecture planning.

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](ADR-001.md) | Authentication Strategy | ACCEPTED |
| [ADR-002](ADR-002.md) | Database ORM Selection | ACCEPTED |
| [ADR-003](ADR-003.md) | Monorepo Structure | ACCEPTED |
| [ADR-004](ADR-004.md) | API Framework Selection | ACCEPTED |
| [ADR-005](ADR-005.md) | Frontend Framework Selection | ACCEPTED |
| [ADR-006](ADR-006.md) | Event Architecture | ACCEPTED |
| [ADR-007](ADR-007.md) | Containerisation Strategy | ACCEPTED |
| [ADR-008](ADR-008.md) | Testing Strategy | ACCEPTED |
| [ADR-009](ADR-009.md) | Domain Boundary Model | ACCEPTED |
| [ADR-010](ADR-010.md) | Wallet Integration Approach | ACCEPTED |
| [ADR-011](ADR-011.md) | Bootstrap MVP Architecture | ACCEPTED |

---

## Sprint 2 ADRs — ADR-012 through ADR-026

Created 2026-06-14 documenting decisions made and validated during Sprint 2 delivery.

| ADR | Title | Status | Story |
|-----|-------|--------|-------|
| [ADR-012](ADR-012.md) | Points System Separation | ACCEPTED | STORY-19 to STORY-38 |
| [ADR-013](ADR-013.md) | Season Activation Gate (13-Check Readiness) | ACCEPTED | STORY-28, STORY-36 |
| [ADR-014](ADR-014.md) | Player externalId Non-Uniqueness | ACCEPTED | STORY-29 |
| [ADR-015](ADR-015.md) | Immutable Ledger Pattern | ACCEPTED | STORY-11, STORY-38 |
| [ADR-016](ADR-016.md) | Direct Service Calls for Side Effects | ACCEPTED (until Kafka) | STORY-19 |
| [ADR-017](ADR-017.md) | Admin Audit Log Requirement | ACCEPTED | STORY-35 |
| [ADR-018](ADR-018.md) | Fantasy Rules Config-Driven | ACCEPTED | STORY-14 |
| [ADR-019](ADR-019.md) | Sandbox-First Provider Pattern | ACCEPTED | STORY-37 |
| [ADR-020](ADR-020.md) | FIFO Challenge Matching | ACCEPTED | STORY-38 |
| [ADR-021](ADR-021.md) | Idempotency Key for Challenge Acceptance | ACCEPTED | STORY-38 |
| [ADR-022](ADR-022.md) | No Business Logic in Frontend | ACCEPTED | All stories |
| [ADR-023](ADR-023.md) | getBetaToken Centralisation | ACCEPTED | STORY-35 |
| [ADR-024](ADR-024.md) | Dry Run Response Contract | ACCEPTED | STORY-36, STORY-39 |
| [ADR-025](ADR-025.md) | BetaLaunchModule Delegates to SeasonSwitchingService | ACCEPTED | STORY-39 |
| [ADR-026](ADR-026.md) | PSL Season Activation Not Implemented in STORY-39 | ACCEPTED | STORY-39 |

---

## Sprint 3 ADRs — ADR-027 onwards

| ADR | Title | Status | Story |
|-----|-------|--------|-------|
| [ADR-027](ADR-027.md) | Durable Event Processing Deferred Pending Measured Requirement | PROPOSED | S3-INFRA-00 |
| [ADR-028](ADR-028.md) | ECS Fargate Runtime and Immutable Container Image Strategy | ACCEPTED | S3-INFRA-01 |

---

## ADR Numbering Convention

- `ADR-001` through `ADR-011` — Sprint 0 architecture planning (3-digit, committed)
- `ADR-012` through `ADR-026` — Sprint 2 validated decisions (3-digit, continuing series)
- `ADR-027` onwards — Sprint 3 decisions
- Next ADR: `ADR-029`

---

## Creating a New ADR

Copy the format from any existing ADR. Required sections:

- Title
- Date
- Status (`PROPOSED`, `ACCEPTED`, `SUPERSEDED`, `DEPRECATED`)
- Context
- Decision
- Alternatives Considered
- Consequences
- Related Stories
- Related Source Files
- Revisit Triggers

Register in this index under the appropriate sprint section.
