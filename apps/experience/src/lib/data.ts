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
