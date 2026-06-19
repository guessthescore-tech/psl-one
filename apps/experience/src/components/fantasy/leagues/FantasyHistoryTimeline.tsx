'use client';

import { GameweekHistoryCard } from './GameweekHistoryCard';
import type { ExpHistoryEntry } from '@/lib/data';

interface FantasyHistoryTimelineProps {
  entries: ExpHistoryEntry[];
}

export function FantasyHistoryTimeline({ entries }: FantasyHistoryTimelineProps) {
  if (entries.length === 0) return null;

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div
        aria-hidden
        className="absolute left-[31px] top-4 bottom-4 w-px bg-exp-border-dk"
      />
      <div className="flex flex-col gap-3 px-4 py-2 relative">
        {entries.map((entry, index) => (
          <div key={entry.gameweekId} className="relative">
            {/* Timeline dot */}
            <div
              aria-hidden
              className="absolute left-[-1px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-exp-navy-2 border-2 border-exp-gold/40 z-10"
            />
            <div className="ml-8">
              <GameweekHistoryCard entry={entry} index={index} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
