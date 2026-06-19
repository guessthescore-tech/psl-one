# PSL One — Sports Data Provider Evaluation
**Last updated:** 2026-06-19 (STORY-FE-PREMIUM-01A)
**Scope:** PSL DStv Premiership (South Africa) data for production integration

**Important disclaimer:** This evaluation is based on publicly available documentation and pricing pages as of 2026-06-19. Technical availability does not equal legal permission for commercial redistribution. All providers must be evaluated against their commercial terms before any production integration. See `docs/data/PSL-DATA-LICENSING-GATE.md` for the owner approval checklist.

---

## Providers Evaluated

1. API-Football (api-football.com / RapidAPI)
2. Sportmonks
3. Stats Perform / Opta
4. Sportradar
5. Official PSL feed or partnership
6. Manual/CSV import fallback

---

## 1. API-Football

**Official site:** https://www.api-football.com
**Documentation:** https://www.api-football.com/documentation-v3

### South African Premier Soccer League Coverage

- The PSL (DStv Premiership) is listed in API-Football's covered leagues
- Country filter `South Africa` returns leagues including the Premier Soccer League
- Historical seasons available (multiple years)
- Coverage includes: fixtures, standings, teams, players, squad lists, lineups, match events, top scorers

### Endpoints Relevant to PSL One

| Endpoint | PSL Coverage | Notes |
|----------|-------------|-------|
| `GET /leagues?country=South Africa` | Available | Returns league ID |
| `GET /leagues?id={id}` | Available | Seasons, coverage details |
| `GET /standings?league={id}&season={year}` | Available | Current and historical |
| `GET /fixtures?league={id}&season={year}` | Available | Full fixture list |
| `GET /fixtures?id={id}` | Available | Single fixture with lineups/events |
| `GET /teams?league={id}&season={year}` | Available | Team list |
| `GET /players?league={id}&season={year}` | Available | Player stats |
| `GET /players/squads?team={id}` | Available | Squad list |
| `GET /events?fixture={id}` | Available | Goals, cards, substitutions |
| `GET /lineups?fixture={id}` | Available | Starting XI |
| `GET /injuries?league={id}&season={year}` | Partial | Not all leagues |
| `GET /predictions?fixture={id}` | Available | Win probability (note: this is statistical, not gambling) |

### Live Score Latency

- API-Football provides live fixture updates
- Polling-based — no WebSocket
- Live endpoints update on poll cycle (typically 30-60 second refresh recommended)
- Suitable for PSL One's live match centre use case with caching

### Logos and Image Rights

- Team logos are provided as hosted URLs
- Player profile images: limited availability for PSL players
- **Warning:** Team logos from API-Football may not be cleared for redistribution. Verify terms before serving to end users.
- Recommended approach: use API-Football logo URLs for internal admin/preview only; obtain separate rights for fan-facing display

### Pricing (as of available public information)

| Plan | Requests/day | Monthly cost (approx.) | Notes |
|------|-------------|------------------------|-------|
| Free | 100/day | $0 | Dev/testing only, no commercial use |
| Starter | 7,500/day | ~$10-15/month | Small projects |
| Pro | 30,000/day | ~$45-60/month | Standard production |
| Ultra | 150,000/day | ~$120-200/month | High traffic |
| Mega | Unlimited | ~$300+/month | Enterprise |

**PSL One assessment:** With 2M fans and match-day polling at ~30s intervals, a live match with 50K active users generating backend refreshes requires careful caching. The Pro or Ultra plan would be appropriate for production.

### Rate Limits

- Per-second limits apply in addition to per-day limits
- Retry-after headers are provided on 429 responses
- Server-side caching is mandatory (5-minute cache for non-live, 30-second for live)

### Commercial Use Rights

- Free tier: development and testing only, not for commercial redistribution
- Paid tiers: commercial use permitted within plan limits
- **Must verify:** redistribution to 2M fans constitutes "commercial use" — confirm with API-Football support

### Caching Restrictions

- Paid plans allow caching
- Do not cache live endpoints for more than 60 seconds
- Historical data: aggressive caching acceptable (24h+)

### Attribution

- Required on paid plans
- Typical: "Data provided by API-Football" visible in data-heavy pages
- Confirm exact attribution wording with API-Football commercial team

### Data Quality

- PSL coverage is available but not their primary market (European leagues are more complete)
- Player statistics completeness varies by club and season
- Historical seasons available, with some gaps for older PSL seasons
- Known to have incomplete player image coverage for South African clubs

