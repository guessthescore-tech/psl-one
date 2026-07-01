import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FantasyChipStatus, FantasyChipType } from '@prisma/client';
import { FantasyChipService } from './fantasy-chip.service';
import type { PrismaService } from '../prisma/prisma.service';

const FUTURE = new Date(Date.now() + 60 * 60 * 1000);  // +1 h from now
const PAST   = new Date(Date.now() - 60 * 60 * 1000);  // -1 h from now

function makeChip(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'chip-1',
    type: FantasyChipType.BENCH_BOOST,
    status: FantasyChipStatus.AVAILABLE,
    fantasyTeamId: 'ft-1',
    gameweekId: null,
    activatedAt: null,
    usedAt: null,
    cancelledAt: null,
    fantasyTeam: { id: 'ft-1', userId: 'u-1' },
    gameweek: null,
    ...overrides,
  };
}

function makeGameweek(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'gw-1',
    seasonId: 's-1',
    round: 5,
    transferDeadlineAt: FUTURE,
    ...overrides,
  };
}

function makePrisma() {
  return {
    fantasyChip: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      createMany: vi.fn(),
    },
    fantasyTeam: {
      findUnique: vi.fn(),
    },
    gameweek: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    season: {
      findFirst: vi.fn(),
    },
    fantasyRulesConfig: {
      findUnique: vi.fn(),
    },
    fantasyTeamPlayer: {
      findMany: vi.fn(),
    },
    fantasyFreeHitSnapshot: {
      upsert: vi.fn(),
    },
  } as unknown as PrismaService;
}

