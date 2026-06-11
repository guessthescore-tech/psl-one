import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { GameweeksController, AdminGameweeksController } from './gameweeks.controller';
import { GameweeksService } from './gameweeks.service';
import { GameweekDeadlineService } from './gameweek-deadline.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [GameweeksController, AdminGameweeksController],
  providers: [GameweeksService, GameweekDeadlineService],
  exports: [GameweeksService, GameweekDeadlineService],
})
export class GameweeksModule {}
