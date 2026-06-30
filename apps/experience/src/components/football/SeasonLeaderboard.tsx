'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';
import { expImg } from '@/lib/data';
import { CATEGORY_LABELS } from './SeasonLeaderboard.helpers';
import type { LeaderboardCategory, LeaderboardEntry } from './SeasonLeaderboard.helpers';
export type { LeaderboardCategory, LeaderboardEntry } from './SeasonLeaderboard.helpers';
export { CATEGORY_LABELS, buildLeaderboard } from './SeasonLeaderboard.helpers';

interface SeasonLeaderboardProps {
  category: LeaderboardCategory;
  entries: LeaderboardEntry[];
}

const TREND_ICON: Record<string, string> = { up: '↑', down: '↓', same: '—' };

function getMedalClass(rank: number): string {
  if (rank === 1) return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/40';
  if (rank === 2) return 'bg-gray-400/20 text-gray-300 border-gray-400/40';
  if (rank === 3) return 'bg-amber-700/20 text-amber-600 border-amber-700/40';
  return 'bg-exp-ink text-exp-muted border-exp-border-dk';
}

export function SeasonLeaderboard({ category, entries }: SeasonLeaderboardProps) {
  const reduce = useReducedMotion();

  if (entries.length === 0) {
    return (
      <div className="py-8 text-center text-exp-muted text-body-md">
        No data available for this category.
      </div>
    );
  }

  return (
    <div role="list" aria-label={`${CATEGORY_LABELS[category]} leaderboard`} className="space-y-2">
      {entries.map((entry, i) => (
        <motion.div
          key={entry.player.id}
          role="listitem"
          initial={reduce ? false : { opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3 bg-exp-navy rounded-card-sm border border-exp-border-dk px-4 py-3"
          aria-label={`Rank ${entry.rank}: ${entry.player.name}, ${entry.value}${entry.unit ?? ''}`}
        >
          {/* Rank badge */}
          <div
            className={clsx(
              'w-7 h-7 rounded-full border flex items-center justify-center text-label-sm font-black flex-shrink-0',
              getMedalClass(entry.rank),
            )}
          >
            {entry.rank}
          </div>

          {/* Player portrait */}
          <div className="w-9 h-9 rounded-full overflow-hidden border border-exp-border-dk flex-shrink-0 relative">
            <Image
              src={expImg(entry.player.imageKey, 72, 72)}
              alt={entry.player.name}
              fill
              className="object-cover object-top"
              sizes="36px"
            />
          </div>

          {/* Name + club */}
          <div className="flex-1 min-w-0">
            <div className="text-body-sm font-bold text-white truncate">{entry.player.name}</div>
            <div className="text-label-sm text-exp-muted">{entry.player.club.shortName}</div>
          </div>

          {/* Trend */}
          {entry.trend && (
            <div
              className={clsx(
                'text-label-sm font-bold',
                entry.trend === 'up'   ? 'text-exp-green' :
                entry.trend === 'down' ? 'text-exp-live'  : 'text-exp-muted',
              )}
              aria-label={`Trend: ${entry.trend}`}
            >
              {TREND_ICON[entry.trend]}
            </div>
          )}

          {/* Value */}
          <div className="text-right flex-shrink-0">
            <span className="text-stat-md font-black text-exp-gold tabular-nums">
              {entry.value}
            </span>
            {entry.unit && (
              <span className="text-label-sm text-exp-muted ml-0.5">{entry.unit}</span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

