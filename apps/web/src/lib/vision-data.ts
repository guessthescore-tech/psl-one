/**
 * DESIGN_REVIEW_DATA — static mock data for PSL One Vision Studio.
 * No API calls are made when using this data set.
 * Used when NEXT_PUBLIC_DATA_MODE !== 'LIVE_BETA_DATA'.
 */

export interface VisionClub {
  id: string;
  name: string;
  shortName: string;
  city: string;
  primaryColor: string;
  accentColor: string;
  founded: number;
  stadium: string;
  abbr: string;
}

export interface VisionFixture {
  id: string;
  homeClub: VisionClub;
  awayClub: VisionClub;
  kickoffAt: string;
  status: 'SCHEDULED' | 'LIVE' | 'HALF_TIME' | 'FINISHED';
  homeScore: number | null;
  awayScore: number | null;
  minute: number | null;
  venue: string;
  gameweek: number;
}

export interface VisionStanding {
  position: number;
  club: VisionClub;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  form: Array<'W' | 'D' | 'L'>;
}

export interface VisionPlayer {
  id: string;
  name: string;
  position: string;
  club: VisionClub;
  nationality: string;
  imageKey: string;
  goalsThisSeason: number;
  assistsThisSeason: number;
  fantasyPoints: number;
  fantasyPrice: number;
  rating: number;
}

export interface VisionMediaStory {
  id: string;
  title: string;
  category: string;
  imageKey: string;
  publishedAt: string;
  readTime: number;
  featured: boolean;
}

export interface VisionGameweek {
  number: number;
  label: string;
  deadlineAt: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  averagePoints: number;
  highestPoints: number;
}

export interface VisionFanValue {
  total: number;
  rank: number;
  breakdown: {
    predictions: number;
    fantasy: number;
    social: number;
    attendance: number;
  };
  level: string;
  nextLevel: string;
  progressPercent: number;
}

/* ── Clubs ──────────────────────────────────────────────────────── */

export const PSL_CLUBS: VisionClub[] = [
  { id: 'sundowns',   name: 'Mamelodi Sundowns',  shortName: 'Sundowns', city: 'Tshwane',      primaryColor: '#FFD700', accentColor: '#006400', founded: 1970, stadium: 'Loftus Versfeld',           abbr: 'MAS' },
  { id: 'pirates',    name: 'Orlando Pirates',    shortName: 'Pirates',  city: 'Johannesburg', primaryColor: '#000000', accentColor: '#FF0000', founded: 1937, stadium: 'Orlando Stadium',             abbr: 'ORP' },
  { id: 'chiefs',     name: 'Kaizer Chiefs',      shortName: 'Chiefs',   city: 'Johannesburg', primaryColor: '#FFD700', accentColor: '#000000', founded: 1970, stadium: 'FNB Stadium',                 abbr: 'KAI' },
  { id: 'ct-city',    name: 'Cape Town City FC',  shortName: 'CT City',  city: 'Cape Town',    primaryColor: '#00A3E0', accentColor: '#FFFFFF', founded: 2016, stadium: 'DHL Newlands',               abbr: 'CTC' },
  { id: 'stellies',   name: 'Stellenbosch FC',    shortName: 'Stellies', city: 'Stellenbosch', primaryColor: '#8B0000', accentColor: '#FFFFFF', founded: 1994, stadium: 'Danie Craven Stadium',        abbr: 'SFC' },
  { id: 'supersport', name: 'SuperSport United',  shortName: 'Matsatsantsa', city: 'Pretoria', primaryColor: '#00529B', accentColor: '#FFFFFF', founded: 1994, stadium: 'Lucas Moripe Stadium',       abbr: 'SSU' },
  { id: 'amazulu',    name: 'AmaZulu FC',         shortName: 'AmaZulu',  city: 'Durban',       primaryColor: '#000000', accentColor: '#FFD700', founded: 1932, stadium: 'Moses Mabhida Stadium',       abbr: 'AMZ' },
  { id: 'galaxy',     name: 'TS Galaxy',          shortName: 'Galaxy',   city: 'Mpumalanga',   primaryColor: '#FF6600', accentColor: '#FFFFFF', founded: 2017, stadium: 'Mbombela Stadium',            abbr: 'TSG' },
  { id: 'sekhukhune', name: 'Sekhukhune United',  shortName: 'Sekhukhune', city: 'Limpopo',   primaryColor: '#CC0000', accentColor: '#000000', founded: 2020, stadium: 'Peter Mokaba Stadium',        abbr: 'SEK' },
  { id: 'arrows',     name: 'Golden Arrows',      shortName: 'Arrows',   city: 'Durban',       primaryColor: '#FFDF00', accentColor: '#008000', founded: 1943, stadium: 'Princess Magogo Stadium',     abbr: 'GAR' },
  { id: 'chippa',     name: 'Chippa United',      shortName: 'Chippa',   city: 'Gqeberha',    primaryColor: '#FF6600', accentColor: '#000000', founded: 2010, stadium: 'Nelson Mandela Bay Stadium',  abbr: 'CHI' },
  { id: 'polokwane',  name: 'Polokwane City',     shortName: 'Rise & Shine', city: 'Polokwane', primaryColor: '#006400', accentColor: '#FFD700', founded: 1978, stadium: 'Peter Mokaba Stadium',   abbr: 'POL' },
  { id: 'ct-spurs',   name: 'Cape Town Spurs',    shortName: 'Spurs',    city: 'Cape Town',    primaryColor: '#003087', accentColor: '#FFFFFF', founded: 1990, stadium: 'Athlone Stadium',             abbr: 'CTS' },
  { id: 'rb-fc',      name: 'Richards Bay FC',    shortName: 'Umhla',    city: 'Richards Bay', primaryColor: '#000080', accentColor: '#FFFFFF', founded: 2018, stadium: 'King Zwelithini Stadium',    abbr: 'RBF' },
  { id: 'swallows',   name: 'Moroka Swallows',    shortName: 'Swallows', city: 'Soweto',       primaryColor: '#CC0000', accentColor: '#FFFFFF', founded: 1947, stadium: 'Dobsonville Stadium',         abbr: 'MOR' },
  { id: 'royal-am',   name: 'Royal AM',           shortName: 'Royal AM', city: 'Pietermaritzburg', primaryColor: '#800080', accentColor: '#FFD700', founded: 1990, stadium: 'Harry Gwala Stadium', abbr: 'RAM' },
];

