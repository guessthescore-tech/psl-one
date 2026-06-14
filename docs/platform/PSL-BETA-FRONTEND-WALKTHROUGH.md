# PSL Beta Frontend Walkthrough

> **Historical Implementation Record** — This document was created during Sprint delivery as a working reference. It may be superseded by content in `docs/architecture/`, `docs/engineering/`, `docs/reference/`, or `docs/domain/`. Do not use as the canonical source for system behaviour.


> Status: READY  
> Last updated: 2026-06-14 (STORY-39)  
> Total pages: 336 (319 from STORY-38 + 17 admin beta-launch + 1 fan /beta)

## Purpose

Step-by-step walkthrough confirming all 19 domain areas render correctly with seeded data before beta cohort invite.

## Step 1 — Authentication
| Page | URL | Verify |
|------|-----|--------|
| Login | `/login` | Form renders, PSL_ADMIN can log in |
| Admin hub | `/admin` | Shows all module links |

## Step 2 — Clubs & Football Data
| Page | URL | Verify |
|------|-----|--------|
| Club list (fan) | `/clubs` | 16 PSL clubs visible |
| Club detail (fan) | `/clubs/:slug` | Crest, players, stats |
| Admin clubs | `/admin/clubs` | 16 clubs, edit capacity |

## Step 3 — Players & Stats
| Page | URL | Verify |
|------|-----|--------|
| Players (fan) | `/players` | Player list with club filter |
| Player detail (fan) | `/players/:id` | Stats, ratings |
| Admin player stats | `/admin/player-stats` | Admin can update stats |

## Step 4 — Fixtures
| Page | URL | Verify |
|------|-----|--------|
| Fixtures (fan) | `/fixtures` | Published PSL fixtures |
| Admin fixtures | `/admin/fixtures` | Import, publish, manage |

## Step 5 — Match Centre
| Page | URL | Verify |
|------|-----|--------|
| Standings (fan) | `/match-centre` | PSL season table |
| Live match (fan) | `/matches/:fixtureId` | Match detail |
| Admin match centre | `/admin/match-centre` | Standings, form, ratings |
| Admin ingestion | `/admin/match-centre/ingestion` | Ingestion log |

## Step 6 — Fantasy Football
| Page | URL | Verify |
|------|-----|--------|
| Team (fan) | `/fantasy` | Pick squad |
| Transfers (fan) | `/fantasy/transfers` | Transfer rules apply |
| Leagues (fan) | `/fantasy/leagues` | Private/public leagues |
| Admin rules | `/admin/fantasy/rules` | Rules config |
| Admin calibration | `/admin/fantasy-price-calibration` | Price batch |

## Step 7 — Guess the Score
| Page | URL | Verify |
|------|-----|--------|
| Predictions (fan) | `/predictions` | Open predictions list |
| Make prediction (fan) | `/predictions/new` | Submit score prediction |
| Admin predictions | `/admin/predictions` | Lock/settle/void |

## Step 8 — Social Predictions
| Page | URL | Verify |
|------|-----|--------|
| Marketplace (fan) | `/social-predictions` | Listings |
| Create challenge (fan) | `/social-predictions/create/:marketId` | Points-only challenge |
| Leaderboard (fan) | `/social-predictions/leaderboard` | Ranking |
| Admin social | `/admin/social-predictions` | Admin controls |

## Step 9 — Leaderboards
| Page | URL | Verify |
|------|-----|--------|
| Leaderboards (fan) | `/leaderboards` | PSL season scope |
| Admin engagement | `/admin/engagement` | Season-scoped admin view |

## Step 10 — Fan Value
| Page | URL | Verify |
|------|-----|--------|
| Fan Value (fan) | `/fan-value` | Ledger entries |
| Admin fan value | `/admin/fan-value` | Admin view |

## Step 11 — Achievements
| Page | URL | Verify |
|------|-----|--------|
| Achievements (fan) | `/achievements` | Earned badges |
| Admin achievements | `/admin/achievements` | Definitions |

## Step 12 — Notifications
| Page | URL | Verify |
|------|-----|--------|
| Notifications (fan) | `/notifications` | Fan inbox |
| Admin notifications | `/admin/notifications` | Admin broadcast |

## Step 13 — Activity Feed
| Page | URL | Verify |
|------|-----|--------|
| Activity (fan) | `/activity` | Social feed |
| Admin activity | `/admin/activity` | Admin view |

## Step 14 — Campaigns
| Page | URL | Verify |
|------|-----|--------|
| Campaigns (fan) | `/campaigns` | Active campaigns |
| Campaign rewards (fan) | `/campaign-rewards` | Earn points |
| Admin campaigns | `/admin/campaigns` | Create/approve/archive |

## Step 15 — Rewards
| Page | URL | Verify |
|------|-----|--------|
| Rewards (fan) | `/rewards` | Reward definitions |
| Admin rewards | `/admin/reward-definitions` | Manage definitions |

## Step 16 — Wallet Sandbox
| Page | URL | Verify |
|------|-----|--------|
| Wallet (fan) | `/wallet` | Sandbox status, no real funds |
| Admin wallet | `/admin/wallet` | Provider config (sandbox only) |

## Step 17 — Media
| Page | URL | Verify |
|------|-----|--------|
| Media (fan) | `/media` | Published content |
| Admin media | `/admin/media` | Rights gate visible |

## Step 18 — Beta Feedback & Admin Operations
| Page | URL | Verify |
|------|-----|--------|
| Admin beta feedback | `/admin/beta-feedback` | Feedback overview |
| Admin operations | `/admin/operations` | Module readiness (includes 8 new beta entries) |
| Admin beta launch | `/admin/beta-launch` | 13-check gate hub |

## Step 19 — Beta Landing (Fan)
| Page | URL | Verify |
|------|-----|--------|
| Beta landing | `/beta` | Cohort invite landing page renders |

## Walkthrough Sign-off

| Domain | Admin | Fan | Sign-off |
|--------|-------|-----|----------|
| Authentication | ✓ | ✓ | |
| Clubs | ✓ | ✓ | |
| Players | ✓ | ✓ | |
| Fixtures | ✓ | ✓ | |
| Match Centre | ✓ | ✓ | |
| Fantasy | ✓ | ✓ | |
| Guess the Score | ✓ | ✓ | |
| Social Predictions | ✓ | ✓ | |
| Leaderboards | ✓ | ✓ | |
| Fan Value | ✓ | ✓ | |
| Achievements | ✓ | ✓ | |
| Notifications | ✓ | ✓ | |
| Activity Feed | ✓ | ✓ | |
| Campaigns | ✓ | ✓ | |
| Rewards | ✓ | ✓ | |
| Wallet Sandbox | ✓ | ✓ | |
| Media | ✓ | ✓ | |
| Beta Feedback | ✓ | — | |
| Beta Landing | — | ✓ | |
