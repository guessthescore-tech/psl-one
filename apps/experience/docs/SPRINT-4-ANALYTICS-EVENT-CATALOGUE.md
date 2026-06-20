# PSL One Experience — Analytics Event Catalogue (Sprint 4)

**Scope:** `apps/experience` premium fan experience (Next.js 15)  
**Revised:** 2026-06-20  
**Privacy framework:** POPIA (South Africa) + GDPR-equivalent consent model  
**Data modes:** `DESIGN_REVIEW_DATA` events MUST be suppressed from production sinks. All preview analytics route to a separate `psl_preview` namespace.

---

## 0. Global Rules

| Rule | Detail |
|---|---|
| No PII in payloads | No email, name, phone, MSISDN, SA ID number, IP address |
| No financial data | No wallet balance, transaction amounts, real-money figures |
| No password fields | Never. Not hashed, not redacted — not included at all |
| No wallet secrets | No tokens, private keys, wallet addresses |
| Consent-aware | Events marked `REQUIRES_CONSENT` must not fire until explicit opt-in is stored (use `analytics_consent` localStorage key or server-side consent flag) |
| Design-review gate | Check `getDataMode() === 'DESIGN_REVIEW_DATA'` before firing any event; route to preview sink if true |
| Session vs user | Use anonymous `session_id` (UUID, regenerated per browser session). Never use `user_id` unless user has consented AND the event is marked `REQUIRES_CONSENT` |
| Timestamp | All events automatically carry `ts` (ISO-8601 UTC), `platform: 'web'`, `app_version` |

---

## 1. Route View Events

Every page navigation fires a `page_viewed` event. Additional context properties vary by page.

