export type TeamDef = {
  externalId: string;
  slug: string;
  name: string;
  shortName: string;
  country: string;
  source: string;
};

// 48 qualified teams, source: FIFA official draw Dec 2025
export const TEAMS: TeamDef[] = [
  // Group A
  { externalId: 'MEX', slug: 'mexico',                name: 'Mexico',                shortName: 'MEX', country: 'Mexico',               source: 'fifa-wc2026' },
  { externalId: 'RSA', slug: 'south-africa',           name: 'South Africa',          shortName: 'RSA', country: 'South Africa',          source: 'fifa-wc2026' },
  { externalId: 'KOR', slug: 'south-korea',            name: 'South Korea',           shortName: 'KOR', country: 'South Korea',           source: 'fifa-wc2026' },
  { externalId: 'CZE', slug: 'czechia',                name: 'Czechia',               shortName: 'CZE', country: 'Czech Republic',        source: 'fifa-wc2026' },
  // Group B
  { externalId: 'CAN', slug: 'canada',                 name: 'Canada',                shortName: 'CAN', country: 'Canada',                source: 'fifa-wc2026' },
  { externalId: 'BIH', slug: 'bosnia',                 name: 'Bosnia and Herzegovina',shortName: 'BIH', country: 'Bosnia and Herzegovina',source: 'fifa-wc2026' },
  { externalId: 'QAT', slug: 'qatar',                  name: 'Qatar',                 shortName: 'QAT', country: 'Qatar',                 source: 'fifa-wc2026' },
  { externalId: 'SUI', slug: 'switzerland',            name: 'Switzerland',           shortName: 'SUI', country: 'Switzerland',           source: 'fifa-wc2026' },
  // Group C
  { externalId: 'BRA', slug: 'brazil',                 name: 'Brazil',                shortName: 'BRA', country: 'Brazil',                source: 'fifa-wc2026' },
  { externalId: 'MAR', slug: 'morocco',                name: 'Morocco',               shortName: 'MAR', country: 'Morocco',               source: 'fifa-wc2026' },
  { externalId: 'HAI', slug: 'haiti',                  name: 'Haiti',                 shortName: 'HAI', country: 'Haiti',                 source: 'fifa-wc2026' },
  { externalId: 'SCO', slug: 'scotland',               name: 'Scotland',              shortName: 'SCO', country: 'Scotland',              source: 'fifa-wc2026' },
  // Group D
  { externalId: 'USA', slug: 'usa',                    name: 'United States',         shortName: 'USA', country: 'United States',         source: 'fifa-wc2026' },
  { externalId: 'PAR', slug: 'paraguay',               name: 'Paraguay',              shortName: 'PAR', country: 'Paraguay',              source: 'fifa-wc2026' },
  { externalId: 'AUS', slug: 'australia',              name: 'Australia',             shortName: 'AUS', country: 'Australia',             source: 'fifa-wc2026' },
  { externalId: 'TUR', slug: 'turkey',                 name: 'Türkiye',               shortName: 'TUR', country: 'Turkey',                source: 'fifa-wc2026' },
  // Group E
  { externalId: 'GER', slug: 'germany',                name: 'Germany',               shortName: 'GER', country: 'Germany',               source: 'fifa-wc2026' },
  { externalId: 'CUW', slug: 'curacao',                name: 'Curaçao',               shortName: 'CUW', country: 'Curaçao',               source: 'fifa-wc2026' },
  { externalId: 'CIV', slug: 'ivory-coast',            name: 'Ivory Coast',           shortName: 'CIV', country: 'Ivory Coast',           source: 'fifa-wc2026' },
  { externalId: 'ECU', slug: 'ecuador',                name: 'Ecuador',               shortName: 'ECU', country: 'Ecuador',               source: 'fifa-wc2026' },
  // Group F
  { externalId: 'NED', slug: 'netherlands',            name: 'Netherlands',           shortName: 'NED', country: 'Netherlands',           source: 'fifa-wc2026' },
  { externalId: 'JPN', slug: 'japan',                  name: 'Japan',                 shortName: 'JPN', country: 'Japan',                 source: 'fifa-wc2026' },
  { externalId: 'SWE', slug: 'sweden',                 name: 'Sweden',                shortName: 'SWE', country: 'Sweden',                source: 'fifa-wc2026' },
  { externalId: 'TUN', slug: 'tunisia',                name: 'Tunisia',               shortName: 'TUN', country: 'Tunisia',               source: 'fifa-wc2026' },
  // Group G
  { externalId: 'BEL', slug: 'belgium',                name: 'Belgium',               shortName: 'BEL', country: 'Belgium',               source: 'fifa-wc2026' },
  { externalId: 'EGY', slug: 'egypt',                  name: 'Egypt',                 shortName: 'EGY', country: 'Egypt',                 source: 'fifa-wc2026' },
  { externalId: 'IRN', slug: 'iran',                   name: 'Iran',                  shortName: 'IRN', country: 'Iran',                  source: 'fifa-wc2026' },
  { externalId: 'NZL', slug: 'new-zealand',            name: 'New Zealand',           shortName: 'NZL', country: 'New Zealand',           source: 'fifa-wc2026' },
  // Group H
  { externalId: 'ESP', slug: 'spain',                  name: 'Spain',                 shortName: 'ESP', country: 'Spain',                 source: 'fifa-wc2026' },
  { externalId: 'CPV', slug: 'cape-verde',             name: 'Cape Verde',            shortName: 'CPV', country: 'Cape Verde',            source: 'fifa-wc2026' },
  { externalId: 'KSA', slug: 'saudi-arabia',           name: 'Saudi Arabia',          shortName: 'KSA', country: 'Saudi Arabia',          source: 'fifa-wc2026' },
  { externalId: 'URU', slug: 'uruguay',                name: 'Uruguay',               shortName: 'URU', country: 'Uruguay',               source: 'fifa-wc2026' },
  // Group I
  { externalId: 'FRA', slug: 'france',                 name: 'France',                shortName: 'FRA', country: 'France',                source: 'fifa-wc2026' },
  { externalId: 'SEN', slug: 'senegal',                name: 'Senegal',               shortName: 'SEN', country: 'Senegal',               source: 'fifa-wc2026' },
  { externalId: 'IRQ', slug: 'iraq',                   name: 'Iraq',                  shortName: 'IRQ', country: 'Iraq',                  source: 'fifa-wc2026' },
  { externalId: 'NOR', slug: 'norway',                 name: 'Norway',                shortName: 'NOR', country: 'Norway',                source: 'fifa-wc2026' },
  // Group J
  { externalId: 'ARG', slug: 'argentina',              name: 'Argentina',             shortName: 'ARG', country: 'Argentina',             source: 'fifa-wc2026' },
  { externalId: 'ALG', slug: 'algeria',                name: 'Algeria',               shortName: 'ALG', country: 'Algeria',               source: 'fifa-wc2026' },
  { externalId: 'AUT', slug: 'austria',                name: 'Austria',               shortName: 'AUT', country: 'Austria',               source: 'fifa-wc2026' },
  { externalId: 'JOR', slug: 'jordan',                 name: 'Jordan',                shortName: 'JOR', country: 'Jordan',                source: 'fifa-wc2026' },
  // Group K
  { externalId: 'POR', slug: 'portugal',               name: 'Portugal',              shortName: 'POR', country: 'Portugal',              source: 'fifa-wc2026' },
  { externalId: 'COD', slug: 'dr-congo',               name: 'DR Congo',              shortName: 'COD', country: 'DR Congo',              source: 'fifa-wc2026' },
  { externalId: 'UZB', slug: 'uzbekistan',             name: 'Uzbekistan',            shortName: 'UZB', country: 'Uzbekistan',            source: 'fifa-wc2026' },
  { externalId: 'COL', slug: 'colombia',               name: 'Colombia',              shortName: 'COL', country: 'Colombia',              source: 'fifa-wc2026' },
  // Group L
  { externalId: 'ENG', slug: 'england',                name: 'England',               shortName: 'ENG', country: 'England',               source: 'fifa-wc2026' },
  { externalId: 'CRO', slug: 'croatia',                name: 'Croatia',               shortName: 'CRO', country: 'Croatia',               source: 'fifa-wc2026' },
  { externalId: 'GHA', slug: 'ghana',                  name: 'Ghana',                 shortName: 'GHA', country: 'Ghana',                 source: 'fifa-wc2026' },
  { externalId: 'PAN', slug: 'panama',                 name: 'Panama',                shortName: 'PAN', country: 'Panama',                source: 'fifa-wc2026' },
];

// Placeholder for unresolved knockout bracket slots
export const TBD_TEAM: TeamDef = {
  externalId: 'TBD',
  slug: 'tbd',
  name: 'TBD',
  shortName: 'TBD',
  country: 'TBD',
  source: 'fifa-wc2026',
};
