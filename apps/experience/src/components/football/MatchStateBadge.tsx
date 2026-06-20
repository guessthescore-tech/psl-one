'use client';

import { clsx } from 'clsx';
import type { ExpFixture } from '@/lib/data';

interface MatchStateBadgeProps {
  status: ExpFixture['status'];
  minute?: number | null;
  size?: 'sm' | 'md' | 'lg';
}

export function MatchStateBadge({ status, minute, size = 'md' }: MatchStateBadgeProps) {
  const sizeClass = {
    sm: 'text-label-sm px-2 py-0.5 gap-1',
    md: 'text-label-md px-2.5 py-1 gap-1.5',
    lg: 'text-label-lg px-3 py-1.5 gap-2',
  }[size];

  if (status === 'LIVE') {
    return (
      <span
        className={clsx(
          'inline-flex items-center rounded-pill font-black bg-exp-live/20 text-exp-live border border-exp-live/40',
          sizeClass,
        )}
        aria-label={`Live match, minute ${minute ?? ''}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-exp-live animate-live-pulse" aria-hidden />
        LIVE{minute != null ? ` ${minute}'` : ''}
      </span>
    );
  }

  if (status === 'HALF_TIME') {
    return (
      <span
        className={clsx(
          'inline-flex items-center rounded-pill font-black bg-exp-warning/20 text-exp-warning border border-exp-warning/40',
          sizeClass,
        )}
        aria-label="Half time"
      >
        HT
      </span>
    );
  }

  if (status === 'FINISHED') {
    return (
      <span
        className={clsx(
          'inline-flex items-center rounded-pill font-bold bg-exp-surface text-exp-muted border border-exp-border',
          sizeClass,
        )}
        aria-label="Full time"
      >
        FT
      </span>
    );
  }

  // SCHEDULED
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-pill font-bold bg-exp-blue/10 text-exp-blue border border-exp-blue/30',
        sizeClass,
      )}
      aria-label="Scheduled"
    >
      UPCOMING
    </span>
  );
}
