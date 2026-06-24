# Sprint 31 — VOD Rights Metadata

**Status:** DESIGNED | PSL INACTIVE | BETA ONLY
**Date:** 2026-06-24

## Overview

VOD content requires explicit rights management before fan-facing publication.
This document defines the rights metadata model and the decision process for each
rights clearance state.

## Rights Status State Machine

```
PENDING_REVIEW ──► CLEAR ──► (published)
       │
       ├──► BLOCKED (third-party refusal or rights not acquired)
       │
       └──► EXPIRED (licence expired — auto-unpublished)
```

**`MediaRightsStatus` enum values:**
| Status | Meaning | Can Publish? |
|--------|---------|-------------|
| `PENDING_REVIEW` | Default — awaiting rights review | No |
| `CLEAR` | Rights confirmed — safe to publish | Yes |
| `BLOCKED` | Rights denied or not acquired | No |
| `EXPIRED` | Licence period ended | No (auto-archive) |

## Rights by Content Type

### Match Highlights
- **Rights holder:** PSL / FIFA / host broadcaster
- **Required clearance:** Broadcasting rights agreement
- **Duration:** Per-season or per-tournament
- **Typical period:** 48-hour window after match (varies by rights deal)
- **Action:** Set `rightsStatus = CLEAR` only after legal confirms

### Player Interviews
- **Rights holder:** Club, player agent, or broadcast partner
- **Required clearance:** Interview rights
- **Duration:** Perpetual (usually)
- **Action:** Standard CLEAR after editorial review

### Training Content
- **Rights holder:** Club (club provides footage)
- **Required clearance:** Club portal approval (Club Admin confirms)
- **Duration:** Perpetual
- **Action:** CLEAR on club confirmation

### Sponsor-Branded Content
- **Rights holder:** Sponsor
- **Required clearance:** Campaign approval (linked to SponsorCampaign)
- **Duration:** Campaign period
- **Action:** Set `rightsStatus = CLEAR` on sponsor approval, `EXPIRED` when campaign ends

### Fan-Generated Content
- **Rights holder:** Fan (must explicitly consent)
- **Required clearance:** POPIA-compliant consent + content review
- **Duration:** Depends on consent terms
- **Action:** Explicit consent logging required before CLEAR

## Metadata Fields for Rights Management

```json
{
  "rightsStatus": "CLEAR",
  "sponsorId": "uuid-of-sponsor-if-branded",
  "isLowDataAvailable": true,
  "streamStartAt": "2026-06-20T18:00:00Z",
  "streamEndAt": "2026-06-20T20:00:00Z",
  "archivedAt": null
}
```

## Licence Expiry Handling

When a video licence expires:
1. `rightsStatus` is set to `EXPIRED` (manual or automated)
2. `archivedAt` is set to the expiry timestamp
3. Video is removed from `GET /fan/videos` listing (filter: `archivedAt = null`)
4. Video is retained in DB for audit purposes
5. Admin sees EXPIRED status in `/admin/videos`

Automated expiry requires a scheduled job (Sprint 34+ or separate cron module).
For beta: admin manually sets `rightsStatus = EXPIRED` and archives.

## Content That Cannot Be Published

Under any circumstances, PSL One must NOT publish:
- Match footage without broadcast rights
- Player images used commercially without consent
- Content portraying minors without parental consent
- Defamatory or discriminatory content
- Content that violates POPIA (personal information)

## POPIA Compliance for Video

- Player faces in crowd shots: low-risk (public event)
- Individual fan identification: high-risk (consent required)
- Minor identification: prohibited without parental consent
- Medical/injury footage: prohibited without player consent

---

*PSL INACTIVE | WALLET SANDBOX | BETA ONLY*
