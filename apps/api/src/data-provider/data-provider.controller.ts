import { Body, Controller, Get, Param, Post, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DataProviderService } from './data-provider.service';
import { ParsePslFixtureIngestionService } from './parse-psl-fixture-ingestion.service';
import type { ParsePslIngestionRequestDto } from './dto/parse-psl-fixture-ingestion.dto';

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
   *
   * dryRun defaults true — no DB writes unless dryRun=false.
   * includeCandidates defaults true — preview normalized fixtures with team resolution.
   *
   * Write-mode safety:
   * - dryRun=false requires seasonId → 400 otherwise
   * - dryRun=false requires confirmWrite=true → 400 otherwise
   * - All ingested fixtures are created with isPublished=false
   *
   * No scheduler. No PSL activation. No production ingestion.
   */
  @Post('parse-psl/fixtures/ingest')
  async ingestParsePslFixtures(@Body() body: ParsePslIngestionRequestDto = {}) {
    const dryRun = body.dryRun !== false; // default true

    if (!dryRun) {
      if (!body.seasonId) {
        throw new BadRequestException(
          'seasonId is required for write mode (dryRun=false)',
        );
      }
      if (body.confirmWrite !== true) {
        throw new BadRequestException(
          'confirmWrite=true is required for write mode; set confirmWrite:true to acknowledge ' +
          'that fixtures will be created as unpublished',
        );
      }
    }

    const opts: {
      competitionCode?: string;
      dryRun?: boolean;
      seasonId?: string;
      includeCandidates?: boolean;
    } = {
      competitionCode: body.competitionCode ?? 'BETWAY_PREMIERSHIP',
      dryRun,
      includeCandidates: body.includeCandidates !== false,
    };
    if (body.seasonId !== undefined) opts.seasonId = body.seasonId;

    return this.ingestion.ingest(opts);
  }
}
