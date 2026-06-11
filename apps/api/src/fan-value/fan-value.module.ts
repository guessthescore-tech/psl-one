import { Module } from '@nestjs/common';
import { FanValueLedgerService } from './fan-value-ledger.service';
import { FanValueController } from './fan-value.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [FanValueLedgerService],
  controllers: [FanValueController],
  exports: [FanValueLedgerService],
})
export class FanValueModule {}