### SLA / Support

- No formal SLA on standard plans
- Community forum and email support
- Response time not guaranteed

### Long-term Vendor Risk

- Primarily consumer-oriented API aggregator
- Not purpose-built for commercial sports data redistribution
- Pricing and coverage may change without notice
- **Risk level: MEDIUM** — suitable for prototype and early production, not for long-term enterprise dependency

### Recommendation

**SUITABLE FOR:** Prototype and early beta data integration
**NOT SUITABLE FOR:** Long-term production at scale without formal commercial agreement

---

## 2. Sportmonks

**Official site:** https://www.sportmonks.com
**Documentation:** https://docs.sportmonks.com

### South African PSL Coverage

- Sportmonks covers the South African Premier Soccer League
- Coverage includes fixtures, standings, teams, players, lineups, events, statistics

### Endpoints Relevant to PSL One

| Endpoint | Coverage | Notes |
|----------|---------|-------|
| Fixtures | Available | Live and scheduled |
| Standings | Available | Real-time |
| Teams | Available | With squad |
| Players | Available | With statistics |
| Lineups | Available | Pre-match and actual |
| Events | Available | Goals, cards, subs |
| Statistics | Available | Match and season |
| Odds | Available | **Do not use — out of scope for PSL One** |

### Pricing (public tier information)

Sportmonks has a tiered subscription model with custom enterprise pricing for commercial redistribution. The PSL One use case (2M fans, commercial app) would fall into the higher tiers.

- Free trial: available for development
- Production: custom pricing, contact required
- **Estimated monthly cost for commercial app with PSL coverage:** $200-800/month depending on included endpoints

### Data Quality

- Higher quality than API-Football for supported leagues
- More complete player statistics
- Faster live data refresh

### Commercial Use Rights

- Commercial redistribution requires explicit tier agreement
- Terms available at sportmonks.com/terms
- **Must review commercial terms before any production use**

### Long-term Vendor Risk

- More enterprise-oriented than API-Football
- Longer track record in commercial sports data
- **Risk level: LOW-MEDIUM**

### Recommendation

**SUITABLE FOR:** Production integration once commercial agreement is established
**PREFERRED OVER API-FOOTBALL FOR:** High-traffic production at scale

---

## 3. Stats Perform / Opta

**Official site:** https://www.statsperform.com
**Product:** Opta data (acquired by Stats Perform)

### South African PSL Coverage

- Stats Perform / Opta covers the DStv Premiership
- Coverage includes comprehensive match data, player tracking data, tactical metrics, event data
- Opta is the industry-standard data provider for premium sports media

### Key Capabilities

- Real-time event data (sub-1-minute latency possible with push delivery)
- Player tracking and spatial data (optional add-on)
- Fantasy sport data packages
- Editorial photography available through partner network

### Pricing

- Enterprise only — no public pricing
- Minimum engagement typically $10,000-50,000+/year for commercial app use
- PSL-specific coverage requires a bespoke agreement

### Commercial Use Rights

- Formal commercial contracts required
- Data reselling and redistribution rights must be explicitly agreed
- Attribution requirements vary by contract

### Long-term Vendor Risk

- Industry standard, highest quality
- Long-term stability
- **Risk level: VERY LOW**

### Recommendation

**SUITABLE FOR:** Long-term production once PSL One reaches commercial scale
**NOT SUITABLE FOR:** Early prototype (cost and commercial complexity)
**IDEAL PATH:** Approach Stats Perform as part of formal PSL partnership discussion

---

## 4. Sportradar

**Official site:** https://sportradar.com
**Coverage relevant:** African football

### South African PSL Coverage

- Sportradar covers the PSL DStv Premiership
- Coverage includes live data, statistics, and results

### Pricing

- Enterprise contracts only
- No public pricing
- Similar tier to Stats Perform

### Long-term Vendor Risk

- One of the two largest sports data companies globally (with Stats Perform/Opta)
- Long-term stability
- **Risk level: VERY LOW**

### Recommendation

**SUITABLE FOR:** Production at scale
**SAME TIER AS:** Stats Perform / Opta — choose based on commercial negotiations and relationship

---

## 5. Official PSL Feed or Partnership

### What This Means

A direct data partnership with the Premier Soccer League itself or its official statistics partner (which has historically included Opta-linked systems).

### Advantages

- Authoritative source — no licensing ambiguity
- Full commercial rights
- Access to official imagery, crest files, player photos
- Potential for exclusive features (pre-match data, official statistics)
- Brand alignment with PSL brand

