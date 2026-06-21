import { Injectable, Logger } from '@nestjs/common';
import { NoOpAdapter } from './no-op.adapter';
import { SportmonksAdapter } from './sportmonks.adapter';
import type { ProviderAdapter } from './provider-adapter.interface';

@Injectable()
export class DataProviderService {
  private readonly logger = new Logger(DataProviderService.name);
  private readonly adapter: ProviderAdapter;

  constructor() {
    const key = process.env['SPORTMONKS_API_KEY'];
    if (key) {
      this.adapter = new SportmonksAdapter();
      this.logger.log('DataProviderService: using SportmonksAdapter (trial mode)');
    } else {
      this.adapter = new NoOpAdapter();
      this.logger.log('DataProviderService: using NoOpAdapter (no API key set)');
    }
  }

  health() { return this.adapter.health(); }
  getSeasons() { return this.adapter.getSeasons(); }
  getFixtures(seasonId: string) { return this.adapter.getFixtures(seasonId); }
  getTeams(seasonId: string) { return this.adapter.getTeams(seasonId); }
  getPlayers(teamId: string) { return this.adapter.getPlayers(teamId); }
  getStandings(seasonId: string) { return this.adapter.getStandings(seasonId); }
}
