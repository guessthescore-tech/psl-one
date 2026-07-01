'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { PlayerSlot } from './PlayerSlot';
import type { ExpFantasyPlayer } from '@/lib/data';

interface FantasyPitchViewProps {
  players: (ExpFantasyPlayer | null)[];
  formation?: string;
  onPlayerClick?: (player: ExpFantasyPlayer | null, position: string, slotIndex: number) => void;
  selectedPlayerId?: string | null;
  transferOutId?: string | null;
}

function parseFormation(formation: string): number[] {
  return formation.split('-').map(Number);
}

export function FantasyPitchView({
  players,
  formation = '4-3-3',
  onPlayerClick,
  selectedPlayerId,
  transferOutId,
}: FantasyPitchViewProps) {
  const reduce = useReducedMotion();
  const formationRows = parseFormation(formation); // e.g. [4,3,3]

  const [defCount = 4, midCount = 3, fwdCount = 3] = formationRows;
  const starterSlots = Array.from(
    { length: 1 + defCount + midCount + fwdCount },
    (_, i) => players[i] ?? null,
  );

  // Build rows from the flat starter-slot array. Do not filter by player
  // position here; filtering changes slot identity when null placeholders exist.
  const gkPlayers = starterSlots.slice(0, 1);
  const defPlayers = starterSlots.slice(1, 1 + defCount);
  const midPlayers = starterSlots.slice(1 + defCount, 1 + defCount + midCount);
  const fwdPlayers = starterSlots.slice(1 + defCount + midCount, 1 + defCount + midCount + fwdCount);

  const rows: Array<{ label: string; pos: string; slots: (ExpFantasyPlayer | null)[] }> = [
    { label: 'GK',  pos: 'GK',  slots: gkPlayers  },
    { label: 'DEF', pos: 'DEF', slots: defPlayers  },
    { label: 'MID', pos: 'MID', slots: midPlayers  },
    { label: 'FWD', pos: 'FWD', slots: fwdPlayers  },
  ];

  // Global start index for each row in the flat starters array.
  // The array is ordered: 1 GK, then DEF×N, then MID×M, then FWD×P.
  // Passing the global index (not the row-local slotIdx) prevents different
  // rows from writing to the same squad.starters slot.
  const rowStartIdx = [
    0,
    1,
    1 + defCount,
    1 + defCount + midCount,
  ];

  return (
    <div
      className="relative rounded-card overflow-hidden"
      style={{
        background: 'repeating-linear-gradient(180deg,#145c2e 0px,#145c2e 44px,#115228 44px,#115228 88px)',
      }}
      aria-label="Football pitch view"
    >
      {/* Pitch markings overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Centre circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-white/10" />
        {/* Centre line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
        {/* Penalty areas */}
        <div className="absolute top-0 left-1/4 right-1/4 h-8 border-b border-l border-r border-white/10" />
        <div className="absolute bottom-0 left-1/4 right-1/4 h-8 border-t border-l border-r border-white/10" />
      </div>

      <div className="relative py-4 px-2 space-y-3">
        {rows.map((row, rowIdx) => (
          <motion.div
            key={row.label}
            className="flex justify-around items-center"
            initial={reduce ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: rowIdx * 0.04, ease: [0.16, 1, 0.3, 1] }}
          >
            {row.slots.map((player, slotIdx) => (
              <PlayerSlot
                key={player?.id ?? `${row.pos}-${slotIdx}`}
                player={player}
                slotLabel={row.label}
                isSelected={player ? player.id === selectedPlayerId : false}
                isTransferOut={player ? player.id === transferOutId : false}
                onClick={onPlayerClick ? () => onPlayerClick(player, row.pos, (rowStartIdx[rowIdx] ?? 0) + slotIdx) : undefined}
              />
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
