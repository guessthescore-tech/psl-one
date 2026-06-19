'use client';

interface SkeletonCardProps {
  height?: number;
  rounded?: string;
  dark?: boolean;
}

export function SkeletonCard({
  height = 120,
  rounded = 'rounded-card',
  dark = true,
}: SkeletonCardProps) {
  return (
    <div
      className={`w-full ${rounded} overflow-hidden ${
        dark ? 'bg-exp-ink' : 'bg-exp-border'
      }`}
      style={{ height }}
      aria-hidden="true"
    >
      <div
        className="h-full w-full animate-shimmer"
        style={{
          background: dark
            ? 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)'
            : 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
        }}
      />
    </div>
  );
}
