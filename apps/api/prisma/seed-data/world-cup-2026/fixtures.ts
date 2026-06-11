// All 104 FIFA World Cup 2026 fixtures
// Kickoff times in UTC (source: official FIFA/ESPN schedule, group stage only has confirmed teams)
// Knockout fixtures use 'TBD' for home/away team — updated when teams qualify

export type FixtureDef = {
  matchNumber: number;
  round: string;
  group?: string;
  matchday?: number;
  homeTeam: string;   // externalId or 'TBD'
  awayTeam: string;   // externalId or 'TBD'
  kickoffAt: string;  // ISO 8601 UTC
  venueId: string;    // venue externalId
  source: string;
};

// ── GROUP STAGE — 72 matches ─────────────────────────────────────────────────
// All kickoffs converted from ET (UTC-4) to UTC

export const GROUP_STAGE: FixtureDef[] = [
  // ── Group A ────────────────────────────────────────────────────────────────
  { matchNumber:  1, round: 'GROUP', group: 'A', matchday: 1, homeTeam: 'MEX', awayTeam: 'RSA', kickoffAt: '2026-06-11T19:00:00Z', venueId: 'estadio-azteca',          source: 'fifa-wc2026' },
  { matchNumber:  2, round: 'GROUP', group: 'A', matchday: 1, homeTeam: 'KOR', awayTeam: 'CZE', kickoffAt: '2026-06-12T02:00:00Z', venueId: 'estadio-akron',            source: 'fifa-wc2026' },
  { matchNumber: 25, round: 'GROUP', group: 'A', matchday: 2, homeTeam: 'CZE', awayTeam: 'RSA', kickoffAt: '2026-06-18T16:00:00Z', venueId: 'mercedes-benz-stadium',    source: 'fifa-wc2026' },
  { matchNumber: 28, round: 'GROUP', group: 'A', matchday: 2, homeTeam: 'MEX', awayTeam: 'KOR', kickoffAt: '2026-06-19T03:00:00Z', venueId: 'estadio-akron',            source: 'fifa-wc2026' },
  { matchNumber: 53, round: 'GROUP', group: 'A', matchday: 3, homeTeam: 'CZE', awayTeam: 'MEX', kickoffAt: '2026-06-25T01:00:00Z', venueId: 'estadio-azteca',           source: 'fifa-wc2026' },
  { matchNumber: 54, round: 'GROUP', group: 'A', matchday: 3, homeTeam: 'RSA', awayTeam: 'KOR', kickoffAt: '2026-06-25T01:00:00Z', venueId: 'estadio-bbva',             source: 'fifa-wc2026' },

  // ── Group B ────────────────────────────────────────────────────────────────
  { matchNumber:  3, round: 'GROUP', group: 'B', matchday: 1, homeTeam: 'CAN', awayTeam: 'BIH', kickoffAt: '2026-06-12T19:00:00Z', venueId: 'bmo-field',                source: 'fifa-wc2026' },
  { matchNumber:  5, round: 'GROUP', group: 'B', matchday: 1, homeTeam: 'QAT', awayTeam: 'SUI', kickoffAt: '2026-06-13T19:00:00Z', venueId: 'levis-stadium',            source: 'fifa-wc2026' },
  { matchNumber: 26, round: 'GROUP', group: 'B', matchday: 2, homeTeam: 'SUI', awayTeam: 'BIH', kickoffAt: '2026-06-18T19:00:00Z', venueId: 'sofi-stadium',             source: 'fifa-wc2026' },
  { matchNumber: 27, round: 'GROUP', group: 'B', matchday: 2, homeTeam: 'CAN', awayTeam: 'QAT', kickoffAt: '2026-06-18T22:00:00Z', venueId: 'bc-place',                 source: 'fifa-wc2026' },
  { matchNumber: 49, round: 'GROUP', group: 'B', matchday: 3, homeTeam: 'SUI', awayTeam: 'CAN', kickoffAt: '2026-06-24T19:00:00Z', venueId: 'bc-place',                 source: 'fifa-wc2026' },
  { matchNumber: 50, round: 'GROUP', group: 'B', matchday: 3, homeTeam: 'BIH', awayTeam: 'QAT', kickoffAt: '2026-06-24T19:00:00Z', venueId: 'lumen-field',              source: 'fifa-wc2026' },

  // ── Group C ────────────────────────────────────────────────────────────────
  { matchNumber:  6, round: 'GROUP', group: 'C', matchday: 1, homeTeam: 'BRA', awayTeam: 'MAR', kickoffAt: '2026-06-13T22:00:00Z', venueId: 'metlife-stadium',          source: 'fifa-wc2026' },
  { matchNumber:  7, round: 'GROUP', group: 'C', matchday: 1, homeTeam: 'HAI', awayTeam: 'SCO', kickoffAt: '2026-06-14T01:00:00Z', venueId: 'gillette-stadium',         source: 'fifa-wc2026' },
  { matchNumber: 30, round: 'GROUP', group: 'C', matchday: 2, homeTeam: 'SCO', awayTeam: 'MAR', kickoffAt: '2026-06-19T22:00:00Z', venueId: 'gillette-stadium',         source: 'fifa-wc2026' },
  { matchNumber: 31, round: 'GROUP', group: 'C', matchday: 2, homeTeam: 'BRA', awayTeam: 'HAI', kickoffAt: '2026-06-20T01:00:00Z', venueId: 'lincoln-financial-field',  source: 'fifa-wc2026' },
  { matchNumber: 51, round: 'GROUP', group: 'C', matchday: 3, homeTeam: 'SCO', awayTeam: 'BRA', kickoffAt: '2026-06-24T22:00:00Z', venueId: 'hard-rock-stadium',        source: 'fifa-wc2026' },
  { matchNumber: 52, round: 'GROUP', group: 'C', matchday: 3, homeTeam: 'MAR', awayTeam: 'HAI', kickoffAt: '2026-06-24T22:00:00Z', venueId: 'mercedes-benz-stadium',    source: 'fifa-wc2026' },

  // ── Group D ────────────────────────────────────────────────────────────────
  { matchNumber:  4, round: 'GROUP', group: 'D', matchday: 1, homeTeam: 'USA', awayTeam: 'PAR', kickoffAt: '2026-06-13T01:00:00Z', venueId: 'sofi-stadium',             source: 'fifa-wc2026' },
  { matchNumber:  8, round: 'GROUP', group: 'D', matchday: 1, homeTeam: 'AUS', awayTeam: 'TUR', kickoffAt: '2026-06-13T04:00:00Z', venueId: 'bc-place',                 source: 'fifa-wc2026' },
  { matchNumber: 29, round: 'GROUP', group: 'D', matchday: 2, homeTeam: 'USA', awayTeam: 'AUS', kickoffAt: '2026-06-19T19:00:00Z', venueId: 'lumen-field',              source: 'fifa-wc2026' },
  { matchNumber: 32, round: 'GROUP', group: 'D', matchday: 2, homeTeam: 'TUR', awayTeam: 'PAR', kickoffAt: '2026-06-20T04:00:00Z', venueId: 'levis-stadium',            source: 'fifa-wc2026' },
  { matchNumber: 59, round: 'GROUP', group: 'D', matchday: 3, homeTeam: 'TUR', awayTeam: 'USA', kickoffAt: '2026-06-26T02:00:00Z', venueId: 'sofi-stadium',             source: 'fifa-wc2026' },
  { matchNumber: 60, round: 'GROUP', group: 'D', matchday: 3, homeTeam: 'PAR', awayTeam: 'AUS', kickoffAt: '2026-06-26T02:00:00Z', venueId: 'levis-stadium',            source: 'fifa-wc2026' },

  // ── Group E ────────────────────────────────────────────────────────────────
  { matchNumber:  9, round: 'GROUP', group: 'E', matchday: 1, homeTeam: 'GER', awayTeam: 'CUW', kickoffAt: '2026-06-14T17:00:00Z', venueId: 'nrg-stadium',              source: 'fifa-wc2026' },
  { matchNumber: 11, round: 'GROUP', group: 'E', matchday: 1, homeTeam: 'CIV', awayTeam: 'ECU', kickoffAt: '2026-06-14T23:00:00Z', venueId: 'lincoln-financial-field',  source: 'fifa-wc2026' },
  { matchNumber: 34, round: 'GROUP', group: 'E', matchday: 2, homeTeam: 'GER', awayTeam: 'CIV', kickoffAt: '2026-06-20T20:00:00Z', venueId: 'bmo-field',                source: 'fifa-wc2026' },
  { matchNumber: 35, round: 'GROUP', group: 'E', matchday: 2, homeTeam: 'ECU', awayTeam: 'CUW', kickoffAt: '2026-06-21T00:00:00Z', venueId: 'arrowhead-stadium',        source: 'fifa-wc2026' },
  { matchNumber: 55, round: 'GROUP', group: 'E', matchday: 3, homeTeam: 'ECU', awayTeam: 'GER', kickoffAt: '2026-06-25T20:00:00Z', venueId: 'metlife-stadium',          source: 'fifa-wc2026' },
  { matchNumber: 56, round: 'GROUP', group: 'E', matchday: 3, homeTeam: 'CUW', awayTeam: 'CIV', kickoffAt: '2026-06-25T20:00:00Z', venueId: 'lincoln-financial-field',  source: 'fifa-wc2026' },

  // ── Group F ────────────────────────────────────────────────────────────────
  { matchNumber: 10, round: 'GROUP', group: 'F', matchday: 1, homeTeam: 'NED', awayTeam: 'JPN', kickoffAt: '2026-06-14T20:00:00Z', venueId: 'att-stadium',              source: 'fifa-wc2026' },
  { matchNumber: 12, round: 'GROUP', group: 'F', matchday: 1, homeTeam: 'SWE', awayTeam: 'TUN', kickoffAt: '2026-06-15T02:00:00Z', venueId: 'estadio-bbva',             source: 'fifa-wc2026' },
  { matchNumber: 33, round: 'GROUP', group: 'F', matchday: 2, homeTeam: 'NED', awayTeam: 'SWE', kickoffAt: '2026-06-20T17:00:00Z', venueId: 'nrg-stadium',              source: 'fifa-wc2026' },
  { matchNumber: 36, round: 'GROUP', group: 'F', matchday: 2, homeTeam: 'TUN', awayTeam: 'JPN', kickoffAt: '2026-06-21T04:00:00Z', venueId: 'estadio-bbva',             source: 'fifa-wc2026' },
  { matchNumber: 57, round: 'GROUP', group: 'F', matchday: 3, homeTeam: 'JPN', awayTeam: 'SWE', kickoffAt: '2026-06-25T23:00:00Z', venueId: 'att-stadium',              source: 'fifa-wc2026' },
  { matchNumber: 58, round: 'GROUP', group: 'F', matchday: 3, homeTeam: 'TUN', awayTeam: 'NED', kickoffAt: '2026-06-25T23:00:00Z', venueId: 'arrowhead-stadium',        source: 'fifa-wc2026' },

  // ── Group G ────────────────────────────────────────────────────────────────
  { matchNumber: 14, round: 'GROUP', group: 'G', matchday: 1, homeTeam: 'BEL', awayTeam: 'EGY', kickoffAt: '2026-06-15T22:00:00Z', venueId: 'lumen-field',              source: 'fifa-wc2026' },
  { matchNumber: 16, round: 'GROUP', group: 'G', matchday: 1, homeTeam: 'IRN', awayTeam: 'NZL', kickoffAt: '2026-06-16T02:00:00Z', venueId: 'sofi-stadium',             source: 'fifa-wc2026' },
  { matchNumber: 38, round: 'GROUP', group: 'G', matchday: 2, homeTeam: 'BEL', awayTeam: 'IRN', kickoffAt: '2026-06-21T19:00:00Z', venueId: 'sofi-stadium',             source: 'fifa-wc2026' },
  { matchNumber: 40, round: 'GROUP', group: 'G', matchday: 2, homeTeam: 'NZL', awayTeam: 'EGY', kickoffAt: '2026-06-22T01:00:00Z', venueId: 'bc-place',                 source: 'fifa-wc2026' },
  { matchNumber: 65, round: 'GROUP', group: 'G', matchday: 3, homeTeam: 'EGY', awayTeam: 'IRN', kickoffAt: '2026-06-27T03:00:00Z', venueId: 'lumen-field',              source: 'fifa-wc2026' },
  { matchNumber: 66, round: 'GROUP', group: 'G', matchday: 3, homeTeam: 'NZL', awayTeam: 'BEL', kickoffAt: '2026-06-27T03:00:00Z', venueId: 'bc-place',                 source: 'fifa-wc2026' },

  // ── Group H ────────────────────────────────────────────────────────────────
  { matchNumber: 13, round: 'GROUP', group: 'H', matchday: 1, homeTeam: 'ESP', awayTeam: 'CPV', kickoffAt: '2026-06-15T17:00:00Z', venueId: 'mercedes-benz-stadium',    source: 'fifa-wc2026' },
  { matchNumber: 15, round: 'GROUP', group: 'H', matchday: 1, homeTeam: 'KSA', awayTeam: 'URU', kickoffAt: '2026-06-15T22:00:00Z', venueId: 'hard-rock-stadium',        source: 'fifa-wc2026' },
  { matchNumber: 37, round: 'GROUP', group: 'H', matchday: 2, homeTeam: 'ESP', awayTeam: 'KSA', kickoffAt: '2026-06-21T16:00:00Z', venueId: 'mercedes-benz-stadium',    source: 'fifa-wc2026' },
  { matchNumber: 39, round: 'GROUP', group: 'H', matchday: 2, homeTeam: 'URU', awayTeam: 'CPV', kickoffAt: '2026-06-21T22:00:00Z', venueId: 'hard-rock-stadium',        source: 'fifa-wc2026' },
  { matchNumber: 63, round: 'GROUP', group: 'H', matchday: 3, homeTeam: 'CPV', awayTeam: 'KSA', kickoffAt: '2026-06-27T00:00:00Z', venueId: 'nrg-stadium',              source: 'fifa-wc2026' },
  { matchNumber: 64, round: 'GROUP', group: 'H', matchday: 3, homeTeam: 'URU', awayTeam: 'ESP', kickoffAt: '2026-06-27T00:00:00Z', venueId: 'estadio-akron',            source: 'fifa-wc2026' },

  // ── Group I ────────────────────────────────────────────────────────────────
  { matchNumber: 17, round: 'GROUP', group: 'I', matchday: 1, homeTeam: 'FRA', awayTeam: 'SEN', kickoffAt: '2026-06-16T19:00:00Z', venueId: 'metlife-stadium',          source: 'fifa-wc2026' },
  { matchNumber: 18, round: 'GROUP', group: 'I', matchday: 1, homeTeam: 'IRQ', awayTeam: 'NOR', kickoffAt: '2026-06-16T22:00:00Z', venueId: 'gillette-stadium',         source: 'fifa-wc2026' },
  { matchNumber: 42, round: 'GROUP', group: 'I', matchday: 2, homeTeam: 'FRA', awayTeam: 'IRQ', kickoffAt: '2026-06-22T21:00:00Z', venueId: 'lincoln-financial-field',  source: 'fifa-wc2026' },
  { matchNumber: 43, round: 'GROUP', group: 'I', matchday: 2, homeTeam: 'NOR', awayTeam: 'SEN', kickoffAt: '2026-06-23T00:00:00Z', venueId: 'metlife-stadium',          source: 'fifa-wc2026' },
  { matchNumber: 61, round: 'GROUP', group: 'I', matchday: 3, homeTeam: 'NOR', awayTeam: 'FRA', kickoffAt: '2026-06-26T19:00:00Z', venueId: 'gillette-stadium',         source: 'fifa-wc2026' },
  { matchNumber: 62, round: 'GROUP', group: 'I', matchday: 3, homeTeam: 'SEN', awayTeam: 'IRQ', kickoffAt: '2026-06-26T19:00:00Z', venueId: 'bmo-field',                source: 'fifa-wc2026' },

  // ── Group J ────────────────────────────────────────────────────────────────
  { matchNumber: 19, round: 'GROUP', group: 'J', matchday: 1, homeTeam: 'ARG', awayTeam: 'ALG', kickoffAt: '2026-06-17T01:00:00Z', venueId: 'arrowhead-stadium',        source: 'fifa-wc2026' },
  { matchNumber: 20, round: 'GROUP', group: 'J', matchday: 1, homeTeam: 'AUT', awayTeam: 'JOR', kickoffAt: '2026-06-17T04:00:00Z', venueId: 'levis-stadium',            source: 'fifa-wc2026' },
  { matchNumber: 41, round: 'GROUP', group: 'J', matchday: 2, homeTeam: 'ARG', awayTeam: 'AUT', kickoffAt: '2026-06-22T17:00:00Z', venueId: 'att-stadium',              source: 'fifa-wc2026' },
  { matchNumber: 44, round: 'GROUP', group: 'J', matchday: 2, homeTeam: 'JOR', awayTeam: 'ALG', kickoffAt: '2026-06-23T03:00:00Z', venueId: 'levis-stadium',            source: 'fifa-wc2026' },
  { matchNumber: 71, round: 'GROUP', group: 'J', matchday: 3, homeTeam: 'ALG', awayTeam: 'AUT', kickoffAt: '2026-06-28T02:00:00Z', venueId: 'arrowhead-stadium',        source: 'fifa-wc2026' },
  { matchNumber: 72, round: 'GROUP', group: 'J', matchday: 3, homeTeam: 'JOR', awayTeam: 'ARG', kickoffAt: '2026-06-28T02:00:00Z', venueId: 'att-stadium',              source: 'fifa-wc2026' },

  // ── Group K ────────────────────────────────────────────────────────────────
  { matchNumber: 21, round: 'GROUP', group: 'K', matchday: 1, homeTeam: 'POR', awayTeam: 'COD', kickoffAt: '2026-06-17T17:00:00Z', venueId: 'nrg-stadium',              source: 'fifa-wc2026' },
  { matchNumber: 24, round: 'GROUP', group: 'K', matchday: 1, homeTeam: 'UZB', awayTeam: 'COL', kickoffAt: '2026-06-18T02:00:00Z', venueId: 'estadio-azteca',           source: 'fifa-wc2026' },
  { matchNumber: 45, round: 'GROUP', group: 'K', matchday: 2, homeTeam: 'POR', awayTeam: 'UZB', kickoffAt: '2026-06-23T17:00:00Z', venueId: 'nrg-stadium',              source: 'fifa-wc2026' },
  { matchNumber: 48, round: 'GROUP', group: 'K', matchday: 2, homeTeam: 'COL', awayTeam: 'COD', kickoffAt: '2026-06-24T02:00:00Z', venueId: 'estadio-akron',            source: 'fifa-wc2026' },
  { matchNumber: 69, round: 'GROUP', group: 'K', matchday: 3, homeTeam: 'COL', awayTeam: 'POR', kickoffAt: '2026-06-27T23:30:00Z', venueId: 'hard-rock-stadium',        source: 'fifa-wc2026' },
  { matchNumber: 70, round: 'GROUP', group: 'K', matchday: 3, homeTeam: 'COD', awayTeam: 'UZB', kickoffAt: '2026-06-27T23:30:00Z', venueId: 'mercedes-benz-stadium',    source: 'fifa-wc2026' },

  // ── Group L ────────────────────────────────────────────────────────────────
  { matchNumber: 22, round: 'GROUP', group: 'L', matchday: 1, homeTeam: 'ENG', awayTeam: 'CRO', kickoffAt: '2026-06-17T20:00:00Z', venueId: 'att-stadium',              source: 'fifa-wc2026' },
  { matchNumber: 23, round: 'GROUP', group: 'L', matchday: 1, homeTeam: 'GHA', awayTeam: 'PAN', kickoffAt: '2026-06-17T23:00:00Z', venueId: 'bmo-field',                source: 'fifa-wc2026' },
  { matchNumber: 46, round: 'GROUP', group: 'L', matchday: 2, homeTeam: 'ENG', awayTeam: 'GHA', kickoffAt: '2026-06-23T20:00:00Z', venueId: 'gillette-stadium',         source: 'fifa-wc2026' },
  { matchNumber: 47, round: 'GROUP', group: 'L', matchday: 2, homeTeam: 'PAN', awayTeam: 'CRO', kickoffAt: '2026-06-23T23:00:00Z', venueId: 'bmo-field',                source: 'fifa-wc2026' },
  { matchNumber: 67, round: 'GROUP', group: 'L', matchday: 3, homeTeam: 'PAN', awayTeam: 'ENG', kickoffAt: '2026-06-27T21:00:00Z', venueId: 'metlife-stadium',          source: 'fifa-wc2026' },
  { matchNumber: 68, round: 'GROUP', group: 'L', matchday: 3, homeTeam: 'CRO', awayTeam: 'GHA', kickoffAt: '2026-06-27T21:00:00Z', venueId: 'lincoln-financial-field',  source: 'fifa-wc2026' },
];

