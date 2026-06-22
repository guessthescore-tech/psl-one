import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { FixtureImportController } from './fixture-import.controller';
import { FixtureImportService } from './fixture-import.service';
import { FixturePublicationController, PslPreflightController } from './fixture-publication.controller';
import { FixturePublicationService } from './fixture-publication.service';
import { PslActivationPreflightService } from './psl-activation-preflight.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [FixtureImportController, FixturePublicationController, PslPreflightController],
  providers: [FixtureImportService, FixturePublicationService, PslActivationPreflightService],
  exports: [FixtureImportService, FixturePublicationService, PslActivationPreflightService],
})
export class FixtureImportModule {}
