interface FantasyErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function FantasyErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: FantasyErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-12 h-12 rounded-full bg-exp-live/10 flex items-center justify-center">
        <span className="text-2xl" aria-hidden>⚠️</span>
      </div>
      <p className="text-body-md text-white">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-card-sm bg-exp-navy-2 text-white text-sm font-semibold hover:bg-exp-navy-2/80 transition-colors min-h-[44px] focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2"
        >
          Try again
        </button>
      )}
    </div>
  );
}
