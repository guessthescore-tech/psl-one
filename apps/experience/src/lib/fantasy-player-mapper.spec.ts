import { describe, it, expect } from 'vitest';
import { toExpFantasyPlayer, toExpFantasySquad } from './fantasy-player-mapper';
import type { PlayerStatsSummary } from './fantasy-player-mapper';

describe('fantasy-player-mapper pricing', () => {
  const playerSummary = {
    id: 'p1',
    name: 'Test Player',
    position: 'MIDFIELDER' as const,
    number: 10,
    team: { id: 't1', name: 'Test FC', shortName: 'TST', externalId: 'tst' },
  };

  it('uses the provided fantasy price override when present', () => {
    const player = toExpFantasyPlayer(playerSummary, { fantasyPrice: 8.2 });
    expect(player.fantasyPrice).toBe(8.2);
  });

  it('uses a position-based fallback when no price override exists', () => {
    const player = toExpFantasyPlayer(playerSummary);
    expect(player.fantasyPrice).toBeGreaterThan(0);
  });

  it('hydrates squad players with priceMap values and falls back when missing', () => {
    const squad = {
      id: 'team-1',
      name: 'My Team',
      formation: '4-3-3',
      totalPoints: 12,
      players: [
        {
          id: 'slot-1',
          playerId: 'p1',
          squadRole: 'STARTER' as const,
          position: 'MIDFIELDER' as const,
          benchSlot: null,
          isCaptain: true,
          isViceCaptain: false,
          player: {
            id: 'p1',
            name: 'Test Player',
            position: 'MIDFIELDER' as const,
            number: 10,
            team: { id: 't1', name: 'Test FC', shortName: 'TST', externalId: 'tst' },
          },
        },
      ],
    };

    const hydrated = toExpFantasySquad(squad, new Map([['p1', 9.1]]));
    expect(hydrated.players[0]!.fantasyPrice).toBe(9.1);

    const fallback = toExpFantasySquad(squad);
    expect(fallback.players[0]!.fantasyPrice).toBeGreaterThan(0);
  });
});

describe('fantasy-player-mapper transfersRemaining', () => {
  const makeSquad = () => ({
    id: 'team-1',
    name: 'My Team',
    formation: '4-3-3',
    totalPoints: 10,
    players: [],
  });

  it('sets transfersRemaining from the freeTransfers param', () => {
    expect(toExpFantasySquad(makeSquad(), undefined, undefined, 2).transfersRemaining).toBe(2);
  });

  it('defaults transfersRemaining to 0 when freeTransfers is not provided', () => {
    // Regression guard: hardcoded 0 must never silently survive when real data is available.
    expect(toExpFantasySquad(makeSquad()).transfersRemaining).toBe(0);
  });

  it('passes 0 explicitly without falling back', () => {
    expect(toExpFantasySquad(makeSquad(), undefined, undefined, 0).transfersRemaining).toBe(0);
  });
});

describe('fantasy-player-mapper stats hydration', () => {
  const makeSquad = () => ({
    id: 'team-1',
    name: 'My Team',
    formation: '4-3-3',
    totalPoints: 42,
    players: [
      {
        id: 'slot-1',
        playerId: 'p1',
        squadRole: 'STARTER' as const,
        position: 'FORWARD' as const,
        benchSlot: null,
        isCaptain: false,
        isViceCaptain: false,
        player: {
          id: 'p1',
          name: 'Star Forward',
          position: 'FORWARD' as const,
          number: 9,
          team: { id: 't1', name: 'Cape Town City', shortName: 'CTC', externalId: 'ctc' },
        },
      },
    ],
  });

  it('populates goals, assists, and fantasyPoints from the statsMap', () => {
    const statsMap = new Map<string, PlayerStatsSummary>([
      ['p1', { goals: 5, assists: 3, fantasyPoints: 72 }],
    ]);
    const result = toExpFantasySquad(makeSquad(), undefined, statsMap);
    const player = result.players[0]!;
    expect(player.goalsThisTournament).toBe(5);
    expect(player.assistsThisTournament).toBe(3);
    expect(player.fantasyPoints).toBe(72);
  });

  it('falls back to zero when the player is absent from the statsMap', () => {
    const result = toExpFantasySquad(makeSquad(), undefined, new Map());
    const player = result.players[0]!;
    expect(player.goalsThisTournament).toBe(0);
    expect(player.assistsThisTournament).toBe(0);
    expect(player.fantasyPoints).toBe(0);
  });

  it('falls back to zero when no statsMap is provided (backward-compat)', () => {
    const result = toExpFantasySquad(makeSquad());
    const player = result.players[0]!;
    expect(player.goalsThisTournament).toBe(0);
    expect(player.assistsThisTournament).toBe(0);
    expect(player.fantasyPoints).toBe(0);
  });
});
