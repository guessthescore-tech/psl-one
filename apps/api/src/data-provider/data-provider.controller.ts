import { Body, Controller, Get, HttpCode, Param, Post, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DataProviderService } from './data-provider.service';
import { ParsePslFixtureIngestionService } from './parse-psl-fixture-ingestion.service';
import { WorldCupImportService } from './world-cup-import.service';
import { WorldCupDbStatusService } from './world-cup-db-status.service';
import { ScoreBatWidgetAdapter } from './scorebat-widget.adapter';
import type { ParsePslIngestionRequestDto } from './dto/parse-psl-fixture-ingestion.dto';
import type { WorldCupImportRequestDto } from './dto/world-cup-import.dto';

@Controller('admin/data-provider')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class DataProviderController {
  constructor(
    private service: DataProviderService,
    private ingestion: ParsePslFixtureIngestionService,
    private wcImport: WorldCupImportService,
    private wcDbStatus: WorldCupDbStatusService,
  ) {}

  /** Read-only WC2026 live provider readiness — no writes, no PSL activation. */
  @Get('world-cup-live-readiness')
  getWorldCupLiveReadiness() { return this.service.getWorldCupLiveReadiness(); }

  /**
   * WC2026 fixture import — dry-run by default, write requires safety flags.
   *
   * Write-mode safety:
   * - dryRun=false requires confirmWorldCupWrite='IMPORT_WORLD_CUP_BETA'
   * - Server env var ALLOW_WORLD_CUP_WRITE=true must also be set
   * No PSL activation. No scheduled ingestion.
   */
  @Post('world-cup/fixtures/import')
  @HttpCode(200)
  async importWorldCupFixtures(@Body() body: WorldCupImportRequestDto = {}) {
    const dryRun = body.dryRun !== false;
    if (!dryRun) {
      if (body.confirmWorldCupWrite !== 'IMPORT_WORLD_CUP_BETA') {
        throw new BadRequestException(
          'confirmWorldCupWrite must be "IMPORT_WORLD_CUP_BETA" for write mode',
        );
      }
    }
    return this.wcImport.importFixtures(body);
  }

  /**
   * Read-only WC2026 player pool status — counts seeded players and prices.
   * Points-only context: all WC fantasy is points-based, no cash value.
   */
  @Get('world-cup/player-pool-status')
  getWorldCupPlayerPoolStatus() { return this.wcDbStatus.getPlayerPoolStatus(); }

  /**
   * Read-only WC2026 fixture and prediction market status.
   * Points-only context: GTS prediction markets are points-based only.
   */
  @Get('world-cup/fixture-status')
  getWorldCupFixtureStatus() { return this.wcDbStatus.getFixtureStatus(); }

  /** Read-only ScoreBat widget embed config — no key values in response. */
  @Get('world-cup/scorebat-widget-config')
  getScoreBatWidgetConfig() {
    const adapter = new ScoreBatWidgetAdapter();
    return adapter.getWidgetEmbedConfig('world-cup');
  }

  /**
   * Refresh WC fixture statuses from football-data.org — PSL_ADMIN only.
   * Matches existing DB fixtures by teams + kickoff date; updates status/scores only.
   * Never creates new fixtures. Never touches PSL data.
   */
  @Post('world-cup/fixtures/refresh-status')
  @HttpCode(200)
  refreshWorldCupFixtureStatuses() {
    return this.wcImport.refreshFixtureStatuses();
  }

  /**
   * Read-only WC2026 GTS prediction market status — admin dashboard use.
   * Delegates to existing fixture-status endpoint which includes market counts.
   */
  @Get('world-cup/gts-status')
  getWorldCupGtsStatus() { return this.wcDbStatus.getFixtureStatus(); }

  /**
   * Read-only WC2026 media provider status — ScoreBat widget config availability.
   */
  @Get('world-cup/media-status')
  getWorldCupMediaStatus() {
    const adapter = new ScoreBatWidgetAdapter();
    const widgetConfig = adapter.getWidgetEmbedConfig('world-cup');
    return {
      provider: 'scorebat',
      widget: widgetConfig,
      note: 'Widget token is embedded in URL by ScoreBat design — not a secret leak',
      safety: { noRealMoney: true, noPslActivation: true },
    };
  }

  /** Read-only PSL fixture readiness — no writes, no PSL activation. */
  @Get('psl-fixture-readiness')
  getPslFixtureReadiness() { return this.service.getPslFixtureReadiness(); }

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
