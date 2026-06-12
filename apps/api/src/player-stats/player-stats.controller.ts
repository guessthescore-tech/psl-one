import { Controller, Get, Param, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { PlayerStatsService } from './player-stats.service';

@Controller('players')
export class PlayerStatsController {
  constructor(private readonly service: PlayerStatsService) {}

  // GET /players/:playerId/profile
  @Get(':playerId/profile')
  getPlayerProfile(@Param('playerId') playerId: string) {
    return this.service.getPlayerProfile(playerId);
  }

  // GET /players/:playerId/season/:seasonId/stats
  @Get(':playerId/season/:seasonId/stats')
  getPlayerSeasonStats(
    @Param('playerId') playerId: string,
    @Param('seasonId') seasonId: string,
  ) {
    return this.service.getPlayerSeasonStats(playerId, seasonId);
  }

  // GET /players/:playerId/fixture/:fixtureId/stats
  @Get(':playerId/fixture/:fixtureId/stats')
  getPlayerMatchStat(
    @Param('playerId') playerId: string,
    @Param('fixtureId') fixtureId: string,
  ) {
    return this.service.getPlayerMatchStat(playerId, fixtureId);
  }

  // GET /players/fixtures/:fixtureId/stats
  @Get('fixtures/:fixtureId/stats')
  listFixtureStats(@Param('fixtureId') fixtureId: string) {
    return this.service.listFixtureStats(fixtureId);
  }

  // GET /players/season/:seasonId/top-performers
  @Get('season/:seasonId/top-performers')
  listSeasonTopPerformers(
    @Param('seasonId') seasonId: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.service.listSeasonTopPerformers(seasonId, limit);
  }

  // GET /players/gameweek/:gameweekId/stats
  @Get('gameweek/:gameweekId/stats')
  listGameweekStats(@Param('gameweekId') gameweekId: string) {
    return this.service.listGameweekStats(gameweekId);
  }

  // GET /players/season/:seasonId/team/:teamId/squad-stats
  @Get('season/:seasonId/team/:teamId/squad-stats')
  listSeasonSquadStats(
    @Param('seasonId') seasonId: string,
    @Param('teamId') teamId: string,
  ) {
    return this.service.listSeasonSquadStats(seasonId, teamId);
  }
}
