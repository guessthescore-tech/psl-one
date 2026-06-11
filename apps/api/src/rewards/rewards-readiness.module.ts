import { Module } from '@nestjs/common';
import { RewardsReadinessController } from './rewards-readiness.controller';
import { RewardsReadinessService } from './rewards-readiness.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ActivityFeedModule } from '../activity-feed/activity-feed.module';

@Module({
  imports: [PrismaModule, AuthModule, NotificationsModule, ActivityFeedModule],
  controllers: [RewardsReadinessController],
  providers: [RewardsReadinessService],
  exports: [RewardsReadinessService],
})
export class RewardsReadinessModule {}
