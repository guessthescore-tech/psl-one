import { Injectable } from '@nestjs/common';
import { ApiCacheService } from './api-cache.service';

@Injectable()
export class CacheInvalidationService {
  constructor(private readonly cache: ApiCacheService) {}

  invalidateFixture(fixtureId: string): void {
    this.cache.deleteByPrefix(`fixture:${fixtureId}`);
    this.cache.deleteByPrefix('fixtures:');
  }

  invalidateLeaderboard(): void {
    this.cache.deleteByPrefix('leaderboard:');
    this.cache.deleteByPrefix('standings:');
  }

  invalidateClub(clubId: string): void {
    this.cache.deleteByPrefix(`club:${clubId}`);
    this.cache.deleteByPrefix('clubs:');
  }

  invalidateSponsor(sponsorId: string): void {
    this.cache.deleteByPrefix(`sponsor:${sponsorId}`);
  }

  invalidateMedia(): void {
    this.cache.deleteByPrefix('media:');
    this.cache.deleteByPrefix('news:');
    this.cache.deleteByPrefix('video:');
  }

  invalidateAll(): void {
    this.cache.flush();
  }
}
