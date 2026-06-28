'use client';

import { useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { WC_PLAYERS, getDataMode, isLiveDataMode, type ExpPlayer } from '@/lib/data';
import { SeasonLeaderboard, buildLeaderboard } from '@/components/football/SeasonLeaderboard';
import type { LeaderboardCategory } from '@/components/football/SeasonLeaderboard';
import { getWorldCupSeason } from '@/lib/football-api';
import { getPlayerPool, getPlayerPrices } from '@/lib/fantasy-api';
import { getTopPerformers } from '@/lib/players-api';
import { playerSummaryToExpPlayer, topPerformerToExpPlayer } from '@/lib/live-mappers';

const TABS: Array<{ id: LeaderboardCategory; label: string; icon: string }> = [
  { id: 'goals',       label: 'Top Scorers',  icon: '⚽' },
  { id: 'assists',     label: 'Top Assists',  icon: '🅰️' },
  { id: 'ratings',     label: 'Best Ratings', icon: '⭐' },
  { id: 'cleanSheets', label: 'Clean Sheets', icon: '🧤' },
];

export default function SeasonStatsPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardCategory>('goals');
  const mode = getDataMode();
  const [players, setPlayers] = useState<ExpPlayer[]>(mode === 'DESIGN_REVIEW_DATA' ? WC_PLAYERS : []);
  const [loading, setLoading] = useState(isLiveDataMode(mode));

  useEffect(() => {
    if (!isLiveDataMode(mode)) {
      setPlayers(WC_PLAYERS);
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        const season = await getWorldCupSeason();
        const [pool, prices, topPerformers] = await Promise.all([
          getPlayerPool(undefined, season.id),
          getPlayerPrices(season.id),
          getTopPerformers(season.id, 50).catch(() => []),
        ]);
        if (cancelled) return;

        const priceMap = new Map(prices.map((p) => [p.playerId, p.currentPrice]));
        const performerMap = new Map(topPerformers.map((p) => [p.playerId, p]));
        const livePlayers =
          pool.length > 0
            ? pool.map((player) => {
                const perf = performerMap.get(player.id);
                return playerSummaryToExpPlayer(player, {
                  goalsThisTournament: perf?.goals ?? 0,
                  assistsThisTournament: perf?.assists ?? 0,
                  fantasyPoints: perf?.fantasyPoints ?? 0,
                  fantasyPrice: priceMap.get(player.id),
                });
              })
            : topPerformers.map((perf) => topPerformerToExpPlayer(perf));

        setPlayers(livePlayers);
      } catch {
        if (!cancelled) setPlayers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const totalGoals = useMemo(() => players.reduce((s, p) => s + p.goalsThisTournament, 0), [players]);
  const topScorer = useMemo(() => [...players].sort((a, b) => b.goalsThisTournament - a.goalsThisTournament)[0] ?? null, [players]);
  const topAssister = useMemo(() => [...players].sort((a, b) => b.assistsThisTournament - a.assistsThisTournament)[0] ?? null, [players]);
  const entries = useMemo(() => buildLeaderboard(players, activeTab), [players, activeTab]);

  return (
    <div className="min-h-[100dvh] bg-exp-surface">
      {mode === 'DESIGN_REVIEW_DATA' && (
        <div role="banner" className="bg-purple-700 text-white text-center text-xs py-1.5 px-4 font-mono sticky top-0 z-50">
          DESIGN_REVIEW_DATA — WC 2026 season stats
        </div>
      )}

      <div className="bg-exp-navy border-b border-exp-border-dk px-4 pt-6 pb-5">
        <div className="max-w-2xl mx-auto">
          <div className="text-label-sm text-exp-gold font-bold uppercase tracking-wider mb-1">
            FIFA World Cup 2026
          </div>
          <h1 className="text-display-lg text-white font-black mb-5">Season Stats</h1>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-exp-ink rounded-card-sm border border-exp-border-dk p-3 text-center">
              <div className="text-stat-xl font-black text-exp-gold tabular-nums">{totalGoals}</div>
              <div className="text-label-sm text-exp-muted">Total Goals</div>
            </div>
            <div className="bg-exp-ink rounded-card-sm border border-exp-border-dk p-3 text-center">
              <div className="text-stat-md font-black text-white truncate">{topScorer?.name.split(' ')[0] ?? '—'}</div>
              <div className="text-label-sm text-exp-muted">Top Scorer</div>
              <div className="text-exp-gold font-black">{topScorer?.goalsThisTournament ?? 0}G</div>
            </div>
            <div className="bg-exp-ink rounded-card-sm border border-exp-border-dk p-3 text-center">
              <div className="text-stat-md font-black text-white truncate">{topAssister?.name.split(' ')[0] ?? '—'}</div>
              <div className="text-label-sm text-exp-muted">Most Assists</div>
              <div className="text-exp-gold font-black">{topAssister?.assistsThisTournament ?? 0}A</div>
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Stats categories">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`stats-panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-label-md font-bold rounded-t-card-sm transition-all min-h-[44px]',
                  'focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
                  activeTab === tab.id ? 'text-exp-gold bg-exp-surface' : 'text-exp-muted hover:text-white',
                )}
              >
                <span aria-hidden>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div id={`stats-panel-${activeTab}`} role="tabpanel" aria-label={TABS.find((t) => t.id === activeTab)?.label}>
          {loading ? (
            <div className="py-12 text-center text-exp-muted">Loading live season stats…</div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-4xl mb-4" aria-hidden>📊</div>
              <div className="text-display-sm text-exp-navy font-black mb-2">No data yet</div>
              <p className="text-body-md text-exp-muted">Stats will appear as matches are played.</p>
            </div>
          ) : (
            <SeasonLeaderboard category={activeTab} entries={entries} />
          )}
        </div>

        <p className="text-label-sm text-exp-muted text-center mt-6">
          Points only · no real money · no financial value
        </p>
      </div>
    </div>
  );
}
