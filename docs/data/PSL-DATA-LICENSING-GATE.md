# PSL One — Data Licensing Gate
**Last updated:** 2026-06-19 (STORY-FE-PREMIUM-01A)

**IMPORTANT: No provider data may be activated for fan-facing display until this entire checklist is completed and signed by the product owner.**

---

## Why This Gate Exists

Technical availability does not equal legal permission.

Many sports data APIs return PSL match data on a technical level. However:

1. **Redistribution rights** must be explicitly granted in commercial terms. A developer API subscription that allows you to fetch data does not automatically allow you to display that data to millions of fans on a commercial platform.

2. **Logos and imagery** — club crests, player profile images, and stadium photography — are almost always subject to separate intellectual property rights. Fetching an image URL from an API does not grant you rights to redistribute that image to your users.

3. **PSL broadcast and data rights** — the Premier Soccer League holds broadcast and data rights to its competition. Even if a third-party provider has a data licence from the PSL, PSL One must verify that redistribution to its fan platform falls within that licence.

4. **GDPR and POPIA** — player personal data (images, nationality, date of birth) may be subject to data protection obligations in South Africa and internationally.

---

## Legal Statement

PSL One will approach Stats Perform, Sportmonks, Sportradar, and API-Football as a **business platform**, not as a personal or hobby project. Commercial redistribution of football data to a fan base of up to 2 million users requires a commercial licence from the data provider.

API-Football's free tier is for development and testing only. The PSL One beta must use a paid tier even for internal testing if users are accessing the data.

The official PSL partnership remains the preferred long-term source of truth. Provider integrations are an interim solution until an official data partnership with the PSL is established.

---

## Owner Decision Checklist

Complete every item before any provider data is published to fans. Items marked [OWNER] must be actioned by the product owner personally.

### Provider Selection

- [ ] [OWNER] Provider selected from `docs/data/PSL-DATA-PROVIDER-EVALUATION.md`
- [ ] [OWNER] Provider shortlist reviewed: API-Football (prototype), Sportmonks/Opta (production)

### Commercial Licence

- [ ] [OWNER] Commercial licence reviewed and accepted with selected provider
- [ ] [OWNER] Redistribution rights confirmed — provider has explicitly permitted display to end users on PSL One
- [ ] [OWNER] Plan tier confirmed — plan covers expected daily request volume for 2M fan base
- [ ] [OWNER] Attribution requirements noted and wired into the product

### PSL Competition Rights

- [ ] [OWNER] PSL official position confirmed — PSL One has permission (written) to display PSL competition data
- [ ] [OWNER] PSL data partner relationship confirmed (does PSL use Opta, Sportmonks, or another provider?)
- [ ] [OWNER] No conflict exists between third-party provider licence and PSL competition rights

### Logo and Image Rights

- [ ] [OWNER] Club crest display rights confirmed — either via PSL, direct from clubs, or via provider's explicit image redistribution licence
- [ ] [OWNER] Player profile image rights confirmed — provider's image URLs may not be publicly redistributable
- [ ] [OWNER] Stadium photography rights confirmed — separate from match data rights
- [ ] [ENGINEERING] All `picsum.photos` placeholders replaced with licensed assets before public launch

### Technical Compliance

- [ ] [ENGINEERING] Caching policy confirmed and implemented — provider rate limits respected
- [ ] [ENGINEERING] Redistribution policy confirmed — data not forwarded to unauthorised third parties
- [ ] [ENGINEERING] Attribution requirement implemented in product UI and documentation
- [ ] [ENGINEERING] Provider API key stored in AWS Secrets Manager — never in git, never in browser code
- [ ] [ENGINEERING] Server-side adapter only — no `NEXT_PUBLIC_` API keys

### Budget

- [ ] [OWNER] Monthly provider cost approved in budget
- [ ] [OWNER] Escalation plan confirmed for traffic spikes on matchday

### Quality Review

- [ ] [ENGINEERING] Security review passed — provider integration reviewed by security engineer
- [ ] [ENGINEERING] Data quality review passed — PSL coverage verified for current season
- [ ] [ENGINEERING] Missing player/fixture detection implemented — alerts when provider data is incomplete

### Rollback

- [ ] [ENGINEERING] Rollback provider defined — if primary provider fails, fallback is CSV/manual import
- [ ] [ENGINEERING] `FOOTBALL_DATA_PROVIDER` env var switch tested — can switch provider without code deploy
- [ ] [ENGINEERING] Provider circuit breaker tested — platform degrades gracefully if provider is down

### Sign-off

- [ ] [OWNER] **All above items completed** — Owner signs off on production activation
- [ ] [OWNER] **Date of sign-off:** _______________
- [ ] [OWNER] **Signed by:** _______________

---

## Contact Points for Provider Engagement

| Provider | Route |
|----------|-------|
| API-Football | https://www.api-football.com/contact (self-service for dev; email for commercial) |
| Sportmonks | https://www.sportmonks.com/contact |
| Stats Perform / Opta | https://www.statsperform.com/contact-us |
| Sportradar | https://sportradar.com/contact |
| PSL official | https://www.psl.co.za (look for commercial partnerships contact) |

---

## What Happens After Sign-off

Once this gate is complete and signed:

1. Engineering lead receives formal go-ahead to activate `FootballDataProvider` adapter in production (ADR-030)
2. `FOOTBALL_DATA_PROVIDER=api-football` (or selected provider) set in AWS Secrets Manager
3. First import is run via admin panel — DRAFT lifecycle only
4. Admin reviews imported data
5. Admin publishes approved data
6. PSL season activation readiness check (13 checks from STORY-28/31)
7. PSL season activated by admin in production

This process is controlled. No automatic activation occurs.
