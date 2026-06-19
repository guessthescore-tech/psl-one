'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CaptainMarker } from './CaptainMarker';
import type { ExpFantasyPlayer } from '@/lib/data';

interface PlayerSlotProps {
  player: ExpFantasyPlayer | null;
  slotLabel?: string;
  isSelected?: boolean;
  isTransferOut?: boolean;
  onClick?: () => void;
}

export function PlayerSlot({
  player,
  slotLabel,
  isSelected,
  isTransferOut,
  onClick,
}: PlayerSlotProps) {
  const reduce = useReducedMotion();

  if (!player) {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        aria-label={slotLabel ? `Add ${slotLabel}` : 'Add player'}
        className="flex flex-col items-center gap-1 focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 min-h-[44px] min-w-[44px]"
        whileHover={reduce ? undefined : { scale: 1.02 }}
        whileTap={reduce ? undefined : { scale: 0.97 }}
      >
        <div className="w-14 h-14 rounded-full border-2 border-dashed border-exp-border-dk flex items-center justify-center text-exp-muted text-xl">
          +
        </div>
        <span className="text-label-sm text-exp-muted max-w-[60px] text-center leading-tight">
          {slotLabel ?? 'Empty'}
        </span>
      </motion.button>
    );
  }

  const posColor =
    player.position === 'GOALKEEPER' ? 'bg-amber-500' :
    player.position === 'DEFENDER'   ? 'bg-blue-500' :
    player.position === 'MIDFIELDER' ? 'bg-exp-green' :
    'bg-exp-live';

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={`${player.name}${player.isCaptain ? ', Captain' : ''}${player.isViceCaptain ? ', Vice Captain' : ''}`}
      className={`relative flex flex-col items-center gap-1 focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 min-h-[44px] min-w-[44px] ${
        isTransferOut ? 'opacity-60' : ''
      }`}
      whileHover={reduce ? undefined : { scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
    >
      {/* Avatar circle */}
      <div
        className={`relative w-14 h-14 rounded-full border-2 flex items-center justify-center text-white text-label-lg font-bold ${
          isSelected ? 'border-exp-gold shadow-glow-gold' :
          isTransferOut ? 'border-exp-live shadow-[0_0_12px_rgb(239_68_68/0.4)]' :
          'border-exp-border-dk'
        } bg-exp-navy`}
      >
        {player.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        {/* Position badge */}
        <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white px-1 rounded-sm ${posColor}`}>
          {player.position === 'GOALKEEPER' ? 'GK' :
           player.position === 'DEFENDER'   ? 'DEF' :
           player.position === 'MIDFIELDER' ? 'MID' : 'FWD'}
        </span>
        {/* Captain marker */}
        {(player.isCaptain || player.isViceCaptain) && (
          <CaptainMarker
            type={player.isCaptain ? 'C' : 'VC'}
            className="absolute -top-1 -right-1"
          />
        )}
        {/* Transfer out indicator */}
        {isTransferOut && (
          <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-exp-live text-white text-xs flex items-center justify-center font-bold">
            ↑
          </span>
        )}
      </div>

      {/* Name + price row */}
      <div className="text-center max-w-[64px]">
        <p className="text-label-sm text-white leading-tight truncate">{player.name.split(' ').pop()}</p>
        <p className="text-label-sm text-exp-gold font-mono">£{player.price}m</p>
      </div>
    </motion.button>
  );
}
