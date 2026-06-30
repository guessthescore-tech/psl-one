export type DataMode = 'DESIGN_REVIEW_DATA' | 'LIVE_BETA_DATA' | 'WC_BETA';

export function getDataMode(): DataMode {
  const mode = process.env['NEXT_PUBLIC_DATA_MODE'];
  if (mode === 'LIVE_BETA_DATA') return 'LIVE_BETA_DATA';
  if (mode === 'WC_BETA') return 'WC_BETA';
  if (process.env['NODE_ENV'] === 'production') return 'WC_BETA';
  return 'DESIGN_REVIEW_DATA';
}

export function isLiveDataMode(mode: DataMode = getDataMode()): boolean {
  return mode !== 'DESIGN_REVIEW_DATA';
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
  /** Aggregated clean-sheet count from PlayerMatchStats.cleanSheet via the backend. */
  cleanSheets: number;
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
/* Returns football-branded SVG placeholder data URIs. No external image deps. */

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const CLUB_PALETTE: Record<string, [string, string]> = {
  fra: ['#002395', '#4060cc'], ger: ['#1a1a1a', '#3a3a3a'],
  arg: ['#74ACDF', '#4080bb'], bra: ['#009C3B', '#00cc50'],
  esp: ['#C60B1E', '#e02030'], eng: ['#C8102E', '#e02040'],
  por: ['#006600', '#008800'], mar: ['#C1272D', '#e02030'],
};

export function expImg(seed: string, w: number, h: number): string {
  const h2 = hashCode(seed);

  // Detect image category from key
  const isPlayer = seed.includes('player') || seed.includes('portrait');
  const isStadium = seed.includes('stadium') || seed.includes('match-night') || seed.includes('fanpark');
  const isVideo = seed.includes('video');
  const isStory = seed.includes('story') || seed.includes('africa') || seed.includes('fantasy');

  // Derive club from key if possible
  const clubMatch = Object.keys(CLUB_PALETTE).find(k => seed.includes(k));
  const [c1, c2] = clubMatch ? CLUB_PALETTE[clubMatch]! : ['#0d3a1a', '#1a6633'];

  let bg1: string, bg2: string, symbol: string;

  if (isStadium) {
    bg1 = '#060d19'; bg2 = '#0d2a3a'; symbol = '⚽';
  } else if (isPlayer) {
    bg1 = c1; bg2 = c2;
    // Extract readable initials from key: wc-player-mbappe → MB
    const part = seed.replace(/^wc-player-|-portrait$|-stats$/g, '').split('-').pop() ?? seed;
    symbol = part.slice(0, 2).toUpperCase();
  } else if (isVideo) {
    bg1 = '#0a0a14'; bg2 = '#1a1a2a'; symbol = '▶';
  } else if (isStory) {
    const editorialPalettes: [string, string, string][] = [
      ['#0d2218', '#1a4a30', '⚽'],
      ['#1a0d12', '#3a1a22', '🏆'],
      ['#0d1a2a', '#1a3050', '📊'],
      ['#1a1408', '#3a2a10', '⭐'],
    ];
    const p = editorialPalettes[h2 % editorialPalettes.length]!;
    [bg1, bg2, symbol] = p;
  } else {
    bg1 = '#0d1f12'; bg2 = '#1a3a22'; symbol = '⚽';
  }

  const fontSize = Math.round(Math.min(w, h) * (isPlayer ? 0.28 : 0.35));

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">`,
    `<stop offset="0%" stop-color="${bg1}"/>`,
    `<stop offset="100%" stop-color="${bg2}"/>`,
    `</linearGradient></defs>`,
    `<rect width="${w}" height="${h}" fill="url(#g)"/>`,
    // Subtle pitch stripe pattern for non-player images
    isPlayer
      ? `<circle cx="${w * 0.5}" cy="${h * 0.45}" r="${Math.min(w, h) * 0.3}" fill="rgba(255,255,255,0.06)"/>`
      : `<rect x="0" y="0" width="${w}" height="${h}" fill="url(#stripe)" opacity="0.08"/>`,
    `<text x="${w / 2}" y="${h / 2}" text-anchor="middle" dominant-baseline="middle" `,
    `font-family="system-ui,sans-serif" font-size="${fontSize}" font-weight="700" `,
    `fill="rgba(255,255,255,0.25)">${symbol}</text>`,
    `</svg>`,
  ].join('');

  // btoa is available in Node 16+ and all modern browsers
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
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
const SOUTH_AFRICA: ExpClub = {
  id: 'rsa', name: 'South Africa', shortName: 'Bafana Bafana', abbr: 'RSA',
  city: 'Johannesburg', country: 'South Africa',
  primaryColor: '#007A4D', secondaryColor: '#FFB612', textColor: '#ffffff', founded: 1991,
};
const SOUTH_KOREA: ExpClub = {
  id: 'kor', name: 'South Korea', shortName: 'South Korea', abbr: 'KOR',
  city: 'Seoul', country: 'South Korea',
  primaryColor: '#C60C30', secondaryColor: '#003478', textColor: '#ffffff', founded: 1928,
};
const USA: ExpClub = {
  id: 'usa', name: 'United States', shortName: 'USA', abbr: 'USA',
  city: 'New York', country: 'United States',
  primaryColor: '#002868', secondaryColor: '#BF0A30', textColor: '#ffffff', founded: 1913,
};
const MEXICO: ExpClub = {
  id: 'mex', name: 'Mexico', shortName: 'Mexico', abbr: 'MEX',
  city: 'Mexico City', country: 'Mexico',
  primaryColor: '#006847', secondaryColor: '#CE1126', textColor: '#ffffff', founded: 1927,
};

export const WC_CLUBS: ExpClub[] = [
  FRANCE, GERMANY, ARGENTINA, BRAZIL, SPAIN, ENGLAND, PORTUGAL, MOROCCO,
  SOUTH_AFRICA, SOUTH_KOREA, USA, MEXICO,
];

export const WC_FIXTURES: ExpFixture[] = [
  {
    id: 'wc-f1',
    homeClub: FRANCE, awayClub: GERMANY,
    homeScore: 2, awayScore: 1,
    status: 'FINISHED', minute: 90,
    kickoffAt: '2026-06-19T18:00:00Z',
    venue: 'MetLife Stadium, New Jersey',
    competition: 'FIFA World Cup 2026', group: 'Group D',
  },
  {
    id: 'wc-f2',
    homeClub: ARGENTINA, awayClub: BRAZIL,
    homeScore: 1, awayScore: 1,
    status: 'FINISHED', minute: 90,
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
    homeScore: 2, awayScore: 0,
    status: 'FINISHED', minute: 90,
    kickoffAt: '2026-06-21T17:00:00Z',
    venue: 'SoFi Stadium, Los Angeles',
    competition: 'FIFA World Cup 2026', group: 'Group B',
  },
  {
    id: 'wc-f5',
    homeClub: GERMANY, awayClub: ARGENTINA,
    homeScore: 2, awayScore: 2,
    status: 'FINISHED', minute: 90,
    kickoffAt: '2026-06-23T21:00:00Z',
    venue: 'Levi\'s Stadium, San Francisco',
    competition: 'FIFA World Cup 2026', group: 'Group D',
  },
  {
    id: 'wc-sa-kor',
    homeClub: SOUTH_AFRICA, awayClub: SOUTH_KOREA,
    homeScore: null, awayScore: null,
    status: 'SCHEDULED', minute: null,
    kickoffAt: '2026-06-25T01:00:00Z',
    venue: 'Estadio BBVA, Guadalupe, Mexico',
    competition: 'FIFA World Cup 2026', group: 'Group A',
  },
  {
    id: 'wc-f7',
    homeClub: USA, awayClub: MEXICO,
    homeScore: null, awayScore: null,
    status: 'SCHEDULED', minute: null,
    kickoffAt: '2026-06-26T20:00:00Z',
    venue: 'AT&T Stadium, Dallas',
    competition: 'FIFA World Cup 2026', group: 'Group B',
  },
  {
    id: 'wc-f8',
    homeClub: BRAZIL, awayClub: SPAIN,
    homeScore: null, awayScore: null,
    status: 'SCHEDULED', minute: null,
    kickoffAt: '2026-06-27T21:00:00Z',
    venue: 'MetLife Stadium, New Jersey',
    competition: 'FIFA World Cup 2026', group: 'Group C',
  },
];

/* ── API-format fallback fixtures (for server-component pages when API unreachable) ── */
export interface WcApiFallbackFixture {
  id: string;
  kickoffAt: string;
  status: string;
  round: string;
  competitionCode: string;
  homeTeam: { name: string; shortName: string } | null;
  awayTeam: { name: string; shortName: string } | null;
  homeScore: number | null;
  awayScore: number | null;
}

export const WC_FALLBACK_FIXTURES: WcApiFallbackFixture[] = WC_FIXTURES.map(f => ({
  id: f.id,
  kickoffAt: f.kickoffAt,
  status: f.status,
  round: f.group ?? 'Group Stage',
  competitionCode: 'WC',
  homeTeam: { name: f.homeClub.name, shortName: f.homeClub.abbr },
  awayTeam: { name: f.awayClub.name, shortName: f.awayClub.abbr },
  homeScore: f.homeScore,
  awayScore: f.awayScore,
}));

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
    goalsThisTournament: 5, assistsThisTournament: 2, cleanSheets: 0,
    fantasyPoints: 94, fantasyPrice: 12.5,
  },
  {
    id: 'vinicius', name: 'Vinicius Jr', position: 'FWD', club: BRAZIL,
    nationality: 'Brazilian', imageKey: 'wc-player-vinicius-portrait',
    goalsThisTournament: 4, assistsThisTournament: 3, cleanSheets: 0,
    fantasyPoints: 78, fantasyPrice: 11.5,
  },
  {
    id: 'bellingham', name: 'Jude Bellingham', position: 'MID', club: ENGLAND,
    nationality: 'English', imageKey: 'wc-player-bellingham-portrait',
    goalsThisTournament: 3, assistsThisTournament: 4, cleanSheets: 0,
    fantasyPoints: 72, fantasyPrice: 11.0,
  },
  {
    id: 'pedri', name: 'Pedri', position: 'MID', club: SPAIN,
    nationality: 'Spanish', imageKey: 'wc-player-pedri-portrait',
    goalsThisTournament: 2, assistsThisTournament: 5, cleanSheets: 0,
    fantasyPoints: 68, fantasyPrice: 10.0,
  },
  {
    id: 'ruben-dias', name: 'Ruben Dias', position: 'DEF', club: PORTUGAL,
    nationality: 'Portuguese', imageKey: 'wc-player-dias-portrait',
    goalsThisTournament: 1, assistsThisTournament: 1, cleanSheets: 0,
    fantasyPoints: 55, fantasyPrice: 7.5,
  },
  {
    id: 'hakimi', name: 'Achraf Hakimi', position: 'DEF', club: MOROCCO,
    nationality: 'Moroccan', imageKey: 'wc-player-hakimi-portrait',
    goalsThisTournament: 0, assistsThisTournament: 2, cleanSheets: 0,
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
  fantasyPlayers: ExpFantasyPlayer[];
  fantasySquad: ExpFantasySquad;
  fantasyLeagues: ExpLeague[];
  fantasyChips: ExpChip[];
  fantasyHistory: ExpHistoryEntry[];
  fantasyFDR: ExpFDREntry[];
}

