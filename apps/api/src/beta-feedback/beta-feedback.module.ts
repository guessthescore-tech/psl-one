import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BetaFeedbackController } from './beta-feedback.controller';
import { BetaFeedbackService } from './beta-feedback.service';

@Module({
  imports: [AuthModule],
  controllers: [BetaFeedbackController],
  providers: [BetaFeedbackService],
  exports: [BetaFeedbackService],
})
export class BetaFeedbackModule {}
