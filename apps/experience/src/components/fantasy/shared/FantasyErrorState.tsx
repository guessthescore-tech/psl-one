'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface FantasyErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function FantasyErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: FantasyErrorStateProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="text-5xl mb-4">⚠️</div>
      <p className="text-display-sm text-exp-live mb-2">Error</p>
      <p className="text-body-md text-exp-muted mb-6 max-w-xs">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-6 py-2.5 bg-exp-navy-2 text-white text-label-lg rounded-pill border border-exp-border-dk focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
        >
          Try Again
        </button>
      )}
    </motion.div>
  );
}
