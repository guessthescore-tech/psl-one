-- CreateEnum
CREATE TYPE "RewardReadinessStatus" AS ENUM ('ELIGIBLE', 'INELIGIBLE', 'PENDING_EVALUATION');

-- CreateEnum
CREATE TYPE "RewardReadinessCategory" AS ENUM ('FANTASY', 'PREDICTIONS', 'CHALLENGES', 'SPONSOR_READY', 'FAN_VALUE', 'LOYALTY', 'PLATFORM');

-- CreateTable
CREATE TABLE "reward_readiness_definitions" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "RewardReadinessCategory" NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "min_fan_value_points" INTEGER,
    "required_achievement_slugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "required_badge_slugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requires_fantasy_team" BOOLEAN NOT NULL DEFAULT false,
    "requires_prediction_activity" BOOLEAN NOT NULL DEFAULT false,
    "requires_challenge_activity" BOOLEAN NOT NULL DEFAULT false,
    "unlock_hint" TEXT,
    "sponsor_name" TEXT,
    "not_redeemable_note" TEXT NOT NULL DEFAULT 'This reward opportunity is not yet redeemable. Fan Value points have no cash value.',
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reward_readiness_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fan_reward_readiness" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "definition_id" TEXT NOT NULL,
    "status" "RewardReadinessStatus" NOT NULL DEFAULT 'PENDING_EVALUATION',
    "evaluated_at" TIMESTAMP(3),
    "met_requirements_json" JSONB,
    "unmet_requirements_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fan_reward_readiness_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reward_readiness_definitions_slug_key" ON "reward_readiness_definitions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "fan_reward_readiness_user_id_definition_id_key" ON "fan_reward_readiness"("user_id", "definition_id");

-- CreateIndex
CREATE INDEX "fan_reward_readiness_user_id_status_idx" ON "fan_reward_readiness"("user_id", "status");

-- AddForeignKey
ALTER TABLE "fan_reward_readiness" ADD CONSTRAINT "fan_reward_readiness_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fan_reward_readiness" ADD CONSTRAINT "fan_reward_readiness_definition_id_fkey" FOREIGN KEY ("definition_id") REFERENCES "reward_readiness_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
