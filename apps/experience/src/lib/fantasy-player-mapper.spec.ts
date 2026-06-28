import { describe, it, expect } from 'vitest';
import { toExpFantasyPlayer, toExpFantasySquad } from './fantasy-player-mapper';

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
