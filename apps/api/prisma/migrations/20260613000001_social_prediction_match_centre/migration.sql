-- STORY-38: Social Prediction Challenge Marketplace + Match Centre
-- 11 new enums, 13 new models

-- Enums: Social Prediction
CREATE TYPE "PredictionMarketType" AS ENUM ('MATCH_RESULT', 'BOTH_TEAMS_TO_SCORE', 'FIRST_GOALSCORER', 'TOTAL_GOALS_OVER_UNDER', 'HALF_TIME_RESULT', 'CORRECT_SCORE', 'ANYTIME_GOALSCORER', 'PLAYER_TO_BE_BOOKED');
CREATE TYPE "PredictionMarketStatus" AS ENUM ('DRAFT', 'OPEN', 'LOCKED', 'SETTLED', 'VOID');
CREATE TYPE "ChallengeListingStatus" AS ENUM ('OPEN', 'PARTIALLY_MATCHED', 'FULLY_MATCHED', 'WITHDRAWN', 'EXPIRED', 'CANCELLED');
CREATE TYPE "ChallengeListingVisibility" AS ENUM ('PUBLIC', 'FRIENDS_ONLY', 'LEAGUE_ONLY', 'PRIVATE');
CREATE TYPE "ChallengeMatchStatus" AS ENUM ('PENDING_SETTLEMENT', 'SETTLED', 'VOID', 'CORRECTED');
CREATE TYPE "ChallengeScoringStatus" AS ENUM ('AWAITING_LOCK', 'LOCKED', 'PENDING_SETTLEMENT', 'SETTLED', 'VOID', 'CORRECTED');
CREATE TYPE "SocialPredictionEntryType" AS ENUM ('OPPORTUNITY_ALLOCATED', 'COMMITMENT_RECORDED', 'POINTS_AWARDED', 'POINTS_FORGONE', 'VOID_RESTORED', 'CORRECTION', 'ADMIN_ADJUSTMENT');

-- Enums: Match Centre
CREATE TYPE "DataSourceType" AS ENUM ('MANUAL', 'SEEDED', 'SANDBOX_PROVIDER', 'OFFICIAL_PROVIDER');
CREATE TYPE "DataStatus" AS ENUM ('PROVISIONAL', 'LIVE', 'VERIFIED', 'FINAL', 'CORRECTED');
CREATE TYPE "FreshnessStatus" AS ENUM ('FRESH', 'DELAYED', 'STALE', 'OFFLINE', 'MANUAL');
CREATE TYPE "ComplianceReviewStatus" AS ENUM ('INTERNAL_REVIEW_REQUIRED', 'LEGAL_REVIEW_REQUIRED', 'APPROVED', 'CONDITIONALLY_APPROVED', 'REJECTED');

