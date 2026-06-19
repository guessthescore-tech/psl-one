'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { clsx } from 'clsx';
import { WC_PLAYERS, getDataMode, expImg } from '@/lib/data';
import type { ExpPlayer } from '@/lib/data';
import { PlayerComparison } from '@/components/football/PlayerComparison';

// DESIGN_REVIEW_DATA only — no compare API
export default function PlayerComparePage() {
  const mode = getDataMode();
  const players = WC_PLAYERS;

  // Pre-select Mbappe vs Vinicius Jr from mock players (DESIGN_REVIEW_DATA)
  // Player ids: 'mbappe' (index 0), 'vinicius' (index 1)
  const defaultA = players.find((p) => p.id === 'mbappe') ?? players[0]!;
  const defaultB = players.find((p) => p.id === 'vinicius') ?? players[1]!;
  const [selectedA, setSelectedA] = useState<ExpPlayer>(defaultA);
  const [selectedB, setSelectedB] = useState<ExpPlayer>(defaultB);
  const [pickingSlot, setPickingSlot] = useState<'A' | 'B' | null>(null);

  function handlePick(player: ExpPlayer) {
    if (pickingSlot === 'A') setSelectedA(player);
    else if (pickingSlot === 'B') setSelectedB(player);
    setPickingSlot(null);
  }

  return (
    <div className="min-h-[100dvh] bg-exp-surface">
      {/* Design review banner */}
      {mode === 'DESIGN_REVIEW_DATA' && (
        <div
          role="banner"
          className="bg-purple-700 text-white text-center text-xs py-1.5 px-4 font-mono sticky top-0 z-50"
        >
          DESIGN_REVIEW_DATA — player comparison (no compare API)
        </div>
      )}

      {/* Back nav */}
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
        {/* Header */}
        <div>
          <h1 className="text-display-lg text-exp-navy font-black">Compare Players</h1>
          <p className="text-body-sm text-exp-muted">Tap a player card to swap</p>
        </div>

        {/* Player selector cards */}
        <div className="grid grid-cols-2 gap-3">
          {(['A', 'B'] as const).map((slot) => {
            const player = slot === 'A' ? selectedA : selectedB;
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

        {/* Player picker bottom sheet (inline panel) */}
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
                    (pickingSlot === 'A' ? selectedA : selectedB).id === p.id
                      ? 'bg-exp-gold/10 text-exp-gold'
                      : 'hover:bg-exp-ink text-white',
                  )}
                  aria-pressed={(pickingSlot === 'A' ? selectedA : selectedB).id === p.id}
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

        {/* Comparison component */}
        <PlayerComparison playerA={selectedA} playerB={selectedB} />

        <p className="text-label-sm text-exp-muted text-center">
          Points only · no real money · no financial value
        </p>
      </div>
    </div>
  );
}
