import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ActivityFeedModule } from '../activity-feed/activity-feed.module';
import { SocialPredictionService } from './social-prediction.service';
import { SocialPredictionFanController, SocialPredictionAdminController } from './social-prediction.controller';

@Module({
  imports: [PrismaModule, AuthModule, NotificationsModule, ActivityFeedModule],
  providers: [SocialPredictionService],
  controllers: [SocialPredictionFanController, SocialPredictionAdminController],
  exports: [SocialPredictionService],
})
export class SocialPredictionModule {}