-- Social Prediction Tables
CREATE TABLE "prediction_market_configs" (
    "id" TEXT NOT NULL,
    "market_type" "PredictionMarketType" NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "base_opportunity" INTEGER NOT NULL DEFAULT 100,
    "allowed_multipliers_json" JSONB NOT NULL,
    "min_commitment_pct" INTEGER NOT NULL DEFAULT 10,
    "max_commitment_pct" INTEGER NOT NULL DEFAULT 100,
    "points_return_rate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "season_id" TEXT NOT NULL,
    "created_by_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "prediction_market_configs_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "prediction_market_configs_season_id_market_type_key" ON "prediction_market_configs"("season_id", "market_type");
ALTER TABLE "prediction_market_configs" ADD CONSTRAINT "prediction_market_configs_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "fixture_prediction_markets" (
    "id" TEXT NOT NULL,
    "fixture_id" TEXT NOT NULL,
    "market_config_id" TEXT NOT NULL,
    "market_type" "PredictionMarketType" NOT NULL,
    "status" "PredictionMarketStatus" NOT NULL DEFAULT 'DRAFT',
    "home_selection_label" TEXT NOT NULL,
    "draw_selection_label" TEXT,
    "away_selection_label" TEXT NOT NULL,
    "base_opportunity" INTEGER NOT NULL DEFAULT 100,
    "points_return_rate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "allowed_multipliers_json" JSONB NOT NULL,
    "settled_outcome" TEXT,
    "locks_at" TIMESTAMP(3),
    "locked_at" TIMESTAMP(3),
    "settled_at" TIMESTAMP(3),
    "voided_at" TIMESTAMP(3),
    "void_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "fixture_prediction_markets_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "fixture_prediction_markets_fixture_id_market_type_key" ON "fixture_prediction_markets"("fixture_id", "market_type");
CREATE INDEX "fixture_prediction_markets_fixture_id_status_idx" ON "fixture_prediction_markets"("fixture_id", "status");
ALTER TABLE "fixture_prediction_markets" ADD CONSTRAINT "fixture_prediction_markets_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixtures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "fixture_prediction_markets" ADD CONSTRAINT "fixture_prediction_markets_market_config_id_fkey" FOREIGN KEY ("market_config_id") REFERENCES "prediction_market_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "gameweek_points_allocations" (
    "id" TEXT NOT NULL,
    "fan_user_id" TEXT NOT NULL,
    "gameweek_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "total_allocation" INTEGER NOT NULL DEFAULT 500,
    "used_allocation" INTEGER NOT NULL DEFAULT 0,
    "remaining_allocation" INTEGER NOT NULL DEFAULT 500,
    "max_concurrent_challenges" INTEGER NOT NULL DEFAULT 10,
    "max_commitment_pct_per_prediction" INTEGER NOT NULL DEFAULT 50,
    "max_confidence_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "is_admin_adjusted" BOOLEAN NOT NULL DEFAULT false,
    "adjustment_reason" TEXT,
    "adjusted_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "gameweek_points_allocations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "gameweek_points_allocations_fan_user_id_gameweek_id_key" ON "gameweek_points_allocations"("fan_user_id", "gameweek_id");
CREATE INDEX "gameweek_points_allocations_gameweek_id_idx" ON "gameweek_points_allocations"("gameweek_id");
ALTER TABLE "gameweek_points_allocations" ADD CONSTRAINT "gameweek_points_allocations_fan_user_id_fkey" FOREIGN KEY ("fan_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "gameweek_points_allocations" ADD CONSTRAINT "gameweek_points_allocations_gameweek_id_fkey" FOREIGN KEY ("gameweek_id") REFERENCES "gameweeks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "gameweek_points_allocations" ADD CONSTRAINT "gameweek_points_allocations_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "challenge_listings" (
    "id" TEXT NOT NULL,
    "fan_user_id" TEXT NOT NULL,
    "fixture_market_id" TEXT NOT NULL,
    "gameweek_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "supporting_selection" TEXT NOT NULL,
    "opposing_selection" TEXT NOT NULL,
    "base_opportunity" INTEGER NOT NULL,
    "points_commitment_pct" INTEGER NOT NULL,
    "committed_points" INTEGER NOT NULL,
    "points_return_rate" DOUBLE PRECISION NOT NULL,
    "confidence_multiplier" DOUBLE PRECISION NOT NULL,
    "potential_points_award" INTEGER NOT NULL,
    "maximum_points_exposure" INTEGER NOT NULL,
    "available_points" INTEGER NOT NULL,
    "matched_points" INTEGER NOT NULL DEFAULT 0,
    "status" "ChallengeListingStatus" NOT NULL DEFAULT 'OPEN',
    "visibility" "ChallengeListingVisibility" NOT NULL DEFAULT 'PUBLIC',
    "league_id" TEXT,
    "published_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "withdrawn_at" TIMESTAMP(3),
    "idempotency_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "challenge_listings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "challenge_listings_idempotency_key_key" ON "challenge_listings"("idempotency_key");
CREATE INDEX "challenge_listings_fan_user_id_status_idx" ON "challenge_listings"("fan_user_id", "status");
CREATE INDEX "challenge_listings_fixture_market_id_status_visibility_idx" ON "challenge_listings"("fixture_market_id", "status", "visibility");
ALTER TABLE "challenge_listings" ADD CONSTRAINT "challenge_listings_fan_user_id_fkey" FOREIGN KEY ("fan_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "challenge_listings" ADD CONSTRAINT "challenge_listings_fixture_market_id_fkey" FOREIGN KEY ("fixture_market_id") REFERENCES "fixture_prediction_markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "challenge_listings" ADD CONSTRAINT "challenge_listings_gameweek_id_fkey" FOREIGN KEY ("gameweek_id") REFERENCES "gameweeks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "challenge_listings" ADD CONSTRAINT "challenge_listings_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "challenge_listings" ADD CONSTRAINT "challenge_listings_league_id_fkey" FOREIGN KEY ("league_id") REFERENCES "fantasy_leagues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "challenge_matches" (
    "id" TEXT NOT NULL,
    "supporting_listing_id" TEXT NOT NULL,
    "opposing_listing_id" TEXT NOT NULL,
    "matched_points" INTEGER NOT NULL,
    "supporter_potential_award" INTEGER NOT NULL,
    "opposer_potential_award" INTEGER NOT NULL,
    "status" "ChallengeMatchStatus" NOT NULL DEFAULT 'PENDING_SETTLEMENT',
    "scoring_status" "ChallengeScoringStatus" NOT NULL DEFAULT 'AWAITING_LOCK',
    "supporter_points_awarded" INTEGER,
    "opposer_points_awarded" INTEGER,
    "settled_at" TIMESTAMP(3),
    "voided_at" TIMESTAMP(3),
    "corrected_at" TIMESTAMP(3),
    "correction_notes" TEXT,
    "idempotency_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "challenge_matches_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "challenge_matches_idempotency_key_key" ON "challenge_matches"("idempotency_key");
CREATE INDEX "challenge_matches_supporting_listing_id_idx" ON "challenge_matches"("supporting_listing_id");
CREATE INDEX "challenge_matches_opposing_listing_id_idx" ON "challenge_matches"("opposing_listing_id");
ALTER TABLE "challenge_matches" ADD CONSTRAINT "challenge_matches_supporting_listing_id_fkey" FOREIGN KEY ("supporting_listing_id") REFERENCES "challenge_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "challenge_matches" ADD CONSTRAINT "challenge_matches_opposing_listing_id_fkey" FOREIGN KEY ("opposing_listing_id") REFERENCES "challenge_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "challenge_scores" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "fan_user_id" TEXT NOT NULL,
    "scoring_status" "ChallengeScoringStatus" NOT NULL DEFAULT 'AWAITING_LOCK',
    "total_committed" INTEGER NOT NULL DEFAULT 0,
    "total_matched" INTEGER NOT NULL DEFAULT 0,
    "total_awarded" INTEGER NOT NULL DEFAULT 0,
    "total_forgone" INTEGER NOT NULL DEFAULT 0,
    "settled_at" TIMESTAMP(3),
    "voided_at" TIMESTAMP(3),
    "corrected_at" TIMESTAMP(3),
    "correction_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "challenge_scores_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "challenge_scores_listing_id_key" ON "challenge_scores"("listing_id");
CREATE INDEX "challenge_scores_fan_user_id_idx" ON "challenge_scores"("fan_user_id");
ALTER TABLE "challenge_scores" ADD CONSTRAINT "challenge_scores_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "challenge_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "challenge_scores" ADD CONSTRAINT "challenge_scores_fan_user_id_fkey" FOREIGN KEY ("fan_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "social_prediction_points_entries" (
    "id" TEXT NOT NULL,
    "fan_user_id" TEXT NOT NULL,
    "fixture_id" TEXT,
    "market_id" TEXT,
    "listing_id" TEXT,
    "match_id" TEXT,
    "gameweek_id" TEXT,
    "season_id" TEXT,
    "competition_id" TEXT,
    "entry_type" "SocialPredictionEntryType" NOT NULL,
    "points" INTEGER NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "social_prediction_points_entries_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "social_prediction_points_entries_idempotency_key_key" ON "social_prediction_points_entries"("idempotency_key");
CREATE INDEX "social_prediction_points_entries_fan_user_id_idx" ON "social_prediction_points_entries"("fan_user_id");
CREATE INDEX "social_prediction_points_entries_gameweek_id_idx" ON "social_prediction_points_entries"("gameweek_id");
CREATE INDEX "social_prediction_points_entries_season_id_idx" ON "social_prediction_points_entries"("season_id");
ALTER TABLE "social_prediction_points_entries" ADD CONSTRAINT "social_prediction_points_entries_fan_user_id_fkey" FOREIGN KEY ("fan_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "social_prediction_points_entries" ADD CONSTRAINT "social_prediction_points_entries_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "challenge_listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "social_prediction_points_entries" ADD CONSTRAINT "social_prediction_points_entries_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "challenge_matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Match Centre Tables
CREATE TABLE "league_standings" (
    "id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "played" INTEGER NOT NULL DEFAULT 0,
    "won" INTEGER NOT NULL DEFAULT 0,
    "drawn" INTEGER NOT NULL DEFAULT 0,
    "lost" INTEGER NOT NULL DEFAULT 0,
    "goals_for" INTEGER NOT NULL DEFAULT 0,
    "goals_against" INTEGER NOT NULL DEFAULT 0,
    "goal_difference" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "form" TEXT,
    "source_type" "DataSourceType" NOT NULL DEFAULT 'MANUAL',
    "data_status" "DataStatus" NOT NULL DEFAULT 'PROVISIONAL',
    "freshness_status" "FreshnessStatus" NOT NULL DEFAULT 'MANUAL',
    "last_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "league_standings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "league_standings_season_id_club_id_key" ON "league_standings"("season_id", "club_id");
CREATE INDEX "league_standings_season_id_position_idx" ON "league_standings"("season_id", "position");
ALTER TABLE "league_standings" ADD CONSTRAINT "league_standings_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "league_standings" ADD CONSTRAINT "league_standings_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "team_form_records" (
    "id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "form_string" TEXT NOT NULL,
    "recent_fixtures" JSONB NOT NULL,
    "source_type" "DataSourceType" NOT NULL DEFAULT 'MANUAL',
    "data_status" "DataStatus" NOT NULL DEFAULT 'PROVISIONAL',
    "last_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "team_form_records_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "team_form_records_club_id_season_id_key" ON "team_form_records"("club_id", "season_id");
ALTER TABLE "team_form_records" ADD CONSTRAINT "team_form_records_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "team_form_records" ADD CONSTRAINT "team_form_records_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "player_ratings" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "fixture_id" TEXT NOT NULL,
    "performance_rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "rating_scale" TEXT NOT NULL DEFAULT '0-10',
    "rating_source" TEXT NOT NULL DEFAULT 'MANUAL',
    "rating_status" "DataStatus" NOT NULL DEFAULT 'PROVISIONAL',
    "rating_version" INTEGER NOT NULL DEFAULT 1,
    "minutes_played" INTEGER NOT NULL DEFAULT 0,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "yellow_cards" INTEGER NOT NULL DEFAULT 0,
    "red_cards" INTEGER NOT NULL DEFAULT 0,
    "source_type" "DataSourceType" NOT NULL DEFAULT 'MANUAL',
    "provider_key" TEXT,
    "last_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "player_ratings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "player_ratings_player_id_fixture_id_key" ON "player_ratings"("player_id", "fixture_id");
ALTER TABLE "player_ratings" ADD CONSTRAINT "player_ratings_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "player_ratings" ADD CONSTRAINT "player_ratings_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixtures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "data_ingestion_logs" (
    "id" TEXT NOT NULL,
    "source_type" "DataSourceType" NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "provider_key" TEXT,
    "data_status" "DataStatus" NOT NULL,
    "raw_payload_hash" TEXT,
    "ingested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "operator_user_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "data_ingestion_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "data_ingestion_logs_entity_type_entity_id_idx" ON "data_ingestion_logs"("entity_type", "entity_id");
CREATE INDEX "data_ingestion_logs_source_type_idx" ON "data_ingestion_logs"("source_type");
CREATE INDEX "data_ingestion_logs_ingested_at_idx" ON "data_ingestion_logs"("ingested_at" DESC);

CREATE TABLE "compliance_domain_configs" (
    "id" TEXT NOT NULL,
    "domain_key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" "ComplianceReviewStatus" NOT NULL DEFAULT 'INTERNAL_REVIEW_REQUIRED',
    "status_notes" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by_user_id" TEXT,
    "next_review_due" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "compliance_domain_configs_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "compliance_domain_configs_domain_key_key" ON "compliance_domain_configs"("domain_key");
