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

  invalidateProfile(userId: string): void {
    this.cache.deleteByPrefix(`profile:${userId}`);
    this.cache.deleteByPrefix(`summary:${userId}`);
  }

  invalidateSponsor(sponsorId: string): void {
    this.cache.deleteByPrefix(`sponsor:${sponsorId}`);
  }

  invalidateMedia(): void {
    this.cache.deleteByPrefix('media:');
    this.cache.deleteByPrefix('news:');
    this.cache.deleteByPrefix('video:');
  }

  invalidateCampaigns(): void {
    this.cache.deleteByPrefix('campaign:');
    this.cache.deleteByPrefix('campaigns:');
    this.cache.deleteByPrefix('campaign-participation:');
    this.cache.deleteByPrefix('campaign-progress:');
  }

  invalidateAll(): void {
    this.cache.flush();
  }
}
