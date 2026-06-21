# PSL One — Sprint 4 Provider Licensing Gate
**Last updated:** 2026-06-20 (Sprint 4 data-provider research)
**Status:** NOT COMPLETE — all items open
**Supersedes:** `PSL-DATA-LICENSING-GATE.md` (Sprint 3 gate — still valid; this document extends it for Sprint 4 specifics)
**Blocked on:** Owner action for all [OWNER] items

---

## IMPORTANT

**No provider data may be displayed to fans until every item in this checklist is marked complete and the gate is signed by the product owner.**

Technical implementation of the adapter (code, caching, field mapping) may proceed in parallel. Data must not be activated in any environment where fans can access it until the gate is signed.

This gate applies to: Sportmonks (recommended), API-Football (development spike), and any alternative provider selected by the owner.

---

## Why This Gate Exists

1. **Commercial redistribution is not implied by technical access.** A paid API subscription allows you to fetch data. It does not automatically allow you to display that data to millions of fans on a commercial platform. These are different rights and must be explicitly confirmed in writing.

2. **Logos and player images carry separate IP rights.** A provider hosting team logos does not mean those logos are cleared for redistribution. Football club crests are registered trademarks.

3. **The PSL holds broadcast and data rights.** Third-party providers may have a data licence from the PSL, but PSL One must verify that the redistribution chain extends to the PSL One fan platform. The PSL may have a preferred official data partner relationship that affects this.

4. **POPIA (Protection of Personal Information Act)** applies to player personal data (names, images, date of birth, nationality) in South Africa. Cross-border data flows and processing must be considered.

5. **Player image use may require consent.** Depending on jurisdiction and the nature of the platform, displaying identifiable player photos may require consent or a licence from the players' association.

---

## Section A: Commercial Licence

| # | Item | Owner action required | Status |
|---|------|-----------------------|:------:|
| A1 | Provider selected (Sportmonks recommended; see `SPRINT-4-PROVIDER-COMPARISON.md`) | [OWNER] Confirm or override provider choice | OPEN |
| A2 | Commercial tier agreed with selected provider | [OWNER] Contact provider sales; obtain written quote and terms | OPEN |
| A3 | Redistribution rights confirmed in writing — provider has explicitly confirmed that displaying match data to fans on PSL One (commercial fan platform, up to 2M users) is permitted under the selected plan | [OWNER] Obtain written confirmation from provider | OPEN |
| A4 | Plan tier confirmed — daily request quota covers server-side polling requirements for up to 16 simultaneous live PSL fixtures (see caching strategy in `SPRINT-4-PROVIDER-RECOMMENDATION.md`) | [OWNER] Verify quota with provider | OPEN |
| A5 | Monthly billing confirmed — recurring cost approved in budget | [OWNER] Approve monthly cost | OPEN |
| A6 | Escalation cost plan — confirm what happens to cost during high-traffic matchday scenarios; confirm per-overage pricing | [OWNER] Verify with provider | OPEN |

---

## Section B: PSL Competition Rights

| # | Item | Owner action required | Status |
|---|------|-----------------------|:------:|
| B1 | PSL official position obtained — PSL One has written permission (or acknowledged right) to display PSL DStv Premiership match data, standings, and player statistics on the platform | [OWNER] Contact PSL commercial department at https://www.psl.co.za | OPEN |
| B2 | PSL's current official data partner identified — determine whether PSL uses Opta/Stats Perform, Sportmonks, or another exclusive data partner, and whether this creates any conflict | [OWNER] Confirm with PSL commercial contact | OPEN |
| B3 | No conflict between third-party provider licence and PSL competition rights — if PSL has an exclusive data deal with a specific provider, third-party data access may be restricted | [OWNER] Legal review if conflict found | OPEN |
| B4 | WC 2026 competition rights — confirm provider's licence covers World Cup 2026 data for fan display (separate from club competition rights) | [OWNER] Verify with provider | OPEN |

---

## Section C: Logo, Image, and Branding Rights

| # | Item | Owner action required | Status |
|---|------|-----------------------|:------:|
| C1 | Club crest display rights confirmed — rights to display all 16 PSL DStv Premiership club crests to fans, either via: (a) PSL agreement, (b) direct club agreement, or (c) provider's explicit image redistribution licence | [OWNER] Confirm rights path | OPEN |
| C2 | Player profile image rights confirmed — rights to display player photographs to fans. Provider image URLs are not automatically cleared for redistribution. May require separate licence or consent. | [OWNER] Confirm with provider and/or players' association | OPEN |
| C3 | Stadium photography rights confirmed — separate from match data rights; stadium images on venue pages require independent rights | [OWNER] Confirm rights path | OPEN |
| C4 | Competition logos (PSL, WC 2026) — rights to display competition branding on PSL One fan pages | [OWNER] Confirm with PSL and FIFA/SAFA for WC 2026 | OPEN |
| C5 | Provider logo / attribution imagery — confirm how to display the required "Data by [Provider]" attribution and whether provider logo may be used | [OWNER] Confirm with provider | OPEN |
| C6 | [ENGINEERING] All `picsum.photos` placeholder images removed from fan-facing pages before public launch; replaced with licensed assets only | Engineering lead | OPEN |

---

## Section D: POPIA and Data Protection

