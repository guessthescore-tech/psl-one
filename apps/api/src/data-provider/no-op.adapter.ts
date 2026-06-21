import { Injectable } from '@nestjs/common';
import type { ProviderAdapter, ProviderAdapterHealth, ProviderFixture, ProviderPlayer, ProviderSeason, ProviderStandings, ProviderTeam } from './provider-adapter.interface';

@Injectable()
export class NoOpAdapter implements ProviderAdapter {
  readonly name = 'no-op';
  async health(): Promise<ProviderAdapterHealth> {
    return { available: false, provider: this.name, message: 'No provider configured' };
  }
  async getSeasons(): Promise<ProviderSeason[]> { return []; }
  async getFixtures(_s: string): Promise<ProviderFixture[]> { return []; }
  async getTeams(_s: string): Promise<ProviderTeam[]> { return []; }
  async getPlayers(_t: string): Promise<ProviderPlayer[]> { return []; }
  async getStandings(_s: string): Promise<ProviderStandings[]> { return []; }
}
