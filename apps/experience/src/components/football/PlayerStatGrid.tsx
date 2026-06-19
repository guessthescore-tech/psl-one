'use client';

import { motion, useReducedMotion } from 'framer-motion';

export interface PlayerStat {
  label: string;
  value: string | number;
  highlight?: boolean;
}

interface PlayerStatGridProps {
  stats: PlayerStat[];
  columns?: 2 | 3 | 4;
}

export function PlayerStatGrid({ stats, columns = 3 }: PlayerStatGridProps) {
  const reduce = useReducedMotion();

  const gridClass =
    columns === 4
      ? 'grid-cols-2 sm:grid-cols-4'
      : columns === 3
      ? 'grid-cols-3'
      : 'grid-cols-2';

  return (
    <div className={`grid ${gridClass} gap-3`} role="list" aria-label="Player statistics">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          role="listitem"
          initial={reduce ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="bg-exp-ink rounded-card-sm border border-exp-border-dk p-3 text-center"
        >
          <div
            className={
              stat.highlight
                ? 'text-stat-md font-black text-exp-gold'
                : 'text-stat-md font-black text-white'
            }
          >
            {stat.value}
          </div>
          <div className="text-label-sm text-exp-muted mt-0.5">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