export function getExperienceData(): ExperienceData {
  const mode = getDataMode();

  const base = {
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
    fantasyPlayers: FANTASY_MOCK_PLAYERS,
    fantasySquad: FANTASY_MOCK_TEAM,
    fantasyLeagues: FANTASY_MOCK_LEAGUES,
    fantasyChips: FANTASY_MOCK_CHIPS,
    fantasyHistory: FANTASY_MOCK_HISTORY,
    fantasyFDR: FANTASY_MOCK_FDR,
  };

  if (mode === 'LIVE_BETA_DATA') {
    /* LIVE_BETA_DATA is not yet wired — returns design mock data. */
    /* Sections using this data must be visibly labelled as editorial preview. */
    return base;
  }

  return base;
}

/* ── Extended Fantasy types ─────────────────────────────────────────────────── */

export interface ExpFantasyPlayer extends ExpPlayer {
  squadRole: 'STARTER' | 'SUBSTITUTE';
  benchSlot: number | null;
  isCaptain: boolean;
  isViceCaptain: boolean;
  gameweekPoints: number;
  isUnavailable: boolean;
}

export interface ExpLeague {
  id: string;
  name: string;
  type: 'PRIVATE' | 'PUBLIC' | 'GLOBAL';
  scoringType: 'CLASSIC' | 'HEAD_TO_HEAD';
  rank: number;
  totalManagers: number;
  myPoints: number;
  leaderPoints: number;
  inviteCode: string | null;
}