const [sundowns, pirates, chiefs, ctCity, stellies, supersport, amazulu, galaxy, sekhukhune, arrows, chippa, polokwane, ctSpurs, rbfc, swallows, royalAm] = PSL_CLUBS as [VisionClub, VisionClub, VisionClub, VisionClub, VisionClub, VisionClub, VisionClub, VisionClub, VisionClub, VisionClub, VisionClub, VisionClub, VisionClub, VisionClub, VisionClub, VisionClub];

/* ── Fixtures ───────────────────────────────────────────────────── */

export const PSL_FIXTURES: VisionFixture[] = [
  {
    id: 'f1',
    homeClub: sundowns,
    awayClub: pirates,
    kickoffAt: '2026-06-20T17:30:00+02:00',
    status: 'LIVE',
    homeScore: 2,
    awayScore: 1,
    minute: 67,
    venue: 'Loftus Versfeld',
    gameweek: 32,
  },
  {
    id: 'f2',
    homeClub: chiefs,
    awayClub: amazulu,
    kickoffAt: '2026-06-20T19:30:00+02:00',
    status: 'SCHEDULED',
    homeScore: null,
    awayScore: null,
    minute: null,
    venue: 'FNB Stadium',
    gameweek: 32,
  },
  {
    id: 'f3',
    homeClub: ctCity,
    awayClub: stellies,
    kickoffAt: '2026-06-21T15:00:00+02:00',
    status: 'SCHEDULED',
    homeScore: null,
    awayScore: null,
    minute: null,
    venue: 'DHL Newlands',
    gameweek: 32,
  },
  {
    id: 'f4',
    homeClub: supersport,
    awayClub: sekhukhune,
    kickoffAt: '2026-06-21T17:30:00+02:00',
    status: 'SCHEDULED',
    homeScore: null,
    awayScore: null,
    minute: null,
    venue: 'Lucas Moripe Stadium',
    gameweek: 32,
  },
  {
    id: 'f5',
    homeClub: amazulu,
    awayClub: arrows,
    kickoffAt: '2026-06-22T15:00:00+02:00',
    status: 'SCHEDULED',
    homeScore: null,
    awayScore: null,
    minute: null,
    venue: 'Moses Mabhida Stadium',
    gameweek: 32,
  },
  {
    id: 'f6',
    homeClub: galaxy,
    awayClub: chippa,
    kickoffAt: '2026-06-22T17:30:00+02:00',
    status: 'SCHEDULED',
    homeScore: null,
    awayScore: null,
    minute: null,
    venue: 'Mbombela Stadium',
    gameweek: 32,
  },
];

/* ── Standings ──────────────────────────────────────────────────── */

export const PSL_STANDINGS: VisionStanding[] = [
  { position: 1, club: sundowns,   played: 31, won: 22, drawn: 6, lost: 3, gf: 68, ga: 22, gd: 46, points: 72, form: ['W','W','W','D','W'] },
  { position: 2, club: pirates,    played: 31, won: 18, drawn: 8, lost: 5, gf: 54, ga: 28, gd: 26, points: 62, form: ['W','W','D','W','L'] },
  { position: 3, club: chiefs,     played: 31, won: 17, drawn: 7, lost: 7, gf: 49, ga: 33, gd: 16, points: 58, form: ['D','W','W','L','W'] },
  { position: 4, club: ctCity,     played: 31, won: 15, drawn: 9, lost: 7, gf: 45, ga: 31, gd: 14, points: 54, form: ['W','D','W','D','W'] },
  { position: 5, club: stellies,   played: 31, won: 14, drawn: 9, lost: 8, gf: 41, ga: 34, gd: 7,  points: 51, form: ['L','W','D','W','D'] },
  { position: 6, club: supersport, played: 31, won: 13, drawn: 8, lost: 10, gf: 37, ga: 38, gd: -1, points: 47, form: ['W','L','W','L','W'] },
  { position: 7, club: amazulu,    played: 31, won: 11, drawn: 9, lost: 11, gf: 33, ga: 39, gd: -6, points: 42, form: ['D','L','W','D','L'] },
  { position: 8, club: sekhukhune, played: 31, won: 10, drawn: 9, lost: 12, gf: 31, ga: 41, gd: -10, points: 39, form: ['L','D','L','W','D'] },
];

