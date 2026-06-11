import { Module } from '@nestjs/common';
import { SeasonSwitchingService } from './season-switching.service';
import { SeasonSwitchingController } from './season-switching.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SeasonSwitchingController],
  providers: [SeasonSwitchingService],
  exports: [SeasonSwitchingService],
})
export class SeasonSwitchingModule {}