export interface ExpLeagueManager {
  rank: number;
  previousRank: number;
  managerName: string;
  teamName: string;
  gameweekPoints: number;
  totalPoints: number;
  isMe: boolean;
}

export interface ExpChip {
  type: 'BENCH_BOOST' | 'FREE_HIT' | 'TRIPLE_CAPTAIN' | 'WILDCARD';
  status: 'AVAILABLE' | 'ACTIVE' | 'USED';
  usedInGameweek: number | null;
}

export interface ExpHistoryEntry {
  gameweekNumber: number;
  gameweekLabel: string;
  points: number;
  totalPoints: number;
  rank: number;
  transfers: number;
  transferCost: number;
  chipUsed: string | null;
}

export interface ExpFDREntry {
  club: ExpClub;
  fixtures: {
    gameweekNumber: number;
    opponentAbbr: string;
    isHome: boolean;
    difficulty: 1 | 2 | 3 | 4 | 5;
  }[];
}

export interface ExpFantasySquad {
  teamName: string;
  totalPoints: number;
  gameweekPoints: number;
  transfersRemaining: number;
  players: ExpFantasyPlayer[];
}

/* ── DESIGN_REVIEW_DATA: Fantasy mock data (WC 2026 context) ─────────────── */
/* 30 players across 4 positions from the 8 WC 2026 clubs. Read-only.       */

