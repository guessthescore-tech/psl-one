# PSL One — Sprint 4 Provider Comparison
**Last updated:** 2026-06-20 (Sprint 4 data-provider research)
**Status:** DRAFT — for owner review before commercial commitment
**Supersedes:** `PSL-DATA-PROVIDER-EVALUATION.md` (Phase 1 evaluation)

**Disclaimer:** This comparison is based on publicly available documentation and prior evaluation research as of 2026-06-20. Provider pricing, coverage, and terms change. Verify all claims directly with each provider before signing any commercial agreement. Specific numeric IDs (league IDs, team IDs) are NOT hardcoded in this document — they must be confirmed against live API responses.

---

## 1. Comparison Table

| Dimension | API-Football | Sportmonks | Stats Perform / Opta | Sportradar | TheSportsDB |
|-----------|:-----------:|:----------:|:-------------------:|:----------:|:-----------:|
| **PSL DStv Premiership coverage** | Available | Available | Available | Available | Partial / community |
| **WC 2026 coverage** | Available | Available | Available | Available | Partial |
| **Historical seasons (PSL)** | Good (multi-year) | Good (multi-year) | Excellent | Excellent | Limited |
| **Live latency** | ~30-60 s (polling) | ~15-30 s (polling) | Sub-minute (push feed available) | Sub-minute (push feed available) | Not a live data product |
| **Update mechanism** | REST polling | REST polling | REST + push / MQ delivery | REST + push / streaming | REST polling |
| **Webhook / push support** | No | Plan-dependent | Yes (premium tier) | Yes (premium tier) | No |
| **Player stats quality (PSL)** | Partial (6/10) | Good (7/10) | Excellent (9/10) | Excellent (9/10) | Low (3/10) |
| **Fixture data quality (PSL)** | Good | Good | Excellent | Excellent | Partial |
| **Team logo rights** | Not confirmed for redistribution | Not confirmed for redistribution | Licensed separately — contract defines | Licensed separately — contract defines | Community-sourced, unclear rights |
| **Player image rights** | Not confirmed for redistribution | Not confirmed for redistribution | Separate editorial product | Separate editorial product | Community-sourced, unclear rights |
| **Fantasy-grade player data** | Good | Good | Excellent | Excellent | Not suitable |
| **Free/trial tier** | Yes (100 req/day, dev only) | Yes (trial, dev only) | No | No | Yes (limited, non-commercial) |
| **Self-service sign-up** | Yes | Yes | No — contract only | No — contract only | Yes |
| **Indicative monthly cost** | $10 – $300 | $200 – $800 | $1,000 – $5,000+ | $1,000 – $5,000+ | Free / $0 (non-commercial only) |
| **Rate limits** | Per-day + per-second | Per-day + per-second | Contract-defined | Contract-defined | Per-hour (public) |
| **Caching allowed** | Yes (paid; live max 60 s) | Yes (paid) | Contract-defined | Contract-defined | Yes (community tier) |
| **Commercial redistribution** | Paid tier — verify explicitly | Custom tier required | Enterprise contract | Enterprise contract | Non-commercial only |
| **Attribution required** | Yes (paid) | Yes | Contract-defined | Contract-defined | Yes |
| **POPIA / data compliance** | Self-managed | Self-managed | Enterprise DPA available | Enterprise DPA available | Community product — no DPA |
| **Time to first integration** | Days | Days – weeks | Months | Months | Days (but unsuitable for prod) |
| **Vendor stability risk** | MEDIUM | LOW-MEDIUM | VERY LOW | VERY LOW | HIGH (community project) |
| **Setup complexity** | Low | Medium | High | High | Low (but unsuitable) |
| **Official PSL data authority** | Third-party aggregator | Third-party aggregator | Industry standard; likely PSL's actual data partner | Industry standard | None |

---

## 2. WC 2026 Coverage Notes

| Provider | WC 2026 Coverage | Notes |
|----------|:----------------:|-------|
| API-Football | Expected available | Major tournaments are standard coverage; verify current season availability |
| Sportmonks | Expected available | Historically covers major FIFA competitions |
| Stats Perform / Opta | Yes | Official data partner for major competitions globally |
| Sportradar | Yes | Official data partner for multiple FIFA competitions |
| TheSportsDB | Partial | Community-submitted data only; not suitable for production live coverage |

**PSL One requirement:** WC 2026 was the secondary competition for the current season. Provider must cover both PSL DStv Premiership and WC 2026 under the same licence agreement.

---

## 3. Pricing Detail

### API-Football (api-football.com / api-sports.io)

