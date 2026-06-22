import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { DataProviderService } from './data-provider.service';
import { DataProviderController } from './data-provider.controller';
import { ProviderRouterService } from './provider-router.service';
import { ParsePslFixtureIngestionService } from './parse-psl-fixture-ingestion.service';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [DataProviderService, ProviderRouterService, ParsePslFixtureIngestionService],
  controllers: [DataProviderController],
  exports: [DataProviderService, ProviderRouterService, ParsePslFixtureIngestionService],
})
export class DataProviderModule {}
