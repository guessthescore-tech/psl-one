-- CreateEnum
CREATE TYPE "ActivityFeedType" AS ENUM ('SYSTEM', 'ACHIEVEMENT_UNLOCKED', 'BADGE_EARNED', 'FANTASY_RESULT', 'PREDICTION_RESULT', 'CHALLENGE_CREATED', 'CHALLENGE_RESULT', 'REWARD_ELIGIBLE', 'LIVE_MATCH_ALERT', 'FAN_VALUE_MILESTONE', 'ADMIN_POST');

-- CreateEnum
CREATE TYPE "ActivityVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'ADMIN_ONLY');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('ACTIVE', 'HIDDEN', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ActivityReactionType" AS ENUM ('LIKE', 'FIRE', 'CLAP', 'TROPHY', 'BALL');

-- CreateTable
CREATE TABLE "activity_feed_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "type" "ActivityFeedType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "visibility" "ActivityVisibility" NOT NULL DEFAULT 'PUBLIC',
    "status" "ActivityStatus" NOT NULL DEFAULT 'ACTIVE',
    "source_type" TEXT,
    "source_id" TEXT,
    "action_url" TEXT,
    "metadata_json" JSONB,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "hidden_at" TIMESTAMP(3),
    "hidden_by_user_id" TEXT,
    "hidden_reason" TEXT,

    CONSTRAINT "activity_feed_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_reactions" (
    "id" TEXT NOT NULL,
    "activity_feed_item_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reaction_type" "ActivityReactionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_feed_items_user_id_idx" ON "activity_feed_items"("user_id");
CREATE INDEX "activity_feed_items_type_idx" ON "activity_feed_items"("type");
CREATE INDEX "activity_feed_items_status_idx" ON "activity_feed_items"("status");
CREATE INDEX "activity_feed_items_occurred_at_idx" ON "activity_feed_items"("occurred_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "activity_reactions_activity_feed_item_id_user_id_reaction_type_key" ON "activity_reactions"("activity_feed_item_id", "user_id", "reaction_type");
CREATE INDEX "activity_reactions_user_id_idx" ON "activity_reactions"("user_id");

-- AddForeignKey
ALTER TABLE "activity_feed_items" ADD CONSTRAINT "activity_feed_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "activity_feed_items" ADD CONSTRAINT "activity_feed_items_hidden_by_user_id_fkey" FOREIGN KEY ("hidden_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_reactions" ADD CONSTRAINT "activity_reactions_activity_feed_item_id_fkey" FOREIGN KEY ("activity_feed_item_id") REFERENCES "activity_feed_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "activity_reactions" ADD CONSTRAINT "activity_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
