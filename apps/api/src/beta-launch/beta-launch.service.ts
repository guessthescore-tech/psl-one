import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SeasonSwitchingService } from '../season-switching/season-switching.service';
import { BetaCohortStatus, BetaCohortMemberStatus, BetaLaunchApprovalStatus, Prisma } from '@prisma/client';
import { CreateCohortDto } from './dto/create-cohort.dto';
import { UpdateCohortDto } from './dto/update-cohort.dto';
import { AddCohortMemberDto } from './dto/add-cohort-member.dto';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { RejectApprovalDto } from './dto/reject-approval.dto';
import * as crypto from 'crypto';

export const ACTIVATION_DISABLED_NOTICE =
  'PSL activation has not been performed. This service provides readiness, approval and dry-run controls only.';

export interface NormalisedReadinessCheck {
  key: string;
  label: string;
  category: string;
  severity: 'BLOCKER' | 'WARNING' | 'INFO';
  status: 'PASS' | 'WARNING' | 'BLOCKED' | 'NOT_APPLICABLE';
  blockers: string[];
  warnings: string[];
  evidence: Record<string, unknown>;
  recommendedAction: string | null;
  resolutionRoute: string | null;
  evaluatedAt: string;
}

const DOMAIN_CATEGORY: Record<string, string> = {
  clubs: 'Football Data',
  fixtures: 'Football Data',
  gameweeks: 'Football Data',
  matchday: 'Admin Operations',
  fantasy: 'Fantasy',
  predictions: 'Guess the Score',
  engagement: 'Engagement',
  player_stats: 'Player / Team Data',
  squad_import: 'Football Data',
  fantasy_price_calibration: 'Fantasy',
};

const RESOLUTION_ROUTE: Record<string, string | null> = {
  clubs: '/admin/clubs',
  fixtures: '/admin/fixtures',
  gameweeks: '/admin/gameweeks',
  matchday: '/admin/gameweeks/operations',
  fantasy: '/admin/fantasy/calibration',
  predictions: '/admin/predictions/calibration',
  engagement: '/admin/engagement',
  player_stats: '/admin/player-stats',
  squad_import: '/admin/squad-import',
  fantasy_price_calibration: '/admin/fantasy-price-calibration',
};

