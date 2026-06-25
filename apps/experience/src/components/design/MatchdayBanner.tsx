'use client';

import { clsx } from 'clsx';
import { motion, useReducedMotion } from 'framer-motion';

interface BannerClub {
  name: string;
  abbr: string;
  primaryColor: string;
  textColor: string;
}

type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED';

interface MatchdayBannerProps {
  homeClub: BannerClub;
  awayClub: BannerClub;
  kickoffAt: string;
  competition: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
}

function formatKickoff(iso: string): string {
  try {
    const d = new Date(iso);
    return (
      d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' }) +
      ' · ' +
      d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
    );
  } catch {
    return iso;
  }
}

export function MatchdayBanner({
  homeClub,
  awayClub,
  kickoffAt,
  competition,
  status,
  homeScore,
  awayScore,
}: MatchdayBannerProps) {
  const reduce = useReducedMotion();
  const isLive = status === 'LIVE';
  const isFinished = status === 'FINISHED';
  const hasScore = isLive || isFinished;

  return (
    <div className="relative w-full overflow-hidden rounded-card shadow-card-xl min-h-[140px] sm:min-h-[180px] flex items-center">
      {/* Split background: home left, away right */}
      <div className="absolute inset-0 flex" aria-hidden>
        <div className="flex-1" style={{ backgroundColor: homeClub.primaryColor, opacity: 0.85 }} />
        <div className="flex-1" style={{ backgroundColor: awayClub.primaryColor, opacity: 0.85 }} />
      </div>

      {/* Dark overlay for legibility */}
      <div className="absolute inset-0 bg-exp-void/55" aria-hidden />

      {/* Inner gold glow centre line */}
      <div
        className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(230,170,0,0.5), transparent)' }}
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 w-full flex items-center justify-between px-5 sm:px-8 py-6">
        {/* Home */}
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <div
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-[28%_28%_50%_50%/20%_20%_40%_40%] flex items-center justify-center font-black text-sm shadow-card"
            style={{ backgroundColor: homeClub.primaryColor, color: homeClub.textColor }}
            aria-hidden
          >
            {homeClub.abbr}
          </div>
          <span className="text-label-md text-white text-center leading-tight max-w-[80px] line-clamp-2">
            {homeClub.name}
          </span>
        </div>

        {/* Centre: competition, score/vs, status */}
        <div className="flex flex-col items-center gap-1 px-2">
          <p className="text-label-sm text-white/50 uppercase tracking-widest text-center">
            {competition}
          </p>

          {hasScore ? (
            <motion.div
              className={clsx(
                'flex items-center gap-2 sm:gap-3',
                'text-score-lg sm:text-score-xl font-black tabular-nums text-white',
              )}
              initial={reduce ? false : { scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              aria-label={`Score: ${homeScore} - ${awayScore}`}
            >
              <span>{homeScore ?? 0}</span>
              <span className="text-exp-gold">-</span>
              <span>{awayScore ?? 0}</span>
            </motion.div>
          ) : (
            <span className="text-display-sm text-white/70 font-bold">vs</span>
          )}

          {isLive ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-exp-live animate-live-pulse" aria-hidden />
              <span className="text-label-md text-exp-live font-black">LIVE</span>
            </div>
          ) : isFinished ? (
            <span className="text-label-md text-exp-muted">Full time</span>
          ) : (
            <span className="text-label-sm text-white/50">
              {formatKickoff(kickoffAt)}
            </span>
          )}
        </div>

        {/* Away */}
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <div
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-[28%_28%_50%_50%/20%_20%_40%_40%] flex items-center justify-center font-black text-sm shadow-card"
            style={{ backgroundColor: awayClub.primaryColor, color: awayClub.textColor }}
            aria-hidden
          >
            {awayClub.abbr}
          </div>
          <span className="text-label-md text-white text-center leading-tight max-w-[80px] line-clamp-2">
            {awayClub.name}
          </span>
        </div>
      </div>
    </div>
  );
}
