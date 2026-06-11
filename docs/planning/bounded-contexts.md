# PSL One — Bounded Contexts

**Generated:** 2026-06-08  
**Author:** PSL One Chief Architecture Agent

---

## Overview

| Context | Priority | Phase | Owner |
|---|---|---|---|
| Identity | P0 | Sprint 0 | Platform Team |
| Fan | P0 | Sprint 0 | Platform Team |
| Football | P0 | Sprint 0 | Football Core Agent |
| Content | P1 | Phase 1 | Content Team |
| Fantasy | P1 | Phase 1 | Fantasy Agent |
| Loyalty / Rewards (GTS) | P1 | Phase 1 | GTS Rewards Agent |
| Wallet | P1 | Phase 1 | Wallet Agent |
| Membership | P2 | Phase 2 | Platform Team |
| Sponsor | P1 | Phase 1 | Platform Team |
| Ticketing | P2 | Phase 2 | Platform Team |
| Marketplace | P3 | Phase 3 | Platform Team |
| Analytics | P1 | Phase 1 | Platform Team |
| Notifications | P0 | Sprint 0 | Platform Team |
| Administration | P0 | Sprint 0 | Platform Team |

---

## 1. Identity Bounded Context

### Purpose
Single source of truth for all authenticated principals. Every fan, club admin, sponsor user and PSL staff member has an Identity record. Governs registration, authentication, consent and session management.

### Ownership
Platform Team — PSL One Core Engineering

### Entities
- `User` — authenticated principal
- `Identity` — POPIA-verified supporter identity
- `Session` — active auth session
- `ConsentRecord` — immutable POPIA consent log
- `VerificationToken` — OTP / email verification
- `PasswordResetToken`