export const FANTASY_MOCK_PLAYERS: ExpFantasyPlayer[] = [
  /* ── Goalkeepers (6) ────────────────────────────────────────────────────── */
  {
    id: 'fp-gk-maignan', name: 'Mike Maignan', position: 'GK', club: WC_CLUBS[0]!,
    nationality: 'French', imageKey: 'wc-player-maignan',
    goalsThisTournament: 0, assistsThisTournament: 0, cleanSheets: 0,
    fantasyPoints: 22, fantasyPrice: 5.5,
    squadRole: 'STARTER', benchSlot: null, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 8, isUnavailable: false,
  },
  {
    id: 'fp-gk-neuer', name: 'Manuel Neuer', position: 'GK', club: WC_CLUBS[1]!,
    nationality: 'German', imageKey: 'wc-player-neuer',
    goalsThisTournament: 0, assistsThisTournament: 0, cleanSheets: 0,
    fantasyPoints: 14, fantasyPrice: 5.0,
    squadRole: 'SUBSTITUTE', benchSlot: 1, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 2, isUnavailable: false,
  },
  {
    id: 'fp-gk-martinez', name: 'Emiliano Martinez', position: 'GK', club: WC_CLUBS[2]!,
    nationality: 'Argentine', imageKey: 'wc-player-emiliano',
    goalsThisTournament: 0, assistsThisTournament: 0, cleanSheets: 0,
    fantasyPoints: 18, fantasyPrice: 5.5,
    squadRole: 'SUBSTITUTE', benchSlot: null, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 6, isUnavailable: false,
  },
  {
    id: 'fp-gk-alisson', name: 'Alisson Becker', position: 'GK', club: WC_CLUBS[3]!,
    nationality: 'Brazilian', imageKey: 'wc-player-alisson',
    goalsThisTournament: 0, assistsThisTournament: 0, cleanSheets: 0,
    fantasyPoints: 16, fantasyPrice: 5.0,
    squadRole: 'SUBSTITUTE', benchSlot: null, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 4, isUnavailable: false,
  },
  {
    id: 'fp-gk-unai', name: 'Unai Simon', position: 'GK', club: WC_CLUBS[4]!,
    nationality: 'Spanish', imageKey: 'wc-player-unai',
    goalsThisTournament: 0, assistsThisTournament: 0, cleanSheets: 0,
    fantasyPoints: 19, fantasyPrice: 5.5,
    squadRole: 'SUBSTITUTE', benchSlot: null, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 10, isUnavailable: false,
  },
  {
    id: 'fp-gk-pickford', name: 'Jordan Pickford', position: 'GK', club: WC_CLUBS[5]!,
    nationality: 'English', imageKey: 'wc-player-pickford',
    goalsThisTournament: 0, assistsThisTournament: 0, cleanSheets: 0,
    fantasyPoints: 11, fantasyPrice: 4.5,
    squadRole: 'SUBSTITUTE', benchSlot: null, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 1, isUnavailable: false,
  },
  /* ── Defenders (8) ──────────────────────────────────────────────────────── */
  {
    id: 'fp-def-hernandez', name: 'Theo Hernandez', position: 'DEF', club: WC_CLUBS[0]!,
    nationality: 'French', imageKey: 'wc-player-hernandez',
    goalsThisTournament: 1, assistsThisTournament: 2, cleanSheets: 0,
    fantasyPoints: 21, fantasyPrice: 7.0,
    squadRole: 'STARTER', benchSlot: null, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 9, isUnavailable: false,
  },
  {
    id: 'fp-def-rudiger', name: 'Antonio Rudiger', position: 'DEF', club: WC_CLUBS[1]!,
    nationality: 'German', imageKey: 'wc-player-rudiger',
    goalsThisTournament: 0, assistsThisTournament: 1, cleanSheets: 0,
    fantasyPoints: 13, fantasyPrice: 5.5,
    squadRole: 'STARTER', benchSlot: null, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 4, isUnavailable: false,
  },
  {
    id: 'fp-def-molina', name: 'Nahuel Molina', position: 'DEF', club: WC_CLUBS[2]!,
    nationality: 'Argentine', imageKey: 'wc-player-molina',
    goalsThisTournament: 1, assistsThisTournament: 1, cleanSheets: 0,
    fantasyPoints: 17, fantasyPrice: 6.5,
    squadRole: 'STARTER', benchSlot: null, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 7, isUnavailable: false,
  },
  {
    id: 'fp-def-militao', name: 'Eder Militao', position: 'DEF', club: WC_CLUBS[3]!,
    nationality: 'Brazilian', imageKey: 'wc-player-militao',
    goalsThisTournament: 0, assistsThisTournament: 0, cleanSheets: 0,
    fantasyPoints: 12, fantasyPrice: 5.5,
    squadRole: 'STARTER', benchSlot: null, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 3, isUnavailable: false,
  },
  {
    id: 'fp-def-carvajal', name: 'Dani Carvajal', position: 'DEF', club: WC_CLUBS[4]!,
    nationality: 'Spanish', imageKey: 'wc-player-carvajal',
    goalsThisTournament: 0, assistsThisTournament: 2, cleanSheets: 0,
    fantasyPoints: 19, fantasyPrice: 7.0,
    squadRole: 'STARTER', benchSlot: null, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 8, isUnavailable: false,
  },
  {
    id: 'fp-def-dias', name: 'Ruben Dias', position: 'DEF', club: WC_CLUBS[6]!,
    nationality: 'Portuguese', imageKey: 'wc-player-dias-portrait',
    goalsThisTournament: 1, assistsThisTournament: 1, cleanSheets: 0,
    fantasyPoints: 15, fantasyPrice: 7.5,
    squadRole: 'SUBSTITUTE', benchSlot: 2, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 4, isUnavailable: false,
  },
  {
    id: 'fp-def-hakimi', name: 'Achraf Hakimi', position: 'DEF', club: WC_CLUBS[7]!,
    nationality: 'Moroccan', imageKey: 'wc-player-hakimi-portrait',
    goalsThisTournament: 0, assistsThisTournament: 2, cleanSheets: 0,
    fantasyPoints: 14, fantasyPrice: 6.5,
    squadRole: 'SUBSTITUTE', benchSlot: null, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 4, isUnavailable: false,
  },
  {
    id: 'fp-def-saka', name: 'Bukayo Saka', position: 'DEF', club: WC_CLUBS[5]!,
    nationality: 'English', imageKey: 'wc-player-saka',
    goalsThisTournament: 1, assistsThisTournament: 1, cleanSheets: 0,
    fantasyPoints: 17, fantasyPrice: 8.0,
    squadRole: 'SUBSTITUTE', benchSlot: null, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 5, isUnavailable: false,
  },
  /* ── Midfielders (9) ────────────────────────────────────────────────────── */
  {
    id: 'fp-mid-griezmann', name: 'Antoine Griezmann', position: 'MID', club: WC_CLUBS[0]!,
    nationality: 'French', imageKey: 'wc-player-griezmann',
    goalsThisTournament: 2, assistsThisTournament: 3, cleanSheets: 0,
    fantasyPoints: 20, fantasyPrice: 9.5,
    squadRole: 'STARTER', benchSlot: null, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 11, isUnavailable: false,
  },
  {
    id: 'fp-mid-muller', name: 'Thomas Muller', position: 'MID', club: WC_CLUBS[1]!,
    nationality: 'German', imageKey: 'wc-player-muller',
    goalsThisTournament: 1, assistsThisTournament: 2, cleanSheets: 0,
    fantasyPoints: 13, fantasyPrice: 8.0,
    squadRole: 'STARTER', benchSlot: null, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 5, isUnavailable: false,
  },
  {
    id: 'fp-mid-depay', name: 'Memphis Depay', position: 'MID', club: WC_CLUBS[2]!,
    nationality: 'Argentine', imageKey: 'wc-player-depay',
    goalsThisTournament: 1, assistsThisTournament: 1, cleanSheets: 0,
    fantasyPoints: 15, fantasyPrice: 8.5,
    squadRole: 'STARTER', benchSlot: null, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 6, isUnavailable: false,
  },
  {
    id: 'fp-mid-casemiro', name: 'Casemiro', position: 'MID', club: WC_CLUBS[3]!,
    nationality: 'Brazilian', imageKey: 'wc-player-casemiro',
    goalsThisTournament: 0, assistsThisTournament: 1, cleanSheets: 0,
    fantasyPoints: 10, fantasyPrice: 7.0,
    squadRole: 'STARTER', benchSlot: null, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 2, isUnavailable: false,
  },
  {
    id: 'fp-mid-pedri', name: 'Pedri', position: 'MID', club: WC_CLUBS[4]!,
    nationality: 'Spanish', imageKey: 'wc-player-pedri-portrait',
    goalsThisTournament: 2, assistsThisTournament: 5, cleanSheets: 0,
    fantasyPoints: 25, fantasyPrice: 10.0,
    squadRole: 'STARTER', benchSlot: null, isCaptain: false, isViceCaptain: true,
    gameweekPoints: 14, isUnavailable: false,
  },
  {
    id: 'fp-mid-bellingham', name: 'Jude Bellingham', position: 'MID', club: WC_CLUBS[5]!,
    nationality: 'English', imageKey: 'wc-player-bellingham-portrait',
    goalsThisTournament: 3, assistsThisTournament: 4, cleanSheets: 0,
    fantasyPoints: 23, fantasyPrice: 11.0,
    squadRole: 'STARTER', benchSlot: null, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 13, isUnavailable: false,
  },
  {
    id: 'fp-mid-bruno', name: 'Bruno Fernandes', position: 'MID', club: WC_CLUBS[6]!,
    nationality: 'Portuguese', imageKey: 'wc-player-bruno',
    goalsThisTournament: 1, assistsThisTournament: 3, cleanSheets: 0,
    fantasyPoints: 18, fantasyPrice: 9.0,
    squadRole: 'SUBSTITUTE', benchSlot: 3, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 6, isUnavailable: false,
  },
  {
    id: 'fp-mid-ziyech', name: 'Hakim Ziyech', position: 'MID', club: WC_CLUBS[7]!,
    nationality: 'Moroccan', imageKey: 'wc-player-ziyech',
    goalsThisTournament: 0, assistsThisTournament: 2, cleanSheets: 0,
    fantasyPoints: 12, fantasyPrice: 7.5,
    squadRole: 'SUBSTITUTE', benchSlot: null, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 4, isUnavailable: false,
  },
  {
    id: 'fp-mid-gnabry', name: 'Serge Gnabry', position: 'MID', club: WC_CLUBS[1]!,
    nationality: 'German', imageKey: 'wc-player-gnabry',
    goalsThisTournament: 1, assistsThisTournament: 0, cleanSheets: 0,
    fantasyPoints: 10, fantasyPrice: 7.5,
    squadRole: 'SUBSTITUTE', benchSlot: null, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 3, isUnavailable: true,
  },
  /* ── Forwards (7) ───────────────────────────────────────────────────────── */
  {
    id: 'fp-fwd-mbappe', name: 'Kylian Mbappe', position: 'FWD', club: WC_CLUBS[0]!,
    nationality: 'French', imageKey: 'wc-player-mbappe-portrait',
    goalsThisTournament: 5, assistsThisTournament: 2, cleanSheets: 0,
    fantasyPoints: 25, fantasyPrice: 13.0,
    squadRole: 'STARTER', benchSlot: null, isCaptain: true, isViceCaptain: false,
    gameweekPoints: 18, isUnavailable: false,
  },
  {
    id: 'fp-fwd-vinicius', name: 'Vinicius Jr', position: 'FWD', club: WC_CLUBS[3]!,
    nationality: 'Brazilian', imageKey: 'wc-player-vinicius-portrait',
    goalsThisTournament: 4, assistsThisTournament: 3, cleanSheets: 0,
    fantasyPoints: 22, fantasyPrice: 11.5,
    squadRole: 'STARTER', benchSlot: null, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 15, isUnavailable: false,
  },
  {
    id: 'fp-fwd-lewandowski', name: 'Robert Lewandowski', position: 'FWD', club: WC_CLUBS[4]!,
    nationality: 'Polish', imageKey: 'wc-player-lewandowski',
    goalsThisTournament: 2, assistsThisTournament: 0, cleanSheets: 0,
    fantasyPoints: 16, fantasyPrice: 10.0,
    squadRole: 'STARTER', benchSlot: null, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 9, isUnavailable: false,
  },
  {
    id: 'fp-fwd-kane', name: 'Harry Kane', position: 'FWD', club: WC_CLUBS[5]!,
    nationality: 'English', imageKey: 'wc-player-kane',
    goalsThisTournament: 2, assistsThisTournament: 1, cleanSheets: 0,
    fantasyPoints: 17, fantasyPrice: 11.0,
    squadRole: 'STARTER', benchSlot: null, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 10, isUnavailable: false,
  },
  {
    id: 'fp-fwd-ronaldo', name: 'Cristiano Ronaldo', position: 'FWD', club: WC_CLUBS[6]!,
    nationality: 'Portuguese', imageKey: 'wc-player-ronaldo',
    goalsThisTournament: 3, assistsThisTournament: 0, cleanSheets: 0,
    fantasyPoints: 19, fantasyPrice: 12.0,
    squadRole: 'SUBSTITUTE', benchSlot: 4, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 7, isUnavailable: false,
  },
  {
    id: 'fp-fwd-lautaro', name: 'Lautaro Martinez', position: 'FWD', club: WC_CLUBS[2]!,
    nationality: 'Argentine', imageKey: 'wc-player-lautaro',
    goalsThisTournament: 2, assistsThisTournament: 1, cleanSheets: 0,
    fantasyPoints: 15, fantasyPrice: 9.5,
    squadRole: 'SUBSTITUTE', benchSlot: null, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 6, isUnavailable: false,
  },
  {
    id: 'fp-fwd-rashford', name: 'Marcus Rashford', position: 'FWD', club: WC_CLUBS[5]!,
    nationality: 'English', imageKey: 'wc-player-rashford',
    goalsThisTournament: 1, assistsThisTournament: 0, cleanSheets: 0,
    fantasyPoints: 11, fantasyPrice: 8.5,
    squadRole: 'SUBSTITUTE', benchSlot: null, isCaptain: false, isViceCaptain: false,
    gameweekPoints: 3, isUnavailable: false,
  },
];

