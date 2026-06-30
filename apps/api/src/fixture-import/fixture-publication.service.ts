import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type FixturePublishRequest = {
  fixtureIds: string[];
  publish: boolean;
  confirmPublication: boolean;
};

export type FixturePublishResult = {
  requested: number;
  changed: number;
  skipped: number;
  published: number;
  unpublished: number;
  errors: string[];
  warnings: string[];
};

export type ImportedFixtureRow = {
  id: string;
  seasonId: string;
  homeTeamName: string;
  awayTeamName: string;
  kickoffAt: Date;
  status: string;
  isPublished: boolean;
  providerSource: string | null;
  providerFixtureId: string | null;
  externalId: string | null;
  sourceUrl: string | null;
  importedAt: Date | null;
  lastSyncedAt: Date | null;
};

@Injectable()
export class FixturePublicationService {
  private readonly logger = new Logger(FixturePublicationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listImportedFixtures(opts: {
    providerSource?: string;
    isPublished?: boolean;
    seasonId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ fixtures: ImportedFixtureRow[]; total: number }> {
    const where: Record<string, unknown> = {};
    if (opts.providerSource !== undefined) where['providerSource'] = opts.providerSource;
    if (opts.isPublished !== undefined) where['isPublished'] = opts.isPublished;
    if (opts.seasonId !== undefined) where['seasonId'] = opts.seasonId;

    const [fixtures, total] = await Promise.all([
      this.prisma.fixture.findMany({
        where,
        select: {
          id: true,
          seasonId: true,
          kickoffAt: true,
          status: true,
          isPublished: true,
          providerSource: true,
          providerFixtureId: true,
          externalId: true,
          sourceUrl: true,
          importedAt: true,
          lastSyncedAt: true,
          homeTeam: { select: { name: true } },
          awayTeam: { select: { name: true } },
        },
        orderBy: { kickoffAt: 'asc' },
        take: opts.limit ?? 100,
        skip: opts.offset ?? 0,
      }),
      this.prisma.fixture.count({ where }),
    ]);

    return {
      fixtures: fixtures.map(f => ({
        id: f.id,
        seasonId: f.seasonId,
        homeTeamName: f.homeTeam.name,
        awayTeamName: f.awayTeam.name,
        kickoffAt: f.kickoffAt,
        status: f.status,
        isPublished: f.isPublished,
        providerSource: f.providerSource,
        providerFixtureId: f.providerFixtureId,
        externalId: f.externalId,
        sourceUrl: f.sourceUrl,
        importedAt: f.importedAt,
        lastSyncedAt: f.lastSyncedAt,
      })),
      total,
    };
  }

  async publishFixtures(dto: FixturePublishRequest): Promise<FixturePublishResult> {
    if (!dto.confirmPublication) {
      throw new BadRequestException(
        'confirmPublication=true is required to publish or unpublish fixtures',
      );
    }
    if (!dto.fixtureIds || dto.fixtureIds.length === 0) {
      throw new BadRequestException('fixtureIds must not be empty');
    }

    const existing = await this.prisma.fixture.findMany({
      where: { id: { in: dto.fixtureIds } },
      select: {
        id: true,
        isPublished: true,
        homeTeamId: true,
        awayTeamId: true,
        kickoffAt: true,
        status: true,
      },
    });

    const errors: string[] = [];
    const warnings: string[] = [];
    const foundIds = new Set(existing.map(f => f.id));
    const skippedUnknown = dto.fixtureIds.filter(id => !foundIds.has(id));
    if (skippedUnknown.length > 0) {
      warnings.push(`${skippedUnknown.length} unknown fixture ID(s) skipped`);
    }

    const toChange: string[] = [];
    let skipped = skippedUnknown.length;

    for (const f of existing) {
      if (f.isPublished === dto.publish) {
        skipped++;
        continue; // idempotent — already in target state
      }
      if (dto.publish && (!f.homeTeamId || !f.awayTeamId)) {
        errors.push(`Fixture ${f.id} cannot be published: missing home or away team`);
        skipped++;
        continue;
      }
      if (dto.publish && !f.kickoffAt) {
        errors.push(`Fixture ${f.id} cannot be published: missing kickoffAt`);
        skipped++;
        continue;
      }
      toChange.push(f.id);
    }

    if (toChange.length === 0) {
      await this.writeAuditLog('FIXTURE_PUBLICATION_ATTEMPTED', {
        requested: dto.fixtureIds.length,
        changed: 0,
        skipped,
        publish: dto.publish,
        errors,
        warnings,
      });
      return {
        requested: dto.fixtureIds.length,
        changed: 0,
        skipped,
        published: 0,
        unpublished: 0,
        errors,
        warnings,
      };
    }

    await this.writeAuditLog('FIXTURE_PUBLICATION_ATTEMPTED', {
      requested: dto.fixtureIds.length,
      toChange: toChange.length,
      publish: dto.publish,
    });

    await this.prisma.fixture.updateMany({
      where: { id: { in: toChange } },
      data: { isPublished: dto.publish },
    });

    await this.writeAuditLog('FIXTURE_PUBLICATION_COMPLETED', {
      changed: toChange.length,
      publish: dto.publish,
      fixtureIds: toChange,
      errors,
      warnings,
    });

    return {
      requested: dto.fixtureIds.length,
      changed: toChange.length,
      skipped,
      published: dto.publish ? toChange.length : 0,
      unpublished: dto.publish ? 0 : toChange.length,
      errors,
      warnings,
    };
  }

  private async writeAuditLog(action: string, metadata: Record<string, unknown>) {
    try {
      await this.prisma.adminAuditLog.create({
        data: {
          actorUserId: 'system',
          actorRole: 'SYSTEM',
          action,
          entityType: 'Fixture',
          entityId: 'bulk',
          route: '/admin/fixtures/publish',
          metadata: metadata as never,
        },
      });
    } catch (err) {
      this.logger.warn({ action: 'publication.audit_log_failed', auditAction: action, error: (err as Error).message });
    }
  }
}