| Plan | Requests/day | Approx. monthly (USD) | Commercial use |
|------|:-----------:|:---------------------:|:--------------:|
| Free | 100 | $0 | Dev/testing only |
| Starter | 7,500 | ~$10-15 | Verify with provider |
| Pro | 30,000 | ~$45-60 | Yes (paid tier) |
| Ultra | 150,000 | ~$120-200 | Yes |
| Mega | Unlimited | ~$300+ | Yes |

With 2M fans and live-match polling every 30 s from the server (not from clients), peak load depends on how many concurrent server-side cache refreshes are needed. A single cache layer means the backend makes one refresh call per active fixture every 30 s, not one per user. Pro or Ultra tier is the minimum for production.

### Sportmonks

Tiered subscription. Enterprise/commercial tier pricing is by negotiation. Public estimates: $200–800/month for a commercial fan app. Contact required.

### Stats Perform / Opta

No public pricing. Enterprise contracts starting at $10,000–50,000+/year. Bespoke per competition.

### Sportradar

No public pricing. Enterprise contracts. Similar tier to Stats Perform.

### TheSportsDB

Free community tier. Patreon supporter tier available. Not suitable for commercial fan-facing deployment at scale.

---

## 4. Rate Limit Strategy (for server-side adapter)

| Provider | Key limit | PSL One server strategy |
|----------|-----------|------------------------|
| API-Football | Per-day quota + per-second limit | Redis cache: live fixtures 30 s TTL, non-live 5 min, historical 24 h |
| Sportmonks | Per-day quota | Same Redis strategy |
| Stats Perform | Contract-defined | Likely push-based; no polling overhead |
| Sportradar | Contract-defined | Likely push-based; no polling overhead |

The Redis caching strategy is enforced in the `FootballDataProviderCacheService` (see ADR-030). No direct provider calls from frontend — all calls are server-side only.

---

## 5. Logo and Image Rights Summary

| Provider | Team logos | Player images | Club crests (SVG) |
|----------|:----------:|:-------------:|:-----------------:|
| API-Football | PNG URLs provided; redistribution rights UNCONFIRMED | Limited for PSL | Not provided |
| Sportmonks | PNG URLs provided; redistribution rights UNCONFIRMED | Available; rights UNCONFIRMED | Not provided |
| Stats Perform / Opta | Separate editorial product | Separate editorial product; rights contract-defined | Via PSL or partner |
| Sportradar | Separate product | Separate product | Via PSL or partner |
| TheSportsDB | Community-sourced; rights UNCLEAR | Community-sourced; rights UNCLEAR | Not suitable |
| PSL Direct | AUTHORITATIVE | AUTHORITATIVE | AUTHORITATIVE |

**Engineering rule:** Until logo and image rights are explicitly confirmed in writing, all image display uses placeholder styling (colour badges from Club.primaryColor). No provider image URLs served to fans.

---

## 6. RECOMMENDATION

**RECOMMENDED PROVIDER: Sportmonks**

Rationale:
1. Better data quality than API-Football for PSL coverage (7/10 vs 6/10), with more complete player statistics suitable for fantasy scoring.
2. Commercial path is clearer — self-service trial tier for development, upgrade to commercial tier for production without an enterprise contract negotiation.
3. Lower vendor risk than API-Football.
4. Covers both PSL DStv Premiership and WC 2026 under a single account.
5. More predictable API structure and documentation than API-Football for an integration at this scale.
6. Comparable pricing to API-Football at production volume once commercial tier is factored in.

**Recommended phase plan:**
- **Sprint 4 (now):** Sportmonks trial tier for development and proof-of-concept integration only. No fan-facing display.
- **Beta production:** Sportmonks commercial tier. Licensing gate must be completed first.
- **Commercial production:** Upgrade to Stats Perform / Opta or establish direct PSL partnership as the platform gains commercial traction.

**API-Football** remains acceptable for the proof-of-concept adapter (the discovery script already exists at `tools/data-provider-spike/api-football-discovery.mjs`). If the owner has already obtained an API-Football paid key, it can be used for the development adapter in Sprint 4 without re-evaluating.

**TheSportsDB is explicitly excluded** from production consideration due to community-sourced data quality and absence of commercial redistribution rights.

---

## 7. Sources

- API-Football documentation: https://www.api-football.com/documentation-v3
- Sportmonks documentation: https://docs.sportmonks.com
- Stats Perform overview: https://www.statsperform.com/opta/
- Sportradar overview: https://sportradar.com/sports-data/football/
- TheSportsDB: https://www.thesportsdb.com/api.php
- PSL official: https://www.psl.co.za
- Prior evaluation: `docs/data/PSL-DATA-PROVIDER-EVALUATION.md`
