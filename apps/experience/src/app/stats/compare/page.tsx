'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { clsx } from 'clsx';
import { WC_PLAYERS, getDataMode, isLiveDataMode, expImg, type ExpPlayer } from '@/lib/data';
import { PlayerComparison } from '@/components/football/PlayerComparison';
import { getContext } from '@/lib/football-api';
import { getTopPerformers, type TopPerformer } from '@/lib/players-api';
import { topPerformerToExpPlayer } from '@/lib/live-mappers';

export default function PlayerComparePage() {
  const mode = getDataMode();
  const [players, setPlayers] = useState<ExpPlayer[]>(mode === 'DESIGN_REVIEW_DATA' ? WC_PLAYERS : []);
  const [selectedA, setSelectedA] = useState<ExpPlayer | null>(() => (mode === 'DESIGN_REVIEW_DATA' ? WC_PLAYERS[0] ?? null : null));
  const [selectedB, setSelectedB] = useState<ExpPlayer | null>(() => (mode === 'DESIGN_REVIEW_DATA' ? WC_PLAYERS[1] ?? null : null));
  const [pickingSlot, setPickingSlot] = useState<'A' | 'B' | null>(null);
  const [loading, setLoading] = useState(isLiveDataMode(mode));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLiveDataMode(mode)) {
      setPlayers(WC_PLAYERS);
      setSelectedA(WC_PLAYERS[0] ?? null);
      setSelectedB(WC_PLAYERS[1] ?? WC_PLAYERS[0] ?? null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const season = await getContext();
        const topPerformers: TopPerformer[] = await getTopPerformers(season.id, 24);
        if (cancelled) return;

        const livePlayers = topPerformers.map(topPerformerToExpPlayer);
        setPlayers(livePlayers);
        setSelectedA((current) => current ?? livePlayers[0] ?? null);
        setSelectedB((current) => current ?? livePlayers[1] ?? livePlayers[0] ?? null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load live comparison data.');
          setPlayers([]);
          setSelectedA(null);
          setSelectedB(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const currentA = useMemo(() => selectedA ?? players[0] ?? null, [players, selectedA]);
  const currentB = useMemo(() => selectedB ?? players[1] ?? players[0] ?? null, [players, selectedB]);

  function handlePick(player: ExpPlayer) {
    if (pickingSlot === 'A') setSelectedA(player);
    else if (pickingSlot === 'B') setSelectedB(player);
    setPickingSlot(null);
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-exp-surface flex items-center justify-center">
        <div className="text-exp-muted text-sm">Loading live player comparison…</div>
      </div>
    );
  }

  if (!loading && error && players.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-exp-surface flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-4xl mb-4" aria-hidden>⚽</div>
          <div className="text-display-md text-exp-navy font-black mb-2">Comparison unavailable</div>
          <p className="text-body-md text-exp-muted mb-6">{error}</p>
          <Link
            href="/stats/season"
            className="inline-flex items-center gap-2 bg-exp-gold text-exp-void font-bold px-6 py-3 rounded-card-sm hover:bg-exp-gold-2 transition-colors min-h-[44px] focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
          >
            Back to season stats
          </Link>
        </div>
      </div>
    );
  }

  if (!currentA || !currentB) {
    return (
      <div className="min-h-[100dvh] bg-exp-surface flex items-center justify-center">
        <div className="text-exp-muted text-sm">No player data available yet.</div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-exp-surface">
      {mode === 'DESIGN_REVIEW_DATA' && (
        <div
          role="banner"
          className="bg-purple-700 text-white text-center text-xs py-1.5 px-4 font-mono sticky top-0 z-50"
        >
          DESIGN_REVIEW_DATA — player comparison (no compare API)
        </div>
      )}

      <div className="bg-exp-navy border-b border-exp-border-dk px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/stats/season"
            className="inline-flex items-center gap-1.5 text-label-md text-exp-muted hover:text-exp-gold transition-colors focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded"
          >
            ← Stats
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-10 space-y-6">
        <div>
          <h1 className="text-display-lg text-exp-navy font-black">Compare Players</h1>
          <p className="text-body-sm text-exp-muted">Tap a player card to swap</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(['A', 'B'] as const).map((slot) => {
            const player = slot === 'A' ? currentA : currentB;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => setPickingSlot(slot)}
                aria-label={`Change player ${slot === 'A' ? 'one' : 'two'}: currently ${player.name}`}
                className={clsx(
                  'bg-exp-navy rounded-card border transition-all text-left p-3',
                  'min-h-[44px] focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
                  pickingSlot === slot
                    ? 'border-exp-gold shadow-glow-gold'
                    : 'border-exp-border-dk hover:border-exp-gold/40',
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-exp-border-dk flex-shrink-0">
                    <Image
                      src={expImg(player.imageKey, 80, 80)}
                      alt={player.name}
                      fill
                      className="object-cover object-top"
                      sizes="40px"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-body-sm font-bold text-white truncate">{player.name}</div>
                    <div className="text-label-sm text-exp-muted">{player.position} · {player.club.abbr}</div>
                  </div>
                </div>
                <div className="text-label-sm text-exp-gold">Tap to change →</div>
              </button>
            );
          })}
        </div>

        {pickingSlot !== null && (
          <div
            className="bg-exp-navy rounded-card border border-exp-gold/30 p-4 shadow-card-lg"
            role="dialog"
            aria-label={`Pick player ${pickingSlot}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-label-lg text-exp-gold font-bold uppercase tracking-wider">
                Pick player {pickingSlot === 'A' ? 'one' : 'two'}
              </h2>
              <button
                type="button"
                onClick={() => setPickingSlot(null)}
                className="text-exp-muted hover:text-white min-h-[44px] w-10 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded"
                aria-label="Close player picker"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {players.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePick(p)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-card-sm text-left transition-colors min-h-[44px]',
                    'focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
                    (pickingSlot === 'A' ? currentA : currentB).id === p.id
                      ? 'bg-exp-gold/10 text-exp-gold'
                      : 'hover:bg-exp-ink text-white',
                  )}
                  aria-pressed={(pickingSlot === 'A' ? currentA : currentB).id === p.id}
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-exp-border-dk flex-shrink-0">
                    <Image
                      src={expImg(p.imageKey, 64, 64)}
                      alt={p.name}
                      fill
                      className="object-cover object-top"
                      sizes="32px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-body-sm font-semibold truncate">{p.name}</div>
                    <div className="text-label-sm text-exp-muted">{p.position} · {p.club.abbr}</div>
                  </div>
                  <div className="text-exp-gold font-bold text-label-sm tabular-nums">
                    {p.fantasyPoints}pts
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <PlayerComparison playerA={currentA} playerB={currentB} />

        <p className="text-label-sm text-exp-muted text-center">
          Points only · no real money · no financial value
        </p>
      </div>
    </div>
  );
}
