export function FantasyLoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4" role="status" aria-label={label}>
      <div className="w-8 h-8 rounded-full border-2 border-exp-gold/30 border-t-exp-gold animate-spin" />
      <span className="text-body-sm text-exp-muted">{label}</span>
    </div>
  );
}
