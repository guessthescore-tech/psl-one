# ADR-034 — Sponsor Audience Segmentation Privacy Architecture

**Status:** Accepted  
**Date:** 2026-06-24  
**Sprint:** Sprint 32

## Context

Sponsors require the ability to target campaigns at specific fan cohorts (e.g., "18-35 year-old
Gauteng fans who participate in fantasy"). This creates tension with:

1. **POPIA (Protection of Personal Information Act)** — South African data privacy law.
   Sponsors must not receive, store, or process individual fan PII.
2. **Business need** — Sponsors need confidence that campaigns reach the right audience.
3. **Platform integrity** — The PSL One platform must act as a trusted data intermediary.

## Decision

We adopt a **criteria-only segmentation model**:

- Sponsors define segments via aggregate filter criteria stored in a `criteria` JSON field.
- The platform evaluates criteria at runtime against its own data — no fan list is ever built.
- Sponsors receive estimated aggregate counts (e.g., "~12,000 matching fans"), not individual records.
- The `AudienceSegment` model stores no fan IDs, emails, names, or other PII.

## Consequences

### Positive

- Full POPIA compliance: sponsors never touch fan PII.
- Sponsor confidence: estimated size gives meaningful reach guidance.
- Extensible: new criteria types can be added without schema changes (JSON field).
- Audit trail: `createdByUserId` on each segment for accountability.

### Negative

- Estimated sizes may be stale (requires periodic recomputation).
- Sponsors cannot verify exact composition — by design.
- Campaign-to-segment linking deferred to Sprint 33+ (current sprint creates segments only).

## Rejected Alternatives

### A — Export fan lists to sponsors

**Rejected.** Direct POPIA violation. Sponsors would hold PSL fan PII outside the platform.

### B — Sponsor-owned fan database

**Rejected.** Requires extensive data processing agreements and POPIA section 20 compliance
infrastructure beyond scope of this platform phase.

### C — No targeting at all

**Rejected.** Reduces sponsor value proposition significantly. Criteria-only model achieves
POPIA compliance while preserving targeting utility.

## Implementation

- Model: `AudienceSegment` in `audience_segments` table (migration `20260624120000_audience_segment`).
- Routes: `GET/POST /sponsor-portal/audiences`, `PATCH/DELETE /sponsor-portal/audiences/:id`.
- Scope enforcement: PortalScopeService prevents cross-sponsor access.
- Related: ADR-031 (billing boundary), ADR-032 (scoping), SPRINT-32-AUDIENCE-SEGMENTATION.md.

## Compliance Notes

- Compliant with POPIA Chapter 3 (conditions for lawful processing).
- No data transfer to third parties under section 72.
- No profiling of individual data subjects — aggregate criteria only.
- Privacy impact assessment recommended before production launch.
