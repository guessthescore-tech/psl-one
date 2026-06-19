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

  // Organise starters by position
  const starters = players.filter(p => !p || p.squadRole === 'STARTER');

  // Build rows: GK (1) + formation rows
  const gkPlayers = starters.filter(p => !p || p?.position === 'GK').slice(0, 1);
  const defPlayers = starters.filter(p => !p || p?.position === 'DEF').slice(0, formationRows[0] ?? 4);
  const midPlayers = starters.filter(p => !p || p?.position === 'MID').slice(0, formationRows[1] ?? 3);
  const fwdPlayers = starters.filter(p => !p || p?.position === 'FWD').slice(0, formationRows[2] ?? 3);

  // Pad to formation counts
  while (defPlayers.length < (formationRows[0] ?? 4)) defPlayers.push(null);
  while (midPlayers.length < (formationRows[1] ?? 3)) midPlayers.push(null);
  while (fwdPlayers.length < (formationRows[2] ?? 3)) fwdPlayers.push(null);

  const rows: Array<{ label: string; pos: string; slots: (ExpFantasyPlayer | null)[] }> = [
    { label: 'GK',  pos: 'GK',  slots: gkPlayers  },
    { label: 'DEF', pos: 'DEF', slots: defPlayers  },
    { label: 'MID', pos: 'MID', slots: midPlayers  },
    { label: 'FWD', pos: 'FWD', slots: fwdPlayers  },
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
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: rowIdx * 0.07, ease: [0.16, 1, 0.3, 1] }}
          >
            {row.slots.map((player, slotIdx) => (
              <PlayerSlot
                key={player?.id ?? `${row.pos}-${slotIdx}`}
                player={player}
                slotLabel={row.label}
                isSelected={player ? player.id === selectedPlayerId : false}
                isTransferOut={player ? player.id === transferOutId : false}
                onClick={onPlayerClick ? () => onPlayerClick(player, row.pos, slotIdx) : undefined}
              />
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
