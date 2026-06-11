import { PlayerPosition } from '@prisma/client';

// Provisional placeholder players — NOT official PSL squad data.
// Source: PSL_PLACEHOLDER. Replace with official data before public launch.
// 6 players per club: 1 GK, 2 DEF, 2 MID, 1 FWD

export interface PslPlayer {
  clubExternalId: string;
  name: string;
  position: PlayerPosition;
  nationality: string;
  shirtNumber: number;
  externalId: string;
}

function clubPlaceholders(clubExternalId: string, shortName: string): PslPlayer[] {
  return [
    { clubExternalId, name: `${shortName} GK`, position: PlayerPosition.GOALKEEPER, nationality: 'South Africa', shirtNumber: 1, externalId: `${clubExternalId}-p-gk` },
    { clubExternalId, name: `${shortName} DEF 1`, position: PlayerPosition.DEFENDER, nationality: 'South Africa', shirtNumber: 4, externalId: `${clubExternalId}-p-df1` },
    { clubExternalId, name: `${shortName} DEF 2`, position: PlayerPosition.DEFENDER, nationality: 'South Africa', shirtNumber: 5, externalId: `${clubExternalId}-p-df2` },
    { clubExternalId, name: `${shortName} MID 1`, position: PlayerPosition.MIDFIELDER, nationality: 'South Africa', shirtNumber: 8, externalId: `${clubExternalId}-p-mf1` },
    { clubExternalId, name: `${shortName} MID 2`, position: PlayerPosition.MIDFIELDER, nationality: 'South Africa', shirtNumber: 10, externalId: `${clubExternalId}-p-mf2` },
    { clubExternalId, name: `${shortName} FWD`, position: PlayerPosition.FORWARD, nationality: 'South Africa', shirtNumber: 9, externalId: `${clubExternalId}-p-fw` },
  ];
}

// Provisional fantasy price bands (stored as integer × 10 = display price)
// GK: 50 (5.0), DEF: 50 (5.0), MID: 55 (5.5), FWD: 60 (6.0)
export const PROVISIONAL_PRICE: Record<PlayerPosition, number> = {
  [PlayerPosition.GOALKEEPER]: 50,
  [PlayerPosition.DEFENDER]: 50,
  [PlayerPosition.MIDFIELDER]: 55,
  [PlayerPosition.FORWARD]: 60,
};

export const PSL_PLACEHOLDER_PLAYERS: PslPlayer[] = [
  ...clubPlaceholders('psl-mamelodi-sundowns', 'Sundowns'),
  ...clubPlaceholders('psl-kaizer-chiefs', 'Chiefs'),
  ...clubPlaceholders('psl-orlando-pirates', 'Pirates'),
  ...clubPlaceholders('psl-supersport-united', 'SuperSport'),
  ...clubPlaceholders('psl-cape-town-city', 'CT City'),
  ...clubPlaceholders('psl-stellenbosch-fc', 'Stellenbosch'),
  ...clubPlaceholders('psl-golden-arrows', 'Golden Arrows'),
  ...clubPlaceholders('psl-sekhukhune-united', 'Sekhukhune'),
  ...clubPlaceholders('psl-chippa-united', 'Chippa'),
  ...clubPlaceholders('psl-royal-am', 'Royal AM'),
  ...clubPlaceholders('psl-moroka-swallows', 'Swallows'),
  ...clubPlaceholders('psl-polokwane-city', 'Polokwane'),
  ...clubPlaceholders('psl-marumo-gallants', 'Gallants'),
  ...clubPlaceholders('psl-ts-galaxy', 'TS Galaxy'),
  ...clubPlaceholders('psl-maritzburg-united', 'Maritzburg'),
  ...clubPlaceholders('psl-amazulu-fc', 'AmaZulu'),
];
