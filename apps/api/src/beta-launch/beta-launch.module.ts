import { Module } from '@nestjs/common';
import { BetaLaunchController } from './beta-launch.controller';
import { BetaLaunchService } from './beta-launch.service';
import { BetaLaunchSmokeTestService } from './beta-launch-smoke-test.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SeasonSwitchingModule } from '../season-switching/season-switching.module';

@Module({
  imports: [PrismaModule, AuthModule, SeasonSwitchingModule],
  controllers: [BetaLaunchController],
  providers: [BetaLaunchService, BetaLaunchSmokeTestService],
  exports: [BetaLaunchService],
})
export class BetaLaunchModule {}
