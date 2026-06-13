-- STORY-37: PSL One Media, Sponsor Campaigns & Wallet Activation Foundation
-- Adds: Media Catalogue, Sponsor Management, Campaign Engine, Campaign Rewards,
--       Wallet Integration (sandbox), Campaign Analytics
-- All commercial capabilities default to FOUNDATION_READY or SANDBOX_READY.
-- No production streaming, no real money movement, no real KYC.

-- ── Extend existing enums ─────────────────────────────────────────────────────

ALTER TYPE "FanValueSourceType" ADD VALUE 'CAMPAIGN_REWARD';
ALTER TYPE "FanValueType" ADD VALUE 'CAMPAIGN_POINTS';
ALTER TYPE "NotificationType" ADD VALUE 'CAMPAIGN_STARTED';
ALTER TYPE "NotificationType" ADD VALUE 'CAMPAIGN_COMPLETED';
ALTER TYPE "NotificationType" ADD VALUE 'REWARD_ISSUED';
ALTER TYPE "NotificationType" ADD VALUE 'WALLET_LINKED';
ALTER TYPE "ActivityFeedType" ADD VALUE 'CAMPAIGN_STARTED';
ALTER TYPE "ActivityFeedType" ADD VALUE 'CAMPAIGN_COMPLETED';
ALTER TYPE "ActivityFeedType" ADD VALUE 'REWARD_ISSUED';
ALTER TYPE "ActivityFeedType" ADD VALUE 'WALLET_LINKED';

-- ── Media enums ───────────────────────────────────────────────────────────────

CREATE TYPE "MediaType" AS ENUM (
  'VIDEO', 'LIVE_STREAM', 'SHORT_FORM', 'AUDIO', 'ARTICLE'
);

CREATE TYPE "MediaContentCategory" AS ENUM (
  'MATCH_HIGHLIGHTS', 'INTERVIEW', 'TRAINING', 'PRESS_CONFERENCE',
  'DOCUMENTARY', 'CLUB_NEWS', 'SPONSOR_BRANDED', 'FAN_CONTENT',
  'ACADEMY', 'WOMENS_FOOTBALL', 'LEGENDS', 'EDUCATION', 'OTHER'
);

CREATE TYPE "MediaVisibility" AS ENUM (
  'DRAFT', 'INTERNAL', 'PUBLIC', 'PREMIUM', 'ARCHIVED'
);

CREATE TYPE "MediaRightsStatus" AS ENUM (
  'CLEAR', 'RESTRICTED', 'EXPIRED', 'PENDING_REVIEW'
);

CREATE TYPE "MediaEngagementEventType" AS ENUM (
  'VIEW', 'COMPLETE', 'CTA_CLICK'
);

-- ── Sponsor enums ─────────────────────────────────────────────────────────────

CREATE TYPE "SponsorStatus" AS ENUM (
  'PROSPECT', 'ACTIVE', 'PAUSED', 'EXPIRED'
);

-- ── Campaign enums ────────────────────────────────────────────────────────────

CREATE TYPE "CampaignType" AS ENUM (
  'PREDICTION', 'QUIZ', 'POLL', 'WATCH_AND_WIN', 'CHECK_IN',
  'SCAN_TO_WIN', 'FANTASY_CHALLENGE', 'VOTE_PLAYER_OF_MATCH',
  'REWARD_DROP', 'CLUB_MISSION', 'SPONSOR_OFFER', 'CONTENT_UNLOCK', 'OTHER'
);

CREATE TYPE "CampaignStatus" AS ENUM (
  'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED',
  'PAUSED', 'COMPLETED', 'REJECTED', 'ARCHIVED'
);

CREATE TYPE "CampaignAudienceScope" AS ENUM (
  'GLOBAL', 'CLUB', 'FIXTURE', 'COMPETITION', 'SEASON', 'SEGMENT'
);

CREATE TYPE "CampaignActionType" AS ENUM (
  'WATCH_MEDIA', 'ANSWER_QUIZ', 'VOTE', 'PREDICT_SCORE',
  'JOIN_FANTASY_CHALLENGE', 'CHECK_IN', 'SCAN_QR', 'CLICK_CTA',
  'LINK_WALLET', 'SHARE_CONTENT', 'COMPLETE_PROFILE', 'OTHER'
);

CREATE TYPE "ParticipationStatus" AS ENUM (
  'STARTED', 'IN_PROGRESS', 'COMPLETED', 'REWARDED', 'DISQUALIFIED'
);

CREATE TYPE "ActionValidationStatus" AS ENUM (
  'PENDING', 'VALID', 'INVALID', 'MANUAL_REVIEW'
);

