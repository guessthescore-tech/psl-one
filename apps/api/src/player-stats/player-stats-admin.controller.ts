import {
  Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PlayerStatsService, UpsertPlayerStatsDto } from './player-stats.service';
import { PlayerMatchStatsStatus } from '@prisma/client';

@Controller('players/admin/stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class PlayerStatsAdminController {
  constructor(private readonly service: PlayerStatsService) {}

  // GET /players/admin/stats
  @Get()
  list(
    @Query('seasonId') seasonId?: string,
    @Query('fixtureId') fixtureId?: string,
    @Query('status') status?: PlayerMatchStatsStatus,
  ) {
    return this.service.adminListStats(seasonId, fixtureId, status);
  }

  // GET /players/admin/stats/season/:seasonId/readiness
  @Get('season/:seasonId/readiness')
  getSeasonReadiness(@Param('seasonId') seasonId: string) {
    return this.service.adminGetSeasonReadiness(seasonId);
  }

  // GET /players/admin/stats/:id
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.adminGetStat(id);
  }

  // POST /players/admin/stats
  @Post()
  upsert(@Body() dto: UpsertPlayerStatsDto) {
    return this.service.adminUpsertStat(dto);
  }

  // PUT /players/admin/stats/:id
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpsertPlayerStatsDto) {
    return this.service.adminUpsertStat(dto);
  }

  // POST /players/admin/stats/:id/verify
  @Post(':id/verify')
  verify(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.adminVerifyStat(id, user.id);
  }

  // POST /players/admin/stats/:id/publish
  @Post(':id/publish')
  publish(@Param('id') id: string) {
    return this.service.adminPublishStat(id);
  }

  // POST /players/admin/stats/:id/lock
  @Post(':id/lock')
  lock(@Param('id') id: string) {
    return this.service.adminLockStat(id);
  }

  // POST /players/admin/stats/fixtures/:fixtureId/bulk-publish
  @Post('fixtures/:fixtureId/bulk-publish')
  bulkPublish(@Param('fixtureId') fixtureId: string) {
    return this.service.adminBulkPublishFixture(fixtureId);
  }

  // DELETE /players/admin/stats/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.adminDeleteStat(id);
  }
}
