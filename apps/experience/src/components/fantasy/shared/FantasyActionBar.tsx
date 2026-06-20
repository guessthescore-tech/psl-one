'use client';

import { CircleNotch } from '@phosphor-icons/react/dist/ssr';
import { motion, useReducedMotion } from 'framer-motion';

interface ActionBarPrimary {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

interface ActionBarSecondary {
  label: string;
  onClick: () => void;
}

interface FantasyActionBarProps {
  primary: ActionBarPrimary;
  secondary?: ActionBarSecondary;
  hint?: string;
}

export function FantasyActionBar({ primary, secondary, hint }: FantasyActionBarProps) {
  const reduce = useReducedMotion();
  return (
    <div
      className="fixed left-0 right-0 z-40 px-4 pb-4 pt-3 bg-gradient-to-t from-exp-void via-exp-void/95 to-transparent"
      style={{
        bottom: 'calc(theme(spacing.16) + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {hint && (
        <p className="text-center text-label-md text-white/50 mb-3 uppercase tracking-widest">
          {hint}
        </p>
      )}

      <div className={`flex gap-3 ${secondary ? 'flex-row' : 'flex-col'}`}>
        {secondary && (
          <button
            type="button"
            onClick={secondary.onClick}
            className="flex-1 inline-flex items-center justify-center min-h-[44px] px-4 rounded-pill border border-exp-border-dk text-white text-label-lg font-semibold hover:bg-exp-ink transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
          >
            {secondary.label}
          </button>
        )}

        <motion.button
          type="button"
          onClick={primary.onClick}
          disabled={primary.disabled || primary.loading}
          aria-busy={primary.loading}
          whileTap={reduce ? undefined : { scale: 0.97 }}
          className={`flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] px-6 rounded-pill text-white text-label-lg font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 ${
            primary.disabled || primary.loading
              ? 'bg-exp-green/40 cursor-not-allowed'
              : 'bg-exp-green hover:bg-exp-green-2'
          }`}
        >
          {primary.loading && (
            <CircleNotch
              size={18}
              weight="bold"
              className="animate-spin"
              aria-hidden="true"
            />
          )}
          {primary.label}
        </motion.button>
      </div>
    </div>
  );
}
