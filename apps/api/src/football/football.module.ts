import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PredictionChallengesModule } from '../prediction-challenges/prediction-challenges.module';
import { FootballController } from './football.controller';
import { FootballService } from './football.service';
import { LiveMatchService } from './live-match.service';
import { FixtureEventPublisher } from './fixture-event.publisher';

@Module({
  imports: [PrismaModule, AuthModule, PredictionChallengesModule],
  controllers: [FootballController],
  providers: [FootballService, LiveMatchService, FixtureEventPublisher],
})
export class FootballModule {}
