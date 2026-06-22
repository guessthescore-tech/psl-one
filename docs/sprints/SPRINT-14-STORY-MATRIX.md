# Sprint 14 — Story Matrix

## Stories

| Story | Title | Status |
|---|---|---|
| STORY-S14-01 | ParsePslAdapter implementation | DONE |
| STORY-S14-02 | ProviderRouterService PSL route update | DONE |
| STORY-S14-03 | DataProviderService parse-psl option | DONE |
| STORY-S14-04 | Sprint 14 discovery tools | DONE |
| STORY-S14-05 | Live validation attempt | PENDING_LIVE_KEY |
| STORY-S14-06 | Sprint 14 docs and handover package | DONE |

---

## Sprint Outcome

Parse PSL official-site adapter implemented and wired as PSL primary provider. Source-empty fixture handling documented and accepted as a valid data-availability state. Live validation is pending `PARSE_API_KEY` provisioning by the project owner.

---

## Provider Routing After Sprint 14

| Competition | Primary | Fallback |
|---|---|---|
| WC / WORLD_CUP_2026 | FootballDataOrgAdapter | NoOpAdapter |
| PSL / BETWAY_PREMIERSHIP / 288 | ParsePslAdapter | ApiFootballAdapter or NoOpAdapter |
| All others | NoOpAdapter | — |

---

## Sprint 14 Go / No-Go

**CONDITIONAL_GO**

Code is shippable. Live validation and owner-authorised infrastructure steps remain pending. See `SPRINT-14-PROVIDER-GO-NOGO.md` and `SPRINT-14-BETA-GO-NOGO.md` for full condition list.

---

## Carried Into Sprint 15

- STORY-S14-05: Complete live validation after `PARSE_API_KEY` provisioning
- EC2 staging migration (carried from Sprint 13)
- Read-only PSL data ingestion job
- API-Football account reactivation (if PSL fallback is required)
