import type { ExpClub, ExpPlayer } from './data';
import type { PlayerSummary } from './fantasy-api';
import type { TopPerformer } from './players-api';
import type { Team as FootballTeam } from './football-api';
import type { PlayerProfile } from './players-api';

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

export function liveTeamToExpClub(team: Pick<FootballTeam, 'id' | 'name' | 'shortName'>): ExpClub {
  const [primaryColor, secondaryColor] = clubColors(team.id ?? team.name);
  return {
    id: team.id,
    name: team.name,
    shortName: team.shortName || team.name,
    abbr: team.shortName?.slice(0, 3).toUpperCase() ?? team.name.slice(0, 3).toUpperCase(),
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
  overrides: Partial<Pick<ExpPlayer, 'goalsThisTournament' | 'assistsThisTournament' | 'fantasyPoints' | 'fantasyPrice'>> = {},
): ExpPlayer {
  return {
    id: player.id,
    name: player.name,
    position: player.position === 'GOALKEEPER' ? 'GK' : player.position === 'DEFENDER' ? 'DEF' : player.position === 'MIDFIELDER' ? 'MID' : 'FWD',
    club: liveTeamToExpClub(player.team),
    nationality: '',
    imageKey: `wc-player-${player.id}`,
    goalsThisTournament: overrides.goalsThisTournament ?? 0,
    assistsThisTournament: overrides.assistsThisTournament ?? 0,
    fantasyPoints: overrides.fantasyPoints ?? 0,
    fantasyPrice: overrides.fantasyPrice ?? 0,
  };
}

export function topPerformerToExpPlayer(
  player: TopPerformer,
): ExpPlayer {
  return {
    id: player.playerId,
    name: player.playerName,
    position: player.position === 'Goalkeeper' ? 'GK' : player.position === 'Defender' ? 'DEF' : player.position === 'Midfielder' ? 'MID' : 'FWD',
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
    fantasyPoints: player.fantasyPoints,
    fantasyPrice: 0,
  };
}

export function playerProfileToExpPlayer(profile: PlayerProfile): ExpPlayer {
  return {
    id: profile.id,
    name: profile.name,
    position: profile.position === 'GOALKEEPER' ? 'GK' : profile.position === 'DEFENDER' ? 'DEF' : profile.position === 'MIDFIELDER' ? 'MID' : 'FWD',
    club: liveTeamToExpClub({
      id: profile.team.id,
      name: profile.team.name,
      shortName: profile.team.shortName,
    }),
    nationality: profile.nationality,
    imageKey: `wc-player-${profile.id}`,
    goalsThisTournament: profile.playerStats?.[0]?.goals ?? 0,
    assistsThisTournament: profile.playerStats?.[0]?.assists ?? 0,
    fantasyPoints: 0,
    fantasyPrice: 0,
  };
}
