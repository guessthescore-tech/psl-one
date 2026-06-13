import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CampaignAnalyticsService } from './campaign-analytics.service';
import { CampaignAnalyticsController } from './campaign-analytics.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [CampaignAnalyticsService],
  controllers: [CampaignAnalyticsController],
  exports: [CampaignAnalyticsService],
})
export class CampaignAnalyticsModule {}
