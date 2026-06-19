'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';
import type { ExpPlayer } from '@/lib/data';
import { expImg } from '@/lib/data';

const POSITION_COLOURS: Record<ExpPlayer['position'], string> = {
  GK:  'bg-exp-warning/20 text-exp-warning border-exp-warning/40',
  DEF: 'bg-exp-green/20  text-exp-green  border-exp-green/40',
  MID: 'bg-exp-blue/20   text-blue-400   border-blue-400/40',
  FWD: 'bg-exp-live/20   text-exp-live   border-exp-live/40',
};

const POSITION_LABEL: Record<ExpPlayer['position'], string> = {
  GK:  'Goalkeeper',
  DEF: 'Defender',
  MID: 'Midfielder',
  FWD: 'Forward',
};

interface PlayerProfileHeroProps {
  player: ExpPlayer;
  compact?: boolean;
  rating?: number;
}

export function PlayerProfileHero({
  player,
  compact = false,
  rating,
}: PlayerProfileHeroProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={clsx(
        'bg-exp-navy rounded-card border border-exp-border-dk overflow-hidden',
        compact ? 'flex items-center gap-3 p-3' : 'flex flex-col sm:flex-row',
      )}
    >
      {/* Portrait */}
      <div
        className={clsx(
          'relative flex-shrink-0 bg-exp-ink',
          compact
            ? 'w-12 h-12 rounded-card-sm overflow-hidden'
            : 'w-full sm:w-48 h-48 sm:h-auto',
        )}
      >
        <Image
          src={expImg(player.imageKey, compact ? 96 : 400, compact ? 96 : 500)}
          alt={player.name}
          fill
          className="object-cover object-top"
          sizes={compact ? '48px' : '(max-width: 640px) 100vw, 192px'}
        />
        {/* Shirt number badge */}
        {!compact && (
          <div className="absolute bottom-3 left-3 w-10 h-10 rounded-full bg-exp-gold text-exp-void flex items-center justify-center text-label-lg font-black">
            —
          </div>
        )}
      </div>

      {/* Info */}
      <div className={clsx(compact ? 'flex-1 min-w-0' : 'flex-1 p-5')}>
        {/* Position badge */}
        <span
          className={clsx(
            'inline-flex items-center rounded-pill border font-bold',
            POSITION_COLOURS[player.position],
            compact ? 'text-label-sm px-2 py-0.5 mb-1' : 'text-label-md px-2.5 py-1 mb-3',
          )}
        >
          {POSITION_LABEL[player.position]}
        </span>

        {/* Name */}
        <div
          className={clsx(
            'font-black text-white',
            compact ? 'text-body-md truncate' : 'text-display-sm',
          )}
        >
          {player.name}
        </div>

        {/* Club + nationality */}
        <div className={clsx('text-exp-muted', compact ? 'text-body-sm truncate' : 'text-body-md mt-1')}>
          {player.club.name} · {player.nationality}
        </div>

        {/* Rating */}
        {rating != null && !compact && (
          <div className="mt-3 inline-flex items-center gap-1.5 bg-exp-gold/10 border border-exp-gold/30 rounded-pill px-3 py-1">
            <span className="text-exp-gold font-black text-stat-md">{rating.toFixed(1)}</span>
            <span className="text-label-sm text-exp-muted">/ 10</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