-- ── Reward enums ──────────────────────────────────────────────────────────────

CREATE TYPE "RewardType" AS ENUM (
  'FAN_VALUE_POINTS', 'BADGE', 'VOUCHER', 'AIRTIME', 'DATA_BUNDLE',
  'TICKET_DISCOUNT', 'MERCHANDISE_DISCOUNT', 'CONTENT_ACCESS',
  'EXPERIENCE_ENTRY', 'WALLET_CREDIT_PENDING_PROVIDER', 'OTHER'
);

CREATE TYPE "FanRewardStatus" AS ENUM (
  'ISSUED', 'CLAIMED', 'REDEEMED', 'EXPIRED', 'CANCELLED',
  'PROVIDER_PENDING', 'PROVIDER_FAILED'
);

-- ── Wallet enums ──────────────────────────────────────────────────────────────

CREATE TYPE "WalletProviderType" AS ENUM (
  'MOBILE_WALLET', 'BANKING_PARTNER', 'PAYMENT_GATEWAY', 'VOUCHER_PROVIDER', 'OTHER'
);

CREATE TYPE "WalletProviderStatus" AS ENUM (
  'SANDBOX', 'ACTIVE', 'PAUSED', 'DISABLED'
);

CREATE TYPE "WalletAuthType" AS ENUM (
  'API_KEY', 'OAUTH2', 'MTLS', 'HMAC', 'NONE'
);

CREATE TYPE "WalletLinkStatus" AS ENUM (
  'NOT_LINKED', 'LINK_PENDING', 'LINKED', 'SUSPENDED', 'UNLINKED', 'FAILED'
);

CREATE TYPE "WalletKycStatus" AS ENUM (
  'UNKNOWN', 'NOT_STARTED', 'PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED'
);

CREATE TYPE "WalletTransactionType" AS ENUM (
  'LINK_WALLET', 'UNLINK_WALLET', 'PAYMENT_INITIATED', 'PAYMENT_CONFIRMED',
  'PAYMENT_FAILED', 'REWARD_ISSUANCE_REQUESTED', 'REWARD_ISSUED',
  'REWARD_FAILED', 'VOUCHER_REDEEMED', 'REVERSAL', 'WEBHOOK_EVENT'
);

CREATE TYPE "WalletTransactionStatus" AS ENUM (
  'CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'REVERSED', 'CANCELLED'
);

-- ── Media Catalogue ───────────────────────────────────────────────────────────