| # | Item | Owner action required | Status |
|---|------|-----------------------|:------:|
| D1 | POPIA assessment — confirm that storing and displaying player names, images, nationality, and date of birth on PSL One is lawful under the Protection of Personal Information Act 4 of 2013 | [OWNER] Obtain legal opinion if needed | OPEN |
| D2 | Data Processing Agreement (DPA) with provider — Sportmonks or the selected provider must be able to provide a DPA confirming their compliance with POPIA for South African user data | [OWNER] Request DPA from provider | OPEN |
| D3 | Cross-border data flow review — provider data may be hosted outside South Africa; confirm this is lawful under POPIA section 72 | [OWNER] Include in legal review | OPEN |
| D4 | Player consent (images) — if displaying identifiable player profile photos, confirm whether POPIA or player association agreements require consent or fee arrangement | [OWNER] Legal opinion | OPEN |
| D5 | Fan data — provider does not receive PSL One fan personal data; confirm that API calls from the server-side adapter do not transmit fan PII to the provider | [ENGINEERING] Architecture review | OPEN |

---

## Section E: Technical Compliance (Engineering)

| # | Item | Owner action required | Status |
|---|------|-----------------------|:------:|
| E1 | Provider API key stored in AWS Secrets Manager — path: `/psl-one/{env}/football-data-provider/api-key`. Never in git. Never in `.env` files committed to repo. | [ENGINEERING] | OPEN |
| E2 | Server-side adapter only — no `NEXT_PUBLIC_` provider API keys. No direct calls from browser. Fan browser never communicates with provider. | [ENGINEERING] Architecture enforced in adapter design | OPEN |
| E3 | Caching policy implemented and verified — Redis TTLs matching provider terms (30 s live, 5 min non-live, 24 h historical). Rate limit not breached in load tests. | [ENGINEERING] | OPEN |
| E4 | Attribution requirement implemented in product UI — "Data provided by [Provider]" visible on fixture, standings, and player-stats pages | [ENGINEERING] After attribution wording confirmed | OPEN |
| E5 | Circuit breaker / fallback tested — if provider is unavailable, platform degrades gracefully to manual mode; no error cascade to fans | [ENGINEERING] | OPEN |
| E6 | `FOOTBALL_DATA_PROVIDER` env var tested — switching from one provider to another (e.g., Sportmonks → API-Football fallback) verified without code deployment | [ENGINEERING] | OPEN |
| E7 | Security review passed — provider integration reviewed for key exposure, request forgery, and data injection risks | [ENGINEERING] Security lead | OPEN |
| E8 | Data quality gate — automated check that imported PSL fixture count matches expected count for the season; alert if mismatch | [ENGINEERING] | OPEN |
| E9 | Admin review workflow — imported data enters DRAFT state in admin panel before being published to fans | [ENGINEERING] Already designed in FixtureImportModule | OPEN |

---

## Section F: PSA / PSL Official Partnership Considerations

| # | Item | Notes | Status |
|---|------|-------|:------:|
| F1 | PSL One commercial proposition — before approaching the PSL for a data partnership, ensure the platform (apps/experience, apps/web) is demonstrable to a PSL commercial representative | Prerequisite: visual review of apps/experience is complete | OPEN |
| F2 | PSL preferred data partner — if PSL uses an exclusive data provider (e.g., Stats Perform / Opta), a direct partnership with PSL may unlock data access without needing a separate provider agreement | PSL contact required | OPEN |
| F3 | Naming rights and branding — if a formal PSL partnership is established, the platform name ("PSL One") and branding must be agreed with the PSL | Not a legal blocker for beta; important for commercial launch | OPEN |
| F4 | SAFA relationship — the South African Football Association is the governing body above the PSL; large-scale data or broadcast relationships may require SAFA awareness | Low priority for beta | OPEN |

---

## Section G: Trial / Development Tier

For Sprint 4 development (before the commercial gate is complete):

| # | Item | Status |
|---|------|:------:|
| G1 | API key for development/spike is on a paid tier — NOT the free tier — if any team member other than the developer is accessing data outputs | OPEN — confirm with owner |
| G2 | Discovery script (`tools/data-provider-spike/api-football-discovery.mjs`) only writes to `/tmp/` — no database writes, no AWS calls | CONFIRMED (script design) |
| G3 | Spike data is used for architecture validation only — not displayed to beta testers | CONFIRM before any beta access |
| G4 | Sprint 4 NestJS adapter is implemented with `manual` provider as default — no live provider calls occur unless explicitly enabled by `FOOTBALL_DATA_PROVIDER` env var | [ENGINEERING] enforce in implementation |

---

## Gate Sign-Off

**ALL sections A–E must be complete before any provider data is shown to fans.**

Sections F and G are either long-term (F) or Sprint 4 development-time items (G).

| Sign-off field | Value |
|----------------|-------|
| All items A–E completed | |
| Provider selected | |
| Date of sign-off | |
| Signed by (owner) | |
| Engineering lead confirmation | |

---

## Contact Points

| Provider / Entity | Contact route |
|------------------|---------------|
| Sportmonks | https://www.sportmonks.com/contact |
| API-Football | https://www.api-football.com/contact |
| Stats Perform / Opta | https://www.statsperform.com/contact-us |
| Sportradar | https://sportradar.com/contact |
| PSL Commercial | https://www.psl.co.za (look for commercial / partnerships) |
| SAFA | https://www.safa.net |