### Disadvantages

- Complex commercial negotiation required
- Long lead time
- May require PSL to see commercial viability first

### How to Pursue

1. Contact PSL commercial department directly
2. Identify PSL's current official data partner
3. Propose a data integration partnership as part of the PSL One commercial model
4. The PSL One platform itself is the proposition — demonstrating the platform quality (via `apps/experience`) is part of the pitch

### Recommendation

**LONG-TERM PREFERRED PATH** — this is the ultimate source of authority
**Timeline:** 3-12 months depending on PSL commercial interest

---

## 6. Manual / CSV Import Fallback

### What This Means

PSL publishes fixtures and results on its official website. These can be manually transcribed or scraped (with legal permission) into CSV and imported via the existing `SquadImportModule` and `FixtureImportBatch` pipelines.

### Advantages

- No licensing cost
- Uses existing infrastructure
- Good enough for calibration and design review

### Disadvantages

- Manual effort
- Not real-time
- Not scalable to 2M fans

### Recommendation

**SHORT-TERM FALLBACK** during the period before a provider is licensed
**USED IN:** STORY-29 (Fantasy Season Calibration) and STORY-36 (Squad Import & Price Calibration)

---

## Comparison Matrix

| Dimension | API-Football | Sportmonks | Stats Perform / Opta | Sportradar | Official PSL | Manual CSV |
|-----------|-------------|------------|---------------------|------------|--------------|------------|
| PSL coverage | Available | Available | Available | Available | Authoritative | Manual |
| Live latency | ~30-60s poll | ~30s poll | Sub-minute push | Sub-minute push | — | N/A |
| Historical data | Good | Good | Excellent | Excellent | Complete | Partial |
| Player stats | Partial | Good | Excellent | Excellent | Complete | None |
| Images/logos | Limited rights | Limited | Licensed separately | Licensed separately | Full rights | None |
| Fantasy suitability | Good | Good | Excellent | Excellent | Best | None |
| Free trial | Yes | Yes | No | No | N/A | N/A |
| Monthly cost (est.) | $10-300 | $200-800 | $1,000-5,000+ | $1,000-5,000+ | Custom | $0 |
| Commercial terms | Verify | Custom | Enterprise contract | Enterprise contract | Partnership | N/A |
| Data quality | 6/10 | 7/10 | 9/10 | 9/10 | 10/10 | 4/10 |
| Vendor risk | MEDIUM | LOW-MEDIUM | VERY LOW | VERY LOW | VERY LOW | — |
| Setup complexity | Low | Medium | High | High | Very High | Low |
| Time to integrate | Days | Weeks | Months | Months | Months | Days |

---

## Recommended Integration Path

### Phase 1: Prototype (now)
**Provider:** API-Football
**Justification:** Low barrier, covers PSL, suitable for proof-of-concept
**Implementation:** `tools/data-provider-spike/api-football-discovery.mjs` (read-only)
**Constraint:** No production activation without licensing gate

### Phase 2: Beta Production
**Provider:** Sportmonks (upgrade from API-Football if volume justifies)
**Justification:** Better data quality, commercial terms clearer, still self-service
**Implementation:** Via NestJS `FootballDataProvider` adapter (ADR-030)

### Phase 3: Commercial Production
**Provider:** Stats Perform / Opta OR Official PSL Partnership
**Justification:** Authoritative data, full rights, scalable to 2M fans
**Timeline:** Aligned with formal PSL One commercial launch

---

## Licensing Risk Summary

| Risk | Provider | Mitigation |
|------|----------|-----------|
| Redistribution without permission | All | Complete licensing gate before any fan-facing display |
| Logo/image copyright | All | Use only confirmed-licensed assets; fallback to colour badges |
| Rate limit breach | API-Football | Server-side cache with aggressive TTLs |
| Provider data outage | Any single provider | Design adapter for provider switchability |
| PSL official data conflict | Third-party providers | Obtain PSL consent or partnership |

---

## Sources

- API-Football official documentation: https://www.api-football.com/documentation-v3
- API-Football pricing: https://www.api-football.com/pricing
- Sportmonks official documentation: https://docs.sportmonks.com
- Stats Perform product overview: https://www.statsperform.com/opta/
- Sportradar product overview: https://sportradar.com/sports-data/football/
- PSL official website: https://www.psl.co.za

**Note:** Provider pricing and coverage may have changed since this document was written. Always verify current terms directly with each provider before commercial commitment.