CREATE TABLE "media_assets" (
    "id"                  TEXT NOT NULL,
    "title"               TEXT NOT NULL,
    "slug"                TEXT NOT NULL,
    "description"         TEXT,
    "media_type"          "MediaType" NOT NULL,
    "content_category"    "MediaContentCategory" NOT NULL DEFAULT 'OTHER',
    "club_id"             TEXT,
    "competition_id"      TEXT,
    "season_id"           TEXT,
    "fixture_id"          TEXT,
    "player_id"           TEXT,
    "sponsor_id"          TEXT,
    "campaign_id"         TEXT,
    "thumbnail_url"       TEXT,
    "playback_url"        TEXT,
    "duration_seconds"    INTEGER,
    "stream_start_at"     TIMESTAMP(3),
    "stream_end_at"       TIMESTAMP(3),
    "visibility"          "MediaVisibility" NOT NULL DEFAULT 'DRAFT',
    "rights_status"       "MediaRightsStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "is_featured"         BOOLEAN NOT NULL DEFAULT false,
    "is_low_data_available" BOOLEAN NOT NULL DEFAULT false,
    "created_by_user_id"  TEXT,
    "published_at"        TIMESTAMP(3),
    "archived_at"         TIMESTAMP(3),
    "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "media_assets_slug_key" ON "media_assets"("slug");
CREATE INDEX "media_assets_visibility_rights_idx" ON "media_assets"("visibility", "rights_status");
CREATE INDEX "media_assets_club_id_idx" ON "media_assets"("club_id");
CREATE INDEX "media_assets_media_type_idx" ON "media_assets"("media_type");
CREATE INDEX "media_assets_created_at_idx" ON "media_assets"("created_at" DESC);

CREATE TABLE "media_engagement_events" (
    "id"               TEXT NOT NULL,
    "media_asset_id"   TEXT NOT NULL,
    "fan_user_id"      TEXT NOT NULL,
    "event_type"       "MediaEngagementEventType" NOT NULL,
    "idempotency_key"  TEXT,
    "progress_percent" INTEGER,
    "metadata_json"    JSONB,
    "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "media_engagement_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "media_engagement_events_idempotency_key_key" ON "media_engagement_events"("idempotency_key");
CREATE INDEX "media_engagement_events_media_asset_id_idx" ON "media_engagement_events"("media_asset_id");
CREATE INDEX "media_engagement_events_fan_user_id_idx" ON "media_engagement_events"("fan_user_id");
CREATE INDEX "media_engagement_events_event_type_idx" ON "media_engagement_events"("event_type");

-- ── Sponsor Management ────────────────────────────────────────────────────────

CREATE TABLE "sponsors" (
    "id"                    TEXT NOT NULL,
    "name"                  TEXT NOT NULL,
    "slug"                  TEXT NOT NULL,
    "sector"                TEXT,
    "logo_url"              TEXT,
    "website_url"           TEXT,
    "primary_contact_name"  TEXT,
    "primary_contact_email" TEXT,
    "status"                "SponsorStatus" NOT NULL DEFAULT 'PROSPECT',
    "created_at"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sponsors_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sponsors_slug_key" ON "sponsors"("slug");
CREATE INDEX "sponsors_status_idx" ON "sponsors"("status");

-- ── Sponsor Campaigns ─────────────────────────────────────────────────────────

CREATE TABLE "sponsor_campaigns" (
    "id"                      TEXT NOT NULL,
    "title"                   TEXT NOT NULL,
    "slug"                    TEXT NOT NULL,
    "description"             TEXT NOT NULL DEFAULT '',
    "sponsor_id"              TEXT,
    "club_id"                 TEXT,
    "competition_id"          TEXT,
    "season_id"               TEXT,
    "fixture_id"              TEXT,
    "campaign_type"           "CampaignType" NOT NULL DEFAULT 'OTHER',
    "status"                  "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "starts_at"               TIMESTAMP(3) NOT NULL,
    "ends_at"                 TIMESTAMP(3) NOT NULL,
    "audience_scope"          "CampaignAudienceScope" NOT NULL DEFAULT 'GLOBAL',
    "creative_image_url"      TEXT,
    "creative_video_url"      TEXT,
    "call_to_action_label"    TEXT,
    "call_to_action_url"      TEXT,
    "terms_and_conditions"    TEXT,
    "reward_policy_json"      JSONB,
    "targeting_rules_json"    JSONB,
    "max_participations_per_fan" INTEGER,
    "requires_wallet_linked"  BOOLEAN NOT NULL DEFAULT false,
    "requires_content_watch"  BOOLEAN NOT NULL DEFAULT false,
    "requires_age_confirmation" BOOLEAN NOT NULL DEFAULT false,
    "created_by_user_id"      TEXT,
    "approved_by_user_id"     TEXT,
    "approved_at"             TIMESTAMP(3),
    "published_at"            TIMESTAMP(3),
    "paused_at"               TIMESTAMP(3),
    "completed_at"            TIMESTAMP(3),
    "archived_at"             TIMESTAMP(3),
    "created_at"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sponsor_campaigns_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sponsor_campaigns_slug_key" ON "sponsor_campaigns"("slug");
CREATE INDEX "sponsor_campaigns_status_idx" ON "sponsor_campaigns"("status");
CREATE INDEX "sponsor_campaigns_sponsor_id_idx" ON "sponsor_campaigns"("sponsor_id");
CREATE INDEX "sponsor_campaigns_club_id_idx" ON "sponsor_campaigns"("club_id");
CREATE INDEX "sponsor_campaigns_starts_at_ends_at_idx" ON "sponsor_campaigns"("starts_at", "ends_at");

-- ── Campaign Actions ──────────────────────────────────────────────────────────

CREATE TABLE "campaign_actions" (
    "id"                     TEXT NOT NULL,
    "campaign_id"            TEXT NOT NULL,
    "title"                  TEXT NOT NULL,
    "description"            TEXT,
    "action_type"            "CampaignActionType" NOT NULL DEFAULT 'OTHER',
    "required_media_asset_id" TEXT,
    "points_awarded"         INTEGER NOT NULL DEFAULT 0,
    "display_order"          INTEGER NOT NULL DEFAULT 0,
    "is_required"            BOOLEAN NOT NULL DEFAULT true,
    "validation_rules_json"  JSONB,
    "created_at"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "campaign_actions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "campaign_actions_campaign_id_idx" ON "campaign_actions"("campaign_id");

-- ── Fan Campaign Participation ─────────────────────────────────────────────────

CREATE TABLE "fan_campaign_participations" (
    "id"            TEXT NOT NULL,
    "campaign_id"   TEXT NOT NULL,
    "fan_user_id"   TEXT NOT NULL,
    "status"        "ParticipationStatus" NOT NULL DEFAULT 'STARTED',
    "started_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at"  TIMESTAMP(3),
    "rewarded_at"   TIMESTAMP(3),
    "metadata_json" JSONB,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fan_campaign_participations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "fan_campaign_participations_campaign_id_fan_user_id_key"
    ON "fan_campaign_participations"("campaign_id", "fan_user_id");
CREATE INDEX "fan_campaign_participations_fan_user_id_idx" ON "fan_campaign_participations"("fan_user_id");
CREATE INDEX "fan_campaign_participations_status_idx" ON "fan_campaign_participations"("status");

-- ── Fan Campaign Action Completions ───────────────────────────────────────────

CREATE TABLE "fan_campaign_action_completions" (
    "id"                TEXT NOT NULL,
    "participation_id"  TEXT NOT NULL,
    "campaign_action_id" TEXT NOT NULL,
    "fan_user_id"       TEXT NOT NULL,
    "completed_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validation_status" "ActionValidationStatus" NOT NULL DEFAULT 'PENDING',
    "idempotency_key"   TEXT,
    "metadata_json"     JSONB,
    "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fan_campaign_action_completions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "fan_campaign_action_completions_participation_id_campaign_action_id_key"
    ON "fan_campaign_action_completions"("participation_id", "campaign_action_id");
CREATE UNIQUE INDEX "fan_campaign_action_completions_idempotency_key_key"
    ON "fan_campaign_action_completions"("idempotency_key");
CREATE INDEX "fan_campaign_action_completions_fan_user_id_idx" ON "fan_campaign_action_completions"("fan_user_id");

-- ── Reward Definitions ────────────────────────────────────────────────────────

CREATE TABLE "reward_definitions" (
    "id"                 TEXT NOT NULL,
    "title"              TEXT NOT NULL,
    "description"        TEXT,
    "reward_type"        "RewardType" NOT NULL,
    "sponsor_id"         TEXT,
    "club_id"            TEXT,
    "campaign_id"        TEXT,
    "points_amount"      INTEGER,
    "display_value"      TEXT,
    "display_currency"   TEXT,
    "inventory_limit"    INTEGER,
    "inventory_issued"   INTEGER NOT NULL DEFAULT 0,
    "provider_reference" TEXT,
    "expires_at"         TIMESTAMP(3),
    "terms_and_conditions" TEXT,
    "is_active"          BOOLEAN NOT NULL DEFAULT true,
    "created_at"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reward_definitions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "reward_definitions_reward_type_idx" ON "reward_definitions"("reward_type");
CREATE INDEX "reward_definitions_sponsor_id_idx" ON "reward_definitions"("sponsor_id");
CREATE INDEX "reward_definitions_is_active_idx" ON "reward_definitions"("is_active");

-- ── Fan Rewards ───────────────────────────────────────────────────────────────

CREATE TABLE "fan_rewards" (
    "id"                    TEXT NOT NULL,
    "reward_definition_id"  TEXT NOT NULL,
    "fan_user_id"           TEXT NOT NULL,
    "campaign_id"           TEXT,
    "status"                "FanRewardStatus" NOT NULL DEFAULT 'ISSUED',
    "issued_at"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimed_at"            TIMESTAMP(3),
    "redeemed_at"           TIMESTAMP(3),
    "expires_at"            TIMESTAMP(3),
    "wallet_transaction_id" TEXT,
    "voucher_reference"     TEXT,
    "idempotency_key"       TEXT,
    "metadata_json"         JSONB,
    "created_at"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fan_rewards_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "fan_rewards_idempotency_key_key" ON "fan_rewards"("idempotency_key");
CREATE INDEX "fan_rewards_fan_user_id_idx" ON "fan_rewards"("fan_user_id");
CREATE INDEX "fan_rewards_status_idx" ON "fan_rewards"("status");
CREATE INDEX "fan_rewards_reward_definition_id_idx" ON "fan_rewards"("reward_definition_id");

-- ── Wallet Provider Detail ────────────────────────────────────────────────────
-- References IntegrationProviderConfig — does not duplicate provider readiness system

CREATE TABLE "wallet_provider_details" (
    "id"                            TEXT NOT NULL,
    "integration_provider_config_id" TEXT NOT NULL,
    "name"                          TEXT NOT NULL,
    "slug"                          TEXT NOT NULL,
    "provider_type"                 "WalletProviderType" NOT NULL DEFAULT 'MOBILE_WALLET',
    "status"                        "WalletProviderStatus" NOT NULL DEFAULT 'SANDBOX',
    "public_display_name"           TEXT,
    "base_url"                      TEXT,
    "auth_type"                     "WalletAuthType" NOT NULL DEFAULT 'NONE',
    "contact_name"                  TEXT,
    "contact_email"                 TEXT,
    "notes"                         TEXT,
    "created_at"                    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"                    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wallet_provider_details_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "wallet_provider_details_integration_provider_config_id_key"
    ON "wallet_provider_details"("integration_provider_config_id");
CREATE UNIQUE INDEX "wallet_provider_details_slug_key" ON "wallet_provider_details"("slug");

-- ── Wallet Links ──────────────────────────────────────────────────────────────

CREATE TABLE "wallet_links" (
    "id"                    TEXT NOT NULL,
    "fan_user_id"           TEXT NOT NULL,
    "wallet_provider_id"    TEXT NOT NULL,
    "provider_customer_ref" TEXT,
    "provider_wallet_ref"   TEXT,
    "status"                "WalletLinkStatus" NOT NULL DEFAULT 'NOT_LINKED',
    "kyc_status"            "WalletKycStatus" NOT NULL DEFAULT 'UNKNOWN',
    "linked_at"             TIMESTAMP(3),
    "last_verified_at"      TIMESTAMP(3),
    "unlinked_at"           TIMESTAMP(3),
    "metadata_json"         JSONB,
    "created_at"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wallet_links_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "wallet_links_fan_user_id_wallet_provider_id_key"
    ON "wallet_links"("fan_user_id", "wallet_provider_id");
CREATE INDEX "wallet_links_fan_user_id_idx" ON "wallet_links"("fan_user_id");
CREATE INDEX "wallet_links_status_idx" ON "wallet_links"("status");

-- ── Wallet Transactions ───────────────────────────────────────────────────────

CREATE TABLE "wallet_transactions" (
    "id"                    TEXT NOT NULL,
    "wallet_provider_id"    TEXT NOT NULL,
    "fan_user_id"           TEXT,
    "wallet_link_id"        TEXT,
    "transaction_type"      "WalletTransactionType" NOT NULL,
    "status"                "WalletTransactionStatus" NOT NULL DEFAULT 'CREATED',
    "amount"                DECIMAL(18,6),
    "currency"              TEXT,
    "provider_reference"    TEXT,
    "idempotency_key"       TEXT,
    "request_summary_json"  JSONB,
    "response_summary_json" JSONB,
    "error_code"            TEXT,
    "error_message"         TEXT,
    "created_at"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "wallet_transactions_idempotency_key_key" ON "wallet_transactions"("idempotency_key");
CREATE INDEX "wallet_transactions_fan_user_id_idx" ON "wallet_transactions"("fan_user_id");
CREATE INDEX "wallet_transactions_wallet_provider_id_idx" ON "wallet_transactions"("wallet_provider_id");
CREATE INDEX "wallet_transactions_transaction_type_idx" ON "wallet_transactions"("transaction_type");
CREATE INDEX "wallet_transactions_created_at_idx" ON "wallet_transactions"("created_at" DESC);

-- ── Campaign Analytics Snapshots ──────────────────────────────────────────────

CREATE TABLE "campaign_analytics_snapshots" (
    "id"                     TEXT NOT NULL,
    "campaign_id"            TEXT NOT NULL,
    "snapshot_date"          DATE NOT NULL,
    "impressions"            INTEGER NOT NULL DEFAULT 0,
    "unique_participants"    INTEGER NOT NULL DEFAULT 0,
    "completed_participants" INTEGER NOT NULL DEFAULT 0,
    "actions_completed"      INTEGER NOT NULL DEFAULT 0,
    "rewards_issued"         INTEGER NOT NULL DEFAULT 0,
    "rewards_redeemed"       INTEGER NOT NULL DEFAULT 0,
    "video_views"            INTEGER NOT NULL DEFAULT 0,
    "video_completions"      INTEGER NOT NULL DEFAULT 0,
    "cta_clicks"             INTEGER NOT NULL DEFAULT 0,
    "wallet_links_started"   INTEGER NOT NULL DEFAULT 0,
    "wallet_links_completed" INTEGER NOT NULL DEFAULT 0,
    "metadata_json"          JSONB,
    "created_at"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "campaign_analytics_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "campaign_analytics_snapshots_campaign_id_snapshot_date_key"
    ON "campaign_analytics_snapshots"("campaign_id", "snapshot_date");
CREATE INDEX "campaign_analytics_snapshots_campaign_id_idx" ON "campaign_analytics_snapshots"("campaign_id");