// ── KNOCKOUT STAGE — 32 matches ──────────────────────────────────────────────
// Teams TBD — placeholder fixtures with confirmed dates/venues
// Round of 32: June 28 – July 1  |  R16: July 4–7  |  QF: July 10–11
// SF: July 14–15  |  3PO: July 18  |  Final: July 19

export const KNOCKOUT_STAGE: FixtureDef[] = [
  // Round of 32 (16 matches)
  { matchNumber: 73,  round: 'ROUND_OF_32', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-06-28T19:00:00Z', venueId: 'metlife-stadium',         source: 'fifa-wc2026' },
  { matchNumber: 74,  round: 'ROUND_OF_32', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-06-28T22:00:00Z', venueId: 'att-stadium',              source: 'fifa-wc2026' },
  { matchNumber: 75,  round: 'ROUND_OF_32', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-06-29T19:00:00Z', venueId: 'nrg-stadium',              source: 'fifa-wc2026' },
  { matchNumber: 76,  round: 'ROUND_OF_32', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-06-29T22:00:00Z', venueId: 'sofi-stadium',             source: 'fifa-wc2026' },
  { matchNumber: 77,  round: 'ROUND_OF_32', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-06-30T16:00:00Z', venueId: 'estadio-azteca',           source: 'fifa-wc2026' },
  { matchNumber: 78,  round: 'ROUND_OF_32', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-06-30T19:00:00Z', venueId: 'mercedes-benz-stadium',    source: 'fifa-wc2026' },
  { matchNumber: 79,  round: 'ROUND_OF_32', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-06-30T22:00:00Z', venueId: 'bc-place',                 source: 'fifa-wc2026' },
  { matchNumber: 80,  round: 'ROUND_OF_32', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-01T01:00:00Z', venueId: 'arrowhead-stadium',        source: 'fifa-wc2026' },
  { matchNumber: 81,  round: 'ROUND_OF_32', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-01T16:00:00Z', venueId: 'lincoln-financial-field',  source: 'fifa-wc2026' },
  { matchNumber: 82,  round: 'ROUND_OF_32', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-01T19:00:00Z', venueId: 'lumen-field',              source: 'fifa-wc2026' },
  { matchNumber: 83,  round: 'ROUND_OF_32', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-01T22:00:00Z', venueId: 'gillette-stadium',         source: 'fifa-wc2026' },
  { matchNumber: 84,  round: 'ROUND_OF_32', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-02T01:00:00Z', venueId: 'hard-rock-stadium',        source: 'fifa-wc2026' },
  { matchNumber: 85,  round: 'ROUND_OF_32', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-02T16:00:00Z', venueId: 'estadio-bbva',             source: 'fifa-wc2026' },
  { matchNumber: 86,  round: 'ROUND_OF_32', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-02T19:00:00Z', venueId: 'levis-stadium',            source: 'fifa-wc2026' },
  { matchNumber: 87,  round: 'ROUND_OF_32', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-02T22:00:00Z', venueId: 'bmo-field',                source: 'fifa-wc2026' },
  { matchNumber: 88,  round: 'ROUND_OF_32', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-03T01:00:00Z', venueId: 'estadio-akron',            source: 'fifa-wc2026' },

  // Round of 16 (8 matches)
  { matchNumber: 89,  round: 'ROUND_OF_16', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-04T22:00:00Z', venueId: 'metlife-stadium',          source: 'fifa-wc2026' },
  { matchNumber: 90,  round: 'ROUND_OF_16', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-05T22:00:00Z', venueId: 'att-stadium',              source: 'fifa-wc2026' },
  { matchNumber: 91,  round: 'ROUND_OF_16', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-06T22:00:00Z', venueId: 'sofi-stadium',             source: 'fifa-wc2026' },
  { matchNumber: 92,  round: 'ROUND_OF_16', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-07T22:00:00Z', venueId: 'nrg-stadium',              source: 'fifa-wc2026' },
  { matchNumber: 93,  round: 'ROUND_OF_16', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-08T02:00:00Z', venueId: 'estadio-azteca',           source: 'fifa-wc2026' },
  { matchNumber: 94,  round: 'ROUND_OF_16', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-08T22:00:00Z', venueId: 'mercedes-benz-stadium',    source: 'fifa-wc2026' },
  { matchNumber: 95,  round: 'ROUND_OF_16', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-09T02:00:00Z', venueId: 'bc-place',                 source: 'fifa-wc2026' },
  { matchNumber: 96,  round: 'ROUND_OF_16', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-09T22:00:00Z', venueId: 'arrowhead-stadium',        source: 'fifa-wc2026' },

  // Quarterfinals (4 matches)
  { matchNumber: 97,  round: 'QUARTER_FINAL', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-10T22:00:00Z', venueId: 'metlife-stadium',          source: 'fifa-wc2026' },
  { matchNumber: 98,  round: 'QUARTER_FINAL', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-11T02:00:00Z', venueId: 'att-stadium',              source: 'fifa-wc2026' },
  { matchNumber: 99,  round: 'QUARTER_FINAL', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-11T22:00:00Z', venueId: 'sofi-stadium',             source: 'fifa-wc2026' },
  { matchNumber: 100, round: 'QUARTER_FINAL', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-12T02:00:00Z', venueId: 'nrg-stadium',              source: 'fifa-wc2026' },

  // Semifinals (2 matches)
  { matchNumber: 101, round: 'SEMI_FINAL', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-14T22:00:00Z', venueId: 'att-stadium',              source: 'fifa-wc2026' },
  { matchNumber: 102, round: 'SEMI_FINAL', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-15T22:00:00Z', venueId: 'metlife-stadium',          source: 'fifa-wc2026' },

  // Third-place playoff
  { matchNumber: 103, round: 'THIRD_PLACE', homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-18T22:00:00Z', venueId: 'att-stadium',              source: 'fifa-wc2026' },

  // Final
  { matchNumber: 104, round: 'FINAL',       homeTeam: 'TBD', awayTeam: 'TBD', kickoffAt: '2026-07-19T21:00:00Z', venueId: 'metlife-stadium',          source: 'fifa-wc2026' },
];

export const ALL_FIXTURES: FixtureDef[] = [...GROUP_STAGE, ...KNOCKOUT_STAGE];
