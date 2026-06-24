-- CreateTable: club_memberships
-- Sprint 28: DB-backed user-to-club scoping
-- Follows FantasyLeagueMember pattern (membership table, not FK on User)
-- NO PSL_ACTIVATION. NO WALLET_PRODUCTION. NO REAL_MONEY.

CREATE TABLE "club_memberships" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CLUB_ADMIN',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable: sponsor_memberships
-- Sprint 28: DB-backed user-to-sponsor scoping
CREATE TABLE "sponsor_memberships" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "sponsor_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'SPONSOR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sponsor_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: club_memberships
CREATE INDEX "club_memberships_team_id_idx" ON "club_memberships"("team_id");
CREATE INDEX "club_memberships_user_id_idx" ON "club_memberships"("user_id");
CREATE UNIQUE INDEX "club_memberships_user_id_team_id_key" ON "club_memberships"("user_id", "team_id");

-- CreateIndex: sponsor_memberships
CREATE INDEX "sponsor_memberships_sponsor_id_idx" ON "sponsor_memberships"("sponsor_id");
CREATE INDEX "sponsor_memberships_user_id_idx" ON "sponsor_memberships"("user_id");
CREATE UNIQUE INDEX "sponsor_memberships_user_id_sponsor_id_key" ON "sponsor_memberships"("user_id", "sponsor_id");

-- AddForeignKey: club_memberships.user_id -> users.id
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: club_memberships.team_id -> teams.id
ALTER TABLE "club_memberships" ADD CONSTRAINT "club_memberships_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: sponsor_memberships.user_id -> users.id
ALTER TABLE "sponsor_memberships" ADD CONSTRAINT "sponsor_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: sponsor_memberships.sponsor_id -> sponsors.id
ALTER TABLE "sponsor_memberships" ADD CONSTRAINT "sponsor_memberships_sponsor_id_fkey" FOREIGN KEY ("sponsor_id") REFERENCES "sponsors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
