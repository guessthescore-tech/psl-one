import { Injectable, Logger } from '@nestjs/common';
import { NoOpAdapter } from './no-op.adapter';
import { ApiFootballAdapter } from './api-football.adapter';
import { FootballDataOrgAdapter } from './football-data-org.adapter';
import type { ProviderAdapter } from './provider-adapter.interface';

/**
 * Per-competition provider router.
 * Routes to the correct adapter based on competition code.
 * Does NOT replace DataProviderService global selection.
 * Keys must be server-side only — never NEXT_PUBLIC_*.
 * No DB writes, no ingestion scheduling, no PSL activation.
 * Sportmonks is REJECTED and will never be selected.
 * ESPN is RESEARCH_ONLY and will never be selected.
 */
@Injectable()
export class ProviderRouterService {
  private readonly logger = new Logger(ProviderRouterService.name);

  // WC competition codes → football-data.org
  private static readonly WC_CODES = new Set(['WC', 'WORLD_CUP_2026', 'FIFA_WORLD_CUP']);

  // PSL competition codes → API-Football
  private static readonly PSL_CODES = new Set(['PSL', 'SOUTH_AFRICA_PSL', '288']);

  getAdapterForCompetition(competitionCode: string): ProviderAdapter {
    const code = competitionCode.toUpperCase().trim();

    if (ProviderRouterService.WC_CODES.has(code)) {
      const key = process.env['FOOTBALL_DATA_API_KEY'];
      if (key) {
        this.logger.log(`ProviderRouterService: routing "${competitionCode}" → FootballDataOrgAdapter`);
        return new FootballDataOrgAdapter();
      }
      this.logger.warn(`ProviderRouterService: WC route requested but FOOTBALL_DATA_API_KEY not set — NoOpAdapter fallback`);
      return new NoOpAdapter();
    }

    if (ProviderRouterService.PSL_CODES.has(code)) {
      const key = process.env['API_FOOTBALL_KEY'];
      if (key) {
        this.logger.log(`ProviderRouterService: routing "${competitionCode}" → ApiFootballAdapter`);
        return new ApiFootballAdapter();
      }
      this.logger.warn(`ProviderRouterService: PSL route requested but API_FOOTBALL_KEY not set — NoOpAdapter fallback`);
      return new NoOpAdapter();
    }

    this.logger.log(`ProviderRouterService: unknown competition "${competitionCode}" — NoOpAdapter default`);
    return new NoOpAdapter();
  }

  getRouteStatus(): { wc: string; psl: string; default: string } {
    return {
      wc: process.env['FOOTBALL_DATA_API_KEY'] ? 'READY (football-data-org)' : 'BLOCKED_NO_KEY',
      psl: process.env['API_FOOTBALL_KEY'] ? 'READY (api-football)' : 'BLOCKED_NO_KEY',
      default: 'NoOpAdapter',
    };
  }
}
