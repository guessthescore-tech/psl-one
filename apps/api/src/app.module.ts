import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { VersionController } from './version/version.controller';
import { validateEnv } from './env';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FootballModule } from './football/football.module';
import { ProfileModule } from './profile/profile.module';
import { PredictionsModule } from './predictions/predictions.module';
import { ChallengesModule } from './challenges/challenges.module';
import { LeaderboardsModule } from './leaderboards/leaderboards.module';
import { FantasyModule } from './fantasy/fantasy.module';
import { GameweeksModule } from './gameweeks/gameweeks.module';
import { AdminModule } from './admin/admin.module';
import { FanValueModule } from './fan-value/fan-value.module';
import { AchievementsModule } from './achievements/achievements.module';
import { RewardsReadinessModule } from './rewards/rewards-readiness.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ActivityFeedModule } from './activity-feed/activity-feed.module';
import { AdminDashboardModule } from './admin-dashboard/admin-dashboard.module';
import { ClubExperienceModule } from './club-experience/club-experience.module';
import { FixtureImportModule } from './fixture-import/fixture-import.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    PrismaModule,
    AuthModule,
    FootballModule,
    ProfileModule,
    PredictionsModule,
    ChallengesModule,
    LeaderboardsModule,
    FantasyModule,
    GameweeksModule,
    AdminModule,
    FanValueModule,
    AchievementsModule,
    RewardsReadinessModule,
    NotificationsModule,
    ActivityFeedModule,
    AdminDashboardModule,
    ClubExperienceModule,
    FixtureImportModule,
    HealthModule,
  ],
  controllers: [VersionController],
})
export class AppModule {}