### APIs
**REST (Auth endpoints):**
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/verify-mobile`
- `POST /auth/refresh-token`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

**GraphQL (Identity queries — via Federation):**
- `Query.me`
- `Query.user(id)`
- `Mutation.updateConsent`
- `Mutation.deleteAccount`

### Events Published
| Topic | Event | Payload |
|---|---|---|
| `identity.user.registered` | `UserRegistered` | userId, email, mobile, timestamp |
| `identity.user.verified` | `UserVerified` | userId, verificationType |
| `identity.user.logged_in` | `UserLoggedIn` | userId, ipAddress, userAgent |
| `identity.user.deleted` | `UserDeleted` | userId, reason |
| `identity.consent.granted` | `ConsentGranted` | userId, purpose, timestamp |
| `identity.consent.withdrawn` | `ConsentWithdrawn` | userId, purpose, timestamp |

### Database
- **Engine:** PostgreSQL (RDS Aurora Serverless v2)
- **Schema:** `identity`
- **Tables:** `users`, `sessions`, `consent_records`, `verification_tokens`
- **Isolation:** Private database. No other service reads this DB directly.

### Dependencies
- **External:** Auth provider (AWS Cognito or Auth0)
- **Internal:** None (this is the root dependency)
- **Infrastructure:** Redis (session cache), SES (email verification), Clickatell (OTP SMS)

---

## 2. Fan Bounded Context

### Purpose
Manages the extended supporter profile, preferences and club affiliations. The Fan profile is the engagement and personalisation layer built on top of Identity.

### Ownership
Platform Team

### Entities
- `FanProfile` — extended profile
- `ClubAffiliation` — primary and secondary club associations
- `PlayerFavourite` — favourite players list
- `FanPreferences` — content, notification, language preferences

### APIs
**GraphQL:**
- `Query.myProfile`
- `Mutation.updateProfile`
- `Mutation.setClubAffiliation`
- `Mutation.addPlayerFavourite`

### Events Published
| Topic | Event |
|---|---|
| `fan.profile.created` | `FanProfileCreated` |
| `fan.profile.updated` | `FanProfileUpdated` |
| `fan.club.affiliation_set` | `ClubAffiliationSet` |

### Events Consumed
| Topic | Action |
|---|---|
| `identity.user.registered` | Create FanProfile |
| `loyalty.tier.upgraded` | Update FanTier on profile |

### Database
- **Engine:** PostgreSQL
- **Schema:** `fan`
- **Tables:** `fan_profiles`, `club_affiliations`, `player_favourites`, `fan_preferences`

### Dependencies
- Identity BC (upstream — via events)
- Football BC (reads Club/Player reference data)

---

## 3. Football Bounded Context

### Purpose
The authoritative data store for all football entities: competitions, seasons, clubs, players, fixtures, results and standings. All other domains reference Football entities but do not own them.

### Ownership
Football Core Agent

### Entities
- `Competition` (PSL, MTN8, Nedbank Cup, CAF CL, AFCON)
- `Season`
- `Club`
- `Player`
- `Fixture`
- `Result`
- `Standing`
- `MatchEvent` (goal, card, substitution)
- `Group` (cup stage)

### APIs
**GraphQL:**
- `Query.competitions`
- `Query.competition(id)`
- `Query.currentSeason(competitionId)`
- `Query.fixtures(seasonId, gameweekId?)`
- `Query.fixture(id)`
- `Query.standings(seasonId)`
- `Query.clubs`
- `Query.club(id)`
- `Query.players`
- `Query.player(id)`

**REST (admin):**
- `POST /admin/fixtures` — manual fixture entry
- `PUT /admin/fixtures/:id` — update fixture
- `POST /admin/results` — enter match result

### Events Published
| Topic | Event |
|---|---|
| `football.fixture.created` | `FixtureCreated` |
| `football.fixture.updated` | `FixtureUpdated` |
| `football.match.started` | `MatchStarted` |
| `football.match.finished` | `MatchFinished` |
| `football.goal.scored` | `GoalScored` |
| `football.player.transferred` | `PlayerTransferred` |
| `football.season.started` | `SeasonStarted` |
| `football.season.ended` | `SeasonEnded` |

### Database
- **Engine:** PostgreSQL
- **Schema:** `football`
- **Tables:** `competitions`, `seasons`, `clubs`, `players`, `fixtures`, `results`, `standings`, `match_events`
- **Cache:** Redis (live match state, standings)

### Dependencies
- **External:** Football data provider (Sportradar / API-Football) via ACL
- **Internal:** None (upstream domain)

---

## 4. Content Bounded Context

### Purpose
Manages editorial content — news articles, match previews, highlights, interviews, behind-the-scenes content. Content is club and competition scoped.

### Ownership
Content Team

### Entities
- `Article`
- `Video`
- `MediaAsset`
- `Author`
- `Tag`
- `ContentSchedule`

### APIs
**GraphQL:**
- `Query.articles(clubId?, competitionId?, limit, cursor)`
- `Query.article(id)`
- `Query.videos(clubId?)`
- `Mutation.createArticle` (club admin / PSL admin only)
- `Mutation.publishArticle`

### Events Published
| Topic | Event |
|---|---|
| `content.article.published` | `ArticlePublished` |
| `content.video.published` | `VideoPublished` |
| `content.content.engaged` | `ContentEngaged` (fan views content) |

### Events Consumed
| Topic | Action |
|---|---|
| `football.match.finished` | Auto-create match report scaffold |
| `fan.profile.created` | Personalise content feed |

### Database
- **Engine:** PostgreSQL
- **Schema:** `content`
- **Storage:** S3 (media assets), CloudFront (CDN delivery)

---

## 5. Fantasy Bounded Context

### Purpose
Full fantasy football engine for competition seasons. Manages squads, transfers, gameweek scoring, chips and leaderboards.

### Ownership
Fantasy Platform Agent

### Entities
- `FantasyLeague`
- `FantasyTeam` (15 players per fan per season)
- `Gameweek`
- `Transfer`
- `Chip`
- `FantasyScore`
- `Leaderboard`

### Squad Rules (Server-Enforced)
- 15 players: 2 GK, 5 DEF, 5 MID, 3 FWD
- 11 starters, 4 bench
- Max 3 players from same club
- Free transfers: 1 per gameweek (rolling max 2)
- Extra transfers: -4 points each

### APIs
**GraphQL:**
- `Query.myFantasyTeam(seasonId)`
- `Query.fantasyLeaderboard(leagueId)`
- `Mutation.createFantasyTeam`
- `Mutation.makeTransfer`
- `Mutation.activateChip`
- `Mutation.setCaptain`
- `Mutation.setViceCaptain`

### Events Published
| Topic | Event |
|---|---|
| `fantasy.team.created` | `FantasyTeamCreated` |
| `fantasy.transfer.made` | `FantasyTransferMade` |
| `fantasy.chip.activated` | `ChipActivated` |
| `fantasy.points.awarded` | `FantasyPointsAwarded` |
| `fantasy.leaderboard.updated` | `LeaderboardUpdated` |

### Events Consumed
| Topic | Action |
|---|---|
| `football.match.finished` | Trigger gameweek scoring |
| `football.goal.scored` | Real-time point updates |
| `football.fixture.updated` | Update transfer deadline |

### Database
- **Engine:** PostgreSQL
- **Schema:** `fantasy`
- **Cache:** Redis (live leaderboard, gameweek state)

### Dependencies
- Football BC (player data, match events)
- Identity BC (team ownership)

---

## 6. Loyalty / Rewards Bounded Context (includes GTS)

### Purpose
Manages points accumulation, tier progression, reward catalogue and redemptions. Includes the Guess The Score (GTS) prediction engine.

### Ownership
GTS Rewards Engine Agent + Wallet Agent

### GTS Sub-Domain Entities
- `Prediction` — fan's score guess for a fixture
- `PredictionSettlement` — outcome after match.finished
- `Leaderboard` (GTS)

### GTS Rules
- One prediction per fixture per fan
- Predictions locked at kickoff
- Exact score: maximum points
- Correct result: partial points
- Cannot be used as a sportsbook (no real money)

### Loyalty Entities
- `LoyaltyAccount`
- `PointsTransaction` (immutable)
- `Reward`
- `RedemptionOrder`
- `EarningRule`
- `Campaign`

### Earning Rules (Default)
| Action | Points |
|---|---|
| Registration | 100 |
| Email verified | 50 |
| Daily login | 5 |
| Match prediction | 20 |
| Correct GTS result | 100 |
| Exact GTS score | 500 |
| Fantasy participation | 50/gameweek |
| Ticket purchase | 200 |
| Content engagement | 2 |
| Referral | 500 |
| Sponsor campaign | Configurable |

### APIs
**GraphQL:**
- `Query.myLoyaltyAccount`
- `Query.myPredictions(gameweekId)`
- `Query.rewards`
- `Query.gtsLeaderboard`
- `Mutation.createPrediction`
- `Mutation.redeemReward`

### Events Published
| Topic | Event |
|---|---|
| `loyalty.points.awarded` | `PointsAwarded` |
| `loyalty.points.deducted` | `PointsDeducted` |
| `loyalty.tier.upgraded` | `TierUpgraded` |
| `loyalty.reward.redeemed` | `RewardRedeemed` |
| `gts.prediction.created` | `PredictionCreated` |
| `gts.prediction.settled` | `PredictionSettled` |

### Events Consumed
| Topic | Action |
|---|---|
| `identity.user.registered` | Create LoyaltyAccount, award registration points |
| `football.match.finished` | Settle predictions |
| `fantasy.points.awarded` | Award loyalty points |
| `ticketing.ticket.purchased` | Award points |
| `marketplace.order.paid` | Award points |
| `sponsor.campaign.completed` | Award campaign points |

### Database
- **Engine:** PostgreSQL
- **Schema:** `loyalty`, `gts`
- **Tables:** `loyalty_accounts`, `points_transactions`, `rewards`, `redemption_orders`, `earning_rules`, `predictions`, `prediction_settlements`

---

## 7. Wallet Bounded Context

### Purpose
Financial-grade digital wallet. Phase 1: points/loyalty wallet. Phase 3: ZAR financial wallet with banking partner.

### Ownership
Wallet Agent

### Phase 1 Scope
- Points balance (derived from loyalty)
- Wallet credits/debits
- Redemption tracking

### Phase 3 Scope
- ZAR stored value
- Payments integration
- Cashback
- Banking partner compliance

### Entities
- `Wallet`
- `WalletTransaction` (immutable ledger)
- `WalletBalance` (computed view)

### APIs
**GraphQL:**
- `Query.myWallet`
- `Query.walletTransactions(limit, cursor)`
- `Mutation.redeemPoints` (Phase 1)
- `Mutation.topUpWallet` (Phase 3)
- `Mutation.withdrawFunds` (Phase 3)

### Events Published
| Topic | Event |
|---|---|
| `wallet.created` | `WalletCreated` |
| `wallet.credited` | `WalletCredited` |
| `wallet.debited` | `WalletDebited` |
| `wallet.frozen` | `WalletFrozen` |

### Events Consumed
| Topic | Action |
|---|---|
| `identity.user.registered` | Create Wallet |
| `loyalty.points.awarded` | Credit loyalty wallet |
| `loyalty.reward.redeemed` | Debit wallet |
| `gts.prediction.settled` | Credit/debit based on outcome |

### Database
- **Engine:** PostgreSQL
- **Schema:** `wallet`
- **Design:** Double-entry ledger. Balance is never stored — always computed from transactions.

---

## 8. Membership Bounded Context

### Purpose
Manage club membership subscriptions, tiers, benefits and renewal.

### Ownership
Platform Team

### Entities
- `Membership`
- `MembershipTier`
- `MembershipBenefit`
- `MembershipSubscription`

### Revenue Share
- 80% to Club, 20% to Platform

### Dependencies
- Identity BC
- Wallet BC (payment processing)
- Loyalty BC (membership earns points)

---

## 9. Marketplace Bounded Context

### Purpose
E-commerce for football merchandise, memorabilia, experiences and travel. Aspiration: "Amazon of Football."

### Ownership
Platform Team

### Entities
- `Product`
- `Vendor` (clubs, sponsors, partners)
- `Cart`
- `Order`
- `OrderLine`
- `Shipment`
- `Return`

### Revenue Share
- Merchandise: 70% Vendor / 30% Platform
- Experiences: TBD

### Dependencies
- Identity BC
- Wallet BC (payment)
- Loyalty BC (earn points on purchase)
- Payment Provider (Peach / Ozow) via ACL

---

## 10. Ticketing Bounded Context

### Purpose
Phase 1: Aggregate external ticketing. Phase 2: Unified marketplace. Phase 3: Native ticketing engine.

### Ownership
Platform Team

### Phase 1 ACL Partners
- Computicket
- TicketPro
- Stadium operators

### Native (Phase 3) Entities
- `Event`
- `Ticket`
- `SeatMap`
- `TicketOrder`
- `TicketValidation`

### Events Published
| Topic | Event |
|---|---|
| `ticketing.ticket.purchased` | `TicketPurchased` |
| `ticketing.ticket.transferred` | `TicketTransferred` |
| `ticketing.ticket.validated` | `TicketValidated` |

---

## 11. Sponsor Bounded Context

### Purpose
Sponsor onboarding, campaign management, audience targeting, activation and ROI reporting.

### Ownership
Platform Team (Commercial)

### Entities
- `Sponsor`
- `Campaign`
- `CampaignParticipation`
- `AudienceSegment`
- `SponsorReport`
- `SponsorContract`

### Privacy Rules
- Zero PII to sponsors — aggregated segments only
- All campaigns must be PSL-approved before activation
- Betway: category exclusivity for sports betting

### Tier Structure
- Tier 1: Headline Sponsor (1 slot — Betway)
- Tier 2: Strategic Category Partners (Banking, Telecom, Automotive, Retail, Insurance)
- Tier 3: Campaign Sponsors (seasonal)

---

## 12. Analytics Bounded Context

### Purpose
Aggregate all engagement events into a unified audience intelligence layer. Powers sponsor reporting, club dashboards, PSL executive KPIs, AI recommendations.

### Ownership
Platform Team (Data)

### Design
- Read-only consumer of all Kafka topics
- Writes to Snowflake via Kafka connector
- Exposes reporting APIs to Sponsor, Club, PSL portals

### Key Metrics Tracked
- Fan registrations, MAU, DAU
- Engagement per feature
- Sponsor campaign performance
- Fantasy participation rates
- GTS participation rates
- Ticket sales attribution
- Marketplace conversion rates
- Loyalty programme health

---

## 13. Notifications Bounded Context

### Purpose
Event-driven, multi-channel notification delivery engine. No business logic — pure delivery infrastructure.

### Channels
- Push (FCM for Android, APNS for iOS)
- Email (AWS SES)
- SMS (Clickatell / Infobip)
- WhatsApp (Meta Business API)
- In-App (real-time via WebSocket)

### Entities
- `NotificationTemplate`
- `NotificationLog`
- `NotificationPreference`
- `NotificationQueue`

### Design
- Templates are localised (EN, Zulu, Xhosa, Afrikaans — roadmap)
- Preference checking before dispatch (fan can opt out per channel)
- Rate limiting to prevent notification fatigue
- Delivery receipt tracking

---

## 14. Administration Bounded Context

### Purpose
Back-office tooling for PSL admins, club admins and platform operators.

### Features
- User management (search, suspend, delete)
- Content moderation
- Campaign approval
- Reward management
- Financial reporting
- Audit log viewer
- System health dashboard
- Feature flags

### RBAC Roles
| Role | Permissions |
|---|---|
| `SUPER_ADMIN` | Full platform access |
| `PSL_ADMIN` | League-level operations |
| `CLUB_ADMIN` | Club-scoped operations |
| `SPONSOR_ADMIN` | Sponsor campaign management |
| `COMPLIANCE_OFFICER` | Wallet freeze, POPIA requests |
| `CONTENT_EDITOR` | Content creation/publish |
| `SUPPORT_AGENT` | Fan profile view, raise tickets |
