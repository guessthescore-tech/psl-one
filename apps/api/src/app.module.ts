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
import { SeasonSwitchingModule } from './season-switching/season-switching.module';
import { FantasyCalibrationModule } from './fantasy-calibration/fantasy-calibration.module';
import { PredictionCalibrationModule } from './prediction-calibration/prediction-calibration.module';
import { GameweekOperationsModule } from './gameweek-operations/gameweek-operations.module';
import { AdminOperationsModule } from './admin-operations/admin-operations.module';
import { EngagementModule } from './engagement/engagement.module';

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
    SeasonSwitchingModule,
    FantasyCalibrationModule,
    PredictionCalibrationModule,
    GameweekOperationsModule,
    AdminOperationsModule,
    EngagementModule,
    HealthModule,
  ],
  controllers: [VersionController],
})
export class AppModule {}
