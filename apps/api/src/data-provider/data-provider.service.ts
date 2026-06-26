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

  /**
   * Read-only World Cup 2026 live provider readiness check.
   *
   * Inspects provider config from environment variables only — no network calls,
   * no DB writes, no fixture import, no PSL activation.
   * Provider keys are checked for presence only; values are never returned.
   */
  getWorldCupLiveReadiness() {
    const fdKey = process.env['FOOTBALL_DATA_API_KEY'] ?? '';
    const srKey = process.env['SPORTSRADAR_SOCCER_API_KEY'] ?? '';
    const sbToken = process.env['SCOREBAT_WIDGET_TOKEN'] ?? '';

    const fdConfigured = fdKey.length > 0;
    const srConfigured = srKey.length > 0;
    const sbConfigured = sbToken.length > 0;

    const primaryProvider = fdConfigured
      ? 'football-data-org'
      : srConfigured
        ? 'sportradar-soccer'
        : 'noop';

    const dryRunEligible = fdConfigured || srConfigured;

    const allowWriteFlag = process.env['ALLOW_WORLD_CUP_WRITE'] === 'true';

    return {
      competition: 'WC2026' as const,
      worldCupActive: true as const,
      activeProviders: {
        footballDataOrg: {
          configured: fdConfigured,
          envVar: 'FOOTBALL_DATA_API_KEY',
          status: fdConfigured ? 'CONFIGURED' : 'NOT_CONFIGURED',
        },
        sportRadar: {
          configured: srConfigured,
          envVar: 'SPORTSRADAR_SOCCER_API_KEY',
          status: srConfigured ? 'CONFIGURED' : 'NOT_CONFIGURED',
        },
        scoreBat: {
          configured: sbConfigured,
          envVar: 'SCOREBAT_WIDGET_TOKEN',
          status: sbConfigured ? 'WIDGET_READY' : 'NOT_CONFIGURED',
        },
      },
      primaryProvider,
      fallbackChain: ['football-data-org', 'sportradar-soccer', 'noop'],
      importReadiness: {
        dryRunEligible,
        writeImportAllowedByEnvFlag: allowWriteFlag,
        writeImportRequiresFlags: [
          'ALLOW_WORLD_CUP_WRITE=true (server env var)',
          'confirmWorldCupWrite=IMPORT_WORLD_CUP_BETA (request body)',
        ],
      },
      ownerActions: [
        fdConfigured
          ? 'football-data.org key configured — run dry-run at POST /admin/data-provider/world-cup/fixtures/import'
          : 'Set FOOTBALL_DATA_API_KEY to enable WC fixture import',
        srConfigured
          ? 'SportRadar key configured — available as fallback provider'
          : 'Set SPORTSRADAR_SOCCER_API_KEY for SportRadar fallback',
        sbConfigured
          ? 'ScoreBat token configured — widget available at /world-cup/live'
          : 'Set SCOREBAT_WIDGET_TOKEN to enable WC highlights widget',
      ],
      forbiddenActions: [
        'Do not activate PSL season',
        'Do not run write import without ALLOW_WORLD_CUP_WRITE=true server env var',
        'Do not expose provider keys to frontend or NEXT_PUBLIC_ vars',
        'Do not enable scheduled ingestion',
        'Do not enable production ingestion',
      ],
      safety: {
        noRealMoney: true as const,
        noPslActivation: true as const,
        worldCupBetaContext: true as const,
        noScheduledIngestion: true as const,
        noProductionIngestion: true as const,
      },
    };
  }

  /**
   * Read-only PSL fixture readiness check.
   *
   * Inspects provider config from environment variables only — no network calls,
   * no DB writes, no fixture import, no PSL activation.
   * Provider keys are read for presence only; values are never returned.
   */
  getPslFixtureReadiness() {
    const dataProvider = process.env['DATA_PROVIDER'] ?? '';
    const parseKey = process.env['PARSE_API_KEY'] ?? '';
    const afKey = process.env['API_FOOTBALL_KEY'] ?? '';

    const parsePslConfigured = dataProvider === 'parse-psl' && parseKey.length > 0;
    const apiFootballConfigured = dataProvider === 'api-football' && afKey.length > 0;

    const parsePslStatus: 'OK' | 'SOURCE_EMPTY' | 'NOT_CONFIGURED' =
      parsePslConfigured ? 'SOURCE_EMPTY' : 'NOT_CONFIGURED';

    const apiFootballStatus: 'OK' | 'SUSPENDED' | 'NOT_CONFIGURED' | 'NOT_CHECKED' =
      apiFootballConfigured ? 'NOT_CHECKED' : 'NOT_CONFIGURED';

    let readinessStatus:
      | 'SOURCE_EMPTY'
      | 'PROVIDER_NOT_CONFIGURED'
      | 'PROVIDER_ERROR'
      | 'FIXTURES_AVAILABLE_DRY_RUN_REQUIRED'
      | 'READY_FOR_OWNER_IMPORT_REVIEW';

    if (!parsePslConfigured && !apiFootballConfigured) {
      readinessStatus = 'PROVIDER_NOT_CONFIGURED';
    } else {
      readinessStatus = 'SOURCE_EMPTY';
    }

    return {
      competition: 'PSL' as const,
      season: '2026/27',
      pslActive: false as const,
      fixturePublicationIsActivation: false as const,
      readinessStatus,
      parsePsl: {
        configured: parsePslConfigured,
        status: parsePslStatus,
        candidateFixtureCount: 0,
        lastCheckedAt: new Date().toISOString(),
      },
      apiFootball: {
        configured: apiFootballConfigured,
        leagueId: 288 as const,
        status: apiFootballStatus,
      },
      ownerActions: [
        'Monitor this endpoint periodically until readinessStatus changes to FIXTURES_AVAILABLE_DRY_RUN_REQUIRED',
        'When fixtures are available: run dry-run import at POST /admin/data-provider/parse-psl/fixtures/ingest with dryRun=true',
        'After reviewing dry-run candidates: request owner approval for write import (dryRun=false)',
        'After write import: separately request owner approval for fixture publication',
        'PSL activation requires 13-check preflight and separate owner approval',
      ],
      forbiddenActions: [
        'Do not run fixture import write without owner approval',
        'Do not publish fixtures without owner approval',
        'Do not activate PSL season without 13-check preflight and owner approval',
        'Do not enable scheduled ingestion',
        'Do not enable production ingestion',
        'Do not expose provider keys to frontend',
      ],
      safety: {
        noWrites: true as const,
        noPublication: true as const,
        noPslActivation: true as const,
        noScheduledIngestion: true as const,
        noProductionIngestion: true as const,
        noRealMoney: true as const,
      },
    };
  }

  /**
   * Read-only WC beta capability matrix by concern (fixture/live/video).
   *
   * Reports key presence only — values are never returned.
   * Covers: football-data.org (fixtures/scores), Sportmonks (live events/lineups/stats),
   * ScoreBat (video highlights).
   * PSL production use of Sportmonks is not authorised — see ADR-037.
   */
  getWcBetaCapability() {
    const hasFdKey = (process.env['FOOTBALL_DATA_API_KEY'] ?? '').length > 0;
    const hasSmKey = (process.env['SPORTMONKS_API_KEY'] ?? '').length > 0;
    const hasScoreBatToken = (process.env['SCOREBAT_WIDGET_TOKEN'] ?? '').length > 0;
    const wcLiveProvider = process.env['WC_LIVE_PROVIDER'] ?? 'manual';

    const liveProviderActive = wcLiveProvider === 'sportmonks';
    const liveReady = liveProviderActive && hasSmKey;

    return {
      competition: 'fifa-world-cup-2026' as const,
      providers: {
        fixture: {
          name: 'football-data-org' as const,
          keyPresent: hasFdKey,
          status: hasFdKey ? ('READY' as const) : ('NO_KEY' as const),
          capabilities: ['fixtures', 'scores', 'standings', 'teams'],
        },
        live: {
          name: wcLiveProvider,
          keyPresent: liveProviderActive ? hasSmKey : true,
          status: liveReady ? ('READY' as const) : liveProviderActive && !hasSmKey ? ('NO_KEY' as const) : ('MANUAL_FALLBACK' as const),
          capabilities: liveReady
            ? ['fixture_state', 'match_events', 'lineups', 'player_stats']
            : ['manual_admin_entry_only'],
          envVar: 'WC_LIVE_PROVIDER',
        },
        video: {
          name: 'scorebat' as const,
          keyPresent: hasScoreBatToken,
          status: hasScoreBatToken ? ('WIDGET_READY' as const) : ('NO_KEY' as const),
          capabilities: ['embedded_highlights_widget'],
          envVar: 'SCOREBAT_WIDGET_TOKEN',
        },
      },
      ownerActions: [
        liveReady
          ? 'Sportmonks live provider active — events, lineups, player stats available'
          : 'Set WC_LIVE_PROVIDER=sportmonks + SPORTMONKS_API_KEY to enable live match events',
        hasScoreBatToken
          ? 'ScoreBat token present — embedded video widget available at /world-cup/live'
          : 'Set SCOREBAT_WIDGET_TOKEN to enable WC highlights widget',
      ],
      guards: {
        pslActivated: false as const,
        productionIngestionEnabled: false as const,
        bettingEnabled: false as const,
        realMoneyEnabled: false as const,
      },
    };
  }
}
