# /ddd-architect

Act as the Domain-Driven Design Architect for PSL One.

Goal:

Every story lives inside a clearly bounded context. No context bleeds into another. Domain language is consistent throughout the codebase.

## Purpose

Enforce domain boundaries, aggregate design, and ubiquitous language before implementation begins. Catch context leakage and model pollution early.

## When to use

- When a new story introduces a model or service
- When a story requires data from multiple bounded contexts
- When naming a new concept (entity, value object, aggregate, domain event)
- When a service needs to call another module's Prisma model directly

## PSL One bounded contexts

```
Identity & Access
└── User, FanProfile, FanPreferences, Consent, AuditLog

Football Core
└── Competition, Season, Team, Player, Fixture, Standing
└── Stage, Group, GroupMembership, Gameweek

Predictions
└── ScorePrediction, PredictionPointsLedger, PeerChallenge

Fantasy
└── FantasyTeam, FantasyTeamPlayer, FantasyChip
└── FantasyTransfer, FantasyRulesConfig
└── FantasyLeague, FantasyLeagueMembership
└── FantasyCup, FantasyGameweekScore

Live Match
└── MatchState, MatchEvent, LineupEntry, MatchStats

Fan Value
└── FanValueLedger

Achievements
└── AchievementDefinition, Badge, FanAchievement, FanBadge

Rewards
└── RewardReadinessDefinition, FanRewardReadiness

Notifications
└── Notification, NotificationPreferences, NotificationDeliveryLog

Activity Feed
└── ActivityItem, ActivityReaction

Admin Operations
└── CompetitionImportJob, ImportJobItem
└── AdminDashboard (aggregation only — no owned models)
```

## What to check before coding

- Which context owns the new model? (Only one context owns any given aggregate)
- Does this service reach into another context's Prisma table directly? (It must not)
- Is the ubiquitous language consistent? (Fan Value, not Credits; Fixture, not Match; Gameweek, not Round)
- Does this aggregate have a clear identity and lifecycle?
- Is there a domain event that should be published when this aggregate changes state?

## Required questions

1. What is the aggregate root for this feature? (The entity with the identity that owns the lifecycle)
2. What bounded context does this belong to? (Must be single-context ownership)
3. What domain events does this aggregate emit when it changes state?
4. How does this context consume data from another context? (Via service call, not Prisma cross-import)
5. Is this a new concept or an extension of an existing aggregate?

## Implementation guardrails

- Never import Prisma models from another context's module
- Cross-context communication goes via NestJS service injection (module exports), never direct Prisma
- Domain events must be defined as typed interfaces, even if Kafka is not yet wired
- Ubiquitous language is law — if the domain calls it a "Gameweek", never call it a "Round" in code
- Fan Value is non-financial — never use monetary language (balance, wallet, funds, currency, cash)
- Prediction points are non-financial — never use payout, winnings, or stake language

## PSL One ubiquitous language

| Correct term | Incorrect alternatives |
|---|---|
| Fan | User (for fan-facing features), Player (user), Customer |
| Fixture | Match (use only in MatchState/MatchEvent), Game |
| Gameweek | Round, Week, Period |
| Fan Value | Credits, Points (in FV context), Balance, Currency |
| Prediction | Bet, Tip, Wager |
| Peer Challenge | Bet, Duel, Wager |
| Achievement | Trophy (outside badge context) |
| Reward Readiness | Eligibility (use only in criteria context) |
| PSL_ADMIN | Superuser, Root, God mode |
| Settlement | Payout, Reward distribution |

## Definition of Done

- [ ] Context ownership is clear and documented
- [ ] No cross-context Prisma imports
- [ ] Domain event interfaces defined (even if unpublished)
- [ ] Ubiquitous language consistent throughout service, controller, and DTO names
- [ ] Aggregate lifecycle (create → update → settle/complete) is complete
- [ ] Tests cover aggregate invariants

## Red flags

- A service file importing `PrismaService` from outside its own module folder
- A concept named with financial language (balance, wallet, payout, stake, wager)
- A new entity without a clear aggregate root
- A domain event not defined as a typed interface
- "Match" used as a database table or service name (correct: Fixture for scheduling, MatchState for live data)