| Event name | Page / Route | Properties | Privacy | Status |
|---|---|---|---|---|
| `page_viewed` | `/` (Homepage) | `page: 'home'`, `data_mode`, `fixture_count`, `has_live_match: bool` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/matches` (Match list) | `page: 'matches'`, `active_tab: 'fixtures'\|'live'\|'results'`, `live_count` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/matches/[fixtureId]` (Match centre) | `page: 'match_centre'`, `fixture_id`, `match_status`, `competition` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/matches/[fixtureId]/motm` | `page: 'man_of_the_match'`, `fixture_id` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/predict` (Guess the Score) | `page: 'predict'`, `fixture_count`, `predictions_count` (from localStorage, anonymised) | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/predict/challenge` | `page: 'challenge_create'`, `fixture_id` (from URL param) | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/predict/challenge/accept` | `page: 'challenge_accept'`, `fixture_id`, `challenger_score_home`, `challenger_score_away` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/fantasy` (Fantasy hub) | `page: 'fantasy_hub'`, `auth_state: 'unauthenticated'\|'no_team'\|'has_team'` | ANONYMOUS_DATA | PLANNED |
| `page_viewed` | `/fantasy/onboarding` | `page: 'fantasy_onboarding'` | ANONYMOUS_DATA | PLANNED |
| `page_viewed` | `/fantasy/team` | `page: 'fantasy_team'` | ANONYMOUS_DATA | PLANNED |
| `page_viewed` | `/fantasy/team/transfers` | `page: 'fantasy_transfers'` | ANONYMOUS_DATA | PLANNED |
| `page_viewed` | `/fantasy/team/chips` | `page: 'fantasy_chips'` | ANONYMOUS_DATA | PLANNED |
| `page_viewed` | `/fantasy/points` | `page: 'fantasy_points'` | ANONYMOUS_DATA | PLANNED |
| `page_viewed` | `/fantasy/fixtures` | `page: 'fantasy_fixtures'` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/fantasy/fixture-difficulty` | `page: 'fantasy_fdr'` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/fantasy/stats` | `page: 'fantasy_stats'` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/fantasy/search` | `page: 'fantasy_player_search'` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/fantasy/rules` | `page: 'fantasy_rules'` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/fantasy/leagues` | `page: 'fantasy_leagues'` | ANONYMOUS_DATA | PLANNED |
| `page_viewed` | `/fantasy/leagues/create` | `page: 'league_create'` | ANONYMOUS_DATA | PLANNED |
| `page_viewed` | `/fantasy/leagues/join` | `page: 'league_join'` | ANONYMOUS_DATA | PLANNED |
| `page_viewed` | `/fantasy/leagues/[leagueId]` | `page: 'league_detail'`, `league_id` | ANONYMOUS_DATA | PLANNED |
| `page_viewed` | `/fantasy/leagues/[leagueId]/teams/[teamId]` | `page: 'rival_team'`, `league_id`, `rival_team_id` (opaque) | ANONYMOUS_DATA | PLANNED |
| `page_viewed` | `/fantasy/history` | `page: 'fantasy_history'` | ANONYMOUS_DATA | PLANNED |
| `page_viewed` | `/fantasy/history/[gameweekId]` | `page: 'fantasy_gw_history'`, `gameweek_id` | ANONYMOUS_DATA | PLANNED |
| `page_viewed` | `/players` (Player list) | `page: 'players'` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/players/[playerId]` | `page: 'player_profile'`, `player_id`, `player_position` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/players/[playerId]/stats` | `page: 'player_stats'`, `player_id` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/stats/season` | `page: 'season_stats'` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/stats/standings` | `page: 'standings'` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/stats/compare` | `page: 'player_compare'` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/stats/hall-of-fame` | `page: 'hall_of_fame'` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/stats/awards` | `page: 'awards'` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/media` (Media hub) | `page: 'media_hub'` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/media/[slug]` | `page: 'media_article'`, `article_slug`, `article_type: 'video'\|'editorial'` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/account` | `page: 'account'` | ANONYMOUS_DATA | PLANNED |
| `page_viewed` | `/account/profile` | `page: 'account_profile'` | ANONYMOUS_DATA | PLANNED |
| `page_viewed` | `/account/security` | `page: 'account_security'` | ANONYMOUS_DATA | PLANNED |
| `page_viewed` | `/account/favourite-team` | `page: 'favourite_team'` | ANONYMOUS_DATA | PLANNED |
| `page_viewed` | `/account/delete` | `page: 'account_delete'` | ANONYMOUS_DATA | PLANNED |
| `page_viewed` | `/sign-in` | `page: 'sign_in'`, `referrer_page` (previous route, no params) | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/register` | `page: 'register'` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/forgot-password` | `page: 'forgot_password'` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/reset-password` | `page: 'reset_password'` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/scan` (Badge scanner) | `page: 'scan'` | ANONYMOUS_DATA | PLANNED |
| `page_viewed` | `/quiz/[quizId]` | `page: 'quiz'`, `quiz_id` | ANONYMOUS_DATA | PLANNED |
| `page_viewed` | `/help` | `page: 'help'` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/help/[slug]` | `page: 'help_article'`, `article_slug` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/about` | `page: 'about'` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/privacy` | `page: 'privacy_policy'` | PUBLIC_DATA | PLANNED |
| `page_viewed` | `/terms` | `page: 'terms'` | PUBLIC_DATA | PLANNED |

---

## 2. Fantasy Events

### 2.1 Onboarding

| Event name | Trigger | Page/Component | Properties | Privacy | Status |
|---|---|---|---|---|---|
| `fantasy_onboarding_started` | User clicks "Build My Squad" from no-team state or unauthenticated splash | `/fantasy` → `NoTeamState`, `UnauthenticatedState` | `entry_point: 'no_team_state'\|'unauthenticated_splash'`, `session_id` | ANONYMOUS_DATA | PLANNED |
| `fantasy_onboarding_step_viewed` | Each onboarding step renders | `/fantasy/onboarding` → `OnboardingStep` | `step_index: number`, `step_name: string`, `total_steps: number` | ANONYMOUS_DATA | PLANNED |
| `fantasy_onboarding_completed` | User completes final step and team is created | `/fantasy/onboarding` | `formation_chosen`, `time_to_complete_seconds` (session-only) | ANONYMOUS_DATA | PLANNED |

### 2.2 Squad Management

| Event name | Trigger | Page/Component | Properties | Privacy | Status |
|---|---|---|---|---|---|
| `fantasy_squad_viewed` | Fantasy team pitch renders with players | `/fantasy/team` → `FantasyPitchView` | `player_count`, `formation`, `has_captain: bool`, `has_vice_captain: bool`, `budget_remaining_band: 'lt5'\|'5-10'\|'gt10'` (banded, not exact) | ANONYMOUS_DATA | PLANNED |
| `fantasy_player_selected` | User taps a player in the pool to add | `/fantasy/search`, `/fantasy/team` → `PlayerPool`, `PlayerPoolRow` | `player_id`, `player_position`, `player_price_band: string` (banded) | ANONYMOUS_DATA | PLANNED |
| `fantasy_transfer_completed` | User confirms transfer in `TransferConfirmation` | `/fantasy/team/transfers` → `TransferConfirmation` | `players_in_count`, `players_out_count`, `transfers_used`, `is_wildcard: bool` | ANONYMOUS_DATA | PLANNED |
| `fantasy_formation_changed` | User picks a new formation | `/fantasy/team` → `FormationSelector` | `formation_from`, `formation_to` | ANONYMOUS_DATA | PLANNED |
| `fantasy_captain_assigned` | User assigns captain via `CaptainMarker` | `/fantasy/team` → `CaptainMarker` | `player_position`, `is_vice: bool` | ANONYMOUS_DATA | PLANNED |

### 2.3 Chips

| Event name | Trigger | Page/Component | Properties | Privacy | Status |
|---|---|---|---|---|---|
| `fantasy_chip_activated` | User confirms chip activation | `/fantasy/team/chips` → `ChipSelector`, `ChipCard` | `chip_type: 'triple_captain'\|'bench_boost'\|'free_hit'\|'wildcard'`, `gameweek_id` | ANONYMOUS_DATA | PLANNED |

### 2.4 Points & History

| Event name | Trigger | Page/Component | Properties | Privacy | Status |
|---|---|---|---|---|---|
| `fantasy_points_viewed` | Points breakdown page renders | `/fantasy/points` | `gameweek_id`, `total_points` (banded: `lt50`, `50-100`, `100-150`, `gt150`) | ANONYMOUS_DATA | PLANNED |
| `fantasy_gw_history_viewed` | Gameweek history detail renders | `/fantasy/history/[gameweekId]` → `GameweekHistoryCard` | `gameweek_id` | ANONYMOUS_DATA | PLANNED |

---

## 3. Prediction Events

> **Critical:** `user_id` is NEVER included in prediction event payloads unless the user has explicitly opted in (`REQUIRES_CONSENT` events). Predictions are stored in localStorage, not server-side, in the current design-review build.

| Event name | Trigger | Page/Component | Properties | Privacy | Status |
|---|---|---|---|---|---|
| `prediction_submitted` | User clicks "Lock in prediction" and `savePrediction()` runs | `/predict` → `FixturePredictionCard.handleSubmit()` | `fixture_id`, `home_score_prediction: number`, `away_score_prediction: number`, `is_edit: bool`, `competition` | PUBLIC_DATA | PLANNED |
| `prediction_share_clicked` | User clicks "Share" button after prediction is locked | `/predict` → `FixturePredictionCard` (share button) | `fixture_id`, `share_source: 'post_prediction_card'` | PUBLIC_DATA | PLANNED |
| `prediction_share_completed` | User picks a share channel in `ShareSheet` | `/predict` → `ShareSheet` | `fixture_id`, `channel: 'whatsapp'\|'web_share'\|'copy_link'` | PUBLIC_DATA | PLANNED |

---

## 4. Challenge Events

| Event name | Trigger | Page/Component | Properties | Privacy | Status |
|---|---|---|---|---|---|
| `challenge_created` | User clicks "Create challenge link" and `buildChallengeLink()` runs | `/predict/challenge` → `ChallengePageInner.handleCreateChallenge()` | `fixture_id`, `home_score_prediction: number`, `away_score_prediction: number`, `competition` | PUBLIC_DATA | PLANNED |
| `challenge_link_copied` | User clicks copy button in `ChallengeShareSheet` | `/predict/challenge` → `ChallengeShareSheet` | `fixture_id` | PUBLIC_DATA | PLANNED |
| `challenge_link_shared` | User shares via WhatsApp or Web Share in `ChallengeShareSheet` | `/predict/challenge` → `ChallengeShareSheet` | `fixture_id`, `channel: 'whatsapp'\|'web_share'` | PUBLIC_DATA | PLANNED |
| `challenge_accepted` | Challenger opens `/predict/challenge/accept` and submits their own prediction | `/predict/challenge/accept` | `fixture_id`, `challenger_score_home`, `challenger_score_away`, `accepter_score_home`, `accepter_score_away`, `result: 'challenger_wins'\|'accepter_wins'\|'draw'` | PUBLIC_DATA | PLANNED |
| `challenge_page_viewed_via_link` | Accept page renders with pre-populated params (tracking inbound viral flow) | `/predict/challenge/accept` | `fixture_id`, `has_challenger_scores: bool` | PUBLIC_DATA | PLANNED |

---

## 5. League Events

| Event name | Trigger | Page/Component | Properties | Privacy | Status |
|---|---|---|---|---|---|
| `league_created` | User submits `LeagueCreateForm` successfully | `/fantasy/leagues/create` → `LeagueCreateForm` | `league_type: 'private'\|'public'`, `is_first_league: bool` | ANONYMOUS_DATA | PLANNED |
| `league_joined` | User submits code in `LeagueCodeInput` and is accepted | `/fantasy/leagues/join` → `LeagueCodeInput` | `join_method: 'code'\|'link'` | ANONYMOUS_DATA | PLANNED |
| `league_invite_shared` | User opens `InviteLeagueSheet` and shares | `/fantasy/leagues/[leagueId]` → `InviteLeagueSheet` | `channel: 'whatsapp'\|'web_share'\|'copy_link'` | ANONYMOUS_DATA | PLANNED |
| `league_standings_viewed` | Standings table renders | `/fantasy/leagues/[leagueId]` → `LeagueStandingsTable` | `league_id`, `rank_position_band: 'top10'\|'11-50'\|'51-200'\|'200+'` | ANONYMOUS_DATA | PLANNED |

---

## 6. Account Events

| Event name | Trigger | Page/Component | Properties | Privacy | Status |
|---|---|---|---|---|---|
| `account_registration_started` | User lands on `/register` or clicks sign-up CTA | `/register` | `entry_point: 'nav'\|'fantasy_gate'\|'cta'` | PUBLIC_DATA | PLANNED |
| `account_registration_completed` | Registration form is submitted successfully | `/register` | `registration_method: 'email'` (no email value ever) | ANONYMOUS_DATA | PLANNED |
| `account_sign_in_completed` | Sign-in completes successfully | `/sign-in` | `sign_in_method: 'email'` | ANONYMOUS_DATA | PLANNED |
| `favourite_team_selected` | User picks favourite club in `FavouriteTeamSelector` | `/account/favourite-team` → `FavouriteTeamSelector` | `team_id`, `team_name`, `is_change: bool` (first time vs update) | ANONYMOUS_DATA | PLANNED |
| `account_deleted` | User confirms account deletion | `/account/delete` → `DeleteAccountDialog` | (no properties — session ends after this event) | REQUIRES_CONSENT | PLANNED |

---

## 7. Engagement & Navigation Events

| Event name | Trigger | Page/Component | Properties | Privacy | Status |
|---|---|---|---|---|---|
| `match_centre_viewed` | Match detail page renders | `/matches/[fixtureId]` | `fixture_id`, `match_status`, `competition`, `arrived_from: 'fixture_rail'\|'matches_list'\|'direct'\|'prediction_card'` | PUBLIC_DATA | PLANNED |
| `player_compared` | Player comparison renders with two players | `/stats/compare` → `PlayerComparison` | `player_a_id`, `player_b_id`, `metric_count` | PUBLIC_DATA | PLANNED |
| `hall_of_fame_viewed` | Hall of Fame page renders | `/stats/hall-of-fame` | (no extra properties) | PUBLIC_DATA | PLANNED |
| `awards_viewed` | Awards page renders | `/stats/awards` | `award_count` | PUBLIC_DATA | PLANNED |
| `media_article_opened` | User opens a media article | `/media/[slug]` → `ArticleDetail`, `VideoPlayerShell` | `article_slug`, `article_type: 'video'\|'editorial'`, `competition` | PUBLIC_DATA | PLANNED |
| `video_played` | User starts video playback | `/media/[slug]` → `VideoPlayerShell` | `video_slug`, `video_duration_seconds` | PUBLIC_DATA | PLANNED |
| `scan_page_opened` | Scan page renders | `/scan` | (no extra properties) | ANONYMOUS_DATA | PLANNED |
| `quiz_started` | Quiz shell renders and first question appears | `/quiz/[quizId]` → `QuizShell` | `quiz_id` | ANONYMOUS_DATA | PLANNED |
| `quiz_completed` | All quiz questions answered | `/quiz/[quizId]` → `QuizShell` | `quiz_id`, `score_band: 'low'\|'mid'\|'high'` (never exact score) | ANONYMOUS_DATA | PLANNED |
| `man_of_the_match_voted` | MOTM card voted on | `/matches/[fixtureId]/motm` → `ManOfTheMatchCard` | `fixture_id`, `player_id` | ANONYMOUS_DATA | PLANNED |

---

## 8. Session Events

> Session events track aggregate engagement without tying to identity.

| Event name | Trigger | Page/Component | Properties | Privacy | Status |
|---|---|---|---|---|---|
| `session_started` | App first renders (layout mount, or after session gap > 30 min) | `apps/experience/src/app/layout.tsx` | `data_mode`, `session_id` (anonymous UUID), `referrer_domain` (domain only, no path) | PUBLIC_DATA | PLANNED |
| `return_visit` | Session starts and device has a previous `psl_session_last_seen` key older than 1 day | `layout.tsx` (session init) | `days_since_last_visit_band: '1'\|'2-7'\|'8-30'\|'31+'` — no timestamps that could reconstruct PII | ANONYMOUS_DATA | PLANNED |

---

## 9. Consent & Preview Rules

### 9.1 Consent Classification

| Classification | Meaning | Consent required |
|---|---|---|
| `PUBLIC_DATA` | Event contains no user context, only public match/player data | No consent needed |
| `ANONYMOUS_DATA` | Event is session-scoped. No user identity. `session_id` is a random UUID per browser session | No consent needed |
| `REQUIRES_CONSENT` | Event includes any user-linked data (even opaque hashed IDs) | Must check `analytics_consent === 'granted'` in localStorage |

### 9.2 Design Review Gate

```typescript
// Pseudo-implementation — analytics service layer
function track(event: string, props: Record<string, unknown>) {
  if (getDataMode() === 'DESIGN_REVIEW_DATA') {
    // Route to preview sink only — never to production
    previewAnalytics.track(event, { ...props, _preview: true });
    return;
  }
  productionAnalytics.track(event, props);
}
```

### 9.3 Properties Never Allowed in Any Payload

- `email`, `phone`, `name`, `surname`, `sa_id`, `passport_number`
- `ip_address`, `device_id` (fingerprinting prohibited)
- `password`, `token`, `api_key`, `wallet_secret`
- `balance`, `transaction_amount`, `rand_value`, `financial_*`
- Raw `user_id` without consent (use `session_id` instead)
