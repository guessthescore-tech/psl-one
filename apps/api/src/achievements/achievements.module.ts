import { Module } from '@nestjs/common';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FanValueModule } from '../fan-value/fan-value.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, FanValueModule, AuthModule],
  controllers: [AchievementsController],
  providers: [AchievementsService],
  exports: [AchievementsService],
})
export class AchievementsModule {}
