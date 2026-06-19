'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';
import type { ExpFixture } from '@/lib/data';
import { TeamIdentity } from './TeamIdentity';

interface GameEntryCardProps {
  fixture: ExpFixture;
  variant?: 'predict' | 'fantasy' | 'challenge';
}

const VARIANT_CONFIG = {
  predict:   { cta: 'Guess the Score', href: '/predict',   ctaClass: 'bg-exp-gold text-exp-void' },
  fantasy:   { cta: 'Pick your squad', href: '/fantasy',   ctaClass: 'bg-exp-green text-white'  },
  challenge: { cta: 'Challenge a fan', href: '/predict',   ctaClass: 'bg-exp-blue text-white'   },
};

export function GameEntryCard({ fixture, variant = 'predict' }: GameEntryCardProps) {
  const reduce = useReducedMotion();
  const cfg = VARIANT_CONFIG[variant];
  const isLive = fixture.status === 'LIVE' || fixture.status === 'HALF_TIME';

  return (
    <div
      className="rounded-card bg-exp-ink border border-exp-border-dk overflow-hidden shadow-card-lg"
      role="region"
      aria-label={`${cfg.cta}: ${fixture.homeClub.shortName} vs ${fixture.awayClub.shortName}`}
    >
      {/* Coloured top bar */}
      <div className="flex h-0.5">
        <div style={{ backgroundColor: fixture.homeClub.primaryColor, flex: 1 }} aria-hidden />
        <div style={{ backgroundColor: fixture.awayClub.primaryColor, flex: 1 }} aria-hidden />
      </div>

      <div className="p-5">
        {/* Match header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-label-md text-exp-gold uppercase tracking-widest">
            {cfg.cta}
          </span>
          {isLive && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-exp-live animate-live-pulse" aria-hidden />
              <span className="text-label-sm text-exp-live font-black">LIVE {fixture.minute}&apos;</span>
            </div>
          )}
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <TeamIdentity club={fixture.homeClub} size="md" showName />

          <div className="text-center flex-1">
            {isLive ? (
              <div className="text-score-lg font-black text-white tabular-nums">
                {fixture.homeScore} - {fixture.awayScore}
              </div>
            ) : (
              <div className="text-exp-muted text-sm font-medium">vs</div>
            )}
            <div className="text-[10px] text-white/30 mt-0.5">{fixture.group ?? fixture.competition}</div>
          </div>

          <TeamIdentity club={fixture.awayClub} size="md" showName />
        </div>

        {/* CTA */}
        <motion.div whileTap={reduce ? {} : { scale: 0.97 }}>
          <Link
            href={`${cfg.href}?fixture=${fixture.id}`}
            className={clsx(
              'block w-full text-center text-sm font-black py-3.5 rounded-card-sm',
              'transition-colors duration-150 min-h-[44px] flex items-center justify-center',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold',
              cfg.ctaClass,
            )}
          >
            {cfg.cta}
          </Link>
        </motion.div>

        <p className="text-label-sm text-white/25 text-center mt-3">
          Points only - no real money - no financial value
        </p>
      </div>
    </div>
  );
}
