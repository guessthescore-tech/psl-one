'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';
import { RankMovement } from './RankMovement';
import type { ExpLeagueManager } from '@/lib/data';

interface ManagerRowProps {
  manager: ExpLeagueManager;
  isCurrentUser?: boolean;
  leagueId: string;
  index: number;
}

export function ManagerRow({ manager, isCurrentUser, leagueId, index }: ManagerRowProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/fantasy/leagues/${leagueId}/teams/${manager.rank}`}
        className={clsx(
          'flex items-center gap-3 px-4 py-3 border-b border-exp-border-dk',
          'transition-colors hover:bg-white/3',
          isCurrentUser && 'bg-exp-gold/10',
        )}
        aria-label={`${manager.managerName} — ${manager.teamName} — Rank ${manager.rank}`}
      >
        {/* Rank */}
        <div className="w-6 text-center text-label-lg text-exp-muted font-black flex-shrink-0">
          {manager.rank}
        </div>

        {/* Movement */}
        <div className="w-8 text-center flex-shrink-0">
          <RankMovement current={manager.rank} previous={manager.previousRank} />
        </div>

        {/* Manager info */}
        <div className="flex-1 min-w-0">
          <div className={clsx('text-body-sm font-semibold truncate', isCurrentUser ? 'text-exp-gold' : 'text-white')}>
            {manager.managerName}
            {isCurrentUser && <span className="ml-1 text-label-sm text-exp-gold/60">(You)</span>}
          </div>
          <div className="text-label-sm text-exp-muted truncate">{manager.teamName}</div>
        </div>

        {/* GW points */}
        <div className="text-right flex-shrink-0">
          <div className="text-body-sm font-black text-white">{manager.gameweekPoints}</div>
          <div className="text-label-sm text-exp-muted">GW</div>
        </div>

        {/* Total points */}
        <div className="text-right w-16 flex-shrink-0">
          <div className={clsx('text-body-sm font-black', isCurrentUser ? 'text-exp-gold' : 'text-white')}>
            {manager.totalPoints.toLocaleString()}
          </div>
          <div className="text-label-sm text-exp-muted">Total</div>
        </div>
      </Link>
    </motion.div>
  );
}
