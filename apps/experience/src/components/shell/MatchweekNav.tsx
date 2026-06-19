'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

interface MatchweekNavProps {
  currentGW: number;
  totalGW?: number;
  label: string;
  onPrev?: () => void;
  onNext?: () => void;
}

export function MatchweekNav({
  currentGW,
  totalGW = 30,
  label,
  onPrev,
  onNext,
}: MatchweekNavProps) {
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const reduce = useReducedMotion();

  function handlePrev() {
    setDirection('right');
    onPrev?.();
  }

  function handleNext() {
    setDirection('left');
    onNext?.();
  }

  return (
    <div className="flex items-center gap-3" role="navigation" aria-label="Matchweek navigation">
      <button
        onClick={handlePrev}
        disabled={currentGW <= 1}
        className={clsx(
          'w-8 h-8 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold',
          currentGW <= 1
            ? 'text-white/20 cursor-not-allowed'
            : 'text-white/60 hover:text-white hover:bg-white/10',
        )}
        aria-label="Previous matchweek"
      >
        <CaretLeft size={16} weight="bold" aria-hidden />
      </button>

      <div className="overflow-hidden min-w-[6rem] text-center">
        <motion.div
          key={currentGW}
          initial={(!reduce && direction) ? { x: direction === 'left' ? 16 : -16, opacity: 0 } : false}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onAnimationComplete={() => setDirection(null)}
        >
          <div className="text-white font-bold text-sm">{label}</div>
          <div className="text-white/40 text-[10px] font-medium tabular-nums">
            GW {currentGW} of {totalGW}
          </div>
        </motion.div>
      </div>

      <button
        onClick={handleNext}
        disabled={currentGW >= totalGW}
        className={clsx(
          'w-8 h-8 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold',
          currentGW >= totalGW
            ? 'text-white/20 cursor-not-allowed'
            : 'text-white/60 hover:text-white hover:bg-white/10',
        )}
        aria-label="Next matchweek"
      >
        <CaretRight size={16} weight="bold" aria-hidden />
      </button>
    </div>
  );
}
