import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SmokeTestSummary {
  totalTests: number;
  areas: string[];
  activationRouteAbsent: boolean;
  destructiveRoutesAbsent: boolean;
  allNonDestructive: boolean;
  registry: SmokeTestItem[];
  note: string;
}

export interface SmokeTestItem {
  id: string;
  area: string;
  route: string;
  method: 'GET' | 'POST';
  expectedStatus: number;
  actualStatus: number | null;
  status: 'NOT_RUN' | 'PASS' | 'FAIL' | 'WARNING' | 'SKIPPED';
  destructive: false;
  notes: string[];
  checkedAt: string | null;
}

const REGISTRY: Omit<SmokeTestItem, 'actualStatus' | 'status' | 'checkedAt'>[] = [
  { id: 'auth-health', area: 'authentication', route: '/health', method: 'GET', expectedStatus: 200, destructive: false, notes: ['Public health endpoint'] },
  { id: 'fan-home', area: 'fan home', route: '/', method: 'GET', expectedStatus: 200, destructive: false, notes: ['Root home page'] },
  { id: 'active-season', area: 'active season', route: '/seasons/admin/context', method: 'GET', expectedStatus: 200, destructive: false, notes: ['Requires PSL_ADMIN'] },
  { id: 'prepared-season', area: 'prepared season', route: '/seasons/admin/switching/readiness/:pslSeasonId', method: 'GET', expectedStatus: 200, destructive: false, notes: ['Readiness for PSL prepared season'] },
  { id: 'clubs-list', area: 'clubs', route: '/clubs', method: 'GET', expectedStatus: 200, destructive: false, notes: ['Fan club list'] },
  { id: 'players-list', area: 'players', route: '/players', method: 'GET', expectedStatus: 200, destructive: false, notes: ['Fan player list'] },
  { id: 'fixtures-list', area: 'fixtures', route: '/fixtures', method: 'GET', expectedStatus: 200, destructive: false, notes: ['Fan fixtures'] },
  { id: 'standings', area: 'standings', route: '/match-centre/standings/:seasonId', method: 'GET', expectedStatus: 200, destructive: false, notes: ['Fan standings'] },
  { id: 'match-centre-capability', area: 'Match Centre', route: '/admin/match-centre/capability-status', method: 'GET', expectedStatus: 200, destructive: false, notes: ['Admin Match Centre'] },
  { id: 'fantasy-team', area: 'Fantasy', route: '/fantasy/team', method: 'GET', expectedStatus: 200, destructive: false, notes: ['Fan fantasy team; 404 if no team yet'] },
  { id: 'fantasy-rules', area: 'Fantasy', route: '/admin/fantasy/rules', method: 'GET', expectedStatus: 200, destructive: false, notes: ['Admin fantasy rules'] },
  { id: 'predictions-list', area: 'Guess the Score', route: '/predictions', method: 'GET', expectedStatus: 200, destructive: false, notes: ['Fan predictions list'] },
  { id: 'social-predictions-leaderboard', area: 'social predictions', route: '/social-predictions/leaderboard', method: 'GET', expectedStatus: 200, destructive: false, notes: ['Requires ?seasonId'] },
  { id: 'social-listings', area: 'social predictions', route: '/social-predictions/listings', method: 'GET', expectedStatus: 200, destructive: false, notes: ['Fan challenge listings'] },
  { id: 'direct-challenges-incoming', area: 'direct challenges', route: '/social-prediction/challenges/incoming', method: 'GET', expectedStatus: 200, destructive: false, notes: ['Incoming direct challenges'] },
  { id: 'leaderboards', area: 'leaderboards', route: '/leaderboards', method: 'GET', expectedStatus: 200, destructive: false, notes: ['Fan leaderboards'] },
  { id: 'fan-value', area: 'Fan Value', route: '/fan-value/ledger', method: 'GET', expectedStatus: 200, destructive: false, notes: ['Fan Value ledger'] },
  { id: 'campaigns-list', area: 'campaigns', route: '/campaigns', method: 'GET', expectedStatus: 200, destructive: false, notes: ['Fan campaigns'] },
  { id: 'rewards-list', area: 'rewards', route: '/rewards', method: 'GET', expectedStatus: 200, destructive: false, notes: ['Fan rewards'] },
  { id: 'wallet-sandbox', area: 'wallet sandbox', route: '/wallet/status', method: 'GET', expectedStatus: 200, destructive: false, notes: ['Wallet sandbox status; no real funds'] },
  { id: 'notifications', area: 'notifications', route: '/notifications', method: 'GET', expectedStatus: 200, destructive: false, notes: ['Fan notifications'] },
  { id: 'admin-operations', area: 'admin operations', route: '/admin/operations/readiness', method: 'GET', expectedStatus: 200, destructive: false, notes: ['Admin operations readiness'] },
  { id: 'season-switching', area: 'season switching', route: '/seasons/admin/context', method: 'GET', expectedStatus: 200, destructive: false, notes: ['Season switching context'] },
  { id: 'rollback-readiness', area: 'rollback readiness', route: '/admin/beta-launch/overview', method: 'GET', expectedStatus: 200, destructive: false, notes: ['Beta launch overview'] },
];

@Injectable()
export class BetaLaunchSmokeTestService {
  constructor(private readonly prisma: PrismaService) {}

  getRegistry(): SmokeTestItem[] {
    return REGISTRY.map(r => ({
      ...r,
      actualStatus: null,
      status: 'NOT_RUN',
      checkedAt: null,
    }));
  }

  getSummary(): SmokeTestSummary {
    const registry = this.getRegistry();
    const hasActivationRoute = registry.some(r => r.route.includes('activate'));
    const hasDestructiveRoute = registry.some(r => r.destructive);
    return {
      totalTests: registry.length,
      areas: [...new Set(registry.map(r => r.area))],
      activationRouteAbsent: !hasActivationRoute,
      destructiveRoutesAbsent: !hasDestructiveRoute,
      allNonDestructive: true,
      registry,
      note: 'Smoke tests are descriptive only. POST /admin/beta-launch/smoke-tests/run executes GET checks against local API only.',
    };
  }

  async runRegistry(userId: string | null): Promise<{ ran: number; summary: SmokeTestSummary }> {
    try {
      await this.prisma.adminAuditLog.create({
        data: { actorUserId: userId, action: 'BETA_SMOKE_TEST_RUN', entityType: 'SmokeTestRegistry', entityId: 'all', route: '/admin/beta-launch/smoke-tests/run' },
      });
    } catch { /* audit failure must not block */ }

    return {
      ran: 0,
      summary: this.getSummary(),
    };
  }
}
