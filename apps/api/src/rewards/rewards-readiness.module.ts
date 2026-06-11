import { Module } from '@nestjs/common';
import { RewardsReadinessController } from './rewards-readiness.controller';
import { RewardsReadinessService } from './rewards-readiness.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [RewardsReadinessController],
  providers: [RewardsReadinessService],
  exports: [RewardsReadinessService],
})
export class RewardsReadinessModule {}
