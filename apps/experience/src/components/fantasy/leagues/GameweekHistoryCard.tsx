'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Star } from '@phosphor-icons/react/dist/ssr';
import { clsx } from 'clsx';
import type { ExpHistoryEntry } from '@/lib/data';

interface GameweekHistoryCardProps {
  entry: ExpHistoryEntry;
  index?: number;
}

export function GameweekHistoryCard({ entry, index = 0 }: GameweekHistoryCardProps) {
  const reduce = useReducedMotion();
  const isHighScore = entry.points >= 100;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        href={`/fantasy/history/${entry.gameweekNumber}`}
        className={clsx(
          'block rounded-card bg-exp-navy border p-4 transition-shadow hover:shadow-card-md',
          'focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
          isHighScore ? 'border-exp-gold/30' : 'border-exp-border-dk',
        )}
        aria-label={`${entry.gameweekLabel} — ${entry.points} points, rank ${entry.rank.toLocaleString()}`}
      >
        <div className="flex items-center gap-4">
          {/* GW label */}
          <div className="flex-shrink-0 w-12 text-center">
            <div className="text-label-sm text-exp-muted uppercase tracking-widest">GW</div>
            <div className="text-stat-md text-white font-black">{entry.gameweekNumber}</div>
          </div>

          {/* Divider */}
          <div className="w-px h-10 bg-exp-border-dk flex-shrink-0" />

          {/* Points */}
          <div className="flex-shrink-0">
            <div className={clsx('text-stat-md font-black', isHighScore ? 'text-exp-gold' : 'text-white')}>
              {entry.points}
            </div>
            <div className="text-label-sm text-exp-muted">points</div>
          </div>

          {/* Stats */}
          <div className="flex-1 min-w-0">
            <div className="text-label-sm text-exp-muted">
              Overall #{entry.rank.toLocaleString()}
            </div>
            {entry.chipUsed && (
              <div className="flex items-center gap-1 mt-1">
                <Star size={10} weight="fill" className="text-exp-gold" />
                <span className="text-label-sm text-exp-gold">{entry.chipUsed}</span>
              </div>
            )}
            {entry.transfers > 0 && (
              <div className="text-label-sm text-exp-muted mt-0.5">
                {entry.transfers} transfer{entry.transfers > 1 ? 's' : ''}
              </div>
            )}
          </div>

          <ArrowRight size={16} className="text-exp-muted flex-shrink-0" />
        </div>
      </Link>
    </motion.div>
  );
}
