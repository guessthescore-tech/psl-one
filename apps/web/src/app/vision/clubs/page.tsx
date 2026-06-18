'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { PSL_CLUBS, PSL_STANDINGS, visionImg } from '@/lib/vision-data';

export default function VisionClubsPage() {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);
  const standingMap = Object.fromEntries(PSL_STANDINGS.map(s => [s.club.id, s]));
  const activeClub = PSL_CLUBS.find(c => c.id === activeId);
  const activeStanding = activeId ? standingMap[activeId] : null;

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
        <span className="text-[10px] font-bold uppercase tracking-widest text-psl-gold">Club Identity</span>
        <span className="text-[10px] text-white/30 uppercase tracking-wide">Design Review</span>
      </nav>

      {/* Header */}
      <div className="bg-psl-midnight text-white px-6 pt-8 pb-10">
        <h1 className="text-display-lg text-white">DStv Premiership</h1>
        <p className="text-sm text-white/40 mt-1">16 clubs · 2025/26 Season</p>
      </div>

      {/* Club detail panel (when selected) */}
      {activeClub && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-10 bg-white border-b border-[#e8eaf0] shadow-card-md px-6 py-4 flex items-center gap-4"
        >
          <div
            className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-black"
            style={{ backgroundColor: activeClub.primaryColor, color: activeClub.accentColor }}
            aria-hidden
          >{activeClub.abbr}</div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-black text-psl-navy">{activeClub.name}</h2>
            <p className="text-xs text-psl-muted">{activeClub.stadium} · Est. {activeClub.founded}</p>
          </div>
          {activeStanding && (
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-black text-psl-navy tabular-nums">
                {activeStanding.points} pts
              </div>
              <div className="text-[10px] text-psl-muted">#{activeStanding.position} in table</div>
            </div>
          )}
          <button
            onClick={() => setActiveId(null)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-psl-surface hover:bg-gray-100 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy"
            aria-label="Close club detail"
          >
            <svg className="w-4 h-4 text-psl-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}

      {/* Club grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {PSL_CLUBS.map((club, i) => {
            const standing = standingMap[club.id];
            const isActive = club.id === activeId;

            return (
              <motion.button
                key={club.id}
                initial={reduce ? false : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                onClick={() => setActiveId(isActive ? null : club.id)}
                className={`text-left rounded-card border p-4 flex flex-col items-center gap-3 motion-safe:transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold focus-visible:ring-offset-1 ${
                  isActive
                    ? 'border-psl-gold bg-psl-gold/5 shadow-card-md'
                    : 'border-[#e8eaf0] bg-white shadow-card hover:shadow-card-md'
                }`}
                aria-pressed={isActive}
                aria-label={club.name}
              >
                {/* Club badge */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-black shadow-card motion-safe:group-hover:scale-105 motion-safe:transition-transform"
                  style={{ backgroundColor: club.primaryColor, color: club.accentColor }}
                  aria-hidden
                >
                  {club.abbr}
                </div>

                <div className="text-center">
                  <p className="text-xs font-bold text-psl-navy leading-tight">{club.shortName}</p>
                  <p className="text-[10px] text-psl-muted mt-0.5">{club.city}</p>
                  {standing && (
                    <p className="text-[10px] font-black text-psl-gold mt-1">
                      #{standing.position} · {standing.points}pts
                    </p>
                  )}
                  {!standing && (
                    <p className="text-[10px] text-psl-muted mt-1">Est. {club.founded}</p>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-psl-muted">
            Points only · No financial value. All gameplay uses platform engagement points only. No real money, no deposits, no withdrawals.
          </p>
        </div>
      </div>

    </main>
  );
}