/* ── Mock squad (15-player active team) ─────────────────────────────────────── */

export const FANTASY_MOCK_TEAM: ExpFantasySquad = {
  teamName: 'Golden Bafana XI',
  totalPoints: 347,
  gameweekPoints: 47,
  transfersRemaining: 1,
  players: FANTASY_MOCK_PLAYERS.filter(p =>
    [
      'fp-gk-maignan',
      'fp-def-hernandez', 'fp-def-rudiger', 'fp-def-molina', 'fp-def-militao', 'fp-def-carvajal',
      'fp-mid-griezmann', 'fp-mid-muller', 'fp-mid-pedri', 'fp-mid-bellingham', 'fp-mid-depay',
      'fp-fwd-mbappe', 'fp-fwd-vinicius', 'fp-fwd-kane', 'fp-fwd-lewandowski',
    ].includes(p.id),
  ).concat(
    // bench slot assignments — override for 4 subs
    [
      { ...FANTASY_MOCK_PLAYERS.find(p => p.id === 'fp-gk-neuer')!, squadRole: 'SUBSTITUTE' as const, benchSlot: 1 },
      { ...FANTASY_MOCK_PLAYERS.find(p => p.id === 'fp-def-dias')!, squadRole: 'SUBSTITUTE' as const, benchSlot: 2 },
      { ...FANTASY_MOCK_PLAYERS.find(p => p.id === 'fp-mid-bruno')!, squadRole: 'SUBSTITUTE' as const, benchSlot: 3 },
      { ...FANTASY_MOCK_PLAYERS.find(p => p.id === 'fp-fwd-ronaldo')!, squadRole: 'SUBSTITUTE' as const, benchSlot: 4 },
    ],
  ),
};

