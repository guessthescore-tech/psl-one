'use client';

import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasyPageHero } from '@/components/fantasy/shared/FantasyPageHero';
import { FantasyEmptyState } from '@/components/fantasy/shared/FantasyEmptyState';
import { FantasyHistoryTimeline } from '@/components/fantasy/leagues/FantasyHistoryTimeline';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr';
import { FANTASY_MOCK_HISTORY } from '@/lib/data';

function computeSummary(entries: typeof FANTASY_MOCK_HISTORY) {
  if (entries.length === 0) return null;
  const totalPoints = entries.reduce((sum, e) => sum + e.points, 0);
  const bestGw = entries.reduce((best, e) => (e.points > best.points ? e : best), entries[0]!);
  const avgRank = Math.round(entries.reduce((sum, e) => sum + e.rank, 0) / entries.length);
  const chipsUsed = entries.filter(e => e.chipUsed).map(e => e.chipUsed!);
  return { totalPoints, bestGw, avgRank, chipsUsed };
}

export default function HistoryPage() {
  const entries = FANTASY_MOCK_HISTORY;
  const summary = computeSummary(entries);

  if (entries.length === 0) {
    return (
      <FantasyShell title="Season History" back={{ href: '/fantasy', label: 'Fantasy Home' }}>
        <FantasyEmptyState
          icon={<CalendarBlank size={40} />}
          title="Season hasn't started"
          message="Your gameweek history will appear here once the season is underway."
        />
      </FantasyShell>
    );
  }

  return (
    <FantasyShell
      title="Season History"
      subtitle="All gameweeks at a glance"
      back={{ href: '/fantasy', label: 'Fantasy Home' }}
    >
      {summary && (
        <FantasyPageHero
          title="Season Overview"
          badge="World Cup 2026"
          stat={{ label: 'Total Points', value: summary.totalPoints.toLocaleString() }}
        />
      )}

      {summary && summary.chipsUsed.length > 0 && (
        <div className="px-4 pt-4 pb-2 flex gap-2 flex-wrap">
          {summary.chipsUsed.map((chip) => (
            <span
              key={chip}
              className="text-label-sm text-exp-gold bg-exp-gold/10 border border-exp-gold/30 rounded-pill px-3 py-1"
            >
              {chip} used
            </span>
          ))}
        </div>
      )}

      <div className="pb-20">
        <FantasyHistoryTimeline entries={entries} />
      </div>
    </FantasyShell>
  );
}
