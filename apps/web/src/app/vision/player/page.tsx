'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { PSL_PLAYERS, PSL_FIXTURES, visionImg } from '@/lib/vision-data';

const POSITION_LABELS: Record<string, string> = {
  GK: 'Goalkeeper', DEF: 'Defender', MID: 'Midfielder', FWD: 'Forward',
};

export default function VisionPlayerPage() {
  const reduce = useReducedMotion();
  const [selectedId, setSelectedId] = useState(PSL_PLAYERS[0]!.id);
  const player = PSL_PLAYERS.find(p => p.id === selectedId) ?? PSL_PLAYERS[0]!;

  return (
    <main className="min-h-[100dvh] bg-psl-surface">

      {/* Vision nav */}
      <nav className="bg-psl-midnight border-b border-white/10 px-6 py-3 flex items-center justify-between" aria-label="Vision studio nav">
        <Link href="/vision" className="text-[10px] font-bold text-white/40 hover:text-white/70 motion-safe:transition-colors flex items-center gap-1.5 focus-visible:outline-none">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Vision Hub
        </Link>
        <span className="text-[10px] font-bold uppercase tracking-widest text-psl-gold">Player Spotlight</span>
        <span className="text-[10px] text-white/30 uppercase tracking-wide">Design Review</span>
      </nav>

      {/* Hero — full-bleed player */}
      <section
        className="relative min-h-[60dvh] flex items-end bg-psl-midnight overflow-hidden"
        aria-label={`Player profile: ${player.name}`}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${visionImg(player.imageKey, 1440, 800)})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-psl-midnight via-psl-midnight/60 to-transparent" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-psl-midnight/90 to-transparent" aria-hidden />

        {/* Club colour stripe */}
        <div
          className="absolute top-0 bottom-0 right-0 w-1"
          style={{ backgroundColor: player.club.primaryColor }}
          aria-hidden
        />

        <div className="relative z-10 px-6 py-10 max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-psl-gold mb-2">
            {POSITION_LABELS[player.position]} · {player.club.name}
          </p>
          <motion.h1
            key={player.id}
            initial={reduce ? false : { opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="text-display-xl text-white leading-tight mb-5"
          >
            {player.name}
          </motion.h1>

          {/* Key stats */}
          <div className="flex flex-wrap gap-6">
            {[
              { label: 'Goals', value: player.goalsThisSeason },
              { label: 'Assists', value: player.assistsThisSeason },
              { label: 'Rating', value: player.rating.toFixed(1) },
              { label: 'FPL pts', value: player.fantasyPoints },
              { label: 'Price', value: `£${player.fantasyPrice}m` },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-stat-lg font-black text-psl-gold tabular-nums">{stat.value}</div>
                <div className="text-[10px] text-white/40 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6 flex-wrap">
            <Link
              href="/vision/fantasy"
              className="inline-flex items-center gap-2 bg-psl-gold text-psl-midnight text-xs font-black px-5 py-2.5 rounded-pill hover:bg-yellow-300 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold min-h-[44px]"
            >
              Pick for fantasy
            </Link>
            <Link
              href="/vision/predict"
              className="inline-flex items-center gap-2 border border-white/30 bg-white/10 text-white text-xs font-semibold px-5 py-2.5 rounded-pill hover:bg-white/20 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 min-h-[44px]"
            >
              Predict his match
            </Link>
          </div>

          <p className="mt-4 text-[10px] text-white/25">
            Points only · No real money · No financial value
          </p>
        </div>
      </section>

      {/* Player selector rail */}
      <div className="bg-white border-b border-[#e8eaf0] px-6 py-4">
        <div
          className="flex gap-3 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
          role="tablist"
          aria-label="Select player"
        >
          {PSL_PLAYERS.map(p => (
            <button
              key={p.id}
              role="tab"
              aria-selected={p.id === selectedId}
              onClick={() => setSelectedId(p.id)}
              className={`flex-shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-pill border text-xs font-bold motion-safe:transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy ${
                p.id === selectedId
                  ? 'border-psl-navy bg-psl-navy text-white'
                  : 'border-[#e8eaf0] text-psl-navy hover:border-psl-navy/40'
              }`}
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: p.club.primaryColor }}
                aria-hidden
              />
              {p.name.split(' ').pop()}
            </button>
          ))}
        </div>
      </div>

      {/* Season stats */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h2 className="text-sm font-black text-psl-navy mb-5">Season Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Goals',     value: player.goalsThisSeason,     sub: 'this season' },
            { label: 'Assists',   value: player.assistsThisSeason,   sub: 'this season' },
            { label: 'FPL Points', value: player.fantasyPoints,      sub: 'total' },
            { label: 'FPL Price', value: `£${player.fantasyPrice}m`, sub: 'current' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-card border border-[#e8eaf0] shadow-card p-4 text-center">
              <div className="text-stat-lg font-black text-psl-navy tabular-nums">{s.value}</div>
              <div className="text-xs font-semibold text-psl-muted mt-1">{s.label}</div>
              <div className="text-[10px] text-psl-muted/60">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Upcoming fixture for this player's club */}
        {(() => {
          const next = PSL_FIXTURES.find(
            f => f.status === 'SCHEDULED' &&
              (f.homeClub.id === player.club.id || f.awayClub.id === player.club.id)
          );
          if (!next) return null;
          const isHome = next.homeClub.id === player.club.id;
          const opp = isHome ? next.awayClub : next.homeClub;
          return (
            <div className="mt-6 bg-psl-navy rounded-card p-4 text-white flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-psl-gold uppercase tracking-widest mb-1">Next fixture</p>
                <p className="text-sm font-black">{isHome ? 'vs' : '@'} {opp.name}</p>
                <p className="text-xs text-white/40 mt-0.5">{next.venue}</p>
              </div>
              <Link
                href="/vision/predict"
                className="text-xs font-bold text-psl-gold hover:underline focus-visible:outline-none"
              >
                Predict
              </Link>
            </div>
          );
        })()}
      </div>

    </main>
  );
}
