import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { FanValueModule } from '../fan-value/fan-value.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ActivityFeedModule } from '../activity-feed/activity-feed.module';
import { CampaignRewardsService } from './campaign-rewards.service';
import { CampaignRewardsController } from './campaign-rewards.controller';

@Module({
  imports: [PrismaModule, AuthModule, FanValueModule, NotificationsModule, ActivityFeedModule],
  providers: [CampaignRewardsService],
  controllers: [CampaignRewardsController],
  exports: [CampaignRewardsService],
})
export class CampaignRewardsModule {}
