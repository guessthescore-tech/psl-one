import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { FixtureImportController } from './fixture-import.controller';
import { FixtureImportService } from './fixture-import.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [FixtureImportController],
  providers: [FixtureImportService],
  exports: [FixtureImportService],
})
export class FixtureImportModule {}
