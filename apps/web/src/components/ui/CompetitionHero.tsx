'use client';

import type { Season } from '@/lib/football-client';

interface CompetitionHeroProps {
  season: Season | null;
  loading?: boolean;
  className?: string;
}

/**
 * Renders a competition context hero banner.
 * Uses pitch-dark CSS background + gradient overlay — no external image required.
 */
export function CompetitionHero({ season, loading = false, className = '' }: CompetitionHeroProps) {
  if (loading) {
    return (
      <div className={`h-20 bg-psl-midnight motion-safe:animate-shimmer bg-shimmer-base bg-[length:200%_100%] ${className}`} />
    );
  }

  const name     = season?.competition?.name ?? 'FIFA World Cup 2026';
  const sub      = season?.name ?? 'Beta Season';
  const isLive   = !!season;

  return (
    <div
      className={`relative overflow-hidden bg-psl-midnight ${className}`}
      role="banner"
      aria-label={name}
    >
      {/* Pitch texture background */}
      <div className="absolute inset-0 bg-pitch-dark opacity-15 pointer-events-none" aria-hidden />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-psl-midnight via-transparent to-psl-midnight/80 pointer-events-none" aria-hidden />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
        {/* Competition emblem */}
        <div className="w-12 h-12 rounded-xl bg-psl-gold flex items-center justify-center text-psl-midnight font-black text-sm flex-shrink-0 shadow-glow-gold">
          WC
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="inline-flex items-center gap-1 bg-psl-green/20 text-psl-green text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-pill">
                <span className="w-1.5 h-1.5 rounded-full bg-psl-green motion-safe:animate-live-pulse" aria-hidden />
                Active
              </span>
            )}
          </div>
          <h2 className="text-sm font-black text-white leading-tight truncate mt-0.5">{name}</h2>
          <p className="text-xs text-white/50">{sub}</p>
        </div>
        <div className="hidden sm:flex flex-col items-end text-right flex-shrink-0">
          <span className="text-[10px] font-bold text-psl-gold/70 uppercase tracking-widest">Beta Platform</span>
          <span className="text-[10px] text-white/40">Points only · No real money</span>
        </div>
      </div>
    </div>
  );
}
