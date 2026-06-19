'use client';

import { ArrowUp, ArrowDown, Minus } from '@phosphor-icons/react';
import { clsx } from 'clsx';

interface RankMovementProps {
  current: number;
  previous: number;
}

export function RankMovement({ current, previous }: RankMovementProps) {
  const diff = previous - current; // positive = moved up (rank number decreased)

  if (diff > 0) {
    return (
      <span
        aria-label={`Moved up ${diff} place${diff === 1 ? '' : 's'}`}
        className="inline-flex items-center gap-0.5 text-exp-green text-label-md"
      >
        <ArrowUp weight="bold" size={12} />
        <span>{diff}</span>
      </span>
    );
  }

  if (diff < 0) {
    const absDiff = Math.abs(diff);
    return (
      <span
        aria-label={`Moved down ${absDiff} place${absDiff === 1 ? '' : 's'}`}
        className="inline-flex items-center gap-0.5 text-exp-live text-label-md"
      >
        <ArrowDown weight="bold" size={12} />
        <span>{absDiff}</span>
      </span>
    );
  }

  return (
    <span
      aria-label="No change in rank"
      className={clsx('inline-flex items-center text-exp-muted text-label-md')}
    >
      <Minus weight="bold" size={12} />
    </span>
  );
}
