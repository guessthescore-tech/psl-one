'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';
import type { ExpFixture } from '@/lib/data';
import { TeamIdentity } from './TeamIdentity';

interface FixtureCardProps {
  fixture: ExpFixture;
  index?: number;
}

function formatKickoff(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();

  const time = d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Today ${time}`;
  if (isTomorrow) return `Tomorrow ${time}`;
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) + ` ${time}`;
}


export function FixtureCard({ fixture, index = 0 }: FixtureCardProps) {
  const reduce = useReducedMotion();
  const isLive = fixture.status === 'LIVE' || fixture.status === 'HALF_TIME';
  const isFinished = fixture.status === 'FINISHED';

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={clsx(
        'snap-card relative rounded-card border overflow-hidden flex-shrink-0 w-[220px] sm:w-[240px]',
        isLive
          ? 'bg-exp-navy border-exp-live/30 shadow-card-md'
          : 'bg-exp-card border-exp-border shadow-card',
      )}
    >
      {/* Top colour bar */}
      <div className="flex h-0.5">
        <div className="flex-1" style={{ backgroundColor: fixture.homeClub.primaryColor }} aria-hidden />
        <div className="flex-1" style={{ backgroundColor: fixture.awayClub.primaryColor }} aria-hidden />
      </div>

      <div className="p-4">
        {/* Status badge */}
        <div className="flex items-center justify-between mb-3">
          {isLive ? (
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full bg-exp-live animate-live-pulse"
                aria-hidden
              />
              <span className="text-label-sm text-exp-live font-black tabular-nums">
                LIVE {fixture.minute}&apos;
              </span>
            </div>
          ) : isFinished ? (
            <span className="text-label-sm text-exp-muted">Full time</span>
          ) : (
            <span className="text-label-sm text-exp-muted">{formatKickoff(fixture.kickoffAt)}</span>
          )}
          {fixture.group && (
            <span className="text-label-sm text-exp-muted">{fixture.group}</span>
          )}
        </div>

        {/* Scoreline / teams */}
        <div className="flex items-center justify-between gap-2">
          <TeamIdentity club={fixture.homeClub} size="sm" showName nameClass={isLive ? 'text-white' : 'text-exp-navy'} />

          <div className="flex-1 text-center">
            {isLive || isFinished ? (
              <div
                className={clsx(
                  'text-score-md font-black tabular-nums',
                  isLive ? 'text-white' : 'text-exp-navy',
                )}
                aria-label={`Score: ${fixture.homeScore} - ${fixture.awayScore}`}
              >
                {fixture.homeScore} - {fixture.awayScore}
              </div>
            ) : (
              <div className={clsx('font-bold text-sm', isLive ? 'text-white/50' : 'text-exp-muted')}>
                vs
              </div>
            )}
          </div>

          <TeamIdentity club={fixture.awayClub} size="sm" showName nameClass={isLive ? 'text-white' : 'text-exp-navy'} />
        </div>

        {/* CTA */}
        <Link
          href={`/predict?fixture=${fixture.id}`}
          className={clsx(
            'mt-4 block text-center text-label-md font-bold py-2.5 rounded-card-xs transition-all duration-150 active:scale-[0.97]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold min-h-[44px] flex items-center justify-center',
            isLive
              ? 'bg-exp-live/20 text-exp-live hover:bg-exp-live/30'
              : isFinished
              ? 'bg-exp-surface text-exp-muted'
              : 'bg-exp-gold text-exp-void hover:bg-exp-gold-2',
          )}
          aria-label={`Predict ${fixture.homeClub.shortName} vs ${fixture.awayClub.shortName}`}
        >
          {isFinished ? 'View result' : 'Predict'}
        </Link>
      </div>
    </motion.div>
  );
}
