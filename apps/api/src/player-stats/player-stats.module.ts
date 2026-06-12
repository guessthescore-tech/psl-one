import { Module } from '@nestjs/common';
import { PlayerStatsService } from './player-stats.service';
import { PlayerStatsController } from './player-stats.controller';
import { PlayerStatsAdminController } from './player-stats-admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PlayerStatsController, PlayerStatsAdminController],
  providers: [PlayerStatsService],
  exports: [PlayerStatsService],
})
export class PlayerStatsModule {}
