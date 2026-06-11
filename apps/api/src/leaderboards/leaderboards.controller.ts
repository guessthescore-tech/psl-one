import { Controller, Get } from '@nestjs/common';
import { LeaderboardsService } from './leaderboards.service';

@Controller('leaderboards')
export class LeaderboardsController {
  constructor(private leaderboardsService: LeaderboardsService) {}

  @Get('predictions')
  getPredictions() {
    return this.leaderboardsService.getPredictionsLeaderboard();
  }
}
