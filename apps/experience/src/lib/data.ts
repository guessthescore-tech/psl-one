export type DataMode = 'DESIGN_REVIEW_DATA' | 'LIVE_BETA_DATA';

export function getDataMode(): DataMode {
  const mode = process.env['NEXT_PUBLIC_DATA_MODE'];
  return mode === 'LIVE_BETA_DATA' ? 'LIVE_BETA_DATA' : 'DESIGN_REVIEW_DATA';
}

/* ── Shared types ──────────────────────────────────────────────────── */

export interface ExpClub {
  id: string;
  name: string;
  shortName: string;
  abbr: string;
  city: string;
  country: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  founded: number;
}

export interface ExpFixture {
  id: string;
  homeClub: ExpClub;
  awayClub: ExpClub;
  homeScore: number | null;
  awayScore: number | null;
  status: 'SCHEDULED' | 'LIVE' | 'HALF_TIME' | 'FINISHED';
  minute: number | null;
  kickoffAt: string;
  venue: string;
  competition: string;
  group?: string;
}

export interface ExpPlayer {
  id: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  club: ExpClub;
  nationality: string;
  imageKey: string;
  goalsThisTournament: number;
  assistsThisTournament: number;
  fantasyPoints: number;
  fantasyPrice: number;
}

export interface ExpStanding {
  position: number;
  club: ExpClub;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

export interface ExpStory {
  id: string;
  title: string;
  category: string;
  summary: string;
  imageKey: string;
  readMinutes: number;
  publishedAt: string;
  featured: boolean;
}

export interface ExpVideo {
  id: string;
  title: string;
  thumbnailKey: string;
  durationSeconds: number;
  category: string;
}

export interface ExpGameweek {
  number: number;
  label: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  deadlineAt: string;
  highestPoints: number;
  averagePoints: number;
  totalPredictions: number;
}

export interface ExpFanValue {
  total: number;
  rank: number;
  level: string;
  levelProgress: number;
  breakdown: {
    predictions: number;
    fantasy: number;
    social: number;
    attendance: number;
  };
}

export interface ExpFantasyTeam {
  totalPoints: number;
  gameweekPoints: number;
  transfersRemaining: number;
  captain: ExpPlayer;
}

/* ── Image helper ──────────────────────────────────────────────────── */

export function expImg(seed: string, w: number, h: number): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

/* ── DESIGN_REVIEW_DATA: FIFA World Cup 2026 presentation dataset ──── */
/* Clearly labelled mock data. Read-only. Do not treat as live scores. */

const FRANCE: ExpClub = {
  id: 'fra', name: 'France', shortName: 'France', abbr: 'FRA',
  city: 'Paris', country: 'France',
  primaryColor: '#002395', secondaryColor: '#ED2939', textColor: '#ffffff', founded: 1919,
};
const GERMANY: ExpClub = {
  id: 'ger', name: 'Germany', shortName: 'Germany', abbr: 'GER',
  city: 'Berlin', country: 'Germany',
  primaryColor: '#1a1a1a', secondaryColor: '#DD0000', textColor: '#ffffff', founded: 1900,
};
const ARGENTINA: ExpClub = {
  id: 'arg', name: 'Argentina', shortName: 'Argentina', abbr: 'ARG',
  city: 'Buenos Aires', country: 'Argentina',
  primaryColor: '#74ACDF', secondaryColor: '#FFFFFF', textColor: '#1a1a1a', founded: 1893,
};
const BRAZIL: ExpClub = {
  id: 'bra', name: 'Brazil', shortName: 'Brazil', abbr: 'BRA',
  city: 'Rio de Janeiro', country: 'Brazil',
  primaryColor: '#009C3B', secondaryColor: '#FFDF00', textColor: '#ffffff', founded: 1914,
};
const SPAIN: ExpClub = {
  id: 'esp', name: 'Spain', shortName: 'Spain', abbr: 'ESP',
  city: 'Madrid', country: 'Spain',
  primaryColor: '#C60B1E', secondaryColor: '#FFC400', textColor: '#ffffff', founded: 1909,
};
const ENGLAND: ExpClub = {
  id: 'eng', name: 'England', shortName: 'England', abbr: 'ENG',
  city: 'London', country: 'England',
  primaryColor: '#C8102E', secondaryColor: '#FFFFFF', textColor: '#ffffff', founded: 1863,
};
const PORTUGAL: ExpClub = {
  id: 'por', name: 'Portugal', shortName: 'Portugal', abbr: 'POR',
  city: 'Lisbon', country: 'Portugal',
  primaryColor: '#006600', secondaryColor: '#FF0000', textColor: '#ffffff', founded: 1914,
};
const MOROCCO: ExpClub = {
  id: 'mar', name: 'Morocco', shortName: 'Morocco', abbr: 'MAR',
  city: 'Casablanca', country: 'Morocco',
  primaryColor: '#C1272D', secondaryColor: '#006233', textColor: '#ffffff', founded: 1955,
};

export const WC_CLUBS: ExpClub[] = [
  FRANCE, GERMANY, ARGENTINA, BRAZIL, SPAIN, ENGLAND, PORTUGAL, MOROCCO,
];

export const WC_FIXTURES: ExpFixture[] = [
  {
    id: 'wc-f1',
    homeClub: FRANCE, awayClub: GERMANY,
    homeScore: 2, awayScore: 1,
    status: 'LIVE', minute: 67,
    kickoffAt: '2026-06-19T18:00:00Z',
    venue: 'MetLife Stadium, New Jersey',
    competition: 'FIFA World Cup 2026', group: 'Group D',
  },
  {
    id: 'wc-f2',
    homeClub: ARGENTINA, awayClub: BRAZIL,
    homeScore: null, awayScore: null,
    status: 'SCHEDULED', minute: null,
    kickoffAt: '2026-06-20T21:00:00Z',
    venue: 'AT&T Stadium, Dallas',
    competition: 'FIFA World Cup 2026', group: 'Group C',
  },
  {
    id: 'wc-f3',
    homeClub: SPAIN, awayClub: ENGLAND,
    homeScore: 3, awayScore: 1,
    status: 'FINISHED', minute: 90,
    kickoffAt: '2026-06-18T20:00:00Z',
    venue: 'Rose Bowl, Pasadena',
    competition: 'FIFA World Cup 2026', group: 'Group A',
  },
  {
    id: 'wc-f4',
    homeClub: PORTUGAL, awayClub: MOROCCO,
    homeScore: null, awayScore: null,
    status: 'SCHEDULED', minute: null,
    kickoffAt: '2026-06-21T17:00:00Z',
    venue: 'SoFi Stadium, Los Angeles',
    competition: 'FIFA World Cup 2026', group: 'Group B',
  },
  {
    id: 'wc-f5',
    homeClub: GERMANY, awayClub: ARGENTINA,
    homeScore: null, awayScore: null,
    status: 'SCHEDULED', minute: null,
    kickoffAt: '2026-06-23T21:00:00Z',
    venue: 'Levi\'s Stadium, San Francisco',
    competition: 'FIFA World Cup 2026', group: 'Group D',
  },
];

export const WC_STANDINGS: ExpStanding[] = [
  { position: 1, club: FRANCE,   played: 2, won: 2, drawn: 0, lost: 0, goalsFor: 5, goalsAgainst: 1, goalDifference:  4, points: 6, form: ['W', 'W'] },
  { position: 2, club: SPAIN,    played: 2, won: 2, drawn: 0, lost: 0, goalsFor: 6, goalsAgainst: 2, goalDifference:  4, points: 6, form: ['W', 'W'] },
  { position: 3, club: ARGENTINA,played: 1, won: 1, drawn: 0, lost: 0, goalsFor: 2, goalsAgainst: 0, goalDifference:  2, points: 3, form: ['W'] },
  { position: 4, club: PORTUGAL, played: 1, won: 1, drawn: 0, lost: 0, goalsFor: 1, goalsAgainst: 0, goalDifference:  1, points: 3, form: ['W'] },
  { position: 5, club: BRAZIL,   played: 1, won: 0, drawn: 1, lost: 0, goalsFor: 1, goalsAgainst: 1, goalDifference:  0, points: 1, form: ['D'] },
  { position: 6, club: GERMANY,  played: 2, won: 0, drawn: 1, lost: 1, goalsFor: 2, goalsAgainst: 4, goalDifference: -2, points: 1, form: ['D', 'L'] },
  { position: 7, club: ENGLAND,  played: 2, won: 0, drawn: 1, lost: 1, goalsFor: 2, goalsAgainst: 4, goalDifference: -2, points: 1, form: ['D', 'L'] },
  { position: 8, club: MOROCCO,  played: 1, won: 0, drawn: 0, lost: 1, goalsFor: 0, goalsAgainst: 1, goalDifference: -1, points: 0, form: ['L'] },
];

export const WC_PLAYERS: ExpPlayer[] = [
  {
    id: 'mbappe', name: 'Kylian Mbappe', position: 'FWD', club: FRANCE,
    nationality: 'French', imageKey: 'wc-player-mbappe-portrait',
    goalsThisTournament: 5, assistsThisTournament: 2,
    fantasyPoints: 94, fantasyPrice: 12.5,
  },
  {
    id: 'vinicius', name: 'Vinicius Jr', position: 'FWD', club: BRAZIL,
    nationality: 'Brazilian', imageKey: 'wc-player-vinicius-portrait',
    goalsThisTournament: 4, assistsThisTournament: 3,
    fantasyPoints: 78, fantasyPrice: 11.5,
  },
  {
    id: 'bellingham', name: 'Jude Bellingham', position: 'MID', club: ENGLAND,
    nationality: 'English', imageKey: 'wc-player-bellingham-portrait',
    goalsThisTournament: 3, assistsThisTournament: 4,
    fantasyPoints: 72, fantasyPrice: 11.0,
  },
  {
    id: 'pedri', name: 'Pedri', position: 'MID', club: SPAIN,
    nationality: 'Spanish', imageKey: 'wc-player-pedri-portrait',
    goalsThisTournament: 2, assistsThisTournament: 5,
    fantasyPoints: 68, fantasyPrice: 10.0,
  },
  {
    id: 'ruben-dias', name: 'Ruben Dias', position: 'DEF', club: PORTUGAL,
    nationality: 'Portuguese', imageKey: 'wc-player-dias-portrait',
    goalsThisTournament: 1, assistsThisTournament: 1,
    fantasyPoints: 55, fantasyPrice: 7.5,
  },
  {
    id: 'hakimi', name: 'Achraf Hakimi', position: 'DEF', club: MOROCCO,
    nationality: 'Moroccan', imageKey: 'wc-player-hakimi-portrait',
    goalsThisTournament: 0, assistsThisTournament: 2,
    fantasyPoints: 38, fantasyPrice: 6.5,
  },
];

export const WC_STORIES: ExpStory[] = [
  {
    id: 's1', title: 'Mbappe fires France into pole position with brace against Germany',
    category: 'Match Report', summary: 'A devastating first-half performance from Kylian Mbappe gave France a commanding lead at MetLife Stadium as Les Bleus assert their tournament credentials.',
    imageKey: 'wc-story-france-germany-match', readMinutes: 4, publishedAt: '2026-06-19T20:00:00Z', featured: true,
  },
  {
    id: 's2', title: 'Spain\'s collective brilliance too much for England in Group A',
    category: 'Match Report', summary: 'Pedri orchestrated a masterclass as Spain dismantled England with three second-half goals at the Rose Bowl.',
    imageKey: 'wc-story-spain-england', readMinutes: 3, publishedAt: '2026-06-18T23:00:00Z', featured: false,
  },
  {
    id: 's3', title: 'Morocco making history: the Atlas Lions roar again',
    category: 'Feature', summary: 'After their 2022 semi-final run, Morocco arrive in 2026 with renewed confidence and a tactical system that is drawing admiration worldwide.',
    imageKey: 'wc-story-morocco-atlas-lions', readMinutes: 5, publishedAt: '2026-06-19T10:00:00Z', featured: false,
  },
  {
    id: 's4', title: 'The rise of African football: what WC 2026 means for the continent',
    category: 'Analysis', summary: 'Five African nations in the expanded 48-team format represents a watershed moment. What does it mean for South African football and the PSL?',
    imageKey: 'wc-story-africa-rise', readMinutes: 6, publishedAt: '2026-06-17T12:00:00Z', featured: false,
  },
  {
    id: 's5', title: 'Fantasy WC: the midfielders you cannot afford to miss',
    category: 'Fantasy', summary: 'Pedri, Bellingham and Guendouzi are all returning exceptional value. Our analysts break down the essential midfield picks.',
    imageKey: 'wc-story-fantasy-mids', readMinutes: 3, publishedAt: '2026-06-19T08:00:00Z', featured: false,
  },
];

export const WC_VIDEOS: ExpVideo[] = [
  { id: 'v1', title: 'Mbappe\'s stunning brace vs Germany — full goals', thumbnailKey: 'wc-video-mbappe-goals', durationSeconds: 142, category: 'Goals' },
  { id: 'v2', title: 'Spain 3-1 England — match highlights', thumbnailKey: 'wc-video-spain-england-highlights', durationSeconds: 318, category: 'Highlights' },
  { id: 'v3', title: 'Morocco\'s defensive masterclass — tactical breakdown', thumbnailKey: 'wc-video-morocco-tactics', durationSeconds: 487, category: 'Analysis' },
  { id: 'v4', title: 'Best saves of Matchday 3', thumbnailKey: 'wc-video-saves-md3', durationSeconds: 215, category: 'Best Of' },
  { id: 'v5', title: 'Vinicius Jr — the complete player', thumbnailKey: 'wc-video-vinicius-profile', durationSeconds: 362, category: 'Feature' },
];

export const WC_GAMEWEEK: ExpGameweek = {
  number: 3,
  label: 'Matchday 3',
  status: 'ACTIVE',
  deadlineAt: '2026-06-21T12:00:00Z',
  highestPoints: 127,
  averagePoints: 52,
  totalPredictions: 14830,
};

export const WC_FANTASY_TEAM: ExpFantasyTeam = {
  totalPoints: 347,
  gameweekPoints: 64,
  transfersRemaining: 1,
  captain: WC_PLAYERS[0]!,
};

export const WC_FAN_VALUE: ExpFanValue = {
  total: 6240,
  rank: 842,
  level: 'Gold Fan',
  levelProgress: 72,
  breakdown: {
    predictions: 2480,
    fantasy:     2110,
    social:       980,
    attendance:   670,
  },
};

/* ── Fantasy-specific types ─────────────────────────────────────────── */

export interface ExpFantasyPlayer {
  id: string;
  name: string;
  position: 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';
  club: string;
  clubShort: string;
  price: number;
  points: number;
  form: number;
  ownership: number;
  goalsThisTournament: number;
  assistsThisTournament: number;
  cleanSheetsThisTournament: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
  squadRole: 'STARTER' | 'SUBSTITUTE';
  benchSlot: number | null;
}

export interface ExpFantasySquad {
  teamName: string;
  totalPoints: number;
  gameweekPoints: number;
  rank: number;
  transfersRemaining: number;
  budget: number;
  formation: string;
  players: ExpFantasyPlayer[];
}

export type ChipType = 'WILDCARD' | 'BENCH_BOOST' | 'TRIPLE_CAPTAIN' | 'FREE_HIT';
export type ChipStatus = 'AVAILABLE' | 'ACTIVE' | 'USED' | 'EXPIRED';

export interface ExpChip {
  type: ChipType;
  status: ChipStatus;
  usedInGameweek?: number;
}

export interface ExpFDREntry {
  club: string;
  clubShort: string;
  fixtures: Array<{
    opponent: string;
    opponentShort: string;
    difficulty: 1 | 2 | 3 | 4 | 5;
    isHome: boolean;
  }>;
}

/* ── Fantasy mock players (30 players, WC 2026) ─────────────────────── */

export const FANTASY_MOCK_PLAYERS: ExpFantasyPlayer[] = [
  // GOALKEEPERS (6)
  { id: 'gk-lloris',    name: 'Hugo Lloris',     position: 'GOALKEEPER', club: 'France',      clubShort: 'FRA', price: 6.0,  points: 42, form: 6.2, ownership: 28.4, goalsThisTournament: 0, assistsThisTournament: 0, cleanSheetsThisTournament: 2, isCaptain: false, isViceCaptain: false, squadRole: 'STARTER',    benchSlot: null },
  { id: 'gk-alisson',   name: 'Alisson',          position: 'GOALKEEPER', club: 'Brazil',      clubShort: 'BRA', price: 6.5,  points: 38, form: 5.8, ownership: 22.1, goalsThisTournament: 0, assistsThisTournament: 0, cleanSheetsThisTournament: 1, isCaptain: false, isViceCaptain: false, squadRole: 'SUBSTITUTE', benchSlot: 1 },
  { id: 'gk-courtois',  name: 'T. Courtois',      position: 'GOALKEEPER', club: 'Belgium',     clubShort: 'BEL', price: 6.0,  points: 35, form: 5.2, ownership: 18.9, goalsThisTournament: 0, assistsThisTournament: 0, cleanSheetsThisTournament: 1, isCaptain: false, isViceCaptain: false, squadRole: 'SUBSTITUTE', benchSlot: null },
  { id: 'gk-martinez',  name: 'E. Martinez',      position: 'GOALKEEPER', club: 'Argentina',   clubShort: 'ARG', price: 6.5,  points: 48, form: 7.1, ownership: 31.2, goalsThisTournament: 0, assistsThisTournament: 0, cleanSheetsThisTournament: 2, isCaptain: false, isViceCaptain: false, squadRole: 'SUBSTITUTE', benchSlot: null },
  { id: 'gk-pickford',  name: 'J. Pickford',      position: 'GOALKEEPER', club: 'England',     clubShort: 'ENG', price: 5.5,  points: 28, form: 4.0, ownership: 14.3, goalsThisTournament: 0, assistsThisTournament: 0, cleanSheetsThisTournament: 0, isCaptain: false, isViceCaptain: false, squadRole: 'SUBSTITUTE', benchSlot: null },
  { id: 'gk-unai',      name: 'U. Simon',         position: 'GOALKEEPER', club: 'Spain',       clubShort: 'ESP', price: 5.5,  points: 44, form: 6.5, ownership: 19.8, goalsThisTournament: 0, assistsThisTournament: 0, cleanSheetsThisTournament: 2, isCaptain: false, isViceCaptain: false, squadRole: 'SUBSTITUTE', benchSlot: null },
  // DEFENDERS (8)
  { id: 'def-upamecano', name: 'D. Upamecano',   position: 'DEFENDER',   club: 'France',      clubShort: 'FRA', price: 6.5,  points: 44, form: 6.8, ownership: 24.1, goalsThisTournament: 0, assistsThisTournament: 1, cleanSheetsThisTournament: 2, isCaptain: false, isViceCaptain: false, squadRole: 'STARTER',    benchSlot: null },
  { id: 'def-hernandez', name: 'T. Hernandez',   position: 'DEFENDER',   club: 'France',      clubShort: 'FRA', price: 7.0,  points: 52, form: 7.8, ownership: 32.5, goalsThisTournament: 1, assistsThisTournament: 2, cleanSheetsThisTournament: 2, isCaptain: false, isViceCaptain: false, squadRole: 'STARTER',    benchSlot: null },
  { id: 'def-dias',      name: 'Ruben Dias',      position: 'DEFENDER',   club: 'Portugal',    clubShort: 'POR', price: 7.5,  points: 55, form: 8.0, ownership: 38.7, goalsThisTournament: 1, assistsThisTournament: 1, cleanSheetsThisTournament: 2, isCaptain: false, isViceCaptain: false, squadRole: 'STARTER',    benchSlot: null },
  { id: 'def-hakimi',    name: 'A. Hakimi',       position: 'DEFENDER',   club: 'Morocco',     clubShort: 'MAR', price: 6.5,  points: 38, form: 5.8, ownership: 21.3, goalsThisTournament: 0, assistsThisTournament: 2, cleanSheetsThisTournament: 1, isCaptain: false, isViceCaptain: false, squadRole: 'STARTER',    benchSlot: null },
  { id: 'def-militao',   name: 'E. Militao',      position: 'DEFENDER',   club: 'Brazil',      clubShort: 'BRA', price: 6.0,  points: 35, form: 5.2, ownership: 17.4, goalsThisTournament: 0, assistsThisTournament: 0, cleanSheetsThisTournament: 1, isCaptain: false, isViceCaptain: false, squadRole: 'SUBSTITUTE', benchSlot: 2 },
  { id: 'def-walker',    name: 'K. Walker',       position: 'DEFENDER',   club: 'England',     clubShort: 'ENG', price: 5.5,  points: 28, form: 4.2, ownership: 13.8, goalsThisTournament: 0, assistsThisTournament: 0, cleanSheetsThisTournament: 0, isCaptain: false, isViceCaptain: false, squadRole: 'SUBSTITUTE', benchSlot: null },
  { id: 'def-kimmich',   name: 'J. Kimmich',      position: 'DEFENDER',   club: 'Germany',     clubShort: 'GER', price: 7.0,  points: 41, form: 6.1, ownership: 26.9, goalsThisTournament: 0, assistsThisTournament: 2, cleanSheetsThisTournament: 1, isCaptain: false, isViceCaptain: false, squadRole: 'SUBSTITUTE', benchSlot: null },
  { id: 'def-araujo',    name: 'R. Araujo',       position: 'DEFENDER',   club: 'Spain',       clubShort: 'ESP', price: 6.0,  points: 46, form: 7.0, ownership: 22.4, goalsThisTournament: 0, assistsThisTournament: 0, cleanSheetsThisTournament: 2, isCaptain: false, isViceCaptain: false, squadRole: 'SUBSTITUTE', benchSlot: null },
  // MIDFIELDERS (9)
  { id: 'mid-bellingham', name: 'J. Bellingham',  position: 'MIDFIELDER', club: 'England',     clubShort: 'ENG', price: 11.0, points: 72, form: 9.8, ownership: 61.2, goalsThisTournament: 3, assistsThisTournament: 4, cleanSheetsThisTournament: 0, isCaptain: false, isViceCaptain: true,  squadRole: 'STARTER',    benchSlot: null },
  { id: 'mid-pedri',      name: 'Pedri',           position: 'MIDFIELDER', club: 'Spain',       clubShort: 'ESP', price: 10.0, points: 68, form: 9.2, ownership: 54.8, goalsThisTournament: 2, assistsThisTournament: 5, cleanSheetsThisTournament: 0, isCaptain: false, isViceCaptain: false, squadRole: 'STARTER',    benchSlot: null },
  { id: 'mid-guendouzi',  name: 'M. Guendouzi',   position: 'MIDFIELDER', club: 'France',      clubShort: 'FRA', price: 7.5,  points: 58, form: 8.1, ownership: 38.2, goalsThisTournament: 1, assistsThisTournament: 3, cleanSheetsThisTournament: 0, isCaptain: false, isViceCaptain: false, squadRole: 'STARTER',    benchSlot: null },
  { id: 'mid-rodrigo',    name: 'Rodrigo',         position: 'MIDFIELDER', club: 'Spain',       clubShort: 'ESP', price: 8.5,  points: 55, form: 7.6, ownership: 42.1, goalsThisTournament: 2, assistsThisTournament: 2, cleanSheetsThisTournament: 0, isCaptain: false, isViceCaptain: false, squadRole: 'STARTER',    benchSlot: null },
  { id: 'mid-kroos',      name: 'T. Kroos',        position: 'MIDFIELDER', club: 'Germany',     clubShort: 'GER', price: 9.0,  points: 50, form: 6.9, ownership: 35.6, goalsThisTournament: 1, assistsThisTournament: 4, cleanSheetsThisTournament: 0, isCaptain: false, isViceCaptain: false, squadRole: 'SUBSTITUTE', benchSlot: 3 },
  { id: 'mid-caicedo',    name: 'M. Caicedo',      position: 'MIDFIELDER', club: 'Ecuador',     clubShort: 'ECU', price: 6.5,  points: 32, form: 4.8, ownership: 12.4, goalsThisTournament: 1, assistsThisTournament: 1, cleanSheetsThisTournament: 0, isCaptain: false, isViceCaptain: false, squadRole: 'SUBSTITUTE', benchSlot: null },
  { id: 'mid-sabitzer',   name: 'M. Sabitzer',     position: 'MIDFIELDER', club: 'Austria',     clubShort: 'AUT', price: 5.5,  points: 24, form: 3.6, ownership: 8.1,  goalsThisTournament: 0, assistsThisTournament: 1, cleanSheetsThisTournament: 0, isCaptain: false, isViceCaptain: false, squadRole: 'SUBSTITUTE', benchSlot: null },
  { id: 'mid-fred',       name: 'Fred',            position: 'MIDFIELDER', club: 'Brazil',      clubShort: 'BRA', price: 6.0,  points: 28, form: 4.2, ownership: 9.8,  goalsThisTournament: 0, assistsThisTournament: 2, cleanSheetsThisTournament: 0, isCaptain: false, isViceCaptain: false, squadRole: 'SUBSTITUTE', benchSlot: null },
  { id: 'mid-amrabat',    name: 'S. Amrabat',      position: 'MIDFIELDER', club: 'Morocco',     clubShort: 'MAR', price: 5.5,  points: 30, form: 4.5, ownership: 11.2, goalsThisTournament: 0, assistsThisTournament: 1, cleanSheetsThisTournament: 0, isCaptain: false, isViceCaptain: false, squadRole: 'SUBSTITUTE', benchSlot: null },
  // FORWARDS (7)
  { id: 'fwd-mbappe',     name: 'K. Mbappe',       position: 'FORWARD',    club: 'France',      clubShort: 'FRA', price: 13.0, points: 94, form: 12.4, ownership: 72.3, goalsThisTournament: 5, assistsThisTournament: 2, cleanSheetsThisTournament: 0, isCaptain: true,  isViceCaptain: false, squadRole: 'STARTER',    benchSlot: null },
  { id: 'fwd-vinicius',   name: 'Vinicius Jr',      position: 'FORWARD',    club: 'Brazil',      clubShort: 'BRA', price: 11.5, points: 78, form: 10.2, ownership: 58.4, goalsThisTournament: 4, assistsThisTournament: 3, cleanSheetsThisTournament: 0, isCaptain: false, isViceCaptain: false, squadRole: 'STARTER',    benchSlot: null },
  { id: 'fwd-leao',       name: 'R. Leao',         position: 'FORWARD',    club: 'Portugal',    clubShort: 'POR', price: 9.0,  points: 60, form: 8.2, ownership: 41.7, goalsThisTournament: 3, assistsThisTournament: 1, cleanSheetsThisTournament: 0, isCaptain: false, isViceCaptain: false, squadRole: 'STARTER',    benchSlot: null },
  { id: 'fwd-saka',       name: 'B. Saka',         position: 'FORWARD',    club: 'England',     clubShort: 'ENG', price: 9.5,  points: 56, form: 7.8, ownership: 44.2, goalsThisTournament: 2, assistsThisTournament: 2, cleanSheetsThisTournament: 0, isCaptain: false, isViceCaptain: false, squadRole: 'SUBSTITUTE', benchSlot: 4 },
  { id: 'fwd-havertz',    name: 'K. Havertz',      position: 'FORWARD',    club: 'Germany',     clubShort: 'GER', price: 8.5,  points: 44, form: 6.2, ownership: 28.9, goalsThisTournament: 2, assistsThisTournament: 1, cleanSheetsThisTournament: 0, isCaptain: false, isViceCaptain: false, squadRole: 'SUBSTITUTE', benchSlot: null },
  { id: 'fwd-benzema',    name: 'K. Benzema',      position: 'FORWARD',    club: 'France',      clubShort: 'FRA', price: 10.5, points: 38, form: 5.1, ownership: 22.3, goalsThisTournament: 1, assistsThisTournament: 0, cleanSheetsThisTournament: 0, isCaptain: false, isViceCaptain: false, squadRole: 'SUBSTITUTE', benchSlot: null },
  { id: 'fwd-jesus',      name: 'G. Jesus',        position: 'FORWARD',    club: 'Brazil',      clubShort: 'BRA', price: 8.0,  points: 35, form: 5.0, ownership: 18.6, goalsThisTournament: 1, assistsThisTournament: 1, cleanSheetsThisTournament: 0, isCaptain: false, isViceCaptain: false, squadRole: 'SUBSTITUTE', benchSlot: null },
];

export const FANTASY_MOCK_TEAM: ExpFantasySquad = {
  teamName: 'Golden Lions FC',
  totalPoints: 347,
  gameweekPoints: 64,
  rank: 1842,
  transfersRemaining: 2,
  budget: 4.5,
  formation: '4-3-3',
  players: FANTASY_MOCK_PLAYERS.filter(p =>
    ['gk-lloris', 'def-upamecano', 'def-hernandez', 'def-dias', 'def-hakimi',
     'mid-bellingham', 'mid-pedri', 'mid-guendouzi', 'mid-rodrigo',
     'fwd-mbappe', 'fwd-vinicius', 'fwd-leao',
     'def-militao', 'mid-kroos', 'fwd-saka'].includes(p.id)
  ),
};

export const FANTASY_MOCK_CHIPS: ExpChip[] = [
  { type: 'WILDCARD',       status: 'USED',      usedInGameweek: 1 },
  { type: 'BENCH_BOOST',    status: 'AVAILABLE' },
  { type: 'TRIPLE_CAPTAIN', status: 'AVAILABLE' },
  { type: 'FREE_HIT',       status: 'AVAILABLE' },
];

export const FANTASY_MOCK_FDR: ExpFDREntry[] = [
  {
    club: 'France', clubShort: 'FRA',
    fixtures: [
      { opponent: 'Germany',     opponentShort: 'GER', difficulty: 3, isHome: true  },
      { opponent: 'England',     opponentShort: 'ENG', difficulty: 2, isHome: false },
      { opponent: 'Argentina',   opponentShort: 'ARG', difficulty: 4, isHome: true  },
      { opponent: 'Brazil',      opponentShort: 'BRA', difficulty: 4, isHome: false },
      { opponent: 'Spain',       opponentShort: 'ESP', difficulty: 5, isHome: true  },
      { opponent: 'Portugal',    opponentShort: 'POR', difficulty: 3, isHome: false },
    ],
  },
  {
    club: 'Brazil', clubShort: 'BRA',
    fixtures: [
      { opponent: 'Argentina',   opponentShort: 'ARG', difficulty: 4, isHome: true  },
      { opponent: 'Germany',     opponentShort: 'GER', difficulty: 2, isHome: false },
      { opponent: 'England',     opponentShort: 'ENG', difficulty: 2, isHome: true  },
      { opponent: 'France',      opponentShort: 'FRA', difficulty: 4, isHome: true  },
      { opponent: 'Morocco',     opponentShort: 'MAR', difficulty: 1, isHome: false },
      { opponent: 'Spain',       opponentShort: 'ESP', difficulty: 4, isHome: true  },
    ],
  },
  {
    club: 'Argentina', clubShort: 'ARG',
    fixtures: [
      { opponent: 'Brazil',      opponentShort: 'BRA', difficulty: 4, isHome: false },
      { opponent: 'Spain',       opponentShort: 'ESP', difficulty: 3, isHome: true  },
      { opponent: 'Germany',     opponentShort: 'GER', difficulty: 3, isHome: false },
      { opponent: 'Portugal',    opponentShort: 'POR', difficulty: 3, isHome: true  },
      { opponent: 'England',     opponentShort: 'ENG', difficulty: 2, isHome: false },
      { opponent: 'Morocco',     opponentShort: 'MAR', difficulty: 1, isHome: true  },
    ],
  },
  {
    club: 'England', clubShort: 'ENG',
    fixtures: [
      { opponent: 'Spain',       opponentShort: 'ESP', difficulty: 4, isHome: true  },
      { opponent: 'France',      opponentShort: 'FRA', difficulty: 4, isHome: true  },
      { opponent: 'Brazil',      opponentShort: 'BRA', difficulty: 3, isHome: false },
      { opponent: 'Germany',     opponentShort: 'GER', difficulty: 3, isHome: true  },
      { opponent: 'Argentina',   opponentShort: 'ARG', difficulty: 3, isHome: true  },
      { opponent: 'Morocco',     opponentShort: 'MAR', difficulty: 1, isHome: false },
    ],
  },
  {
    club: 'Germany', clubShort: 'GER',
    fixtures: [
      { opponent: 'France',      opponentShort: 'FRA', difficulty: 4, isHome: false },
      { opponent: 'Brazil',      opponentShort: 'BRA', difficulty: 3, isHome: true  },
      { opponent: 'Argentina',   opponentShort: 'ARG', difficulty: 3, isHome: true  },
      { opponent: 'England',     opponentShort: 'ENG', difficulty: 3, isHome: false },
      { opponent: 'Portugal',    opponentShort: 'POR', difficulty: 3, isHome: true  },
      { opponent: 'Spain',       opponentShort: 'ESP', difficulty: 4, isHome: false },
    ],
  },
  {
    club: 'Spain', clubShort: 'ESP',
    fixtures: [
      { opponent: 'England',     opponentShort: 'ENG', difficulty: 2, isHome: false },
      { opponent: 'Argentina',   opponentShort: 'ARG', difficulty: 3, isHome: false },
      { opponent: 'Morocco',     opponentShort: 'MAR', difficulty: 1, isHome: true  },
      { opponent: 'Portugal',    opponentShort: 'POR', difficulty: 3, isHome: false },
      { opponent: 'France',      opponentShort: 'FRA', difficulty: 4, isHome: false },
      { opponent: 'Germany',     opponentShort: 'GER', difficulty: 3, isHome: true  },
    ],
  },
  {
    club: 'Portugal', clubShort: 'POR',
    fixtures: [
      { opponent: 'Morocco',     opponentShort: 'MAR', difficulty: 1, isHome: true  },
      { opponent: 'Portugal',    opponentShort: 'POR', difficulty: 3, isHome: false },
      { opponent: 'France',      opponentShort: 'FRA', difficulty: 4, isHome: false },
      { opponent: 'Argentina',   opponentShort: 'ARG', difficulty: 3, isHome: false },
      { opponent: 'Germany',     opponentShort: 'GER', difficulty: 3, isHome: false },
      { opponent: 'Brazil',      opponentShort: 'BRA', difficulty: 4, isHome: false },
    ],
  },
  {
    club: 'Netherlands', clubShort: 'NED',
    fixtures: [
      { opponent: 'Morocco',     opponentShort: 'MAR', difficulty: 1, isHome: true  },
      { opponent: 'England',     opponentShort: 'ENG', difficulty: 3, isHome: false },
      { opponent: 'Spain',       opponentShort: 'ESP', difficulty: 4, isHome: true  },
      { opponent: 'Germany',     opponentShort: 'GER', difficulty: 3, isHome: false },
      { opponent: 'Brazil',      opponentShort: 'BRA', difficulty: 4, isHome: true  },
      { opponent: 'Argentina',   opponentShort: 'ARG', difficulty: 3, isHome: false },
    ],
  },
];

/* ── Data accessor (chooses mock vs live) ───────────────────────────── */

export interface ExperienceData {
  mode: DataMode;
  clubs: ExpClub[];
  fixtures: ExpFixture[];
  liveFixture: ExpFixture | null;
  standings: ExpStanding[];
  players: ExpPlayer[];
  stories: ExpStory[];
  videos: ExpVideo[];
  gameweek: ExpGameweek;
  fantasyTeam: ExpFantasyTeam;
  fanValue: ExpFanValue;
  competitionName: string;
}

export function getExperienceData(): ExperienceData {
  const mode = getDataMode();

  if (mode === 'LIVE_BETA_DATA') {
    /* TODO: replace with real API calls when LIVE_BETA_DATA is wired. */
    /* Showing WC mock data with LIVE banner until API integration. */
    return {
      mode,
      clubs: WC_CLUBS,
      fixtures: WC_FIXTURES,
      liveFixture: WC_FIXTURES.find(f => f.status === 'LIVE') ?? null,
      standings: WC_STANDINGS,
      players: WC_PLAYERS,
      stories: WC_STORIES,
      videos: WC_VIDEOS,
      gameweek: WC_GAMEWEEK,
      fantasyTeam: WC_FANTASY_TEAM,
      fanValue: WC_FAN_VALUE,
      competitionName: 'FIFA World Cup 2026',
    };
  }

  return {
    mode,
    clubs: WC_CLUBS,
    fixtures: WC_FIXTURES,
    liveFixture: WC_FIXTURES.find(f => f.status === 'LIVE') ?? null,
    standings: WC_STANDINGS,
    players: WC_PLAYERS,
    stories: WC_STORIES,
    videos: WC_VIDEOS,
    gameweek: WC_GAMEWEEK,
    fantasyTeam: WC_FANTASY_TEAM,
    fanValue: WC_FAN_VALUE,
    competitionName: 'FIFA World Cup 2026',
  };
}
