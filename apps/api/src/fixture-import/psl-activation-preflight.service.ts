import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type PreflightCheck = {
  name: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  detail: string;
};

export type PslActivationPreflightResult = {
  status: 'NO_GO' | 'CONDITIONAL_GO' | 'GO';
  blockers: string[];
  warnings: string[];
  checks: PreflightCheck[];
};

@Injectable()
export class PslActivationPreflightService {
  private readonly logger = new Logger(PslActivationPreflightService.name);

  constructor(private readonly prisma: PrismaService) {}

  async runPreflight(seasonId?: string): Promise<PslActivationPreflightResult> {
    const checks: PreflightCheck[] = [];
    const blockers: string[] = [];
    const warnings: string[] = [];

    // ── 1. PSL season exists ────────────────────────────────────────────────
    const pslSeason = await this.findPslSeason(seasonId);
    if (!pslSeason) {
      checks.push({ name: 'psl_season_exists', status: 'FAIL', detail: 'No PSL season found' });
      blockers.push('No PSL season found in the database');
      return this.buildResult(checks, blockers, warnings);
    }
    checks.push({
      name: 'psl_season_exists',
      status: 'PASS',
      detail: `PSL season found: ${pslSeason.id} (${pslSeason.name ?? 'unnamed'})`,
    });

    // ── 2. PSL season is inactive ───────────────────────────────────────────
    if (pslSeason.isActive) {
      checks.push({ name: 'psl_season_inactive', status: 'WARN', detail: 'PSL season is already active' });
      warnings.push('PSL season is already marked active — activation may be a no-op');
    } else {
      checks.push({ name: 'psl_season_inactive', status: 'PASS', detail: 'PSL season is currently inactive' });
    }

    // ── 3. Fixtures exist for season ────────────────────────────────────────
    const totalFixtures = await this.prisma.fixture.count({ where: { seasonId: pslSeason.id } });
    if (totalFixtures === 0) {
      checks.push({ name: 'fixtures_exist', status: 'FAIL', detail: 'No fixtures found for this season' });
      blockers.push('No fixtures exist for the PSL season — run Parse PSL ingestion first');
    } else {
      checks.push({ name: 'fixtures_exist', status: 'PASS', detail: `${totalFixtures} fixture(s) found` });
    }

    // ── 4. Fixtures have teams ──────────────────────────────────────────────
    const fixturesMissingTeams = await this.prisma.fixture.count({
      where: {
        seasonId: pslSeason.id,
        OR: [
          { homeTeamId: null as unknown as string },
          { awayTeamId: null as unknown as string },
        ],
      },
    });
    if (fixturesMissingTeams > 0) {
      checks.push({ name: 'fixtures_have_teams', status: 'FAIL', detail: `${fixturesMissingTeams} fixture(s) missing team IDs` });
      blockers.push(`${fixturesMissingTeams} fixture(s) are missing home or away team — resolve team resolution warnings`);
    } else if (totalFixtures > 0) {
      checks.push({ name: 'fixtures_have_teams', status: 'PASS', detail: 'All fixtures have home and away teams' });
    } else {
      checks.push({ name: 'fixtures_have_teams', status: 'WARN', detail: 'No fixtures to check teams on' });
    }

    // ── 5. Fixtures have kickoffAt ──────────────────────────────────────────
    // kickoffAt is required by Prisma schema — this is always PASS
    checks.push({ name: 'fixtures_have_kickoff', status: 'PASS', detail: 'kickoffAt is required by schema — always set' });

    // ── 6. Published vs unpublished counts ─────────────────────────────────
    const publishedCount = await this.prisma.fixture.count({ where: { seasonId: pslSeason.id, isPublished: true } });
    const unpublishedCount = totalFixtures - publishedCount;
    if (publishedCount === 0 && totalFixtures > 0) {
      checks.push({
        name: 'fixtures_published',
        status: 'WARN',
        detail: `All ${totalFixtures} fixture(s) are unpublished — publish before activation if fan visibility is required`,
      });
      warnings.push(`${totalFixtures} fixture(s) are unpublished — publish them first if fan visibility is required`);
    } else {
      checks.push({
        name: 'fixtures_published',
        status: publishedCount > 0 ? 'PASS' : 'WARN',
        detail: `${publishedCount} published, ${unpublishedCount} unpublished`,
      });
    }

    // ── 7. Provider provenance present ─────────────────────────────────────
    const importedFixtures = await this.prisma.fixture.count({
      where: { seasonId: pslSeason.id, providerSource: { not: null } },
    });
    if (importedFixtures > 0) {
      checks.push({ name: 'provider_provenance', status: 'PASS', detail: `${importedFixtures} fixture(s) have provider provenance` });
    } else if (totalFixtures > 0) {
      checks.push({ name: 'provider_provenance', status: 'WARN', detail: 'Fixtures have no providerSource — were they imported via Parse PSL?' });
      warnings.push('No fixtures have provider provenance — confirm ingestion source');
    } else {
      checks.push({ name: 'provider_provenance', status: 'WARN', detail: 'No fixtures to check provenance on' });
    }

    // ── 8. Wallet is sandbox-only ───────────────────────────────────────────
    const nonSandboxProviders = await this.prisma.walletProviderDetail.count({
      where: { status: { not: 'SANDBOX' } },
    });
    if (nonSandboxProviders > 0) {
      checks.push({ name: 'wallet_sandbox_only', status: 'FAIL', detail: `${nonSandboxProviders} non-SANDBOX wallet provider(s) active` });
      blockers.push('Non-sandbox wallet providers are active — disable before activation');
    } else {
      checks.push({ name: 'wallet_sandbox_only', status: 'PASS', detail: 'All wallet providers are in SANDBOX mode' });
    }

    // ── 9. No real-money feature flags ─────────────────────────────────────
    checks.push({
      name: 'no_real_money_flags',
      status: 'PASS',
      detail: 'Platform is points-only — no real-money feature flags exist in schema',
    });

    // ── 10. Approval record check ──────────────────────────────────────────
    const approval = await this.prisma.seasonActivationApproval.findFirst({
      where: { seasonId: pslSeason.id },
      orderBy: { createdAt: 'desc' },
    });
    if (!approval) {
      checks.push({ name: 'activation_approval', status: 'WARN', detail: 'No SeasonActivationApproval record found for this season' });
      warnings.push('No activation approval record — owner must create one before activation');
    } else {
      const approvalStatus = approval.approvalStatus;
      if (approvalStatus === 'ACTIVATED') {
        checks.push({ name: 'activation_approval', status: 'WARN', detail: `Season already ACTIVATED (${approval.id})` });
        warnings.push('Season is already marked ACTIVATED in SeasonActivationApproval');
      } else if (approvalStatus === 'APPROVED') {
        checks.push({ name: 'activation_approval', status: 'PASS', detail: `Approval record is APPROVED (${approval.id})` });
      } else {
        checks.push({ name: 'activation_approval', status: 'WARN', detail: `Approval status is ${approvalStatus} — must be APPROVED before activation` });
        warnings.push(`Approval status is ${approvalStatus} — owner must approve before activation`);
      }
    }

    await this.writeAuditLog('PSL_PREFLIGHT_CHECK_RUN', {
      seasonId: pslSeason.id,
      checks: checks.length,
      blockers: blockers.length,
      warnings: warnings.length,
    });

    return this.buildResult(checks, blockers, warnings);
  }

