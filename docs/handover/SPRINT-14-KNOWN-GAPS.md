# Sprint 14 — Known Gaps

## Gap Register

| ID | Gap | Impact | Resolution |
|---|---|---|---|
| G1 | `PARSE_API_KEY` not in local env | HIGH | Set in `apps/api/.env`; run discovery tools; never commit the key |
| G2 | Parse PSL not yet validated live | HIGH | Depends on G1; run all four discovery tools and record outcomes |
| G3 | Parse PSL `get_fixtures` may be source-empty | KNOWN-ACCEPTABLE | If psl.co.za has not published new-season fixtures, an empty array is the correct response; validate clubs, results, and standings instead; do not treat as adapter failure |
| G4 | API-Football account suspended | MEDIUM — now fallback only | Reactivate at dashboard.api-football.com if PSL fallback is needed |
| G5 | EC2 staging migration not applied | MEDIUM | Authorise `terraform apply` on the beta EC2 module separately |
| G6 | No ingestion pipeline | MEDIUM | Sprint 15 scope; `ParsePslAdapter` currently serves read-only discovery only |
| G7 | Parse.bot is an unofficial scraper | RISK | Dependent on psl.co.za site structure; may break without notice; monitor regularly; commercial terms must be reviewed before production use |

---

## Gap Prioritisation

**Immediate (owner action before production):** G1, G2, G3 (validation run), G7 (terms review)

**Short-term (Sprint 15):** G4 (if PSL fallback needed), G5 (infrastructure), G6 (ingestion)

**Ongoing:** G7 monitoring — check Parse.bot health after any known psl.co.za site changes
