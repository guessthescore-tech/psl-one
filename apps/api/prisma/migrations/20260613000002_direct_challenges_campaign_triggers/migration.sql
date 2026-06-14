-- CreateEnum
CREATE TYPE "ChallengeMode" AS ENUM ('PUBLIC_MARKETPLACE', 'DIRECT_USER', 'FRIEND', 'PRIVATE_LEAGUE');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'WITHDRAWN', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CampaignTriggerType" AS ENUM ('LINEUP_CONFIRMED', 'MATCH_STARTED', 'GOAL_SCORED', 'HALF_TIME', 'FULL_TIME', 'PLAYER_OF_MATCH_VOTE_OPEN', 'CLEAN_SHEET_COMPLETED', 'FANTASY_MILESTONE', 'PREDICTION_RESULT_AVAILABLE');

-- AlterTable: add direct challenge fields to challenge_listings
ALTER TABLE "challenge_listings"
    ADD COLUMN "challenge_mode" "ChallengeMode" NOT NULL DEFAULT 'PUBLIC_MARKETPLACE',
    ADD COLUMN "challenged_user_id" TEXT,
    ADD COLUMN "invitation_status" "InvitationStatus";

-- CreateTable
CREATE TABLE "campaign_trigger_events" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "fixture_id" TEXT,
    "trigger_type" "CampaignTriggerType" NOT NULL,
    "source_event_id" TEXT,
    "idempotency_key" TEXT NOT NULL,
    "triggered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_trigger_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaign_trigger_events_idempotency_key_key" ON "campaign_trigger_events"("idempotency_key");

-- CreateIndex
CREATE INDEX "campaign_trigger_events_campaign_id_trigger_type_idx" ON "campaign_trigger_events"("campaign_id", "trigger_type");

-- CreateIndex
CREATE INDEX "campaign_trigger_events_fixture_id_trigger_type_idx" ON "campaign_trigger_events"("fixture_id", "trigger_type");

-- CreateIndex
CREATE INDEX "challenge_listings_challenged_user_id_invitation_status_idx" ON "challenge_listings"("challenged_user_id", "invitation_status");

-- AddForeignKey
ALTER TABLE "challenge_listings" ADD CONSTRAINT "challenge_listings_challenged_user_id_fkey" FOREIGN KEY ("challenged_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_trigger_events" ADD CONSTRAINT "campaign_trigger_events_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "sponsor_campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_trigger_events" ADD CONSTRAINT "campaign_trigger_events_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixtures"("id") ON DELETE SET NULL ON UPDATE CASCADE;
