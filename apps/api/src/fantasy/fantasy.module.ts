import { Module } from '@nestjs/common';
import { FantasyService } from './fantasy.service';
import { FantasyDeadlineService } from './fantasy-deadline.service';
import { FantasyTransferService } from './fantasy-transfer.service';
import { FantasyChipService } from './fantasy-chip.service';
import { FantasyPriceService } from './fantasy-price.service';
import { FantasyScoringService } from './fantasy-scoring.service';
import { FantasyAutoSubService } from './fantasy-auto-sub.service';
import { FantasyLeagueService } from './fantasy-league.service';
import { FantasyCupService } from './fantasy-cup.service';
import { FantasyRulesConfigService } from './fantasy-rules-config.service';
import { FantasyGameweekScoringService } from './fantasy-gameweek-scoring.service';
import { FantasyController } from './fantasy.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { FanValueModule } from '../fan-value/fan-value.module';
import { AchievementsModule } from '../achievements/achievements.module';

@Module({
  imports: [PrismaModule, AuthModule, FanValueModule, AchievementsModule],
  providers: [
    FantasyService,
    FantasyDeadlineService,
    FantasyTransferService,
    FantasyChipService,
    FantasyPriceService,
    FantasyScoringService,
    FantasyAutoSubService,
    FantasyLeagueService,
    FantasyCupService,
    FantasyRulesConfigService,
    FantasyGameweekScoringService,
  ],
  controllers: [FantasyController],
  exports: [FantasyService],
})
export class FantasyModule {}
