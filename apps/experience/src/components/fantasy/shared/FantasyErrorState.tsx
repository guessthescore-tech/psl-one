'use client';

import { WarningCircle } from '@phosphor-icons/react';

interface FantasyErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function FantasyErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: FantasyErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <WarningCircle size={40} weight="duotone" className="text-exp-live mb-4" />
      <h3 className="text-display-sm text-white mb-2">Error</h3>
      <p className="text-body-md text-exp-muted max-w-xs mb-6">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-pill border border-exp-border-dk text-white text-body-sm font-semibold transition-colors hover:border-white/30 focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
        >
          Try again
        </button>
      )}
    </div>
  );
}
