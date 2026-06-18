'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { type VisionGameweek, visionImg } from '@/lib/vision-data';

interface MatchweekHeroProps {
  gameweek: VisionGameweek;
  competitionName?: string;
}

export function MatchweekHero({ gameweek, competitionName = 'DStv Premiership' }: MatchweekHeroProps) {
  const reduce = useReducedMotion();

  const deadline = new Date(gameweek.deadlineAt);
  const deadlineLabel = deadline.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <section
      className="relative min-h-[56dvh] flex items-end overflow-hidden bg-psl-midnight"
      aria-label={`${gameweek.label} hero`}
    >
      {/* Background photography */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${visionImg('football-stadium-night-sa', 1440, 700)})` }}
        aria-hidden
      />
      {/* Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-psl-midnight via-psl-midnight/70 to-transparent" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-r from-psl-midnight/80 to-transparent" aria-hidden />

      {/* Live indicator strip */}
      {gameweek.status === 'ACTIVE' && (
        <div className="absolute top-6 left-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-psl-live motion-safe:animate-live-pulse" aria-hidden />
          <span className="text-[11px] font-bold tracking-widest uppercase text-psl-live">Live Gameweek</span>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-12 pt-24">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-xs font-bold tracking-widest uppercase text-psl-gold mb-3">
            {competitionName}
          </p>
          <h1 className="text-display-xl text-white leading-none tracking-tight mb-4">
            {gameweek.label}
          </h1>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-6">
            <div>
              <div className="text-stat-md text-psl-gold font-black tabular-nums">{gameweek.highestPoints}</div>
              <div className="text-xs text-white/50 mt-0.5">Top score (pts)</div>
            </div>
            <div>
              <div className="text-stat-md text-white font-black tabular-nums">{gameweek.averagePoints}</div>
              <div className="text-xs text-white/50 mt-0.5">Average (pts)</div>
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-white/70">{deadlineLabel}</div>
              <div className="text-xs text-white/40 mt-0.5">Transfer deadline</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
