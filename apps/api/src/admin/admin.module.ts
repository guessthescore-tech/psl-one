import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AdminCompetitionsController, AdminSeasonsController } from './admin-competitions.controller';
import { AdminCompetitionsService } from './admin-competitions.service';
import { AdminImportsController, AdminManualImportController } from './admin-imports.controller';
import { CompetitionImportService } from './competition-import.service';
import { AdminFixtureAssignmentController } from './admin-fixture-assignment.controller';
import { FixtureAssignmentService } from './fixture-assignment.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    AdminCompetitionsController,
    AdminSeasonsController,
    AdminImportsController,
    AdminManualImportController,
    AdminFixtureAssignmentController,
  ],
  providers: [AdminCompetitionsService, CompetitionImportService, FixtureAssignmentService],
  exports: [AdminCompetitionsService, CompetitionImportService, FixtureAssignmentService],
})
export class AdminModule {}
