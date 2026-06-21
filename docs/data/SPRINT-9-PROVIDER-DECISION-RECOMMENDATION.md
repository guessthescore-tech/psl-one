# Sprint 9 — Provider Decision Recommendation

## Summary

**Preliminary recommendation: Sportmonks as primary provider.**

This recommendation is based on adapter maturity and prior investigation only. It is explicitly pending live trial validation with a replacement key.

---

## Decision Factors

| Factor | Sportmonks | SportsDataIO | Notes |
|--------|-----------|--------------|-------|
| PSL Premier League coverage | **Pending trial** | **Pending trial** | Cannot confirm without live key |
| WC2026 coverage | **Pending trial** | **Pending trial** (UCL trial ≠ WC2026) | Critical for beta context |
| Adapter maturity | Fully implemented ✅ | Skeleton only ⚠️ | Sportmonks has clear advantage |
| DataProviderService integration | Wired in ✅ | Not yet wired ⚠️ | Sportmonks is production-ready path |
| Auth method | `Authorization: Bearer` header ✅ | `Ocp-Apim-Subscription-Key` header ✅ | Both server-side only |
| Trial scope | Full API (with valid key) | UCL only (Competition ID 3) | SportsDataIO trial insufficient for PSL/WC2026 |
| Rate limit handling | 429 graceful ✅ | 429 graceful ✅ | Both safe |
| getStandings() | Implemented ✅ | Implemented ✅ | Both ready |
| Betting/odds endpoints | PROHIBITED ✅ | PROHIBITED ✅ | PSL policy — both compliant |
| Frontend key exposure | NEVER ✅ | NEVER ✅ | Both server-side only |
| Commercial terms | **Unknown** | **Unknown** | Owner must review before activation |
| Prior investigation | Favored Sportmonks | Secondary candidate | See tools/data-provider-spike/ |
| Current validation status | BLOCKED_BY_REPLACEMENT_TOKEN | BLOCKED_BY_REPLACEMENT_TOKEN | Both blocked |

---

## Recommendation

### Primary: Sportmonks

Rationale:
1. The adapter is fully implemented, tested (20 tests), and wired to `DataProviderService`
2. Prior spike investigation (`tools/data-provider-spike/`) favored Sportmonks
3. SportsDataIO free trial scope (UCL only) is insufficient to validate PSL or WC2026 fixture coverage
4. Sportmonks uses standard `Authorization: Bearer` header (not query param), which is cleaner and more secure

### Secondary: SportsDataIO

Keep as backup/fallback candidate:
- Adapter skeleton exists and handles auth correctly
- Could be wired to `DataProviderService` if Sportmonks trial reveals coverage gaps
- UCL trial validates the auth model and endpoint structure even if PSL coverage is unknown

---

## Owner Decision Gates

Before activating Sportmonks (or any provider) in production, the owner must confirm:

1. **PSL fixture coverage**: Sportmonks must return fixture data for the PSL Premier League competition. Run: `PROVIDER=sportmonks SEASON_ID=<psl-season-id> node tools/discovery/provider-coverage-check.mjs`

2. **WC2026 fixture coverage**: Sportmonks must return World Cup 2026 fixture data. Run with WC2026 season ID.

3. **Field mapping**: All required PSL One fields (`externalId`, `homeTeamName`, `awayTeamName`, `kickoffAt`, `status`) must be present. Run: `PROVIDER=sportmonks node tools/discovery/provider-field-mapping-check.mjs`

4. **Commercial terms**: Owner must review Sportmonks pricing and confirm licensing rights for PSL data. URL: https://sportmonks.com/pricing

5. **Rate limits**: Owner must confirm the plan's rate limits are sufficient for 2 million fans at match time.

6. **Staging migration applied**: The settlement fields must be present in the staging DB before activating provider ingestion.

---

## What This Recommendation Does NOT Authorize

- Production provider ingestion is NOT enabled by this document
- PSL season activation is NOT authorized
- No provider key is committed, printed, or stored outside of local env
- SportsDataIO is NOT wired to DataProviderService (intentional; decision deferred)

---

## Next Steps After Owner Validates

1. Generate replacement Sportmonks key → place in `apps/api/.env`
2. Run `node tools/discovery/provider-health-check.mjs` → confirm health
3. Run coverage and field mapping checks
4. Record results in `docs/data/SPRINT-9-PROVIDER-VALIDATION-RESULTS.md`
5. Review commercial terms
6. If all gates pass → Sprint 10 can wire Sportmonks to DataProviderService for staging ingestion
