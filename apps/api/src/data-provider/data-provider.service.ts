import { Injectable, Logger } from '@nestjs/common';
import { NoOpAdapter } from './no-op.adapter';
// SportmonksAdapter is retained for reference but is NOT wired — Sportmonks was removed from
// the active provider strategy (Sprint 10 amendment). Primary provider is UNDECIDED.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SportmonksAdapter } from './sportmonks.adapter';
import type { ProviderAdapter } from './provider-adapter.interface';

@Injectable()
export class DataProviderService {
  private readonly logger = new Logger(DataProviderService.name);
  private readonly adapter: ProviderAdapter;

  constructor() {
    // Primary provider is UNDECIDED — always use NoOpAdapter until a new provider is chosen
    // and explicitly wired here. See docs/data/SPRINT-10-ACTIVE-PROVIDER-STRATEGY.md.
    this.adapter = new NoOpAdapter();
    this.logger.log('DataProviderService: using NoOpAdapter (primary provider UNDECIDED)');
  }

  health() { return this.adapter.health(); }
  getSeasons() { return this.adapter.getSeasons(); }
  getFixtures(seasonId: string) { return this.adapter.getFixtures(seasonId); }
  getTeams(seasonId: string) { return this.adapter.getTeams(seasonId); }
  getPlayers(teamId: string) { return this.adapter.getPlayers(teamId); }
  getStandings(seasonId: string) { return this.adapter.getStandings(seasonId); }
}
