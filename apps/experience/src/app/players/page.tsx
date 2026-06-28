'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { WC_PLAYERS, getDataMode, isLiveDataMode } from '@/lib/data';
import type { ExpPlayer } from '@/lib/data';
import { PlayerProfileHero } from '@/components/football/PlayerProfileHero';
import { getWorldCupSeason } from '@/lib/football-api';
import { getPlayerPool, getPlayerPrices } from '@/lib/fantasy-api';
import { getTopPerformers } from '@/lib/players-api';
import { playerSummaryToExpPlayer, topPerformerToExpPlayer } from '@/lib/live-mappers';

type PositionFilter = 'ALL' | 'GK' | 'DEF' | 'MID' | 'FWD';
type SortOption = 'name' | 'points' | 'price' | 'goals';

const SORT_LABELS: Record<SortOption, string> = {
  name: 'A–Z',
  points: 'Points ↓',
  price: 'Price ↓',
  goals: 'Goals ↓',
};

export default function PlayersPage() {
  const mode = getDataMode();
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState<PositionFilter>('ALL');
  const [sort, setSort] = useState<SortOption>('points');
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

  const filtered = useMemo(() => {
    let list = [...players];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.club.name.toLowerCase().includes(q) ||
          p.nationality.toLowerCase().includes(q),
      );
    }
    if (posFilter !== 'ALL') list = list.filter((p) => p.position === posFilter);
    switch (sort) {
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'points':
        list.sort((a, b) => b.fantasyPoints - a.fantasyPoints);
        break;
      case 'price':
        list.sort((a, b) => b.fantasyPrice - a.fantasyPrice);
        break;
      case 'goals':
        list.sort((a, b) => b.goalsThisTournament - a.goalsThisTournament);
        break;
    }
    return list;
  }, [players, search, posFilter, sort]);

  const positions: PositionFilter[] = ['ALL', 'GK', 'DEF', 'MID', 'FWD'];

  return (
    <div className="min-h-[100dvh] bg-exp-surface">
      {mode === 'DESIGN_REVIEW_DATA' && (
        <div role="banner" className="bg-purple-700 text-white text-center text-xs py-1.5 px-4 font-mono sticky top-0 z-50">
          DESIGN_REVIEW_DATA — {players.length} mock players
        </div>
      )}

      <div className="bg-exp-navy border-b border-exp-border-dk px-4 pt-6 pb-5">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-display-lg text-white font-black mb-1">Players</h1>
          <p className="text-body-sm text-exp-muted mb-4">FIFA World Cup 2026</p>

          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-exp-muted" aria-hidden>🔍</span>
            <input
              type="search"
              placeholder="Search players, clubs, nationality…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-exp-ink border border-exp-border-dk rounded-card-sm text-white placeholder:text-exp-muted text-body-sm focus:outline-none focus:border-exp-gold/50 focus:ring-1 focus:ring-exp-gold/30 min-h-[44px]"
              aria-label="Search players"
            />
          </div>

          <div className="flex gap-2 flex-wrap mb-3" role="group" aria-label="Filter by position">
            {positions.map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => setPosFilter(pos)}
                aria-pressed={posFilter === pos}
                className={clsx(
                  'px-3 py-1.5 rounded-pill text-label-md font-bold transition-all min-h-[44px]',
                  'focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
                  posFilter === pos
                    ? 'bg-exp-gold text-exp-void'
                    : 'bg-exp-ink text-exp-muted border border-exp-border-dk hover:border-exp-gold/40',
                )}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-4" role="group" aria-label="Sort players">
          <span className="text-label-sm text-exp-muted">Sort:</span>
          {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setSort(opt)}
              aria-pressed={sort === opt}
              className={clsx(
                'px-2.5 py-1 rounded-pill text-label-sm font-bold transition-all',
                'focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
                sort === opt
                  ? 'bg-exp-gold/20 text-exp-gold border border-exp-gold/40'
                  : 'text-exp-muted hover:text-white',
              )}
            >
              {SORT_LABELS[opt]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="text-exp-muted text-sm">Loading live player pool…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-4" aria-hidden>🔍</div>
            <div className="text-display-sm text-exp-navy font-black mb-2">No players found</div>
            <p className="text-body-md text-exp-muted">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2" role="list" aria-label={`${filtered.length} players`}>
            {filtered.map((player: ExpPlayer) => (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                role="listitem"
                className="block focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded-card"
                aria-label={`${player.name}, ${player.position}, ${player.club.name}`}
              >
                <div className="bg-exp-card border border-exp-border rounded-card-sm px-4 py-3 flex items-center gap-3 hover:border-exp-gold/40 hover:shadow-card transition-all min-h-[44px] h-full">
                  <PlayerProfileHero player={player} compact />
                  <div className="ml-auto flex-shrink-0 text-right">
                    <div className="text-stat-md font-black text-exp-gold tabular-nums">{player.fantasyPoints}</div>
                    <div className="text-label-sm text-exp-muted">pts</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <p className="text-label-sm text-exp-muted text-center mt-6">
          Points only · no real money · no financial value
        </p>
      </div>
    </div>
  );
}
