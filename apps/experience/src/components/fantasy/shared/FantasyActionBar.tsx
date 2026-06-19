'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface ActionButton {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

interface FantasyActionBarProps {
  primary: ActionButton;
  secondary?: Omit<ActionButton, 'disabled' | 'loading'>;
  hint?: string;
}

export function FantasyActionBar({ primary, secondary, hint }: FantasyActionBarProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-40 bg-exp-void/95 backdrop-blur-sm border-t border-exp-border-dk px-4 py-3 safe-area-pb"
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      initial={reduce ? false : { y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {hint && (
        <p className="text-label-sm text-exp-muted text-center mb-2">{hint}</p>
      )}
      <div className={`flex gap-3 ${secondary ? 'flex-row' : 'flex-col'}`}>
        {secondary && (
          <button
            type="button"
            onClick={secondary.onClick}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-pill border border-exp-border-dk text-white text-label-lg focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
          >
            {secondary.label}
          </button>
        )}
        <button
          type="button"
          onClick={primary.onClick}
          disabled={primary.disabled || primary.loading}
          className="flex-1 min-h-[44px] px-4 py-2.5 rounded-pill bg-exp-green text-white text-label-lg disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
        >
          {primary.loading ? 'Saving…' : primary.label}
        </button>
      </div>
    </motion.div>
  );
}
