'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { clsx } from 'clsx';

interface FantasyActionBarProps {
  primary: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
  secondary?: {
    label: string;
    onClick: () => void;
  };
  hint?: string;
}

export function FantasyActionBar({ primary, secondary, hint }: FantasyActionBarProps) {
  const reduce = useReducedMotion();

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-exp-navy border-t border-exp-border-dk px-4 py-3 pb-safe">
      {hint && (
        <p className="text-label-sm text-exp-muted text-center mb-2">{hint}</p>
      )}
      <div className="flex gap-3">
        {secondary && (
          <motion.button
            type="button"
            onClick={secondary.onClick}
            whileTap={reduce ? {} : { scale: 0.97 }}
            className="flex-1 min-h-[44px] rounded-card-sm border border-exp-border-dk text-white text-body-sm font-semibold transition-colors hover:border-white/30 focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
          >
            {secondary.label}
          </motion.button>
        )}
        <motion.button
          type="button"
          onClick={primary.onClick}
          disabled={primary.disabled || primary.loading}
          whileTap={reduce ? {} : { scale: 0.97 }}
          className={clsx(
            'flex-1 min-h-[44px] rounded-card-sm font-black text-body-sm transition-all',
            'focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2',
            primary.disabled || primary.loading
              ? 'bg-white/10 text-white/30 cursor-not-allowed'
              : 'bg-exp-gold text-exp-void hover:shadow-glow-gold',
          )}
        >
          {primary.loading ? 'Loading...' : primary.label}
        </motion.button>
      </div>
    </div>
  );
}
