import { Injectable, Logger } from '@nestjs/common';
import type { ProviderAdapter, ProviderAdapterHealth, ProviderFixture, ProviderPlayer, ProviderSeason, ProviderTeam } from './provider-adapter.interface';

@Injectable()
export class SportmonksAdapter implements ProviderAdapter {
  readonly name = 'sportmonks';
  private readonly logger = new Logger(SportmonksAdapter.name);
  private readonly apiKey: string | undefined;
  private readonly baseUrl = 'https://api.sportmonks.com/v3/football';

  constructor() {
    this.apiKey = process.env['SPORTMONKS_API_KEY'];
    if (!this.apiKey) {
      this.logger.warn('SPORTMONKS_API_KEY not set — provider is in disabled/safe mode');
    }
  }

  async health(): Promise<ProviderAdapterHealth> {
    if (!this.apiKey) {
      return { available: false, provider: this.name, message: 'API key not configured — safe disabled mode' };
    }
    try {
      // In trial mode: just confirm we can reach the status endpoint
      const url = `${this.baseUrl}/leagues?api_token=${this.apiKey}&per_page=1`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) return { available: true, provider: this.name, message: 'Provider reachable' };
      return { available: false, provider: this.name, message: `Provider returned ${res.status}` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return { available: false, provider: this.name, message: `Provider unreachable: ${msg}` };
    }
  }

  async getSeasons(): Promise<ProviderSeason[]> {
    if (!this.apiKey) return [];
    // Intentionally not implemented — trial mode only
    return [];
  }

  async getFixtures(_seasonExternalId: string): Promise<ProviderFixture[]> {
    if (!this.apiKey) return [];
    return [];
  }

  async getTeams(_seasonExternalId: string): Promise<ProviderTeam[]> {
    if (!this.apiKey) return [];
    return [];
  }

  async getPlayers(_teamExternalId: string): Promise<ProviderPlayer[]> {
    if (!this.apiKey) return [];
    return [];
  }
}
