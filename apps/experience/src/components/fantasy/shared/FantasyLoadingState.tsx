'use client';

import { SkeletonCard } from './SkeletonCard';
import { SkeletonText } from './SkeletonText';

interface FantasyLoadingStateProps {
  rows?: number;
  type?: 'card' | 'list' | 'pitch';
}

export function FantasyLoadingState({ rows = 3, type = 'card' }: FantasyLoadingStateProps) {
  if (type === 'list') {
    return (
      <div className="space-y-3 px-4" aria-busy="true" aria-label="Loading content">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonCard height={44} rounded="rounded-full" />
            <div className="flex-1 space-y-2">
              <SkeletonText width="3/4" size="md" />
              <SkeletonText width="1/2" size="sm" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'pitch') {
    return (
      <div className="space-y-4 px-4" aria-busy="true" aria-label="Loading pitch">
        <SkeletonCard height={320} rounded="rounded-card" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} height={80} rounded="rounded-card-sm" />
          ))}
        </div>
      </div>
    );
  }

  // default: card
  return (
    <div className="space-y-3 px-4" aria-busy="true" aria-label="Loading content">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonCard height={100} rounded="rounded-card" />
          <div className="px-1 space-y-1.5">
            <SkeletonText width="3/4" size="md" />
            <SkeletonText width="1/2" size="sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
