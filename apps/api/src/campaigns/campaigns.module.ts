import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ActivityFeedModule } from '../activity-feed/activity-feed.module';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { CampaignTriggerService } from './campaign-trigger.service';

@Module({
  imports: [PrismaModule, AuthModule, NotificationsModule, ActivityFeedModule],
  providers: [CampaignsService, CampaignTriggerService],
  controllers: [CampaignsController],
  exports: [CampaignsService, CampaignTriggerService],
})
export class CampaignsModule {}
