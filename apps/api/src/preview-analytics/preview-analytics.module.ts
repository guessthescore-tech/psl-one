import { Module } from '@nestjs/common';
import { PreviewAnalyticsController } from './preview-analytics.controller';
import { PreviewAnalyticsService } from './preview-analytics.service';

@Module({
  providers: [PreviewAnalyticsService],
  controllers: [PreviewAnalyticsController],
  exports: [PreviewAnalyticsService],
})
export class PreviewAnalyticsModule {}
