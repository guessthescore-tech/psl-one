import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PredictionChallengesController } from './prediction-challenges.controller';
import { PredictionChallengesService } from './prediction-challenges.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PredictionChallengesController],
  providers: [PredictionChallengesService],
  exports: [PredictionChallengesService],
})
export class PredictionChallengesModule {}
