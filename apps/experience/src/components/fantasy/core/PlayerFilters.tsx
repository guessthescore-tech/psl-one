'use client';

import { motion, useReducedMotion } from 'framer-motion';

type PositionFilter = 'ALL' | 'GK' | 'DEF' | 'MID' | 'FWD';
type SortKey = 'fantasyPoints' | 'fantasyPrice' | 'gameweekPoints';

interface PlayerFiltersProps {
  position: PositionFilter;
  onPositionChange: (p: PositionFilter) => void;
  sortBy?: SortKey;
  onSortChange?: (s: SortKey) => void;
}

const POSITIONS: Array<{ id: PositionFilter; label: string }> = [
  { id: 'ALL', label: 'All' },
  { id: 'GK',  label: 'GK'  },
  { id: 'DEF', label: 'DEF' },
  { id: 'MID', label: 'MID' },
  { id: 'FWD', label: 'FWD' },
];

export function PlayerFilters({ position, onPositionChange, sortBy = 'fantasyPoints', onSortChange }: PlayerFiltersProps) {
  const reduce = useReducedMotion();

  return (
    <div className="space-y-2 px-4 py-3 bg-exp-navy border-b border-exp-border-dk">
      {/* Position filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {POSITIONS.map(p => {
          const isActive = p.id === position;
          return (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => onPositionChange(p.id)}
              aria-pressed={isActive}
              className={`min-h-[36px] px-3 py-1.5 text-label-sm rounded-pill border whitespace-nowrap flex-shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 ${
                isActive
                  ? 'bg-exp-gold text-exp-void border-exp-gold'
                  : 'bg-transparent text-exp-muted border-exp-border-dk hover:text-white'
              }`}
              whileHover={reduce ? undefined : { scale: 1.02 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
            >
              {p.label}
            </motion.button>
          );
        })}
      </div>

      {/* Sort */}
      {onSortChange && (
        <div className="flex items-center gap-2">
          <span className="text-label-sm text-exp-muted">Sort:</span>
          {(['fantasyPoints', 'fantasyPrice', 'gameweekPoints'] as const).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => onSortChange(s)}
              aria-pressed={s === sortBy}
              className={`min-h-[32px] px-2.5 py-1 text-label-sm rounded-card-xs focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 ${
                s === sortBy ? 'text-exp-gold bg-exp-gold/10' : 'text-exp-muted hover:text-white'
              }`}
            >
              {s === 'fantasyPoints' ? 'Pts' : s === 'fantasyPrice' ? 'Price' : 'GW Pts'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
