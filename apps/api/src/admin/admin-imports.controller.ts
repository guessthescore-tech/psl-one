import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TokenPayload } from '../auth/providers/auth.provider.interface';
import { CompetitionImportService } from './competition-import.service';
import {
  CompetitionImportPayload,
  ImportCompetitionDto,
  ImportFixtureDto,
  ImportPlayerDto,
  ImportSeasonDto,
  ImportTeamDto,
  ImportVenueDto,
} from './dto/competition-import-payload.dto';

@Controller('admin/imports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class AdminImportsController {
  constructor(private readonly importService: CompetitionImportService) {}

  @Get()
  listJobs() {
    return this.importService.listJobs();
  }

  @Post('validate')
  validate(@Body() body: CompetitionImportPayload) {
    return this.importService.validate(body);
  }

  @Post('commit')
  commit(@Body() body: CompetitionImportPayload, @CurrentUser() user: TokenPayload) {
    return this.importService.commit(body, { userId: user.sub });
  }

  @Post('manual')
  createDraft(@Body() body: CompetitionImportPayload, @CurrentUser() user: TokenPayload) {
    return this.importService.createDraftJob(body, user.sub);
  }

  @Get(':id')
  getJob(@Param('id') id: string) {
    return this.importService.getJob(id);
  }

  @Post(':id/retry')
  retryJob(@Param('id') id: string) {
    return this.importService.retryJob(id);
  }

  @Post(':id/cancel')
  cancelJob(@Param('id') id: string) {
    return this.importService.cancelJob(id);
  }
}

@Controller('admin/imports/manual')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class AdminManualImportController {
  constructor(private readonly importService: CompetitionImportService) {}

  @Post('competition')
  manualCompetition(@Body() body: ImportCompetitionDto, @CurrentUser() user: TokenPayload) {
    return this.importService.commit(
      { source: 'MANUAL', sourceType: 'MANUAL', competition: body },
      { userId: user.sub },
    );
  }

  @Post('season')
  manualSeason(
    @Body() body: ImportSeasonDto & { competitionSlug?: string },
    @CurrentUser() user: TokenPayload,
  ) {
    const { competitionSlug, ...season } = body;
    return this.importService.commit(
      { source: 'MANUAL', sourceType: 'MANUAL', season, ...(competitionSlug ? { competitionSlug } : {}) },
      { userId: user.sub },
    );
  }

  @Post('team')
  manualTeam(@Body() body: ImportTeamDto, @CurrentUser() user: TokenPayload) {
    return this.importService.commit(
      { source: 'MANUAL', sourceType: 'MANUAL', teams: [body] },
      { userId: user.sub },
    );
  }

  @Post('player')
  manualPlayer(@Body() body: ImportPlayerDto, @CurrentUser() user: TokenPayload) {
    return this.importService.commit(
      { source: 'MANUAL', sourceType: 'MANUAL', players: [body] },
      { userId: user.sub },
    );
  }

  @Post('venue')
  manualVenue(@Body() body: ImportVenueDto, @CurrentUser() user: TokenPayload) {
    return this.importService.commit(
      { source: 'MANUAL', sourceType: 'MANUAL', venues: [body] },
      { userId: user.sub },
    );
  }

  @Post('fixture')
  manualFixture(
    @Body() body: ImportFixtureDto & { seasonSlug?: string },
    @CurrentUser() user: TokenPayload,
  ) {
    const { seasonSlug, ...fixture } = body;
    return this.importService.commit(
      { source: 'MANUAL', sourceType: 'MANUAL', fixtures: [fixture], ...(seasonSlug ? { seasonSlug } : {}) },
      { userId: user.sub },
    );
  }
}
