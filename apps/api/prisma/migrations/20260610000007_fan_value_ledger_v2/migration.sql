-- CreateEnum
CREATE TYPE "FanValueSourceType" AS ENUM ('FANTASY_GAMEWEEK_SCORE', 'FANTASY_AUTO_SUBSTITUTION', 'PREDICTION_SETTLEMENT', 'PEER_CHALLENGE', 'ACHIEVEMENT', 'SPONSOR_ENGAGEMENT_READY', 'REWARD_ELIGIBILITY_READY', 'ADMIN_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "FanValueType" AS ENUM ('FANTASY_POINTS', 'PREDICTION_POINTS', 'CHALLENGE_POINTS', 'ACHIEVEMENT_POINTS', 'LOYALTY_POINTS', 'REWARD_CREDITS_READY');

-- CreateEnum
CREATE TYPE "FanValueStatus" AS ENUM ('POSTED', 'VOIDED');

-- Drop string default before type change
ALTER TABLE "fan_value_ledger" ALTER COLUMN "value_type" DROP DEFAULT;

-- Change source_type and value_type from TEXT to enum
ALTER TABLE "fan_value_ledger"
  ALTER COLUMN "source_type" TYPE "FanValueSourceType" USING "source_type"::"FanValueSourceType",
  ALTER COLUMN "value_type" TYPE "FanValueType" USING "value_type"::"FanValueType";

-- Restore enum default
ALTER TABLE "fan_value_ledger" ALTER COLUMN "value_type" SET DEFAULT 'FANTASY_POINTS';

-- Add new columns
ALTER TABLE "fan_value_ledger"
  ADD COLUMN "status"          "FanValueStatus" NOT NULL DEFAULT 'POSTED',
  ADD COLUMN "idempotency_key" TEXT,
  ADD COLUMN "fantasy_team_id" TEXT,
  ADD COLUMN "prediction_id"   TEXT,
  ADD COLUMN "challenge_id"    TEXT,
  ADD COLUMN "achievement_id"  TEXT,
  ADD COLUMN "fixture_id"      TEXT,
  ADD COLUMN "metadata_json"   JSONB,
  ADD COLUMN "occurred_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updated_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Unique index for idempotency key
CREATE UNIQUE INDEX "fan_value_ledger_idempotency_key_key" ON "fan_value_ledger"("idempotency_key");
