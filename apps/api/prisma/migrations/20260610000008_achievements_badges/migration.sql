-- Achievements & Badges MVP

CREATE TYPE "AchievementCategory" AS ENUM (
  'FANTASY', 'PREDICTIONS', 'CHALLENGES', 'LEAGUES',
  'PROFILE', 'FAN_VALUE', 'SOCIAL_READY', 'SPONSOR_READY', 'PLATFORM'
);

CREATE TYPE "AchievementTriggerType" AS ENUM (
  'FIRST_FANTASY_TEAM', 'FIRST_PREDICTION', 'FIRST_EXACT_PREDICTION',
  'FIRST_LEAGUE_JOIN', 'FIRST_LEAGUE_CREATED', 'FIRST_CHALLENGE',
  'FIRST_CHALLENGE_WIN', 'FANTASY_GAMEWEEK_POINTS', 'FANTASY_SEASON_POINTS',
  'PREDICTION_POINTS', 'FAN_VALUE_POINTS', 'PROFILE_COMPLETED', 'MANUAL'
);

CREATE TYPE "AchievementStatus" AS ENUM ('LOCKED', 'IN_PROGRESS', 'UNLOCKED', 'REVOKED');

CREATE TYPE "BadgeRarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY');

CREATE TABLE "achievement_definitions" (
  "id"               TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "slug"             TEXT NOT NULL,
  "name"             TEXT NOT NULL,
  "description"      TEXT NOT NULL,
  "category"         "AchievementCategory" NOT NULL,
  "trigger_type"     "AchievementTriggerType" NOT NULL,
  "threshold"        INTEGER,
  "fan_value_points" INTEGER NOT NULL DEFAULT 0,
  "value_type"       "FanValueType" NOT NULL DEFAULT 'ACHIEVEMENT_POINTS',
  "is_active"        BOOLEAN NOT NULL DEFAULT true,
  "sort_order"       INTEGER NOT NULL DEFAULT 0,
  "metadata_json"    JSONB,
  "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "achievement_definitions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "achievement_definitions_slug_key" ON "achievement_definitions"("slug");

CREATE TABLE "badge_definitions" (
  "id"           TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "slug"         TEXT NOT NULL,
  "name"         TEXT NOT NULL,
  "description"  TEXT NOT NULL,
  "image_url"    TEXT,
  "icon"         TEXT,
  "rarity"       "BadgeRarity" NOT NULL,
  "category"     "AchievementCategory" NOT NULL,
  "is_active"    BOOLEAN NOT NULL DEFAULT true,
  "sort_order"   INTEGER NOT NULL DEFAULT 0,
  "metadata_json" JSONB,
  "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "badge_definitions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "badge_definitions_slug_key" ON "badge_definitions"("slug");

CREATE TABLE "achievement_badges" (
  "id"                        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "achievement_definition_id" TEXT NOT NULL,
  "badge_definition_id"       TEXT NOT NULL,
  "created_at"                TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "achievement_badges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "achievement_badges_achievement_definition_id_badge_definition_id_key"
  ON "achievement_badges"("achievement_definition_id", "badge_definition_id");

ALTER TABLE "achievement_badges"
  ADD CONSTRAINT "achievement_badges_achievement_definition_id_fkey"
    FOREIGN KEY ("achievement_definition_id") REFERENCES "achievement_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "achievement_badges_badge_definition_id_fkey"
    FOREIGN KEY ("badge_definition_id") REFERENCES "badge_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "fan_achievements" (
  "id"                        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id"                   TEXT NOT NULL,
  "achievement_definition_id" TEXT NOT NULL,
  "progress"                  INTEGER NOT NULL DEFAULT 0,
  "target"                    INTEGER,
  "status"                    "AchievementStatus" NOT NULL DEFAULT 'LOCKED',
  "unlocked_at"               TIMESTAMP(3),
  "awarded_by_user_id"        TEXT,
  "revoked_at"                TIMESTAMP(3),
  "revoke_reason"             TEXT,
  "metadata_json"             JSONB,
  "created_at"                TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"                TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fan_achievements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "fan_achievements_user_id_achievement_definition_id_key"
  ON "fan_achievements"("user_id", "achievement_definition_id");
CREATE INDEX "fan_achievements_user_id_status_idx" ON "fan_achievements"("user_id", "status");
CREATE INDEX "fan_achievements_user_id_idx" ON "fan_achievements"("user_id");

ALTER TABLE "fan_achievements"
  ADD CONSTRAINT "fan_achievements_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "fan_achievements_achievement_definition_id_fkey"
    FOREIGN KEY ("achievement_definition_id") REFERENCES "achievement_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "fan_achievements_awarded_by_user_id_fkey"
    FOREIGN KEY ("awarded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "fan_badges" (
  "id"                  TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id"             TEXT NOT NULL,
  "badge_definition_id" TEXT NOT NULL,
  "fan_achievement_id"  TEXT,
  "awarded_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revoked_at"          TIMESTAMP(3),
  "revoke_reason"       TEXT,
  "is_displayed"        BOOLEAN NOT NULL DEFAULT true,
  "metadata_json"       JSONB,
  "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fan_badges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "fan_badges_user_id_badge_definition_id_key"
  ON "fan_badges"("user_id", "badge_definition_id");
CREATE INDEX "fan_badges_user_id_idx" ON "fan_badges"("user_id");

ALTER TABLE "fan_badges"
  ADD CONSTRAINT "fan_badges_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "fan_badges_badge_definition_id_fkey"
    FOREIGN KEY ("badge_definition_id") REFERENCES "badge_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "fan_badges_fan_achievement_id_fkey"
    FOREIGN KEY ("fan_achievement_id") REFERENCES "fan_achievements"("id") ON DELETE SET NULL ON UPDATE CASCADE;