/* ── Mock leagues ────────────────────────────────────────────────────────────── */

export const FANTASY_MOCK_LEAGUES: ExpLeague[] = [
  {
    id: 'league-private-001',
    name: 'Friends League',
    type: 'PRIVATE',
    scoringType: 'CLASSIC',
    rank: 3,
    totalManagers: 8,
    myPoints: 347,
    leaderPoints: 398,
    inviteCode: 'WC2026FRN',
  },
  {
    id: 'league-public-001',
    name: 'PSL SA League',
    type: 'PUBLIC',
    scoringType: 'CLASSIC',
    rank: 142,
    totalManagers: 1024,
    myPoints: 347,
    leaderPoints: 512,
    inviteCode: null,
  },
  {
    id: 'league-global-001',
    name: 'Global WC 2026',
    type: 'GLOBAL',
    scoringType: 'CLASSIC',
    rank: 88403,
    totalManagers: 2000000,
    myPoints: 347,
    leaderPoints: 743,
    inviteCode: null,
  },
];

/* ── Mock chips ──────────────────────────────────────────────────────────────── */

export const FANTASY_MOCK_CHIPS: ExpChip[] = [
  { type: 'BENCH_BOOST',     status: 'AVAILABLE', usedInGameweek: null },
  { type: 'FREE_HIT',        status: 'AVAILABLE', usedInGameweek: null },
  { type: 'TRIPLE_CAPTAIN',  status: 'AVAILABLE', usedInGameweek: null },
  { type: 'WILDCARD',        status: 'USED',       usedInGameweek: 1    },
];

