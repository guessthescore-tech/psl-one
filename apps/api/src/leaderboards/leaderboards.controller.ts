import { Controller, Get, Query } from '@nestjs/common';
import { LeaderboardsService } from './leaderboards.service';
import { parseBoundedLimit } from '../common/pagination';

const MAX_LEADERBOARD_LIMIT = 200;

@Controller('leaderboards')
export class LeaderboardsController {
  constructor(private readonly leaderboardsService: LeaderboardsService) {}

  @Get()
  async getOverview(@Query('seasonSlug') seasonSlug?: string) {
    const seasonId = seasonSlug ? await this._resolveSeasonId(seasonSlug) : null;
    return this.leaderboardsService.getLeaderboardOverview(seasonId);
  }

  @Get('seasons')
  getSeasons() {
    return this.leaderboardsService.getLeaderboardSeasons();
  }

  @Get('overall')
  async getOverall(@Query('seasonSlug') seasonSlug?: string, @Query('limit') limit?: string) {
    const seasonId = seasonSlug ? await this._resolveSeasonId(seasonSlug) : null;
    return this.leaderboardsService.getOverallLeaderboard(
      seasonId,
      parseBoundedLimit(limit, 50, MAX_LEADERBOARD_LIMIT),
    );
  }

  @Get('fan-value')
  async getFanValue(@Query('seasonSlug') seasonSlug?: string, @Query('limit') limit?: string) {
    const seasonId = seasonSlug ? await this._resolveSeasonId(seasonSlug) : null;
    return this.leaderboardsService.getFanValueLeaderboard(
      seasonId,
      parseBoundedLimit(limit, 50, MAX_LEADERBOARD_LIMIT),
    );
  }

  @Get('fantasy')
  async getFantasy(@Query('seasonSlug') seasonSlug?: string, @Query('limit') limit?: string) {
    const seasonId = seasonSlug ? await this._resolveSeasonId(seasonSlug) : null;
    return this.leaderboardsService.getFantasyLeaderboard(
      seasonId,
      parseBoundedLimit(limit, 50, MAX_LEADERBOARD_LIMIT),
    );
  }

  @Get('predictions')
  async getPredictions(@Query('seasonSlug') seasonSlug?: string, @Query('limit') limit?: string) {
    const seasonId = seasonSlug ? await this._resolveSeasonId(seasonSlug) : null;
    return this.leaderboardsService.getPredictionsLeaderboard(
      seasonId,
      parseBoundedLimit(limit, 50, MAX_LEADERBOARD_LIMIT),
    );
  }

  @Get('achievements')
  async getAchievements(@Query('limit') limit?: string) {
    return this.leaderboardsService.getAchievementsLeaderboard(
      parseBoundedLimit(limit, 50, MAX_LEADERBOARD_LIMIT),
    );
  }

  private async _resolveSeasonId(slug: string): Promise<string | null> {
    const season = await this.leaderboardsService.resolveSeasonFromSlug(slug);
    return season?.id ?? null;
  }
}
