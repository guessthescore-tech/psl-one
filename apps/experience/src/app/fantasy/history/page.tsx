'use client';

import { useEffect, useMemo, useState } from 'react';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasyPageHero } from '@/components/fantasy/shared/FantasyPageHero';
import { FantasyEmptyState } from '@/components/fantasy/shared/FantasyEmptyState';
import { FantasyHistoryTimeline } from '@/components/fantasy/leagues/FantasyHistoryTimeline';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr';
import { FANTASY_MOCK_HISTORY, getDataMode, isLiveDataMode, type ExpHistoryEntry } from '@/lib/data';
import { getHistory, type FantasyHistoryEntry } from '@/lib/fantasy-api';

function mapHistory(entries: FantasyHistoryEntry[]): ExpHistoryEntry[] {
  let cumulative = 0;
  return entries.map((entry) => {
    cumulative += entry.netPoints;
    return {
      gameweekNumber: entry.gameweek.round,
      gameweekLabel: entry.gameweek.name,
      points: entry.netPoints,
      totalPoints: cumulative,
      rank: entry.rank ?? 0,
      transfers: 0,
      transferCost: entry.transferCost,
      chipUsed: entry.chipPoints > 0 ? 'Chip used' : null,
    };
  });
}

function computeSummary(entries: ExpHistoryEntry[]) {
  if (entries.length === 0) return null;
  const totalPoints = entries.reduce((sum, e) => sum + e.points, 0);
  const bestGw = entries.reduce((best, e) => (e.points > best.points ? e : best), entries[0]!);
  const avgRank = Math.round(entries.reduce((sum, e) => sum + e.rank, 0) / entries.length);
  const chipsUsed = entries.filter(e => e.chipUsed).map(e => e.chipUsed!);
  return { totalPoints, bestGw, avgRank, chipsUsed };
}

export default function HistoryPage() {
  const mode = getDataMode();
  const [entries, setEntries] = useState<ExpHistoryEntry[]>(mode === 'DESIGN_REVIEW_DATA' ? FANTASY_MOCK_HISTORY : []);
  const [loading, setLoading] = useState(isLiveDataMode(mode));

  useEffect(() => {
    if (!isLiveDataMode(mode)) {
      setEntries(FANTASY_MOCK_HISTORY);
      setLoading(false);
      return;
    }

    let cancelled = false;
    void getHistory().then((data) => {
      if (cancelled) return;
      setEntries(mapHistory(data));
      setLoading(false);
    }).catch(() => {
      if (!cancelled) {
        setEntries([]);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [mode]);

  const summary = useMemo(() => computeSummary(entries), [entries]);

  if (!loading && entries.length === 0) {
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
      {loading ? (
        <div className="px-4 py-8 text-exp-muted">Loading live history…</div>
      ) : (
        <>
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
        </>
      )}
    </FantasyShell>
  );
}
