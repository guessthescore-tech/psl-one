'use client';

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-card bg-exp-navy animate-[shimmer_2s_linear_infinite] bg-gradient-to-r from-exp-navy via-exp-navy-2/30 to-exp-navy bg-[length:200%_100%] ${className}`}
      aria-hidden="true"
    />
  );
}
