# Sprint 35 — Ticketing Scope

## Current State: INFORMATIONAL

Ticket pages are informational placeholders at launch. No seat selection, no payment,
no QR code generation, no turnstile integration.

## Model: Ticket (existing)

The `Ticket` model exists in the schema for future ticketing integration.
At launch, no ticket-related API routes are exposed to fans.

## Planned Ticket Flow (Post-Launch)

```
Fan selects match → Seat map (future) → Ticket selection
  → Payment via gateway (OG-35-COMMERCE required)
  → QR code generated (UUID-based, not guessable)
  → Ticket delivered to fan app
  → Stadium scan validates QR at turnstile
```

## Owner Gates Required Before Ticketing Activation

| Gate          | Requirement                                            |
|---------------|--------------------------------------------------------|
| OG-35-TICKET  | Owner authorises ticketing module activation           |
| OG-35-COMMERCE| Payment gateway activated (blocks ticketing too)       |
| OG-35-VENUE   | Stadium venue and seat map data loaded                 |
| OG-35-SCAN    | QR scanner integration with stadium turnstile systems  |

## QR Code Security (Planned)

- QR codes are single-use UUID tokens (not fan ID + match ID).
- Server validates at scan time — no client-side validation.
- QR tokens expire 24 hours after match end.
- Duplicate scan detection via `usedAt` timestamp.

## Safety Constraints

- CATALOGUE_ONLY: No ticket purchases in this sprint.
- No QR code generation.
- No stadium integration.
- No real-money payment for tickets.
- See ADR-033 for the full commerce boundary.
