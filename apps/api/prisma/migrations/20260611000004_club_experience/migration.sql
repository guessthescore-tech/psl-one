-- CreateEnum
CREATE TYPE "SeasonTeamStatus" AS ENUM ('ACTIVE', 'PROVISIONAL', 'PROMOTED', 'RELEGATED', 'WITHDRAWN', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "SeasonTeamSource" AS ENUM ('MANUAL', 'IMPORT', 'OFFICIAL', 'PLACEHOLDER');

-- CreateEnum
CREATE TYPE "ClubProfileStatus" AS ENUM ('DRAFT', 'READY', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ClubContentType" AS ENUM ('NEWS', 'VIDEO', 'ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "ClubContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ShopProductCategory" AS ENUM ('HOME_KIT', 'AWAY_KIT', 'THIRD_KIT', 'TRAINING_WEAR', 'LIFESTYLE', 'ACCESSORIES', 'SOUVENIRS', 'KIDS');

-- CreateEnum
CREATE TYPE "ShopProductAvailability" AS ENUM ('COMING_SOON', 'AVAILABLE_SOON', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "ShopProductStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ShopCommerceStatus" AS ENUM ('CATALOGUE_ONLY', 'COMMERCE_READY_FOR_SPRINT_3');

-- CreateEnum
CREATE TYPE "SquadRegistrationStatus" AS ENUM ('PROVISIONAL', 'CONFIRMED', 'NEEDS_REVIEW', 'REMOVED');

-- CreateEnum
CREATE TYPE "SquadRegistrationSource" AS ENUM ('MANUAL', 'IMPORT', 'OFFICIAL', 'PLACEHOLDER');

-- CreateTable
CREATE TABLE "season_teams" (
    "id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "status" "SeasonTeamStatus" NOT NULL DEFAULT 'PROVISIONAL',
    "source" "SeasonTeamSource" NOT NULL DEFAULT 'PLACEHOLDER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "season_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_profiles" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "founded_year" INTEGER,
    "city" TEXT,
    "province" TEXT,
    "country" TEXT NOT NULL DEFAULT 'South Africa',
    "website_url" TEXT,
    "ticketing_url" TEXT,
    "shop_url" TEXT,
    "description" TEXT,
    "hero_image_url" TEXT,
    "crest_url" TEXT,
    "primary_color" TEXT,
    "secondary_color" TEXT,
    "profile_status" "ClubProfileStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_content_items" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "type" "ClubContentType" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "image_url" TEXT,
    "video_url" TEXT,
    "external_url" TEXT,
    "status" "ClubContentStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_content_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_shop_products" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "ShopProductCategory" NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "price_display" TEXT,
    "currency_code" TEXT,
    "availability" "ShopProductAvailability" NOT NULL DEFAULT 'COMING_SOON',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "ShopProductStatus" NOT NULL DEFAULT 'DRAFT',
    "commerce_status" "ShopCommerceStatus" NOT NULL DEFAULT 'CATALOGUE_ONLY',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_shop_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_experience_statuses" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "profile_ready" BOOLEAN NOT NULL DEFAULT false,
    "squad_ready" BOOLEAN NOT NULL DEFAULT false,
    "fixtures_ready" BOOLEAN NOT NULL DEFAULT false,
    "venue_ready" BOOLEAN NOT NULL DEFAULT false,
    "tickets_ready" BOOLEAN NOT NULL DEFAULT false,
    "shopfront_ready" BOOLEAN NOT NULL DEFAULT false,
    "catalogue_ready" BOOLEAN NOT NULL DEFAULT false,
    "last_reviewed_at" TIMESTAMP(3),
    "review_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_experience_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "season_squad_registrations" (
    "id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "status" "SquadRegistrationStatus" NOT NULL DEFAULT 'PROVISIONAL',
    "shirt_number" INTEGER,
    "source" "SquadRegistrationSource" NOT NULL DEFAULT 'PLACEHOLDER',
    "registered_at" TIMESTAMP(3),
    "removed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "season_squad_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "season_teams_season_id_status_idx" ON "season_teams"("season_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "season_teams_season_id_team_id_key" ON "season_teams"("season_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "club_profiles_team_id_key" ON "club_profiles"("team_id");

-- CreateIndex
CREATE INDEX "club_content_items_team_id_status_idx" ON "club_content_items"("team_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "club_shop_products_team_id_slug_key" ON "club_shop_products"("team_id", "slug");

-- CreateIndex
CREATE INDEX "club_shop_products_team_id_status_idx" ON "club_shop_products"("team_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "club_experience_statuses_team_id_key" ON "club_experience_statuses"("team_id");

-- CreateIndex
CREATE INDEX "season_squad_registrations_season_id_team_id_idx" ON "season_squad_registrations"("season_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "season_squad_registrations_season_id_player_id_key" ON "season_squad_registrations"("season_id", "player_id");

-- AddForeignKey
ALTER TABLE "season_teams" ADD CONSTRAINT "season_teams_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "season_teams" ADD CONSTRAINT "season_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_profiles" ADD CONSTRAINT "club_profiles_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_content_items" ADD CONSTRAINT "club_content_items_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_shop_products" ADD CONSTRAINT "club_shop_products_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_experience_statuses" ADD CONSTRAINT "club_experience_statuses_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "season_squad_registrations" ADD CONSTRAINT "season_squad_registrations_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "season_squad_registrations" ADD CONSTRAINT "season_squad_registrations_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "season_squad_registrations" ADD CONSTRAINT "season_squad_registrations_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
