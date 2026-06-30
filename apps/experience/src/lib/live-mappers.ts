import type { ExpClub, ExpPlayer } from './data';
import type { PlayerSummary } from './fantasy-api';
import type { TopPerformer } from './players-api';
import type { Player as FootballPlayer, Team as FootballTeam } from './football-api';
import type { PlayerProfile } from './players-api';

const DEFAULT_FANTASY_PRICE_BY_POSITION: Record<ExpPlayer['position'], number> = {
  GK: 4.5,
  DEF: 5.0,
  MID: 7.0,
  FWD: 8.0,
};

const PALETTE = [
  ['#002395', '#4060cc'],
  ['#1a1a1a', '#3a3a3a'],
  ['#74ACDF', '#4080bb'],
  ['#009C3B', '#00cc50'],
  ['#C60B1E', '#e02030'],
  ['#C8102E', '#e02040'],
  ['#006600', '#008800'],
  ['#C1272D', '#e02030'],
] as const;

function hashIndex(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (Math.imul(31, hash) + seed.charCodeAt(i)) | 0;
  return Math.abs(hash) % PALETTE.length;
}

function clubColors(seed: string): [string, string] {
  return (PALETTE[hashIndex(seed)] ?? ['#1E3A5F', '#C8A84B']) as [string, string];
}

function positionToExp(position: FootballPlayer['position'] | PlayerSummary['position'] | TopPerformer['position']): ExpPlayer['position'] {
  if (position === 'GOALKEEPER' || position === 'Goalkeeper') return 'GK';
  if (position === 'DEFENDER' || position === 'Defender') return 'DEF';
  if (position === 'MIDFIELDER' || position === 'Midfielder') return 'MID';
  return 'FWD';
}

function clubShortName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

export function defaultFantasyPriceForPosition(position: ExpPlayer['position']): number {
  return DEFAULT_FANTASY_PRICE_BY_POSITION[position];
}

export function liveTeamToExpClub(
  team: Pick<FootballTeam, 'id' | 'name'> & Partial<Pick<FootballTeam, 'shortName'>>,
): ExpClub {
  const [primaryColor, secondaryColor] = clubColors(team.id ?? team.name);
  const shortName = team.shortName?.trim() || team.name;
  return {
    id: team.id,
    name: team.name,
    shortName,
    abbr: clubShortName(shortName || team.name),
    city: '',
    country: '',
    primaryColor,
    secondaryColor,
    textColor: '#FFFFFF',
    founded: 0,
  };
}

export function playerSummaryToExpPlayer(
  player: PlayerSummary,
  overrides: Partial<Pick<ExpPlayer, 'goalsThisTournament' | 'assistsThisTournament' | 'cleanSheets' | 'fantasyPoints' | 'fantasyPrice'>> = {},
): ExpPlayer {
  const position = positionToExp(player.position);
  return {
    id: player.id,
    name: player.name,
    position,
    club: liveTeamToExpClub(player.team),
    nationality: '',
    imageKey: `wc-player-${player.id}`,
    goalsThisTournament: overrides.goalsThisTournament ?? 0,
    assistsThisTournament: overrides.assistsThisTournament ?? 0,
    cleanSheets: overrides.cleanSheets ?? 0,
    fantasyPoints: overrides.fantasyPoints ?? 0,
    fantasyPrice: overrides.fantasyPrice ?? defaultFantasyPriceForPosition(position),
  };
}

export function footballPlayerToExpPlayer(
  player: FootballPlayer,
  overrides: Partial<Pick<ExpPlayer, 'goalsThisTournament' | 'assistsThisTournament' | 'cleanSheets' | 'fantasyPoints' | 'fantasyPrice'>> = {},
): ExpPlayer {
  const position = positionToExp(player.position);
  const team = player.team ?? {
    id: player.teamId,
    name: 'Unknown Team',
    slug: player.teamId,
  };

  return {
    id: player.id,
    name: player.name,
    position,
    club: liveTeamToExpClub(team),
    nationality: player.nationality,
    imageKey: `wc-player-${player.id}`,
    goalsThisTournament: overrides.goalsThisTournament ?? 0,
    assistsThisTournament: overrides.assistsThisTournament ?? 0,
    cleanSheets: overrides.cleanSheets ?? 0,
    fantasyPoints: overrides.fantasyPoints ?? 0,
    fantasyPrice: overrides.fantasyPrice ?? defaultFantasyPriceForPosition(position),
  };
}

export function topPerformerToExpPlayer(
  player: TopPerformer,
): ExpPlayer {
  const position = positionToExp(player.position);
  return {
    id: player.playerId,
    name: player.playerName,
    position,
    club: {
      id: player.teamName,
      name: player.teamName,
      shortName: player.teamName,
      abbr: player.teamName.slice(0, 3).toUpperCase(),
      city: '',
      country: '',
      primaryColor: '#1E3A5F',
      secondaryColor: '#C8A84B',
      textColor: '#FFFFFF',
      founded: 0,
    },
    nationality: '',
    imageKey: `wc-player-${player.playerId}`,
    goalsThisTournament: player.goals,
    assistsThisTournament: player.assists,
    cleanSheets: player.cleanSheets,
    fantasyPoints: player.fantasyPoints,
    fantasyPrice: defaultFantasyPriceForPosition(position),
  };
}

export function playerProfileToExpPlayer(profile: PlayerProfile, fantasyPrice?: number): ExpPlayer {
  const position = positionToExp(profile.position);
  return {
    id: profile.id,
    name: profile.name,
    position,
    club: liveTeamToExpClub({
      id: profile.team.id,
      name: profile.team.name,
      shortName: profile.team.shortName,
    }),
    nationality: profile.nationality,
    imageKey: `wc-player-${profile.id}`,
    goalsThisTournament: profile.playerStats?.[0]?.goals ?? 0,
    assistsThisTournament: profile.playerStats?.[0]?.assists ?? 0,
    cleanSheets: 0,
    fantasyPoints: 0,
    fantasyPrice: fantasyPrice ?? defaultFantasyPriceForPosition(position),
  };
}
