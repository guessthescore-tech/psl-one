# Sprint 8 — Provider Coverage Results

## Status

| Provider | Status |
|----------|--------|
| Sportmonks | PENDING — BLOCKED_BY_REPLACEMENT_TOKEN |
| SportsDataIO | PENDING — trial not yet run (self-service at sportsdata.io) |

This document covers both provider candidates. Fill in results after trial keys are placed server-side.
See `SPRINT-8-PROVIDER-COMPARISON-ADDENDUM.md` for the comparison matrix.
See `SPRINT-8-SPORTSDATAIO-CANDIDATE.md` for SportsDataIO endpoint details.

## Test Date
_To be completed after token available_

## Endpoint Coverage

| Endpoint | HTTP Status | PSL Coverage | WC2026 Coverage | Rate Limit Hit | Notes |
|----------|-------------|--------------|-----------------|----------------|-------|
| /seasons | - | - | - | - | |
| /fixtures?season_id={id} | - | - | - | - | |
| /teams?season_id={id} | - | - | - | - | |
| /players?team_id={id} | - | - | - | - | |
| /standings?season_id={id} | - | - | - | - | |
| /livescores | - | - | - | - | Free tier: may be gated |
| /fixtures/{id}/events | - | - | - | - | |
| /fixtures/{id}/lineups | - | - | - | - | |

## Coverage Legend
- FULL: all expected fields returned
- PARTIAL: some fields returned, some missing
- EMPTY: endpoint responds but no PSL/WC2026 data
- GATED: requires higher subscription tier
- NOT_AVAILABLE: endpoint not in this plan

## Field Coverage Summary
_To be completed_

## Rate Limiting
- Requests per minute: _to be confirmed_
- Requests per day: _to be confirmed_
- Estimated PSL season fixtures: ~240 (30 rounds x 8 fixtures)
- Estimated daily sync load: _to be calculated_

## Recommendation
_To be completed after validation_
