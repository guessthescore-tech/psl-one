# Sprint 6 Known Gaps

## Deferred Items

| Gap | Reason | Future Sprint |
|-----|--------|--------------|
| Challenge settlement scoring | Post-match points attribution requires live data integration | Sprint 7+ |
| Challenge notification to creator when accepted | NotificationsModule hook not added this sprint | Sprint 7 |
| Sportmonks API key in SSM | Key not yet acquired — adapter is ready | When key available |
| Live fixture data from provider | NoOpAdapter returns empty; fixture data still from seed | When key available |
| Challenge leaderboard | No leaderboard integration for PredictionChallenge yet | Sprint 7+ |
| Admin analytics dashboard | Analytics events are logged but not visualised in admin UI | Sprint 7+ |

## S6-05 Status: Partial

The "Live Data Route Upgrade" story was marked partial because:
- Routes exist and are protected correctly
- Adapter is in place and ready
- No ingestion jobs were written (out of scope for trial boundary story)
- No fixture sync from provider yet implemented

This is intentional — the boundary is established, implementation follows when the key is secured.

## PSL Season

PSL is NOT activated. This remains a deliberate gate.

## STORY-40

STORY-40 is RESERVED and will not be used.
