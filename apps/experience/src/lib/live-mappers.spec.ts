import { describe, it, expect } from 'vitest';
import { playerSummaryToExpPlayer, topPerformerToExpPlayer, playerProfileToExpPlayer, footballPlayerToExpPlayer, defaultFantasyPriceForPosition } from './live-mappers';

describe('live-mappers fantasy price fallback', () => {
  it('defaults playerSummary fantasy price by position when no override is provided', () => {
    const player = playerSummaryToExpPlayer({
      id: 'p1',
      name: 'Test Player',
      position: 'MIDFIELDER',
      number: 10,
      team: { id: 't1', name: 'Test FC', shortName: 'TST', externalId: 'tst' },
    });

    expect(player.fantasyPrice).toBe(defaultFantasyPriceForPosition('MID'));
  });

  it('respects an explicit fantasyPrice override', () => {
    const player = playerSummaryToExpPlayer({
      id: 'p2',
      name: 'Test Player 2',
      position: 'FORWARD',
      number: 9,
      team: { id: 't2', name: 'Another FC', shortName: 'ANR', externalId: 'anr' },
    }, {
      fantasyPrice: 9.5,
    });

    expect(player.fantasyPrice).toBe(9.5);
  });

  it('defaults topPerformer and playerProfile fantasy prices', () => {
    const topPerformer = topPerformerToExpPlayer({
      playerId: 'tp1',
      playerName: 'Top Performer',
      teamName: 'Test FC',
      position: 'Defender',
      goals: 1,
      assists: 2,
      minutesPlayed: 90,
      fantasyPoints: 12,
      cleanSheets: 1,
    });

    const profile = playerProfileToExpPlayer({
      id: 'pp1',
      name: 'Profile Player',
      position: 'GOALKEEPER',
      nationality: 'ZA',
      dateOfBirth: null,
      number: 1,
      team: {
        id: 't3',
        name: 'Profile FC',
        slug: 'profile-fc',
        shortName: 'PRF',
        logoUrl: null,
        country: 'South Africa',
      },
      playerStats: [],
    });

    expect(topPerformer.fantasyPrice).toBe(defaultFantasyPriceForPosition('DEF'));
    expect(profile.fantasyPrice).toBe(defaultFantasyPriceForPosition('GK'));
  });

  it('maps football player records into exp player cards', () => {
    const player = footballPlayerToExpPlayer({
      id: 'fp1',
      teamId: 'team-1',
      name: 'Football Player',
      position: 'MIDFIELDER',
      nationality: 'South African',
      dateOfBirth: null,
      number: 7,
      team: { id: 'team-1', name: 'Test United', slug: 'test-united' },
    });

    expect(player.position).toBe('MID');
    expect(player.club.name).toBe('Test United');
    expect(player.nationality).toBe('South African');
    expect(player.fantasyPrice).toBe(defaultFantasyPriceForPosition('MID'));
  });
});
