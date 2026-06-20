'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';

type FilterId = 'ALL' | 'MY_LEAGUES' | 'FRIENDS';

interface FilterPill {
  id: FilterId;
  label: string;
}

const FILTERS: FilterPill[] = [
  { id: 'ALL',        label: 'All'        },
  { id: 'MY_LEAGUES', label: 'My Leagues' },
  { id: 'FRIENDS',    label: 'Friends'    },
];

interface ManagerFiltersProps {
  active: FilterId;
  onChange: (id: FilterId) => void;
}

export function ManagerFilters({ active, onChange }: ManagerFiltersProps) {
  const reduce = useReducedMotion();

  return (
    <div
      role="group"
      aria-label="Filter managers"
      className="flex gap-2 px-4 py-3 border-b border-exp-border-dk overflow-x-auto"
    >
      {FILTERS.map((filter) => {
        const isActive = filter.id === active;
        return (
          <motion.button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            aria-pressed={isActive}
            whileTap={reduce ? {} : { scale: 0.95 }}
            className={clsx(
              'flex-shrink-0 px-4 py-1.5 rounded-pill text-label-lg uppercase tracking-wider',
              'min-h-[36px] transition-all focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
              isActive
                ? 'bg-exp-gold text-exp-void font-black'
                : 'bg-exp-ink border border-exp-border-dk text-exp-muted hover:border-white/20 hover:text-white',
            )}
          >
            {filter.label}
          </motion.button>
        );
      })}
    </div>
  );
}
