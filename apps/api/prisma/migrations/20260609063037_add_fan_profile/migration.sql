-- CreateTable
CREATE TABLE "fan_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "display_name" TEXT,
    "city" TEXT,
    "country" TEXT,
    "preferred_team_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fan_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "match_reminders" BOOLEAN NOT NULL DEFAULT true,
    "team_news" BOOLEAN NOT NULL DEFAULT true,
    "fantasy_updates" BOOLEAN NOT NULL DEFAULT false,
    "rewards_updates" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fan_profiles_user_id_key" ON "fan_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_profile_id_key" ON "notification_preferences"("profile_id");

-- AddForeignKey
ALTER TABLE "fan_profiles" ADD CONSTRAINT "fan_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fan_profiles" ADD CONSTRAINT "fan_profiles_preferred_team_id_fkey" FOREIGN KEY ("preferred_team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "fan_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
