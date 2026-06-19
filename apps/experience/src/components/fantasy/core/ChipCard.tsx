'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ExpChip, ChipType, ChipStatus } from '@/lib/data';

const CHIP_META: Record<ChipType, { emoji: string; name: string; description: string }> = {
  WILDCARD: {
    emoji: '🔄',
    name: 'Wildcard',
    description: 'All transfers this gameweek are free. No limit on transfers.',
  },
  BENCH_BOOST: {
    emoji: '⬆️',
    name: 'Bench Boost',
    description: "Your bench players' points count this gameweek.",
  },
  TRIPLE_CAPTAIN: {
    emoji: '3×',
    name: 'Triple Captain',
    description: 'Your captain scores triple points this gameweek instead of double.',
  },
  FREE_HIT: {
    emoji: '🎯',
    name: 'Free Hit',
    description: 'Use any players for one gameweek. Your squad reverts after.',
  },
};

const STATUS_STYLES: Record<ChipStatus, string> = {
  AVAILABLE: 'text-exp-green border-exp-green/40 bg-exp-green/10',
  ACTIVE:    'text-exp-gold border-exp-gold/40 bg-exp-gold/10',
  USED:      'text-exp-muted border-exp-border-dk bg-exp-ink',
  EXPIRED:   'text-exp-muted border-exp-border-dk bg-exp-ink',
};

interface ChipCardProps {
  chip: ExpChip;
  onActivate?: (type: ChipType) => void;
  onCancel?: (type: ChipType) => void;
  isDeadlineLocked?: boolean;
}

export function ChipCard({ chip, onActivate, onCancel, isDeadlineLocked }: ChipCardProps) {
  const reduce = useReducedMotion();
  const meta = CHIP_META[chip.type];
  const isAvailable = chip.status === 'AVAILABLE';
  const isActive = chip.status === 'ACTIVE';
  const isUsed = chip.status === 'USED' || chip.status === 'EXPIRED';

  return (
    <motion.div
      className={`rounded-card border p-4 ${isUsed ? 'opacity-50' : ''} ${
        isActive ? 'border-exp-gold/40 bg-exp-gold/5 shadow-glow-gold' :
        isAvailable ? 'border-exp-border-dk bg-exp-navy' :
        'border-exp-border-dk bg-exp-ink'
      }`}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={isAvailable && !reduce ? { scale: 1.01 } : undefined}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl flex-shrink-0" aria-hidden="true">{meta.emoji}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-display-sm text-white">{meta.name}</h3>
            <span className={`text-label-sm px-2 py-0.5 rounded-pill border ${STATUS_STYLES[chip.status]}`}>
              {chip.status === 'USED' && chip.usedInGameweek
                ? `Used GW${chip.usedInGameweek}`
                : chip.status}
            </span>
          </div>
          <p className="text-body-sm text-exp-muted">{meta.description}</p>
          <p className="text-label-sm text-exp-muted mt-1">Points only — no financial value</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-3">
        {isActive && onCancel && (
          <button
            type="button"
            onClick={() => onCancel(chip.type)}
            className="w-full min-h-[44px] rounded-pill border border-exp-live/40 text-exp-live text-label-lg focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
          >
            Cancel chip
          </button>
        )}
        {isAvailable && onActivate && (
          <button
            type="button"
            onClick={() => onActivate(chip.type)}
            disabled={isDeadlineLocked}
            className="w-full min-h-[44px] rounded-pill bg-exp-green text-white text-label-lg disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
          >
            {isDeadlineLocked ? 'Deadline passed' : 'Activate chip'}
          </button>
        )}
      </div>
    </motion.div>
  );
}
