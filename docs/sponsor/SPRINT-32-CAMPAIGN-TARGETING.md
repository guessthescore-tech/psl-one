# Sprint 32 — Campaign Targeting

## Overview

Campaign targeting enables sponsors to associate audience segments with campaigns,
controlling which fan cohorts see a given promotion. This builds on the AudienceSegment
model introduced in Sprint 32 and the SponsorCampaign model from Sprint 37.

## Current State (Sprint 32)

- `AudienceSegment` model is live: sponsors can create/update/delete segments.
- Targeting association (linking segments to campaigns) is a **planned enhancement**.
- Existing `SponsorCampaign` model has no `segmentId` FK yet — that's Sprint 33+.

## Planned Targeting Flow

```
Sponsor defines AudienceSegment (criteria JSON)
  → Sponsor selects segment when creating SponsorCampaign
  → PSL platform evaluates criteria at render time (aggregate, never PII list)
  → Fan sees campaign only if they match criteria
```

## Criteria Evaluation Rules

| Criterion             | Source                          | Notes                            |
|-----------------------|---------------------------------|----------------------------------|
| `ageRange`            | Fan profile (aggregated)        | Bracket only, not exact DOB      |
| `province`            | Fan profile (aggregated)        | Province code                    |
| `engagementLevel`     | Computed from activity ledger   | HIGH/MEDIUM/LOW                  |
| `fantasyParticipant`  | FantasyTeam existence           | Boolean                          |
| `predictionParticipant` | PredictionEntry count > 0     | Boolean                          |
| `clubAffiliation`     | Fan's selected club             | Club ID                          |

## POPIA Compliance

- Targeting operates on aggregated criteria — the platform evaluates against anonymous
  aggregate statistics, never builds or exports a list of matching fan IDs.
- Sponsors never receive individual fan PII.
- See ADR-034 for the full data boundary.

## Non-Financial Boundary

- Campaign targeting is non-financial.
- No gambling, no odds, no stakes, no real-money rewards.
- All sponsor rewards remain non-financial (fan points, digital badges, non-cash prizes).
