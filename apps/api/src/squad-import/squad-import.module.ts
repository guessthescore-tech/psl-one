import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SquadImportService } from './squad-import.service';
import { SquadImportController } from './squad-import.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [SquadImportController],
  providers: [SquadImportService],
  exports: [SquadImportService],
})
export class SquadImportModule {}
