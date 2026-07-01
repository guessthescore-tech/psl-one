import type { ExpFantasyPlayer } from './data';

export type StarterSlotPosition = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface SquadState {
  starters: (ExpFantasyPlayer | null)[];
  bench: (ExpFantasyPlayer | null)[];
}

export function parseFormationRows(formation: string): number[] {
  return formation.split('-').map(Number);
}

export function buildEmptySquad(formation: string): SquadState {
  const rows = parseFormationRows(formation);
  const starterCount = 1 + rows.reduce((a, b) => a + b, 0);
  return {
    starters: Array.from({ length: starterCount }, () => null),
    bench: [null, null, null, null],
  };
}

export function getStarterSlotPosition(formation: string, starterIndex: number): StarterSlotPosition {
  const [defCount = 4, midCount = 3] = parseFormationRows(formation);
  if (starterIndex === 0) return 'GK';
  if (starterIndex < 1 + defCount) return 'DEF';
  if (starterIndex < 1 + defCount + midCount) return 'MID';
  return 'FWD';
}

export function selectPlayerForSlot(
  squad: SquadState,
  selectedSlot: { isStarter: boolean; idx: number },
  player: ExpFantasyPlayer,
  formation: string,
): SquadState {
  if (selectedSlot.isStarter) {
    const expectedPosition = getStarterSlotPosition(formation, selectedSlot.idx);
    if (player.position !== expectedPosition) return squad;
  }

  const selectedPlayer: ExpFantasyPlayer = {
    ...player,
    squadRole: selectedSlot.isStarter ? 'STARTER' : 'SUBSTITUTE',
    benchSlot: selectedSlot.isStarter ? null : selectedSlot.idx + 1,
    isCaptain: false,
    isViceCaptain: false,
  };

  const starters = [...squad.starters];
  const bench = [...squad.bench];
  if (selectedSlot.isStarter) {
    starters[selectedSlot.idx] = selectedPlayer;
  } else {
    bench[selectedSlot.idx] = selectedPlayer;
  }
  return { starters, bench };
}

export function reseatStartersForFormation(
  previous: SquadState,
  formation: string,
): SquadState {
  const hasPicks = [...previous.starters, ...previous.bench].some(Boolean);
  if (!hasPicks) return buildEmptySquad(formation);

  const filled = previous.starters.filter(Boolean) as ExpFantasyPlayer[];
  const gks = filled.filter(p => p.position === 'GK');
  const defs = filled.filter(p => p.position === 'DEF');
  const mids = filled.filter(p => p.position === 'MID');
  const fwds = filled.filter(p => p.position === 'FWD');
  const [nDef = 4, nMid = 3, nFwd = 3] = parseFormationRows(formation);

  return {
    starters: [
      gks[0] ?? null,
      ...Array.from({ length: nDef }, (_, i): ExpFantasyPlayer | null => defs[i] ?? null),
      ...Array.from({ length: nMid }, (_, i): ExpFantasyPlayer | null => mids[i] ?? null),
      ...Array.from({ length: nFwd }, (_, i): ExpFantasyPlayer | null => fwds[i] ?? null),
    ],
    bench: previous.bench,
  };
}