/* ── Mock history (10 gameweeks) ─────────────────────────────────────────────── */

export const FANTASY_MOCK_HISTORY: ExpHistoryEntry[] = [
  { gameweekNumber: 1, gameweekLabel: 'Matchday 1', points: 45, totalPoints: 45,   rank: 120000, transfers: 0, transferCost: 0, chipUsed: 'WILDCARD' },
  { gameweekNumber: 2, gameweekLabel: 'Matchday 2', points: 58, totalPoints: 103,  rank: 98500,  transfers: 1, transferCost: 0, chipUsed: null },
  { gameweekNumber: 3, gameweekLabel: 'Matchday 3', points: 67, totalPoints: 170,  rank: 81200,  transfers: 2, transferCost: 4, chipUsed: null },
  { gameweekNumber: 4, gameweekLabel: 'Matchday 4', points: 52, totalPoints: 222,  rank: 88100,  transfers: 1, transferCost: 0, chipUsed: null },
  { gameweekNumber: 5, gameweekLabel: 'Matchday 5', points: 61, totalPoints: 283,  rank: 79400,  transfers: 1, transferCost: 0, chipUsed: null },
  { gameweekNumber: 6, gameweekLabel: 'Round of 16 — 1', points: 49, totalPoints: 332, rank: 85700, transfers: 2, transferCost: 4, chipUsed: null },
  { gameweekNumber: 7, gameweekLabel: 'Round of 16 — 2', points: 63, totalPoints: 395, rank: 76300, transfers: 1, transferCost: 0, chipUsed: null },
  { gameweekNumber: 8, gameweekLabel: 'Quarter-finals',  points: 54, totalPoints: 449, rank: 83900, transfers: 0, transferCost: 0, chipUsed: null },
  { gameweekNumber: 9, gameweekLabel: 'Semi-finals',     points: 47, totalPoints: 496, rank: 88403, transfers: 1, transferCost: 0, chipUsed: null },
  { gameweekNumber: 10, gameweekLabel: 'Final',          points: 47, totalPoints: 543, rank: 88403, transfers: 0, transferCost: 0, chipUsed: null },
];

/* ── Mock FDR (8 clubs × 6 upcoming gameweeks) ───────────────────────────────── */

