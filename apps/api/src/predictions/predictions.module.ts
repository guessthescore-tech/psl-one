import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { FanValueModule } from '../fan-value/fan-value.module';
import { AchievementsModule } from '../achievements/achievements.module';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';

@Module({
  imports: [PrismaModule, AuthModule, FanValueModule, AchievementsModule],
  controllers: [PredictionsController],
  providers: [PredictionsService],
})
export class PredictionsModule {}
