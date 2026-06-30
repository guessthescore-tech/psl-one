import type { ExpClub, ExpFantasyPlayer } from './data';
import type { FantasyTeam, PlayerSummary } from './fantasy-api';

export interface PlayerStatsSummary {
  goals: number;
  assists: number;
  fantasyPoints: number;
}

const POSITION_ABBR: Record<PlayerSummary['position'], ExpFantasyPlayer['position']> = {
  GOALKEEPER: 'GK',
  DEFENDER: 'DEF',
  MIDFIELDER: 'MID',
  FORWARD: 'FWD',
};

const DEFAULT_PRICE: Record<ExpFantasyPlayer['position'], number> = {
  GK: 4.5,
  DEF: 5.0,
  MID: 7.0,
  FWD: 8.0,
};

function clubFromPlayer(player: PlayerSummary): ExpClub {
  const abbr = player.team.shortName || player.team.name.slice(0, 3).toUpperCase();
  return {
    id: player.team.id,
    name: player.team.name,
    shortName: player.team.shortName,
    abbr,
    city: '',
    country: '',
    primaryColor: '#1E3A5F',
    secondaryColor: '#C8A84B',
    textColor: '#FFFFFF',
    founded: 0,
  };
}

export function toExpFantasyPlayer(
  player: PlayerSummary,
  overrides: Partial<Pick<ExpFantasyPlayer, 'squadRole' | 'benchSlot' | 'isCaptain' | 'isViceCaptain' | 'fantasyPrice'>> = {},
): ExpFantasyPlayer {
  const position = POSITION_ABBR[player.position];
  return {
    id: player.id,
    name: player.name,
    position,
    club: clubFromPlayer(player),
    nationality: '',
    imageKey: `wc-player-${player.id}`,
    goalsThisTournament: 0,
    assistsThisTournament: 0,
    fantasyPoints: 0,
    fantasyPrice: overrides.fantasyPrice ?? DEFAULT_PRICE[position],
    squadRole: overrides.squadRole ?? 'STARTER',
    benchSlot: overrides.benchSlot ?? null,
    isCaptain: overrides.isCaptain ?? false,
    isViceCaptain: overrides.isViceCaptain ?? false,
    gameweekPoints: 0,
    isUnavailable: false,
  };
}

export function toFantasySlot(player: ExpFantasyPlayer, index: number) {
  return {
    playerId: player.id,
    squadRole: player.squadRole,
    benchSlot: player.squadRole === 'SUBSTITUTE' ? player.benchSlot ?? index + 1 : undefined,
    isCaptain: player.isCaptain,
    isViceCaptain: player.isViceCaptain,
  };
}

export function toExpFantasySquad(
  team: FantasyTeam,
  priceMap?: Map<string, number>,
  statsMap?: Map<string, PlayerStatsSummary>,
) {
  const players = team.players.map((tp, index) => {
    const position = POSITION_ABBR[tp.player.position];
    const stats = statsMap?.get(tp.player.id);
    return {
      id: tp.player.id,
      name: tp.player.name,
      position,
      club: {
        id: tp.player.team.id,
        name: tp.player.team.name,
        shortName: tp.player.team.shortName,
        abbr: tp.player.team.shortName || tp.player.team.name.slice(0, 3).toUpperCase(),
        city: '',
        country: '',
        primaryColor: '#1E3A5F',
        secondaryColor: '#C8A84B',
        textColor: '#FFFFFF',
        founded: 0,
      },
      nationality: '',
      imageKey: `wc-player-${tp.player.id}`,
      goalsThisTournament: stats?.goals ?? 0,
      assistsThisTournament: stats?.assists ?? 0,
      fantasyPoints: stats?.fantasyPoints ?? 0,
      fantasyPrice: priceMap?.get(tp.player.id) ?? DEFAULT_PRICE[position],
      squadRole: tp.squadRole,
      benchSlot: tp.benchSlot ?? null,
      isCaptain: tp.isCaptain,
      isViceCaptain: tp.isViceCaptain,
      gameweekPoints: 0,
      isUnavailable: false,
    } satisfies ExpFantasyPlayer;
  });

  return {
    teamName: team.name,
    totalPoints: team.totalPoints,
    gameweekPoints: 0,
    transfersRemaining: 0,
    players,
  };
}
