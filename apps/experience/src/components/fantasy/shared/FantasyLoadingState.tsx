'use client';

import { SkeletonCard } from './SkeletonCard';
import { SkeletonText } from './SkeletonText';

interface FantasyLoadingStateProps {
  rows?: number;
  type?: 'card' | 'list' | 'pitch';
}

export function FantasyLoadingState({ rows = 3, type = 'card' }: FantasyLoadingStateProps) {
  if (type === 'pitch') {
    return (
      <div className="space-y-3 p-4" aria-label="Loading pitch…" aria-busy="true">
        {/* GK row */}
        <div className="flex justify-center">
          <SkeletonCard className="w-16 h-20" />
        </div>
        {/* DEF row */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3].map(i => <SkeletonCard key={i} className="w-16 h-20" />)}
        </div>
        {/* MID row */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map(i => <SkeletonCard key={i} className="w-16 h-20" />)}
        </div>
        {/* FWD row */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map(i => <SkeletonCard key={i} className="w-16 h-20" />)}
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-2" aria-label="Loading list…" aria-busy="true">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-card bg-exp-navy">
            <SkeletonCard className="w-10 h-10 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonText width="w-3/4" height="h-3" />
              <SkeletonText width="w-1/2" height="h-2.5" />
            </div>
            <SkeletonText width="w-12" height="h-6" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3" aria-label="Loading…" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonCard key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}
