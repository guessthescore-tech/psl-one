'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { type VisionPlayer, visionImg } from '@/lib/vision-data';

interface PlayerSpotlightProps {
  player: VisionPlayer;
}

const POSITION_LABELS: Record<string, string> = {
  GK: 'Goalkeeper', DEF: 'Defender', MID: 'Midfielder', FWD: 'Forward',
};

export function PlayerSpotlight({ player }: PlayerSpotlightProps) {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden rounded-card bg-psl-midnight text-white shadow-card-xl" aria-label={`Player spotlight: ${player.name}`}>
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${visionImg(player.imageKey, 800, 600)})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-t from-psl-midnight via-psl-midnight/80 to-psl-midnight/40" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-r from-psl-midnight/90 to-transparent" aria-hidden />

      {/* Club colour accent stripe */}
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l-card"
        style={{ backgroundColor: player.club.primaryColor }}
        aria-hidden
      />

      <div className="relative z-10 p-6 flex flex-col h-full min-h-[280px]">
        {/* Label */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-psl-gold mb-6">
          Player Spotlight
        </p>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-end">
          <p className="text-xs font-semibold text-white/50 mb-1">
            {POSITION_LABELS[player.position] ?? player.position} · {player.club.name}
          </p>
          <motion.h2
            initial={reduce ? false : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-display-md text-white leading-tight mb-6"
          >
            {player.name}
          </motion.h2>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Goals', value: player.goalsThisSeason },
              { label: 'Assists', value: player.assistsThisSeason },
              { label: 'FPL pts', value: player.fantasyPoints },
              { label: 'Price', value: `£${player.fantasyPrice}m` },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-stat-md font-black text-psl-gold tabular-nums">{stat.value}</div>
                <div className="text-[10px] text-white/40 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          <Link
            href="/vision/player"
            className="inline-flex items-center gap-2 self-start bg-psl-gold text-psl-midnight text-xs font-black px-5 py-2.5 rounded-pill hover:bg-yellow-300 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold min-h-[44px]"
            aria-label={`Full profile for ${player.name}`}
          >
            Full profile
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
