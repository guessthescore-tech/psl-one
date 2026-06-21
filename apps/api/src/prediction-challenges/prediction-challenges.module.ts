import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PredictionChallengesController } from './prediction-challenges.controller';
import { PredictionChallengesService } from './prediction-challenges.service';
import { ChallengeSettlementService } from './challenge-settlement.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PredictionChallengesController],
  providers: [PredictionChallengesService, ChallengeSettlementService],
  exports: [PredictionChallengesService],
})
export class PredictionChallengesModule {}
