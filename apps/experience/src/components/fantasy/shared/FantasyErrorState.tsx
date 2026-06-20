'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Warning } from '@phosphor-icons/react/dist/ssr';

interface FantasyErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function FantasyErrorState({
  message = 'Unable to load data. Check your connection.',
  onRetry,
}: FantasyErrorStateProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="flex flex-col items-center justify-center px-6 py-16 text-center"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      role="alert"
    >
      <div className="mb-4 text-exp-live" aria-hidden="true">
        <Warning size={48} weight="fill" />
      </div>

      <h3 className="font-display text-display-sm text-white mb-2">Something went wrong</h3>
      <p className="text-body-md text-exp-muted max-w-xs">{message}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center justify-center min-h-[44px] px-6 rounded-pill bg-exp-green text-white text-label-lg font-semibold transition-colors hover:bg-exp-green-2 focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
        >
          Try again
        </button>
      )}
    </motion.div>
  );
}
