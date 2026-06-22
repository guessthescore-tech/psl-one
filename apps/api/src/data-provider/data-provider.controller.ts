import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DataProviderService } from './data-provider.service';
import { ParsePslFixtureIngestionService } from './parse-psl-fixture-ingestion.service';

@Controller('admin/data-provider')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class DataProviderController {
  constructor(
    private service: DataProviderService,
    private ingestion: ParsePslFixtureIngestionService,
  ) {}

  @Get('health')
  health() { return this.service.health(); }

  @Get('discovery/seasons')
  seasons() { return this.service.getSeasons(); }

  @Get('discovery/fixtures/:seasonId')
  fixtures(@Param('seasonId') seasonId: string) { return this.service.getFixtures(seasonId); }

  @Get('discovery/teams/:seasonId')
  teams(@Param('seasonId') seasonId: string) { return this.service.getTeams(seasonId); }

  @Get('discovery/standings/:seasonId')
  standings(@Param('seasonId') seasonId: string) { return this.service.getStandings(seasonId); }

  /**
   * Manual, admin-only Parse PSL fixture ingestion trigger.
   * dryRun defaults true — no DB writes unless explicitly set to false.
   * No scheduler. No PSL activation. No production ingestion.
   */
  @Post('parse-psl/fixtures/ingest')
  ingestParsePslFixtures(
    @Body() body: { competitionCode?: string; dryRun?: boolean; seasonId?: string } = {},
  ) {
    const opts: { competitionCode?: string; dryRun?: boolean; seasonId?: string } = {
      competitionCode: body.competitionCode ?? 'BETWAY_PREMIERSHIP',
      dryRun: body.dryRun !== false, // default true
    };
    if (body.seasonId !== undefined) opts.seasonId = body.seasonId;
    return this.ingestion.ingest(opts);
  }
}
