'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FixtureShareMenu } from './FixtureShareMenu';

interface ShareButtonProps {
  fixtureId: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: string;
  prediction?: { homeScore: number; awayScore: number } | null;
  variant?: 'icon' | 'pill' | 'card-footer';
  className?: string;
}

export function ShareButton({
  fixtureId,
  homeTeam,
  awayTeam,
  kickoffAt,
  prediction = null,
  variant = 'pill',
  className = '',
}: ShareButtonProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        transition={{ duration: 0.1 }}
        onClick={() => setMenuOpen(true)}
        aria-label={`Share ${homeTeam} vs ${awayTeam}`}
        className={`inline-flex items-center justify-center gap-1.5 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy focus-visible:ring-offset-1 ${
          variant === 'icon'
            ? 'w-9 h-9 rounded-full text-psl-muted hover:text-psl-navy hover:bg-psl-surface min-h-[44px] min-w-[44px]'
            : variant === 'card-footer'
            ? 'flex-1 flex-col gap-0.5 rounded-card-sm py-2 text-psl-muted hover:text-psl-navy hover:bg-psl-surface min-h-[44px] text-[10px]'
            : 'text-xs text-psl-muted hover:text-psl-navy bg-psl-surface hover:bg-[#e8eaf0] px-3 py-2 rounded-card-sm min-h-[44px]'
        } ${className}`}
      >
        <ShareIcon className={variant === 'card-footer' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
        {variant !== 'icon' && (
          <span>{variant === 'card-footer' ? 'Share' : 'Share'}</span>
        )}
      </motion.button>

      <FixtureShareMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        fixtureId={fixtureId}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        kickoffAt={kickoffAt}
        prediction={prediction}
      />
    </>
  );
}

function ShareIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 1 1 0-2.684m0 2.684 6.632 3.316m-6.632-6 6.632-3.316m0 0a3 3 0 1 0 5.367-2.684 3 3 0 0 0-5.367 2.684Zm0 9.316a3 3 0 1 0 5.368 2.684 3 3 0 0 0-5.368-2.684Z" />
    </svg>
  );
}
