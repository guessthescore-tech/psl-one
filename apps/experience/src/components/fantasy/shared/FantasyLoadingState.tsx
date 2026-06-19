'use client';

interface FantasyLoadingStateProps {
  rows?: number;
  type?: 'card' | 'list' | 'pitch';
}

function ShimmerCard() {
  return (
    <div className="rounded-card bg-exp-navy border border-exp-border-dk p-4 animate-pulse">
      <div className="h-4 bg-white/10 rounded mb-3 w-2/3" />
      <div className="h-3 bg-white/6 rounded mb-2 w-full" />
      <div className="h-3 bg-white/6 rounded w-1/2" />
    </div>
  );
}

function ShimmerRow() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-exp-border-dk animate-pulse">
      <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0" />
      <div className="flex-1">
        <div className="h-3 bg-white/10 rounded mb-1.5 w-1/2" />
        <div className="h-2.5 bg-white/6 rounded w-1/3" />
      </div>
      <div className="h-4 bg-white/10 rounded w-12" />
    </div>
  );
}

function ShimmerPitch() {
  return (
    <div className="rounded-card bg-exp-navy border border-exp-border-dk p-4 animate-pulse">
      <div className="aspect-[2/3] bg-white/5 rounded-card-sm flex items-center justify-center">
        <div className="text-white/20 text-body-sm">Loading pitch...</div>
      </div>
    </div>
  );
}

export function FantasyLoadingState({ rows = 3, type = 'card' }: FantasyLoadingStateProps) {
  if (type === 'pitch') {
    return (
      <div className="p-4">
        <ShimmerPitch />
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="px-4 py-2">
        {Array.from({ length: rows }).map((_, i) => (
          <ShimmerRow key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <ShimmerCard key={i} />
      ))}
    </div>
  );
}
