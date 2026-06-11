-- CreateTable
CREATE TABLE "fantasy_rules_configs" (
    "id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "squad_size" INTEGER NOT NULL DEFAULT 15,
    "goalkeeper_count" INTEGER NOT NULL DEFAULT 2,
    "defender_count" INTEGER NOT NULL DEFAULT 5,
    "midfielder_count" INTEGER NOT NULL DEFAULT 5,
    "forward_count" INTEGER NOT NULL DEFAULT 3,
    "starting_xi_size" INTEGER NOT NULL DEFAULT 11,
    "min_starting_goalkeepers" INTEGER NOT NULL DEFAULT 1,
    "max_starting_goalkeepers" INTEGER NOT NULL DEFAULT 1,
    "min_starting_defenders" INTEGER NOT NULL DEFAULT 3,
    "min_starting_midfielders" INTEGER NOT NULL DEFAULT 2,
    "min_starting_forwards" INTEGER NOT NULL DEFAULT 1,
    "bench_size" INTEGER NOT NULL DEFAULT 4,
    "free_transfers_per_gameweek" INTEGER NOT NULL DEFAULT 1,
    "max_saved_free_transfers" INTEGER NOT NULL DEFAULT 5,
    "extra_transfer_cost" INTEGER NOT NULL DEFAULT 4,
    "max_transfers_per_gameweek" INTEGER NOT NULL DEFAULT 20,
    "deadline_offset_minutes" INTEGER NOT NULL DEFAULT 90,
    "wildcard_count" INTEGER NOT NULL DEFAULT 2,
    "free_hit_count" INTEGER NOT NULL DEFAULT 2,
    "bench_boost_count" INTEGER NOT NULL DEFAULT 2,
    "triple_captain_count" INTEGER NOT NULL DEFAULT 2,
    "chips_enabled" BOOLEAN NOT NULL DEFAULT true,
    "wildcard_enabled" BOOLEAN NOT NULL DEFAULT true,
    "free_hit_enabled" BOOLEAN NOT NULL DEFAULT true,
    "bench_boost_enabled" BOOLEAN NOT NULL DEFAULT true,
    "triple_captain_enabled" BOOLEAN NOT NULL DEFAULT true,
    "free_hit_consecutive_gameweek_blocked" BOOLEAN NOT NULL DEFAULT true,
    "halfway_gameweek" INTEGER NOT NULL DEFAULT 19,
    "season_gameweek_count" INTEGER NOT NULL DEFAULT 38,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fantasy_rules_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fantasy_rules_configs_season_id_key" ON "fantasy_rules_configs"("season_id");

-- AddForeignKey
ALTER TABLE "fantasy_rules_configs" ADD CONSTRAINT "fantasy_rules_configs_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
