import { Injectable, Logger } from '@nestjs/common';
import { NoOpAdapter } from './no-op.adapter';
import { ApiFootballAdapter } from './api-football.adapter';
import { FootballDataOrgAdapter } from './football-data-org.adapter';
import { ParsePslAdapter } from './parse-psl.adapter';
import { SportRadarSoccerAdapter } from './sportradar-soccer.adapter';
import type { ProviderAdapter } from './provider-adapter.interface';

/**
 * Per-competition provider router.
 * Routes to the correct adapter based on competition code.
 * Does NOT replace DataProviderService global selection.
 * Keys must be server-side only — never NEXT_PUBLIC_*.
 * No DB writes, no ingestion scheduling, no PSL activation.
 * Sportmonks is REJECTED and will never be selected.
 * ESPN is RESEARCH_ONLY and will never be selected.
 *
 * PSL routing priority:
 *   1. ParsePslAdapter  — primary candidate (psl.co.za official site via Parse.bot)
 *   2. ApiFootballAdapter — fallback when PARSE_API_KEY absent but API_FOOTBALL_KEY present
 *   3. NoOpAdapter — when no PSL key is configured
 */
@Injectable()
export class ProviderRouterService {
  private readonly logger = new Logger(ProviderRouterService.name);

  // WC competition codes → football-data.org
  private static readonly WC_CODES = new Set(['WC', 'WORLD_CUP_2026', 'FIFA_WORLD_CUP']);

  // PSL competition codes → ParsePslAdapter (primary) or ApiFootballAdapter (fallback)
  private static readonly PSL_CODES = new Set([
    'PSL',
    'SOUTH_AFRICA_PSL',
    '288',
    'BETWAY_PREMIERSHIP',
  ]);

  getAdapterForCompetition(competitionCode: string): ProviderAdapter {
    const code = competitionCode.toUpperCase().trim();

    if (ProviderRouterService.WC_CODES.has(code)) {
      const fdKey = process.env['FOOTBALL_DATA_API_KEY'];
      if (fdKey) {
        this.logger.log({ action: 'provider.route_selected', competitionCode, adapter: 'FootballDataOrgAdapter' });
        return new FootballDataOrgAdapter();
      }
      const srKey = process.env['SPORTSRADAR_SOCCER_API_KEY'];
      if (srKey) {
        this.logger.log({ action: 'provider.route_selected', competitionCode, adapter: 'SportRadarSoccerAdapter', fallbackReason: 'FOOTBALL_DATA_API_KEY absent' });
        return new SportRadarSoccerAdapter();
      }
      this.logger.warn({ action: 'provider.route_missing_key', competitionCode, adapter: 'NoOpAdapter' });
      return new NoOpAdapter();
    }

    if (ProviderRouterService.PSL_CODES.has(code)) {
      const parseKey = process.env['PARSE_API_KEY'];
      if (parseKey) {
        this.logger.log({ action: 'provider.route_selected', competitionCode, adapter: 'ParsePslAdapter' });
        return new ParsePslAdapter();
      }
      const afKey = process.env['API_FOOTBALL_KEY'];
      if (afKey) {
        this.logger.log({ action: 'provider.route_selected', competitionCode, adapter: 'ApiFootballAdapter', fallbackReason: 'PARSE_API_KEY absent' });
        return new ApiFootballAdapter();
      }
      this.logger.warn({ action: 'provider.route_missing_key', competitionCode, adapter: 'NoOpAdapter' });
      return new NoOpAdapter();
    }

    this.logger.log({ action: 'provider.route_defaulted', competitionCode, adapter: 'NoOpAdapter' });
    return new NoOpAdapter();
  }

  getRouteStatus(): { wc: string; psl: string; default: string } {
    const parseKey = process.env['PARSE_API_KEY'];
    const afKey = process.env['API_FOOTBALL_KEY'];
    let pslStatus: string;
    if (parseKey) {
      pslStatus = 'READY (parse-psl)';
    } else if (afKey) {
      pslStatus = 'READY (api-football-fallback)';
    } else {
      pslStatus = 'BLOCKED_NO_KEY';
    }
    const fdKey = process.env['FOOTBALL_DATA_API_KEY'];
    const srKey = process.env['SPORTSRADAR_SOCCER_API_KEY'];
    let wcStatus: string;
    if (fdKey) {
      wcStatus = 'READY (football-data-org)';
    } else if (srKey) {
      wcStatus = 'READY (sportradar-soccer-fallback)';
    } else {
      wcStatus = 'BLOCKED_NO_KEY';
    }
    return {
      wc: wcStatus,
      psl: pslStatus,
      default: 'NoOpAdapter',
    };
  }
}
