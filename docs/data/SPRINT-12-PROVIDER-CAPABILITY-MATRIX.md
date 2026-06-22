# Sprint 12 — Provider Capability Matrix

Last updated: Sprint 12. All "FORBIDDEN" entries for Betting/Odds reflect a platform-wide rule: PSL One is a points-only platform and must never ingest or display odds data regardless of provider availability.

## Matrix

| Capability | football-data.org | API-Football | ESPN (research) | Sportmonks (rejected) | SportsDataIO (secondary) |
|---|---|---|---|---|---|
| **PSL Fixtures** | NO | PENDING (league 288 unconfirmed) | UNKNOWN | UNKNOWN — REJECTED, DO NOT USE | NOT_FOUND |
| **WC2026 Fixtures** | YES (code WC) | PENDING (league 1 unconfirmed) | LIKELY | UNKNOWN — REJECTED, DO NOT USE | PARTIAL |
| **Player Stats** | LIMITED (squad only) | YES | LIKELY | N/A | YES |
| **Standings** | YES | YES | LIKELY | N/A | LIMITED |
| **Free Tier** | YES | LIMITED | UNOFFICIAL (public, undocumented) | N/A | TRIAL |
| **Auth Method** | X-Auth-Token header | x-apisports-key header | None (public) | N/A | subscription-key header |
| **PSL Coverage** | NO | PENDING | UNKNOWN | REJECTED — DO NOT USE | NOT_FOUND |
| **WC Coverage** | YES | PENDING | LIKELY | REJECTED — DO NOT USE | PARTIAL |
| **Betting / Odds** | FORBIDDEN | FORBIDDEN | FORBIDDEN | FORBIDDEN | FORBIDDEN |

## Notes

### football-data.org
- Free tier covers 10 competitions including WC, CL, and PL; PSL is not among them.
- Player stats are limited to squad/roster data — per-match statistics are not available on the free tier.
- Paid tier add-ons (including an odds add-on) exist but must not be activated.

### API-Football
- PSL league 288 and WC2026 league 1 are documented by API-Football but have not been validated against a live key.
- Per-match player statistics are a core offering; depth depends on subscription tier.
- Free/trial tier has strict daily request limits.

### ESPN (research)
- Public endpoints at `site.api.espn.com` are unofficial and undocumented.
- Coverage appears broad but is unverified and carries no SLA or data rights.
- Not wired; no adapter; no production use.

### Sportmonks
- Rejected in Sprint 10 after trial validation failed to meet PSL One requirements.
- Must not be re-evaluated without a new owner decision recorded in the decision log.

### SportsDataIO
- PSL was not found in the SportsDataIO competition catalogue (Sprint 10 evaluation).
- WC2026 coverage was partial in trial testing (Sprint 10).
- Retained as secondary candidate only; not currently under active evaluation.
