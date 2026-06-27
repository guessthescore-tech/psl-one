'use client';

import { use, useEffect, useState } from 'react';
import { Star, ArrowsLeftRight } from '@phosphor-icons/react/dist/ssr';
import { FantasyShell } from '@/components/fantasy/shared/FantasyShell';
import { FantasyEmptyState } from '@/components/fantasy/shared/FantasyEmptyState';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr';
import { getDataMode, isLiveDataMode, type ExpHistoryEntry } from '@/lib/data';
import { getGameweekHistory, type FantasyGameweekScore } from '@/lib/fantasy-api';

interface GameweekDetailPageProps {
  params: Promise<{ gameweekId: string }>;
}

function mapHistory(score: FantasyGameweekScore): ExpHistoryEntry {
  return {
    gameweekNumber: score.gameweek.round,
    gameweekLabel: score.gameweek.name,
    points: score.netPoints,
    totalPoints: score.netPoints,
    rank: score.rank ?? 0,
    transfers: 0,
    transferCost: score.transferCost,
    chipUsed: score.chipPoints > 0 ? 'Chip used' : null,
  };
}

export default function GameweekDetailPage({ params }: GameweekDetailPageProps) {
  const { gameweekId } = use(params);
  const mode = getDataMode();
  const [entry, setEntry] = useState<ExpHistoryEntry | null>(null);
  const [loading, setLoading] = useState(isLiveDataMode(mode));

  useEffect(() => {
    if (!isLiveDataMode(mode)) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    void getGameweekHistory(gameweekId).then((score) => {
      if (cancelled) return;
      setEntry(mapHistory(score));
      setLoading(false);
    }).catch(() => {
      if (!cancelled) {
        setEntry(null);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [gameweekId, mode]);

  if (loading) {
    return (
      <FantasyShell back={{ href: '/fantasy/history', label: 'Season History' }}>
        <div className="px-4 py-8 text-exp-muted">Loading live gameweek history…</div>
      </FantasyShell>
    );
  }

  if (!entry) {
    return (
      <FantasyShell back={{ href: '/fantasy/history', label: 'Season History' }}>
        <FantasyEmptyState
          icon={<CalendarBlank size={40} />}
          title="Gameweek not found"
          message="This gameweek doesn't exist or hasn't been completed yet."
          action={{ label: 'Back to History', href: '/fantasy/history' }}
        />
      </FantasyShell>
    );
  }

  return (
    <FantasyShell back={{ href: '/fantasy/history', label: 'Season History' }}>
      <div className="px-4 py-6 border-b border-exp-border-dk">
        <p className="text-label-lg text-exp-muted uppercase tracking-widest mb-1">{entry.gameweekLabel}</p>
        <div className="flex items-end gap-3">
          <span className="text-display-2xl text-exp-gold font-black leading-none">{entry.points}</span>
          <span className="text-display-sm text-exp-muted mb-1">points</span>
        </div>
        {entry.chipUsed && (
          <div className="flex items-center gap-1.5 mt-2">
            <Star size={14} weight="fill" className="text-exp-gold" />
            <span className="text-label-lg text-exp-gold">{entry.chipUsed} active</span>
          </div>
        )}
        <div className="flex gap-6 mt-4 pt-4 border-t border-exp-border-dk">
          <div>
            <div className="text-stat-md text-white font-black">#{entry.rank.toLocaleString()}</div>
            <div className="text-label-sm text-exp-muted">Overall rank</div>
          </div>
          <div>
            <div className="text-stat-md text-white font-black">GW{entry.gameweekNumber}</div>
            <div className="text-label-sm text-exp-muted">Gameweek</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 pb-20 flex flex-col gap-5">
        <div className="rounded-card bg-exp-navy border border-exp-border-dk p-4 flex items-center gap-3">
          <ArrowsLeftRight size={20} className="text-exp-muted flex-shrink-0" />
          <div>
            <div className="text-body-sm font-semibold text-white">
              {entry.transfers} transfer{entry.transfers !== 1 ? 's' : ''} made
            </div>
            <div className="text-label-sm text-exp-muted">
              {entry.transfers > 1 ? `−${(entry.transfers - 1) * 4} pts hit` : 'No point hit'}
            </div>
          </div>
        </div>

        <div className="rounded-card bg-exp-navy border border-exp-border-dk p-4">
          <h2 className="text-label-lg text-exp-muted uppercase tracking-widest mb-3">Gameweek summary</h2>
          <p className="text-body-md text-white">
            Live gameweek history is now backed by the Fantasy API. Player-level breakdown is shown in the team and player screens.
          </p>
        </div>

        <p className="text-label-sm text-exp-muted text-center">
          Points only — no real money — no financial value
        </p>
      </div>
    </FantasyShell>
  );
}