export const FANTASY_MOCK_FDR: ExpFDREntry[] = [
  {
    club: WC_CLUBS[0]!, // France
    fixtures: [
      { gameweekNumber: 4, opponentAbbr: 'MAR', isHome: true,  difficulty: 2 },
      { gameweekNumber: 5, opponentAbbr: 'ESP', isHome: false, difficulty: 4 },
      { gameweekNumber: 6, opponentAbbr: 'BRA', isHome: true,  difficulty: 3 },
      { gameweekNumber: 7, opponentAbbr: 'GER', isHome: false, difficulty: 3 },
      { gameweekNumber: 8, opponentAbbr: 'ARG', isHome: true,  difficulty: 4 },
      { gameweekNumber: 9, opponentAbbr: 'ENG', isHome: false, difficulty: 3 },
    ],
  },
  {
    club: WC_CLUBS[1]!, // Germany
    fixtures: [
      { gameweekNumber: 4, opponentAbbr: 'POR', isHome: false, difficulty: 3 },
      { gameweekNumber: 5, opponentAbbr: 'BRA', isHome: true,  difficulty: 4 },
      { gameweekNumber: 6, opponentAbbr: 'ENG', isHome: false, difficulty: 3 },
      { gameweekNumber: 7, opponentAbbr: 'FRA', isHome: true,  difficulty: 3 },
      { gameweekNumber: 8, opponentAbbr: 'MAR', isHome: false, difficulty: 1 },
      { gameweekNumber: 9, opponentAbbr: 'ESP', isHome: true,  difficulty: 4 },
    ],
  },
  {
    club: WC_CLUBS[2]!, // Argentina
    fixtures: [
      { gameweekNumber: 4, opponentAbbr: 'ENG', isHome: true,  difficulty: 3 },
      { gameweekNumber: 5, opponentAbbr: 'MAR', isHome: false, difficulty: 2 },
      { gameweekNumber: 6, opponentAbbr: 'POR', isHome: true,  difficulty: 3 },
      { gameweekNumber: 7, opponentAbbr: 'ESP', isHome: false, difficulty: 4 },
      { gameweekNumber: 8, opponentAbbr: 'FRA', isHome: false, difficulty: 4 },
      { gameweekNumber: 9, opponentAbbr: 'BRA', isHome: true,  difficulty: 5 },
    ],
  },
  {
    club: WC_CLUBS[3]!, // Brazil
    fixtures: [
      { gameweekNumber: 4, opponentAbbr: 'ESP', isHome: false, difficulty: 4 },
      { gameweekNumber: 5, opponentAbbr: 'GER', isHome: false, difficulty: 4 },
      { gameweekNumber: 6, opponentAbbr: 'FRA', isHome: false, difficulty: 3 },
      { gameweekNumber: 7, opponentAbbr: 'MAR', isHome: true,  difficulty: 1 },
      { gameweekNumber: 8, opponentAbbr: 'POR', isHome: false, difficulty: 3 },
      { gameweekNumber: 9, opponentAbbr: 'ARG', isHome: false, difficulty: 5 },
    ],
  },
  {
    club: WC_CLUBS[4]!, // Spain
    fixtures: [
      { gameweekNumber: 4, opponentAbbr: 'BRA', isHome: true,  difficulty: 4 },
      { gameweekNumber: 5, opponentAbbr: 'FRA', isHome: true,  difficulty: 4 },
      { gameweekNumber: 6, opponentAbbr: 'ARG', isHome: false, difficulty: 4 },
      { gameweekNumber: 7, opponentAbbr: 'POR', isHome: true,  difficulty: 3 },
      { gameweekNumber: 8, opponentAbbr: 'ENG', isHome: true,  difficulty: 3 },
      { gameweekNumber: 9, opponentAbbr: 'GER', isHome: false, difficulty: 4 },
    ],
  },
  {
    club: WC_CLUBS[5]!, // England
    fixtures: [
      { gameweekNumber: 4, opponentAbbr: 'ARG', isHome: false, difficulty: 3 },
      { gameweekNumber: 5, opponentAbbr: 'POR', isHome: true,  difficulty: 3 },
      { gameweekNumber: 6, opponentAbbr: 'GER', isHome: true,  difficulty: 3 },
      { gameweekNumber: 7, opponentAbbr: 'MAR', isHome: false, difficulty: 1 },
      { gameweekNumber: 8, opponentAbbr: 'ESP', isHome: false, difficulty: 3 },
      { gameweekNumber: 9, opponentAbbr: 'FRA', isHome: true,  difficulty: 3 },
    ],
  },
  {
    club: WC_CLUBS[6]!, // Portugal
    fixtures: [
      { gameweekNumber: 4, opponentAbbr: 'GER', isHome: true,  difficulty: 3 },
      { gameweekNumber: 5, opponentAbbr: 'ENG', isHome: false, difficulty: 3 },
      { gameweekNumber: 6, opponentAbbr: 'ARG', isHome: false, difficulty: 3 },
      { gameweekNumber: 7, opponentAbbr: 'ESP', isHome: false, difficulty: 4 },
      { gameweekNumber: 8, opponentAbbr: 'BRA', isHome: true,  difficulty: 3 },
      { gameweekNumber: 9, opponentAbbr: 'MAR', isHome: true,  difficulty: 1 },
    ],
  },
  {
    club: WC_CLUBS[7]!, // Morocco
    fixtures: [
      { gameweekNumber: 4, opponentAbbr: 'FRA', isHome: false, difficulty: 2 },
      { gameweekNumber: 5, opponentAbbr: 'ARG', isHome: true,  difficulty: 2 },
      { gameweekNumber: 6, opponentAbbr: 'BRA', isHome: false, difficulty: 2 },
      { gameweekNumber: 7, opponentAbbr: 'ENG', isHome: true,  difficulty: 1 },
      { gameweekNumber: 8, opponentAbbr: 'GER', isHome: true,  difficulty: 1 },
      { gameweekNumber: 9, opponentAbbr: 'POR', isHome: false, difficulty: 1 },
    ],
  },
];

/* ── Mock league standings ───────────────────────────────────────────────────── */

export const FANTASY_MOCK_STANDINGS: ExpLeagueManager[] = [
  { rank: 1, previousRank: 2, managerName: 'Sipho Dlamini',   teamName: 'Bafana Bafana XI',  gameweekPoints: 78, totalPoints: 1428, isMe: false },
  { rank: 2, previousRank: 1, managerName: 'Lerato Mokoena',  teamName: 'Soweto Stars',       gameweekPoints: 71, totalPoints: 1371, isMe: false },
  { rank: 3, previousRank: 3, managerName: 'You',             teamName: 'My WC Fantasy Team', gameweekPoints: 64, totalPoints: 1247, isMe: true  },
  { rank: 4, previousRank: 5, managerName: 'Thabo Nkosi',     teamName: 'Golden Squad',       gameweekPoints: 59, totalPoints: 1188, isMe: false },
  { rank: 5, previousRank: 4, managerName: 'Nomsa Vilakazi',  teamName: 'Atlas Lions FC',     gameweekPoints: 55, totalPoints: 1102, isMe: false },
  { rank: 6, previousRank: 6, managerName: 'Kagiso Sithole',  teamName: 'Mzansi Magic',       gameweekPoints: 48, totalPoints: 984,  isMe: false },
  { rank: 7, previousRank: 7, managerName: 'Zanele Mbatha',   teamName: 'Phoenix Rising',     gameweekPoints: 41, totalPoints: 879,  isMe: false },
  { rank: 8, previousRank: 8, managerName: 'Bongani Khoza',   teamName: 'Tribal Warriors',    gameweekPoints: 37, totalPoints: 723,  isMe: false },
];
