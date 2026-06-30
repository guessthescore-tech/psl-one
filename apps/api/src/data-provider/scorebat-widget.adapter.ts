import { Injectable, Logger } from '@nestjs/common';
import type {
  ProviderAdapter,
  ProviderAdapterHealth,
  ProviderFixture,
  ProviderPlayer,
  ProviderSeason,
  ProviderStandings,
  ProviderTeam,
} from './provider-adapter.interface';

/**
 * ScoreBat widget adapter for PSL One.
 *
 * ScoreBat provides an iframe-based video highlights widget — it is NOT a
 * structured data API. This adapter implements the ProviderAdapter interface
 * for registration purposes, but all data methods return empty arrays.
 *
 * Use getWidgetEmbedConfig() to get the iframe embed parameters.
 * The widget token (SCOREBAT_WIDGET_TOKEN) is read server-side only and is
 * never returned as a raw value — only the embed URL is returned.
 *
 * No betting/odds. No PSL fixture data. No player stats.
 * Widget is additive: highlights only — never a primary data source.
 */
@Injectable()
export class ScoreBatWidgetAdapter implements ProviderAdapter {
  readonly name = 'scorebat-widget';
  private readonly logger = new Logger(ScoreBatWidgetAdapter.name);
  private readonly widgetToken: string | undefined;

  private static readonly EMBED_BASE = 'https://www.scorebat.com/embed';
  private static readonly ALLOWED_HOSTS = ['scorebat.com', 'www.scorebat.com'];

  constructor() {
    this.widgetToken = process.env['SCOREBAT_WIDGET_TOKEN'] || undefined;
    if (!this.widgetToken) {
      this.logger.warn({ action: 'provider.disabled', provider: this.name, requiredKey: 'SCOREBAT_WIDGET_TOKEN' });
    }
  }

  async health(): Promise<ProviderAdapterHealth> {
    if (!this.widgetToken) {
      return {
        available: false,
        provider: this.name,
        message: 'SCOREBAT_WIDGET_TOKEN not configured — widget disabled',
      };
    }
    return {
      available: true,
      provider: this.name,
      message: 'ScoreBat widget token configured — embed ready for World Cup highlights',
    };
  }

  /** ScoreBat is widget-only — structured fixture data not available. */
  async getSeasons(): Promise<ProviderSeason[]> { return []; }
  async getFixtures(_seasonExternalId: string): Promise<ProviderFixture[]> { return []; }
  async getTeams(_seasonExternalId: string): Promise<ProviderTeam[]> { return []; }
  async getPlayers(_teamExternalId: string): Promise<ProviderPlayer[]> { return []; }
  async getStandings(_seasonExternalId: string): Promise<ProviderStandings[]> { return []; }

  /**
   * Returns embed configuration for the ScoreBat World Cup widget.
   * The widget embed URL is safe to render server-side — it is not a secret API key.
   * Token is embedded in the URL (as ScoreBat intends for iframe attribution),
   * but the raw env var name and value are never logged or returned separately.
   *
   * @param competitionSlug e.g. 'world-cup-2026', 'world-cup'
   */
  getWidgetEmbedConfig(competitionSlug = 'world-cup'): ScoreBatEmbedConfig {
    if (!this.widgetToken) {
      return {
        available: false,
        embedUrl: null,
        allowedHosts: ScoreBatWidgetAdapter.ALLOWED_HOSTS,
        message: 'ScoreBat widget token not configured',
      };
    }
    const embedUrl = `${ScoreBatWidgetAdapter.EMBED_BASE}/competition/?id=${competitionSlug}&token=${this.widgetToken}&thdId=0&theme=light&widgetStyle=normal&isMobile=true`;
    return {
      available: true,
      embedUrl,
      allowedHosts: ScoreBatWidgetAdapter.ALLOWED_HOSTS,
      message: 'ScoreBat World Cup highlights widget ready',
    };
  }

  /** Static list of allowed ScoreBat iframe hosts for CSP/security configuration. */
  static getAllowedHosts(): string[] {
    return [...ScoreBatWidgetAdapter.ALLOWED_HOSTS];
  }
}

export interface ScoreBatEmbedConfig {
  available: boolean;
  embedUrl: string | null;
  allowedHosts: string[];
  message: string;
}