/* ── Players ────────────────────────────────────────────────────── */

export const PSL_PLAYERS: VisionPlayer[] = [
  { id: 'p1', name: 'Themba Zwane',      position: 'MID', club: sundowns,   nationality: 'ZA', imageKey: 'football-player-action-1',  goalsThisSeason: 14, assistsThisSeason: 11, fantasyPoints: 218, fantasyPrice: 12.5, rating: 8.9 },
  { id: 'p2', name: 'Evidence Makgopa',  position: 'FWD', club: pirates,    nationality: 'ZA', imageKey: 'football-player-action-2',  goalsThisSeason: 18, assistsThisSeason: 5,  fantasyPoints: 204, fantasyPrice: 11.0, rating: 8.7 },
  { id: 'p3', name: 'Khanyisa Mayo',     position: 'FWD', club: ctCity,     nationality: 'ZA', imageKey: 'football-player-action-3',  goalsThisSeason: 16, assistsThisSeason: 7,  fantasyPoints: 197, fantasyPrice: 10.5, rating: 8.6 },
  { id: 'p4', name: 'Yusuf Maart',       position: 'MID', club: sekhukhune, nationality: 'ZA', imageKey: 'football-player-action-4',  goalsThisSeason: 9,  assistsThisSeason: 13, fantasyPoints: 188, fantasyPrice: 9.5,  rating: 8.4 },
  { id: 'p5', name: 'Neo Maema',         position: 'MID', club: sundowns,   nationality: 'ZA', imageKey: 'football-player-action-5',  goalsThisSeason: 7,  assistsThisSeason: 14, fantasyPoints: 181, fantasyPrice: 9.0,  rating: 8.3 },
  { id: 'p6', name: 'Tebogo Langerman',  position: 'DEF', club: pirates,    nationality: 'ZA', imageKey: 'football-player-action-6',  goalsThisSeason: 3,  assistsThisSeason: 8,  fantasyPoints: 174, fantasyPrice: 7.5,  rating: 8.1 },
];

/* ── Media Stories ──────────────────────────────────────────────── */

export const PSL_STORIES: VisionMediaStory[] = [
  { id: 's1', title: 'Sundowns extend lead with commanding win over Pirates', category: 'Match Report', imageKey: 'football-stadium-1', publishedAt: '2026-06-20T19:45:00Z', readTime: 4, featured: true },
  { id: 's2', title: 'Zwane on course for Player of the Season award', category: 'Feature', imageKey: 'football-player-portrait-1', publishedAt: '2026-06-19T10:00:00Z', readTime: 6, featured: false },
  { id: 's3', title: 'Chiefs confirm new attacking recruit ahead of derby', category: 'Transfer', imageKey: 'football-transfer-1', publishedAt: '2026-06-18T14:30:00Z', readTime: 3, featured: false },
  { id: 's4', title: 'Cape Town City\'s remarkable DHL Newlands unbeaten run', category: 'Analysis', imageKey: 'football-stadium-2', publishedAt: '2026-06-17T09:00:00Z', readTime: 5, featured: false },
  { id: 's5', title: 'Makgopa targets golden boot in final six matches', category: 'Interview', imageKey: 'football-player-portrait-2', publishedAt: '2026-06-16T12:00:00Z', readTime: 4, featured: false },
];

/* ── Gameweek ────────────────────────────────────────────────────── */

export const CURRENT_GAMEWEEK: VisionGameweek = {
  number: 32,
  label: 'Gameweek 32',
  deadlineAt: '2026-06-20T14:00:00+02:00',
  status: 'ACTIVE',
  averagePoints: 47,
  highestPoints: 112,
};

/* ── Fan Value ───────────────────────────────────────────────────── */

export const MOCK_FAN_VALUE: VisionFanValue = {
  total: 4820,
  rank: 1247,
  breakdown: {
    predictions: 1840,
    fantasy: 2110,
    social: 570,
    attendance: 300,
  },
  level: 'Gold Fan',
  nextLevel: 'Platinum Fan',
  progressPercent: 64,
};

/* ── Picsum image helper ─────────────────────────────────────────── */

export function visionImg(seed: string, w: number, h: number): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

/* ── Data mode ───────────────────────────────────────────────────── */

export type DataMode = 'DESIGN_REVIEW_DATA' | 'LIVE_BETA_DATA';

export function getDataMode(): DataMode {
  return process.env['NEXT_PUBLIC_DATA_MODE'] === 'LIVE_BETA_DATA'
    ? 'LIVE_BETA_DATA'
    : 'DESIGN_REVIEW_DATA';
}
