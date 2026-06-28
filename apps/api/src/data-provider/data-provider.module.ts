import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { DataProviderService } from './data-provider.service';
import { DataProviderController } from './data-provider.controller';
import { ProviderRouterService } from './provider-router.service';
import { ParsePslFixtureIngestionService } from './parse-psl-fixture-ingestion.service';
import { WorldCupImportService } from './world-cup-import.service';
import { WorldCupDbStatusService } from './world-cup-db-status.service';
import { WorldCupBetaBackfillService } from './world-cup-beta-backfill.service';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [DataProviderService, ProviderRouterService, ParsePslFixtureIngestionService, WorldCupImportService, WorldCupDbStatusService, WorldCupBetaBackfillService],
  controllers: [DataProviderController],
  exports: [DataProviderService, ProviderRouterService, ParsePslFixtureIngestionService, WorldCupImportService, WorldCupDbStatusService, WorldCupBetaBackfillService],
})
export class DataProviderModule {}