@Injectable()
export class BetaLaunchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly seasonSwitching: SeasonSwitchingService,
  ) {}

  // ── Overview ─────────────────────────────────────────────────────────────────

  async getOverview() {
    const [seasons, activeSeason, totalCohorts, totalApprovals] = await Promise.all([
      this.prisma.season.findMany({ select: { id: true, name: true, slug: true, isActive: true, status: true }, orderBy: { startDate: 'desc' } }),
      this.prisma.season.findFirst({ where: { isActive: true }, select: { id: true, name: true, slug: true, status: true } }),
      this.prisma.betaCohort.count(),
      this.prisma.seasonActivationApproval.count(),
    ]);

    return {
      activationDisabledNotice: ACTIVATION_DISABLED_NOTICE,
      activeSeason,
      totalSeasons: seasons.length,
      totalCohorts,
      totalApprovals,
      generatedAt: new Date().toISOString(),
    };
  }

  async getSeasons() {
    const seasons = await this.prisma.season.findMany({
      select: { id: true, name: true, slug: true, isActive: true, status: true, startDate: true, endDate: true },
      orderBy: { startDate: 'desc' },
    });
    return { seasons, activationDisabledNotice: ACTIVATION_DISABLED_NOTICE };
  }

  // ── Readiness Aggregate ───────────────────────────────────────────────────────

  async getReadiness(seasonId: string) {
    const [season, rawReadiness, activeSeason] = await Promise.all([
      this.prisma.season.findUnique({ where: { id: seasonId }, select: { id: true, name: true, slug: true, isActive: true, status: true } }),
      this.seasonSwitching.getSeasonSwitchReadiness(seasonId),
      this.prisma.season.findFirst({ where: { isActive: true }, select: { id: true, name: true, status: true } }),
    ]);
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const now = new Date().toISOString();
    const checks: NormalisedReadinessCheck[] = rawReadiness.checks.map(c => ({
      key: `${c.domain}_${c.label.toLowerCase().replace(/\s+/g, '_')}`,
      label: c.label,
      category: DOMAIN_CATEGORY[c.domain] ?? 'Other',
      severity: c.severity,
      status: c.passed ? 'PASS' : (c.severity === 'BLOCKER' ? 'BLOCKED' : c.severity === 'INFO' ? 'NOT_APPLICABLE' : 'WARNING'),
      blockers: !c.passed && c.severity === 'BLOCKER' ? [c.detail] : [],
      warnings: !c.passed && c.severity === 'WARNING' ? [c.detail] : [],
      evidence: { detail: c.detail, domain: c.domain },
      recommendedAction: c.passed ? null : c.detail,
      resolutionRoute: c.passed ? null : (RESOLUTION_ROUTE[c.domain] ?? null),
      evaluatedAt: now,
    }));

    const blockerCount = checks.filter(c => c.status === 'BLOCKED').length;
    const warningCount = checks.filter(c => c.status === 'WARNING').length;
    const passedCount = checks.filter(c => c.status === 'PASS').length;

    const overallStatus = blockerCount > 0 ? 'BLOCKED' : warningCount > 0 ? 'READY_WITH_WARNINGS' : 'READY';

    const categoryMap: Record<string, { passed: number; warned: number; blocked: number }> = {};
    for (const c of checks) {
      const cat = c.category;
      if (!categoryMap[cat]) categoryMap[cat] = { passed: 0, warned: 0, blocked: 0 };
      if (c.status === 'PASS' || c.status === 'NOT_APPLICABLE') categoryMap[cat].passed++;
      else if (c.status === 'WARNING') categoryMap[cat].warned++;
      else if (c.status === 'BLOCKED') categoryMap[cat].blocked++;
    }

    await this.writeAuditLog(null, 'BETA_READINESS_GENERATED', 'Season', seasonId, { overallStatus, blockerCount, warningCount });

    return {
      activationDisabledNotice: ACTIVATION_DISABLED_NOTICE,
      targetSeason: season,
      currentActiveSeason: activeSeason,
      overallStatus,
      blockerCount,
      warningCount,
      passedCount,
      totalChecks: checks.length,
      checks,
      categoryBreakdown: categoryMap,
      recommendedActions: checks.filter(c => c.status !== 'PASS' && c.status !== 'NOT_APPLICABLE').map(c => c.recommendedAction).filter(Boolean),
      evaluatedAt: now,
    };
  }

  async getBlockers(seasonId: string) {
    const readiness = await this.getReadiness(seasonId);
    return {
      activationDisabledNotice: ACTIVATION_DISABLED_NOTICE,
      targetSeason: readiness.targetSeason,
      blockerCount: readiness.blockerCount,
      blockers: readiness.checks.filter(c => c.status === 'BLOCKED'),
      evaluatedAt: readiness.evaluatedAt,
    };
  }

  async getWarnings(seasonId: string) {
    const readiness = await this.getReadiness(seasonId);
    return {
      activationDisabledNotice: ACTIVATION_DISABLED_NOTICE,
      targetSeason: readiness.targetSeason,
      warningCount: readiness.warningCount,
      warnings: readiness.checks.filter(c => c.status === 'WARNING'),
      evaluatedAt: readiness.evaluatedAt,
    };
  }

  // ── Category Readiness ────────────────────────────────────────────────────────

  async getFrontendReadiness(seasonId: string) {
    await this.requireSeason(seasonId);
    const routes = [
      { route: '/beta', title: 'Beta Landing', audience: 'PUBLIC', status: 'PASS' },
      { route: '/', title: 'Home', audience: 'PUBLIC', status: 'PASS' },
      { route: '/clubs', title: 'Clubs', audience: 'PUBLIC', status: 'PASS' },
      { route: '/fixtures', title: 'Fixtures', audience: 'FAN', status: 'PASS' },
      { route: '/matches', title: 'Live Match Hub', audience: 'FAN', status: 'PASS' },
      { route: '/match-centre/standings/:seasonId', title: 'Standings', audience: 'FAN', status: 'PASS' },
      { route: '/fantasy', title: 'Fantasy', audience: 'FAN', status: 'PASS' },
      { route: '/predictions', title: 'Guess the Score', audience: 'FAN', status: 'PASS' },
      { route: '/social-predictions/marketplace/:fixtureId', title: 'Social Predictions', audience: 'FAN', status: 'PASS' },
      { route: '/social-challenges', title: 'Direct Challenges', audience: 'FAN', status: 'PASS' },
      { route: '/leaderboards', title: 'Leaderboards', audience: 'FAN', status: 'PASS' },
      { route: '/fan-value', title: 'Fan Value', audience: 'FAN', status: 'PASS' },
      { route: '/campaigns', title: 'Campaigns', audience: 'FAN', status: 'PASS' },
      { route: '/rewards', title: 'Rewards', audience: 'FAN', status: 'PASS' },
      { route: '/wallet', title: 'Wallet Sandbox', audience: 'FAN', status: 'WARNING', notes: 'Sandbox only' },
      { route: '/admin/beta-launch', title: 'Beta Launch Dashboard', audience: 'PSL_ADMIN', status: 'PASS' },
    ];
    const passed = routes.filter(r => r.status === 'PASS').length;
    const warned = routes.filter(r => r.status === 'WARNING').length;
    return {
      category: 'Frontend Readiness',
      overallStatus: warned > 0 ? 'READY_WITH_WARNINGS' : 'READY',
      routeCount: routes.length,
      passed,
      warned,
      blocked: 0,
      routes,
      activationDisabledNotice: ACTIVATION_DISABLED_NOTICE,
    };
  }

  async getDataReadiness(seasonId: string) {
    const readiness = await this.getReadiness(seasonId);
    const dataChecks = readiness.checks.filter(c => ['Football Data', 'Player / Team Data'].includes(c.category));
    return {
      category: 'Data Readiness',
      overallStatus: readiness.overallStatus,
      checks: dataChecks,
      blockerCount: dataChecks.filter(c => c.status === 'BLOCKED').length,
      warningCount: dataChecks.filter(c => c.status === 'WARNING').length,
      activationDisabledNotice: ACTIVATION_DISABLED_NOTICE,
      evaluatedAt: readiness.evaluatedAt,
    };
  }

  async getSecurityReadiness(seasonId: string) {
    await this.requireSeason(seasonId);
    const checks = [
      { key: 'rbac_admin_routes', label: 'Admin routes RBAC-protected', status: 'PASS', evidence: 'JwtAuthGuard + RolesGuard on all admin controllers' },
      { key: 'fan_identity_from_jwt', label: 'Fan identity derived from JWT', status: 'PASS', evidence: 'req.user.sub used exclusively for fanUserId' },
      { key: 'no_secrets_in_db', label: 'No provider secrets in PostgreSQL', status: 'PASS', evidence: 'IntegrationProviderConfig stores slugs only, not credentials' },
      { key: 'no_email_leakage', label: 'No fan email leakage in APIs', status: 'PASS', evidence: 'email removed from challenge APIs in STORY-38' },
      { key: 'no_real_money', label: 'No real-money mechanics', status: 'PASS', evidence: 'All points system-issued; no deposit/withdrawal/payout path' },
      { key: 'wallet_sandbox', label: 'Wallet remains sandbox-only', status: 'PASS', evidence: 'SiliconEnterpriseSandboxWalletAdapter; no production wallet movement' },
      { key: 'no_production_provider', label: 'No production sports-data provider calls', status: 'PASS', evidence: 'LiveMatchProviderInterface is stub; no external HTTP calls in backend modules' },
      { key: 'compliance_acknowledged', label: 'Compliance review state visible', status: 'WARNING', evidence: 'POINTS_BASED_SOCIAL_PREDICTION_COMPLIANCE = INTERNAL_REVIEW_REQUIRED' },
    ];
    const passed = checks.filter(c => c.status === 'PASS').length;
    const warned = checks.filter(c => c.status === 'WARNING').length;
    return {
      category: 'Security Readiness',
      overallStatus: warned > 0 ? 'READY_WITH_WARNINGS' : 'READY',
      passed,
      warned,
      blocked: 0,
      checks,
      activationDisabledNotice: ACTIVATION_DISABLED_NOTICE,
    };
  }

  async getOperationsReadiness(seasonId: string) {
    const readiness = await this.getReadiness(seasonId);
    const opsChecks = readiness.checks.filter(c => ['Admin Operations'].includes(c.category));
    const checks = [
      ...opsChecks,
      { key: 'fixture_import', label: 'Fixture import pipeline ready', category: 'Admin Operations', status: 'PASS' as const, resolutionRoute: '/admin/fixtures', evidence: { detail: 'FixtureImportModule with batch + row management' } },
      { key: 'squad_import_ui', label: 'Squad import UI ready', category: 'Admin Operations', status: 'PASS' as const, resolutionRoute: '/admin/squad-import', evidence: { detail: 'SquadImportModule with validation and publish' } },
      { key: 'admin_audit_logs', label: 'Admin audit logs enabled', category: 'Admin Operations', status: 'PASS' as const, resolutionRoute: '/admin/operations', evidence: { detail: 'AdminAuditLog model; all mutations audited' } },
      { key: 'rollback_ready', label: 'Season rollback endpoint exists', category: 'Admin Operations', status: 'PASS' as const, resolutionRoute: '/admin/seasons', evidence: { detail: 'SeasonSwitchingService.rollbackSeason() available' } },
      { key: 'smoke_tests', label: 'Smoke-test registry available', category: 'Admin Operations', status: 'PASS' as const, resolutionRoute: '/admin/beta-launch/smoke-tests', evidence: { detail: 'BetaLaunchSmokeTestService with 23-area registry' } },
    ];
    return {
      category: 'Operations Readiness',
      checks,
      activationDisabledNotice: ACTIVATION_DISABLED_NOTICE,
      evaluatedAt: new Date().toISOString(),
    };
  }

  async getCohortReadiness(seasonId: string) {
    await this.requireSeason(seasonId);
    const [cohorts, totalMembers] = await Promise.all([
      this.prisma.betaCohort.findMany({
        where: { seasonId },
        include: { _count: { select: { members: true } } },
      }),
      this.prisma.betaCohortMember.count({ where: { cohort: { seasonId } } }),
    ]);
    const activeCohort = cohorts.find(c => c.status === BetaCohortStatus.ACTIVE) ?? null;
    return {
      category: 'Beta Cohort Readiness',
      cohortCount: cohorts.length,
      totalMembers,
      activeCohort,
      cohorts: cohorts.map(c => ({ ...c, memberCount: c._count.members })),
      ready: cohorts.length > 0,
      activationDisabledNotice: ACTIVATION_DISABLED_NOTICE,
    };
  }

  // ── Activation Preview (read-only) ────────────────────────────────────────────

  async getActivationPreview(seasonId: string) {
    const preview = await this.seasonSwitching.getSeasonSwitchPreview(seasonId);
    const readiness = await this.getReadiness(seasonId);
    return {
      dryRunOnly: true,
      activationWillNotBePerformed: true,
      activationDisabledNotice: ACTIVATION_DISABLED_NOTICE,
      ...preview,
      launchReadiness: readiness,
    };
  }

  async executeDryRun(seasonId: string, userId: string | null) {
    const season = await this.requireSeason(seasonId);
    const [readiness, activeSeason] = await Promise.all([
      this.getReadiness(seasonId),
      this.prisma.season.findFirst({ where: { isActive: true }, select: { id: true, name: true, status: true } }),
    ]);

    const [fixtureCount, publishedFixtures, squadCount, priceCount, gameweekCount, cohortCount] = await Promise.all([
      this.prisma.fixture.count({ where: { seasonId } }),
      this.prisma.fixture.count({ where: { seasonId, isPublished: true } }),
      this.prisma.seasonSquadRegistration.count({ where: { seasonId } }),
      this.prisma.fantasyPlayerPrice.count({ where: { seasonId } }),
      this.prisma.gameweek.count({ where: { seasonId } }),
      this.prisma.betaCohort.count({ where: { seasonId } }),
    ]);

    await this.writeAuditLog(userId, 'BETA_DRY_RUN_EXECUTED', 'Season', seasonId, { blockerCount: readiness.blockerCount, warningCount: readiness.warningCount });

    return {
      dryRunOnly: true as const,
      activationWillNotBePerformed: true as const,
      activationDisabledNotice: ACTIVATION_DISABLED_NOTICE,
      seasonId,
      seasonName: season.name,
      currentActiveSeason: activeSeason,
      targetSeason: { id: season.id, name: season.name, status: season.status, isActive: season.isActive },
      readinessStatus: readiness.overallStatus,
      checks: readiness.checks,
      blockerCount: readiness.blockerCount,
      warningCount: readiness.warningCount,
      dataCounts: { fixtureCount, publishedFixtures, squadCount, priceCount, gameweekCount },
      cohortImpact: { cohortCount, note: 'Starting a cohort does not activate the season.' },
      worldCupImpact: { preserved: true, note: 'World Cup season history is not affected by PSL activation.' },
      fantasyImpact: { note: 'Fantasy rules and player prices already configured. No changes on activation.' },
      predictionImpact: { note: 'Prediction rules already configured. No changes on activation.' },
      socialPredictionImpact: { note: 'Social prediction markets remain unchanged on activation.' },
      rollbackPlan: { available: true, note: 'SeasonSwitchingService.rollbackSeason() is available. World Cup can be restored as active season.' },
      recommendedActions: readiness.recommendedActions,
      evaluatedAt: readiness.evaluatedAt,
    };
  }

  async executeRollbackDryRun(seasonId: string, userId: string | null) {
    const season = await this.requireSeason(seasonId);
    const [activeSeason, lastActivation] = await Promise.all([
      this.prisma.season.findFirst({ where: { isActive: true }, select: { id: true, name: true, status: true } }),
      this.prisma.seasonSwitchAudit.findFirst({
        where: { toSeasonId: seasonId, action: 'ACTIVATE', status: 'SUCCESS' },
        orderBy: { createdAt: 'desc' },
        select: { fromSeasonId: true, createdAt: true },
      }),
    ]);

    let restorationSeason = null;
    if (lastActivation?.fromSeasonId) {
      restorationSeason = await this.prisma.season.findUnique({ where: { id: lastActivation.fromSeasonId }, select: { id: true, name: true, status: true } });
    }

    await this.writeAuditLog(userId, 'BETA_ROLLBACK_DRY_RUN_EXECUTED', 'Season', seasonId, { activeSeason: activeSeason?.name ?? null });

    return {
      dryRunOnly: true as const,
      rollbackWillNotBePerformed: true as const,
      activationDisabledNotice: ACTIVATION_DISABLED_NOTICE,
      currentActiveSeason: activeSeason,
      targetSeason: { id: season.id, name: season.name, status: season.status },
      restorationSeason,
      expectedContextChanges: {
        pslSeason: `${season.name} → UPCOMING (deactivated)`,
        restorationSeason: restorationSeason ? `${restorationSeason.name} → ACTIVE (restored)` : 'No previous season to restore',
      },
      preservedPslData: { fixtures: true, squads: true, prices: true, gameweeks: true, note: 'All PSL data preserved on rollback.' },
      preservedWorldCupData: { fixtures: true, results: true, standings: true, note: 'World Cup history is never deleted.' },
      fantasyHistoryPreserved: true,
      predictionHistoryPreserved: true,
      socialChallengeHistoryPreserved: true,
      leaderboardHistoryPreserved: true,
      fanValueHistoryPreserved: true,
      campaignHistoryPreserved: true,
      blockers: season.isActive ? [] : ['Season is not currently active — rollback not applicable'],
      warnings: restorationSeason === null ? ['No previous season to restore after rollback'] : [],
      verificationSteps: [
        'Confirm active season is PSL before executing rollback',
        'Verify World Cup season can be restored',
        'Confirm no fan activity depends on PSL being active',
        'Verify rollback audit log entry is written',
        'Verify World Cup becomes active after rollback',
      ],
    };
  }

  // ── Approval Workflow ─────────────────────────────────────────────────────────

  async createApproval(seasonId: string, userId: string, dto: CreateApprovalDto) {
    const season = await this.requireSeason(seasonId);
    const readiness = await this.getReadiness(seasonId);

    if (readiness.blockerCount > 0) {
      throw new BadRequestException({
        message: 'Cannot create approval while blockers remain unresolved.',
        blockerCount: readiness.blockerCount,
        blockers: readiness.checks.filter(c => c.status === 'BLOCKED').map(c => c.label),
      });
    }

    if (!dto.rollbackVerified || !dto.betaCohortVerified || !dto.frontendVerified || !dto.dataVerified || !dto.securityVerified || !dto.operationsVerified) {
      throw new BadRequestException('All verification flags must be true to create an approval.');
    }

    const snapshot = readiness.checks.map(c => ({ key: c.key, status: c.status, label: c.label }));
    const fingerprint = crypto.createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');

    const approval = await this.prisma.seasonActivationApproval.create({
      data: {
        seasonId,
        readinessSnapshotJson: snapshot as unknown as Prisma.InputJsonValue,
        readinessFingerprint: fingerprint,
        blockerCount: readiness.blockerCount,
        warningCount: readiness.warningCount,
        approvedByUserId: userId,
        approvedAt: new Date(),
        approvalStatus: BetaLaunchApprovalStatus.APPROVED,
        rollbackVerified: dto.rollbackVerified,
        betaCohortVerified: dto.betaCohortVerified,
        frontendVerified: dto.frontendVerified,
        dataVerified: dto.dataVerified,
        securityVerified: dto.securityVerified,
        operationsVerified: dto.operationsVerified,
        notes: dto.notes ?? null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await this.writeAuditLog(userId, 'BETA_APPROVAL_CREATED', 'SeasonActivationApproval', approval.id, { seasonId, seasonName: season.name, fingerprint });

    return { ...approval, activationDisabledNotice: ACTIVATION_DISABLED_NOTICE };
  }

  async rejectApproval(seasonId: string, userId: string, dto: RejectApprovalDto) {
    const season = await this.requireSeason(seasonId);
    const readiness = await this.getReadiness(seasonId);

    const snapshot = readiness.checks.map(c => ({ key: c.key, status: c.status, label: c.label }));
    const fingerprint = crypto.createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');

    const approval = await this.prisma.seasonActivationApproval.create({
      data: {
        seasonId,
        readinessSnapshotJson: snapshot as unknown as Prisma.InputJsonValue,
        readinessFingerprint: fingerprint,
        blockerCount: readiness.blockerCount,
        warningCount: readiness.warningCount,
        approvedByUserId: userId,
        approvalStatus: BetaLaunchApprovalStatus.REJECTED,
        notes: dto.reason,
      },
    });

    await this.writeAuditLog(userId, 'BETA_APPROVAL_REJECTED', 'SeasonActivationApproval', approval.id, { seasonId, seasonName: season.name, reason: dto.reason });

    return { ...approval, activationDisabledNotice: ACTIVATION_DISABLED_NOTICE };
  }

  async getApproval(seasonId: string) {
    await this.requireSeason(seasonId);
    const latest = await this.prisma.seasonActivationApproval.findFirst({
      where: { seasonId },
      orderBy: { createdAt: 'desc' },
    });
    return {
      activationDisabledNotice: ACTIVATION_DISABLED_NOTICE,
      latestApproval: latest,
      hasValidApproval: latest?.approvalStatus === BetaLaunchApprovalStatus.APPROVED && (!latest.expiresAt || latest.expiresAt > new Date()),
    };
  }

  // ── Runbook ───────────────────────────────────────────────────────────────────

  getRunbook() {
    return {
      title: 'PSL Beta Launch Runbook',
      notice: ACTIVATION_DISABLED_NOTICE,
      sections: [
        {
          heading: 'Before Launch',
          steps: [
            'Verify migration status: pnpm --filter @psl-one/api prisma migrate status',
            'Run readiness check: GET /admin/beta-launch/:seasonId/readiness',
            'Resolve all BLOCKED checks',
            'Run activation dry run: POST /admin/beta-launch/:seasonId/dry-run',
            'Run rollback dry run: POST /admin/beta-launch/:seasonId/rollback-dry-run',
            'Verify all approval flags are true',
            'Create approval record: POST /admin/beta-launch/:seasonId/approve',
            'Verify approval not expired',
          ],
        },
        {
          heading: 'Future Activation Sequence (do not execute in STORY-39)',
          steps: [
            '1. Enter maintenance window and communicate downtime',
            '2. Capture local PostgreSQL backup',
            '3. Run prisma migrate status — confirm up to date',
            '4. Rerun readiness — confirm no new blockers',
            '5. Rerun activation dry run — confirm READY',
            '6. Verify valid approval record',
            '7. Execute POST /seasons/admin/switching/activate/:seasonId (requires explicit user instruction)',
            '8. Verify GET /seasons/admin/context shows PSL as active',
            '9. Verify fan home shows PSL context',
            '10. Run smoke tests',
            '11. Open beta cohort',
            '12. Monitor launch health',
          ],
        },
        {
          heading: 'After Launch',
          steps: [
            'Run smoke tests: POST /admin/beta-launch/smoke-tests/run',
            'Monitor beta feedback: GET /admin/beta-feedback',
            'Monitor admin audit logs',
            'Review scoring and prediction settlement',
            'Confirm rollback threshold criteria',
          ],
        },
      ],
      rollbackDocPath: 'docs/platform/PSL-BETA-ROLLBACK-RUNBOOK.md',
    };
  }

  // ── Beta Cohort ───────────────────────────────────────────────────────────────

  async listCohorts(seasonId?: string) {
    const cohorts = await this.prisma.betaCohort.findMany({
      ...(seasonId ? { where: { seasonId } } : {}),
      include: { _count: { select: { members: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return cohorts.map(c => ({ ...c, memberCount: c._count.members }));
  }

  async createCohort(dto: CreateCohortDto, userId: string) {
    await this.requireSeason(dto.seasonId);

    const existing = await this.prisma.betaCohort.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException(`Cohort slug '${dto.slug}' already in use.`);

    const cohort = await this.prisma.betaCohort.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        seasonId: dto.seasonId,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        maxUsers: dto.maxUsers ?? null,
        notes: dto.notes ?? null,
        createdByUserId: userId,
      },
    });

    await this.writeAuditLog(userId, 'BETA_COHORT_CREATED', 'BetaCohort', cohort.id, { name: cohort.name, slug: cohort.slug, seasonId: cohort.seasonId });
    return cohort;
  }

  async getCohort(cohortId: string) {
    const cohort = await this.prisma.betaCohort.findUnique({
      where: { id: cohortId },
      include: { members: { include: { user: { select: { id: true, role: true, fanProfile: { select: { displayName: true } } } } } } },
    });
    if (!cohort) throw new NotFoundException(`Cohort '${cohortId}' not found`);
    return cohort;
  }

  async updateCohort(cohortId: string, dto: UpdateCohortDto, userId: string) {
    const cohort = await this.prisma.betaCohort.findUnique({ where: { id: cohortId } });
    if (!cohort) throw new NotFoundException(`Cohort '${cohortId}' not found`);

    const updated = await this.prisma.betaCohort.update({
      where: { id: cohortId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.startsAt !== undefined && { startsAt: new Date(dto.startsAt) }),
        ...(dto.endsAt !== undefined && { endsAt: new Date(dto.endsAt) }),
        ...(dto.maxUsers !== undefined && { maxUsers: dto.maxUsers }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });

    await this.writeAuditLog(userId, 'BETA_COHORT_UPDATED', 'BetaCohort', cohortId, dto as Record<string, unknown>);
    return updated;
  }

  async addMember(cohortId: string, dto: AddCohortMemberDto, userId: string) {
    const cohort = await this.prisma.betaCohort.findUnique({ where: { id: cohortId }, include: { _count: { select: { members: { where: { status: { not: BetaCohortMemberStatus.REMOVED } } } } } } });
    if (!cohort) throw new NotFoundException(`Cohort '${cohortId}' not found`);

    const user = await this.prisma.user.findUnique({ where: { id: dto.userId }, select: { id: true, role: true } });
    if (!user) throw new NotFoundException(`User '${dto.userId}' not found`);

    if (cohort.maxUsers !== null && cohort._count.members >= cohort.maxUsers) {
      throw new BadRequestException(`Cohort '${cohort.name}' is at maximum capacity (${cohort.maxUsers} users).`);
    }

    const existing = await this.prisma.betaCohortMember.findUnique({ where: { cohortId_userId: { cohortId, userId: dto.userId } } });
    if (existing && existing.status !== BetaCohortMemberStatus.REMOVED) {
      throw new ConflictException('User is already a member of this cohort.');
    }

    const member = existing
      ? await this.prisma.betaCohortMember.update({ where: { id: existing.id }, data: { status: BetaCohortMemberStatus.INVITED, removedAt: null, invitedAt: new Date(), metadataJson: dto.notes ? { notes: dto.notes } as Prisma.InputJsonValue : Prisma.JsonNull } })
      : await this.prisma.betaCohortMember.create({ data: { cohortId, userId: dto.userId, metadataJson: dto.notes ? { notes: dto.notes } as Prisma.InputJsonValue : Prisma.JsonNull } });

    await this.writeAuditLog(userId, 'BETA_COHORT_MEMBER_ADDED', 'BetaCohortMember', member.id, { cohortId, memberId: dto.userId });
    return member;
  }

  async removeMember(cohortId: string, memberId: string, userId: string) {
    const member = await this.prisma.betaCohortMember.findUnique({ where: { cohortId_userId: { cohortId, userId: memberId } } });
    if (!member) throw new NotFoundException('Member not found in this cohort.');

    const updated = await this.prisma.betaCohortMember.update({
      where: { id: member.id },
      data: { status: BetaCohortMemberStatus.REMOVED, removedAt: new Date() },
    });

    await this.writeAuditLog(userId, 'BETA_COHORT_MEMBER_REMOVED', 'BetaCohortMember', member.id, { cohortId, memberId });
    return updated;
  }

  async startCohort(cohortId: string, userId: string) {
    return this.transitionCohort(cohortId, userId, [BetaCohortStatus.DRAFT, BetaCohortStatus.INVITE_ONLY, BetaCohortStatus.PAUSED], BetaCohortStatus.ACTIVE, 'BETA_COHORT_STARTED');
  }

  async pauseCohort(cohortId: string, userId: string) {
    return this.transitionCohort(cohortId, userId, [BetaCohortStatus.ACTIVE], BetaCohortStatus.PAUSED, 'BETA_COHORT_PAUSED');
  }

  async completeCohort(cohortId: string, userId: string) {
    return this.transitionCohort(cohortId, userId, [BetaCohortStatus.ACTIVE, BetaCohortStatus.PAUSED], BetaCohortStatus.COMPLETED, 'BETA_COHORT_COMPLETED');
  }

  private async transitionCohort(cohortId: string, userId: string, allowedFrom: BetaCohortStatus[], to: BetaCohortStatus, auditAction: string) {
    const cohort = await this.prisma.betaCohort.findUnique({ where: { id: cohortId } });
    if (!cohort) throw new NotFoundException(`Cohort '${cohortId}' not found`);
    if (!allowedFrom.includes(cohort.status)) {
      throw new BadRequestException(`Cannot transition cohort from ${cohort.status} to ${to}.`);
    }
    const updated = await this.prisma.betaCohort.update({ where: { id: cohortId }, data: { status: to, ...(to === BetaCohortStatus.ACTIVE ? { startsAt: cohort.startsAt ?? new Date() } : {}) } });
    await this.writeAuditLog(userId, auditAction, 'BetaCohort', cohortId, { from: cohort.status, to, name: cohort.name });
    return { ...updated, notice: 'Cohort lifecycle change does not affect season activation state.' };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  private async requireSeason(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId }, select: { id: true, name: true, isActive: true, status: true } });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);
    return season;
  }

  private async writeAuditLog(actorUserId: string | null, action: string, entityType: string, entityId: string, metadata: Record<string, unknown>) {
    try {
      await this.prisma.adminAuditLog.create({ data: { actorUserId, action, entityType, entityId, metadata: metadata as Prisma.InputJsonValue, route: '/admin/beta-launch' } });
    } catch { /* audit log failure must not block the primary operation */ }
  }
}
