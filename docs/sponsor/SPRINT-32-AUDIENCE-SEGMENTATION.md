# Sprint 32 — Sponsor Audience Segmentation

## Overview

Audience segmentation allows sponsors to define fan audience profiles for campaign targeting.
This is POPIA-safe: segments store aggregate filter criteria only — not individual fan PII lists.

## Model: AudienceSegment

| Field           | Type     | Notes                                    |
|-----------------|----------|------------------------------------------|
| id              | UUID     | Primary key                              |
| sponsorId       | String   | FK → sponsors.id (CASCADE)               |
| name            | String   | Human-readable segment name              |
| description     | String?  | Optional description                     |
| criteria        | Json     | Aggregate filter criteria (no PII)       |
| estimatedSize   | Int?     | Estimated fan count (admin-set, optional)|
| isActive        | Boolean  | Soft-delete flag                         |
| createdByUserId | String?  | Audit: who created it                    |

## API Routes

| Method | Path                              | Auth            | Description                   |
|--------|-----------------------------------|-----------------|-------------------------------|
| GET    | /sponsor-portal/audiences         | SPONSOR/PSL_ADMIN | List active segments         |
| POST   | /sponsor-portal/audiences         | SPONSOR/PSL_ADMIN | Create segment               |
| PATCH  | /sponsor-portal/audiences/:id     | SPONSOR/PSL_ADMIN | Update segment               |
| DELETE | /sponsor-portal/audiences/:id     | SPONSOR/PSL_ADMIN | Delete segment               |

## POPIA Compliance

- `criteria` stores filter parameters (e.g., `{ "ageRange": "18-35", "province": "GP" }`).
- No individual fan IDs, emails, or PII are stored in segments.
- Sponsors receive estimated aggregate counts only.
- See ADR-034 for full privacy architecture.

## Criteria Schema (example)

```json
{
  "ageRange": "18-35",
  "province": "Gauteng",
  "engagementLevel": "HIGH",
  "fantasyParticipant": true,
  "predictionParticipant": true
}
```

## Safety Constraints

- PSL_INACTIVE: do not activate PSL season.
- SPONSOR_REWARDS_NON_FINANCIAL: no cash payouts, no real-money rewards.
- WALLET_SANDBOX_ONLY: wallet remains sandbox.
