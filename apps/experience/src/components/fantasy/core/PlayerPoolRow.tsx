'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Plus } from '@phosphor-icons/react/dist/ssr';
import type { ExpFantasyPlayer } from '@/lib/data';

interface PlayerPoolRowProps {
  player: ExpFantasyPlayer;
  onSelect?: (player: ExpFantasyPlayer) => void;
  isSelected?: boolean;
  isAlreadyPicked?: boolean;
  showAddButton?: boolean;
}

const posAbbr: Record<string, string> = {
  GK:  'GK',
  DEF: 'DEF',
  MID: 'MID',
  FWD: 'FWD',
};

const posColor: Record<string, string> = {
  GK:  'text-amber-400',
  DEF: 'text-blue-400',
  MID: 'text-exp-green',
  FWD: 'text-exp-live',
};

export function PlayerPoolRow({
  player,
  onSelect,
  isSelected,
  isAlreadyPicked,
  showAddButton = true,
}: PlayerPoolRowProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={`flex items-center gap-3 px-4 py-3 border-b border-exp-border-dk transition-colors ${
        isAlreadyPicked ? 'opacity-40' :
        isSelected ? 'bg-exp-gold/10' : 'hover:bg-exp-navy'
      }`}
      whileHover={reduce ? undefined : { x: 2 }}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-exp-navy-2 border border-exp-border-dk flex items-center justify-center text-label-md text-white font-bold flex-shrink-0">
        {player.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-body-sm text-white font-semibold truncate">{player.name}</span>
          {isAlreadyPicked && (
            <span className="text-label-sm text-exp-muted">(picked)</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-label-sm ${posColor[player.position] ?? 'text-exp-muted'}`}>
            {posAbbr[player.position]}
          </span>
          <span className="text-label-sm text-exp-muted">{player.club.abbr}</span>
          <span className="text-label-sm text-exp-muted">G {player.goalsThisTournament} · A {player.assistsThisTournament}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-label-md text-exp-gold font-mono">£{player.fantasyPrice}m</span>
        <span className="text-label-sm text-exp-muted">{player.fantasyPoints}pts</span>
        <span className="text-label-sm text-white/60">GW {player.gameweekPoints}</span>
      </div>

      {/* Add button */}
      {showAddButton && onSelect && !isAlreadyPicked && (
        <button
          type="button"
          onClick={() => onSelect(player)}
          aria-label={`Add ${player.name}`}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-exp-green hover:bg-exp-green hover:text-white active:scale-95 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
        >
          <Plus size={20} weight="bold" aria-hidden="true" />
        </button>
      )}
    </motion.div>
  );
}
