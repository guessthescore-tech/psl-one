'use client';

import { clsx } from 'clsx';
import { motion, useReducedMotion } from 'framer-motion';
import type { ExpFixture } from '@/lib/data';
import { MatchStateBadge } from './MatchStateBadge';

interface MatchHeaderProps {
  fixture: ExpFixture;
  compact?: boolean;
}

export function MatchHeader({ fixture, compact = false }: MatchHeaderProps) {
  const reduce = useReducedMotion();
  const hasScore =
    fixture.homeScore != null && fixture.awayScore != null;
  const isLive = fixture.status === 'LIVE' || fixture.status === 'HALF_TIME';

  const scoreClass = compact ? 'text-score-md' : 'text-score-xl';

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={clsx(
        'rounded-card border overflow-hidden',
        isLive
          ? 'bg-exp-navy border-exp-live/30 shadow-card-lg'
          : 'bg-exp-navy border-exp-border-dk shadow-card-md',
      )}
    >
      {/* Competition colour stripe */}
      <div className="flex h-1">
        <div
          className="flex-1 transition-all"
          style={{ backgroundColor: fixture.homeClub.primaryColor }}
          aria-hidden
        />
        <div
          className="flex-1 transition-all"
          style={{ backgroundColor: fixture.awayClub.primaryColor }}
          aria-hidden
        />
      </div>

      <div className={compact ? 'p-4' : 'px-6 py-8'}>
        {/* Competition + group */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-label-sm text-exp-muted uppercase tracking-wider">
            {fixture.competition}
            {fixture.group ? ` · ${fixture.group}` : ''}
          </span>
          <MatchStateBadge status={fixture.status} minute={fixture.minute} size={compact ? 'sm' : 'md'} />
        </div>

        {/* Score row */}
        <div className="flex items-center justify-between gap-4">
          {/* Home team */}
          <div className={clsx('flex-1', compact ? 'text-left' : 'text-center')}>
            <div
              className={clsx(
                'font-black text-white',
                compact ? 'text-body-lg' : 'text-display-sm',
              )}
            >
              {fixture.homeClub.shortName}
            </div>
            <div className="text-label-sm text-exp-muted mt-0.5">{fixture.homeClub.abbr}</div>
          </div>

          {/* Score */}
          <div className="flex-shrink-0 text-center">
            {hasScore ? (
              <div
                className={clsx(
                  'font-black tabular-nums text-white',
                  scoreClass,
                )}
                aria-label={`Score: ${fixture.homeScore} - ${fixture.awayScore}`}
              >
                {fixture.homeScore}
                <span className="text-exp-muted mx-1">-</span>
                {fixture.awayScore}
              </div>
            ) : (
              <div className="text-exp-muted font-bold text-xl">vs</div>
            )}
            {!compact && (
              <div className="text-label-sm text-exp-muted mt-1">{fixture.venue}</div>
            )}
          </div>

          {/* Away team */}
          <div className={clsx('flex-1', compact ? 'text-right' : 'text-center')}>
            <div
              className={clsx(
                'font-black text-white',
                compact ? 'text-body-lg' : 'text-display-sm',
              )}
            >
              {fixture.awayClub.shortName}
            </div>
            <div className="text-label-sm text-exp-muted mt-0.5">{fixture.awayClub.abbr}</div>
          </div>
        </div>

        {/* Venue line (compact only) */}
        {compact && (
          <div className="mt-3 text-label-sm text-exp-muted text-center">{fixture.venue}</div>
        )}
      </div>
    </motion.div>
  );
}
