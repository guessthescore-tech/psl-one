import { Injectable, Logger } from '@nestjs/common';
import { NoOpAdapter } from './no-op.adapter';
import { ApiFootballAdapter } from './api-football.adapter';
import { FootballDataOrgAdapter } from './football-data-org.adapter';
import { ParsePslAdapter } from './parse-psl.adapter';
import type { ProviderAdapter } from './provider-adapter.interface';

@Injectable()
export class DataProviderService {
  private readonly logger = new Logger(DataProviderService.name);
  private readonly adapter: ProviderAdapter;

  constructor() {
    // Provider selection is explicit via DATA_PROVIDER env var.
    // A key alone never activates a provider — both must be set.
    // See docs/data/SPRINT-12-PROVIDER-STRATEGY.md.
    const provider = process.env['DATA_PROVIDER'];
    if (provider === 'api-football') {
      const key = process.env['API_FOOTBALL_KEY'];
      if (key) {
        this.adapter = new ApiFootballAdapter();
        this.logger.log('DataProviderService: using ApiFootballAdapter (DATA_PROVIDER=api-football)');
      } else {
        this.adapter = new NoOpAdapter();
        this.logger.warn('DataProviderService: DATA_PROVIDER=api-football but API_FOOTBALL_KEY not set — NoOpAdapter fallback');
      }
    } else if (provider === 'football-data-org') {
      const key = process.env['FOOTBALL_DATA_API_KEY'];
      if (key) {
        this.adapter = new FootballDataOrgAdapter();
        this.logger.log('DataProviderService: using FootballDataOrgAdapter (DATA_PROVIDER=football-data-org)');
      } else {
        this.adapter = new NoOpAdapter();
        this.logger.warn('DataProviderService: DATA_PROVIDER=football-data-org but FOOTBALL_DATA_API_KEY not set — NoOpAdapter fallback');
      }
    } else if (provider === 'parse-psl') {
      const key = process.env['PARSE_API_KEY'];
      if (key) {
        this.adapter = new ParsePslAdapter();
        this.logger.log('DataProviderService: using ParsePslAdapter (DATA_PROVIDER=parse-psl)');
      } else {
        this.adapter = new NoOpAdapter();
        this.logger.warn('DataProviderService: DATA_PROVIDER=parse-psl but PARSE_API_KEY not set — NoOpAdapter fallback');
      }
    } else {
      this.adapter = new NoOpAdapter();
      if (provider) {
        this.logger.warn(`DataProviderService: unknown DATA_PROVIDER="${provider}" — NoOpAdapter fallback`);
      } else {
        this.logger.log('DataProviderService: DATA_PROVIDER not set — NoOpAdapter default');
      }
    }
  }

  health() { return this.adapter.health(); }
  getSeasons() { return this.adapter.getSeasons(); }
  getFixtures(seasonId: string) { return this.adapter.getFixtures(seasonId); }
  getTeams(seasonId: string) { return this.adapter.getTeams(seasonId); }
  getPlayers(teamId: string) { return this.adapter.getPlayers(teamId); }
  getStandings(seasonId: string) { return this.adapter.getStandings(seasonId); }
}