describe('FantasyChipService.activateChip', () => {
  let service: FantasyChipService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    prisma = makePrisma();
    service = new FantasyChipService(prisma);
  });

  it('activates an AVAILABLE chip before deadline', async () => {
    (prisma.fantasyChip.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(makeChip());
    (prisma.gameweek.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(makeGameweek());
    (prisma.fantasyRulesConfig.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.fantasyChip.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null); // no active chip
    (prisma.fantasyChip.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...makeChip(),
      status: FantasyChipStatus.ACTIVE,
      gameweekId: 'gw-1',
      activatedAt: PAST,
    });

    const result = await service.activateChip('u-1', 'chip-1', 'gw-1');
    expect(result.status).toBe(FantasyChipStatus.ACTIVE);
    expect(result.gameweekId).toBe('gw-1');
  });

  it('throws NotFoundException when chip does not exist', async () => {
    (prisma.fantasyChip.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(service.activateChip('u-1', 'no-chip', 'gw-1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws BadRequestException when chip belongs to a different user', async () => {
    (prisma.fantasyChip.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeChip({ fantasyTeam: { id: 'ft-1', userId: 'other-user' } }),
    );
    await expect(service.activateChip('u-1', 'chip-1', 'gw-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException when chip is already USED (single-use enforcement)', async () => {
    (prisma.fantasyChip.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeChip({ status: FantasyChipStatus.USED }),
    );
    await expect(service.activateChip('u-1', 'chip-1', 'gw-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException when chip is already ACTIVE', async () => {
    (prisma.fantasyChip.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeChip({ status: FantasyChipStatus.ACTIVE }),
    );
    await expect(service.activateChip('u-1', 'chip-1', 'gw-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException when transfer deadline has passed', async () => {
    (prisma.fantasyChip.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(makeChip());
    (prisma.gameweek.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeGameweek({ transferDeadlineAt: PAST }),
    );
    (prisma.fantasyRulesConfig.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(service.activateChip('u-1', 'chip-1', 'gw-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException when another chip is already ACTIVE this gameweek (one chip per gameweek)', async () => {
    (prisma.fantasyChip.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(makeChip());
    (prisma.gameweek.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(makeGameweek());
    (prisma.fantasyRulesConfig.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    // There is already an ACTIVE chip for this team
    (prisma.fantasyChip.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeChip({ id: 'chip-wc', type: FantasyChipType.WILDCARD, status: FantasyChipStatus.ACTIVE }),
    );
    await expect(service.activateChip('u-1', 'chip-1', 'gw-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException when chips are globally disabled', async () => {
    (prisma.fantasyChip.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(makeChip());
    (prisma.gameweek.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(makeGameweek());
    (prisma.fantasyRulesConfig.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      chipsEnabled: false,
      wildcardEnabled: true, freeHitEnabled: true, benchBoostEnabled: true, tripleCaptainEnabled: true,
    });
    await expect(service.activateChip('u-1', 'chip-1', 'gw-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException when this specific chip type is disabled', async () => {
    (prisma.fantasyChip.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(makeChip());
    (prisma.gameweek.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(makeGameweek());
    (prisma.fantasyRulesConfig.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      chipsEnabled: true,
      wildcardEnabled: true, freeHitEnabled: true,
      benchBoostEnabled: false,  // BENCH_BOOST disabled
      tripleCaptainEnabled: true,
    });
    await expect(service.activateChip('u-1', 'chip-1', 'gw-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws NotFoundException when gameweek not found', async () => {
    (prisma.fantasyChip.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(makeChip());
    (prisma.gameweek.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(service.activateChip('u-1', 'chip-1', 'missing-gw')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('wildcard: throws when already used in same half of season', async () => {
    (prisma.fantasyChip.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeChip({ type: FantasyChipType.WILDCARD }),
    );
    (prisma.gameweek.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(makeGameweek({ round: 5 }));
    (prisma.fantasyRulesConfig.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.fantasyChip.findFirst as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(null) // no other active chip
      .mockResolvedValueOnce({     // wildcard already used in first half (round 3 ≤ 19)
        type: FantasyChipType.WILDCARD,
        status: FantasyChipStatus.USED,
        gameweek: { round: 3 },
      });
    await expect(service.activateChip('u-1', 'chip-1', 'gw-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('free-hit: throws when used in consecutive gameweeks', async () => {
    (prisma.fantasyChip.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeChip({ type: FantasyChipType.FREE_HIT }),
    );
    (prisma.gameweek.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(makeGameweek({ round: 5 }));
    (prisma.fantasyRulesConfig.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      chipsEnabled: true, wildcardEnabled: true, freeHitEnabled: true,
      benchBoostEnabled: true, tripleCaptainEnabled: true,
      freeHitConsecutiveGameweekBlocked: true,
      halfwayGameweek: 19,
    });
    (prisma.fantasyChip.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null); // no active chip
    // previous gameweek exists
    (prisma.gameweek.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'gw-prev', round: 4 });
    // free-hit was used last gameweek
    (prisma.fantasyChip.findFirst as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(null)             // no active chip
      .mockResolvedValueOnce({ id: 'old-fh' }); // free-hit used in prev gameweek
    await expect(service.activateChip('u-1', 'chip-1', 'gw-1')).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('FantasyChipService.cancelChip', () => {
  let service: FantasyChipService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    prisma = makePrisma();
    service = new FantasyChipService(prisma);
  });

  it('cancels an ACTIVE chip before deadline, resetting to AVAILABLE', async () => {
    (prisma.fantasyChip.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeChip({
        status: FantasyChipStatus.ACTIVE,
        gameweekId: 'gw-1',
        gameweek: makeGameweek({ transferDeadlineAt: FUTURE }),
      }),
    );
    (prisma.fantasyChip.update as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeChip({ status: FantasyChipStatus.AVAILABLE, gameweekId: null }),
    );

    const result = await service.cancelChip('u-1', 'chip-1');
    expect(result.status).toBe(FantasyChipStatus.AVAILABLE);
    expect(result.gameweekId).toBeNull();
  });

  it('throws BadRequestException when cancelling a non-ACTIVE chip', async () => {
    (prisma.fantasyChip.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeChip({ status: FantasyChipStatus.AVAILABLE }),
    );
    await expect(service.cancelChip('u-1', 'chip-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException when cancelling after deadline has passed', async () => {
    (prisma.fantasyChip.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeChip({
        status: FantasyChipStatus.ACTIVE,
        gameweekId: 'gw-1',
        gameweek: makeGameweek({ transferDeadlineAt: PAST }),
      }),
    );
    await expect(service.cancelChip('u-1', 'chip-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException when chip belongs to a different user', async () => {
    (prisma.fantasyChip.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeChip({
        status: FantasyChipStatus.ACTIVE,
        gameweek: makeGameweek({ transferDeadlineAt: FUTURE }),
        fantasyTeam: { id: 'ft-1', userId: 'other-user' },
      }),
    );
    await expect(service.cancelChip('u-1', 'chip-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws NotFoundException when chip does not exist', async () => {
    (prisma.fantasyChip.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(service.cancelChip('u-1', 'no-chip')).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('FantasyChipService.getChipsForUser', () => {
  let service: FantasyChipService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    prisma = makePrisma();
    service = new FantasyChipService(prisma);
  });

  it('returns all chips for the user with id field present', async () => {
    (prisma.season.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 's-1' });
    (prisma.fantasyTeam.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'ft-1' });
    (prisma.fantasyChip.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'chip-uuid-1', type: FantasyChipType.BENCH_BOOST, status: FantasyChipStatus.AVAILABLE, gameweekId: null, activatedAt: null, usedAt: null },
      { id: 'chip-uuid-2', type: FantasyChipType.WILDCARD, status: FantasyChipStatus.USED, gameweekId: 'gw-1', activatedAt: PAST, usedAt: PAST },
    ]);

    const chips = await service.getChipsForUser('u-1');
    expect(chips).toHaveLength(2);
    // Each chip must expose its UUID so the frontend can call activate/cancel
    expect(chips[0]!.id).toBe('chip-uuid-1');
    expect(chips[1]!.id).toBe('chip-uuid-2');
    expect(chips[1]!.status).toBe(FantasyChipStatus.USED);
  });

  it('throws NotFoundException when user has no fantasy team', async () => {
    (prisma.season.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 's-1' });
    (prisma.fantasyTeam.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(service.getChipsForUser('u-1')).rejects.toBeInstanceOf(NotFoundException);
  });
});