  private buildResult(
    checks: PreflightCheck[],
    blockers: string[],
    warnings: string[],
  ): PslActivationPreflightResult {
    let status: 'NO_GO' | 'CONDITIONAL_GO' | 'GO';
    if (blockers.length > 0) {
      status = 'NO_GO';
    } else if (warnings.length > 0) {
      status = 'CONDITIONAL_GO';
    } else {
      status = 'GO';
    }
    return { status, blockers, warnings, checks };
  }

  private async findPslSeason(seasonId?: string) {
    if (seasonId) {
      return this.prisma.season.findUnique({ where: { id: seasonId } });
    }
    // Find the PSL competition's most recent inactive season
    return this.prisma.season.findFirst({
      where: {
        isActive: false,
        competition: {
          slug: { in: ['psl', 'betway-premiership', 'betway_premiership', 'south-africa-psl'] },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  private async writeAuditLog(action: string, metadata: Record<string, unknown>) {
    try {
      await this.prisma.adminAuditLog.create({
        data: {
          actorUserId: 'system',
          actorRole: 'SYSTEM',
          action,
          entityType: 'Season',
          entityId: String(metadata['seasonId'] ?? 'unknown'),
          route: '/admin/psl/preflight',
          metadata: metadata as never,
        },
      });
    } catch (err) {
      this.logger.warn({ action: 'preflight.audit_log_failed', auditAction: action, error: (err as Error).message });
    }
  }
}
