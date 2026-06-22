# Sprint 12 — Known Gaps

| ID | Gap | Impact | Resolution |
|---|---|---|---|
| G1 | football-data.org World Cup live key not validated | HIGH | Owner runs `tools/discovery/sprint-12-football-data-worldcup.mjs` and confirms WC fixtures/teams/standings returned without error |
| G2 | API-Football PSL league 288 not confirmed | HIGH | Owner runs `tools/discovery/sprint-11-provider-coverage.mjs` and confirms league 288 data is accessible |
| G3 | ESPN not wired — research only | LOW | Reconsidered once official licensing and data rights are confirmed; no action in Sprint 12 |
| G4 | Commercial terms not reviewed | HIGH (pre-production gate) | Owner reviews pricing and terms at api-sports.io and football-data.org before any production ingestion |
| G5 | EC2 staging migration not applied | MEDIUM | Owner authorises `terraform apply` on the pending EC2 plan; see `SPRINT-12-OWNER-REVIEW-GUIDE.md` |
| G6 | PSL provider not confirmed — path depends on API-Football validation | HIGH | Resolve G2 first; PSL must remain `INACTIVE` until confirmed |
| G7 | WC2026 and PSL require different adapters — dual-provider switching not in DataProviderService | MEDIUM | Sprint 13: implement per-competition routing in `DataProviderService` if both providers are validated and live ingestion is needed simultaneously |
