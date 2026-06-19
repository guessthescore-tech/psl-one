'use client';

export function SkeletonText({ width = 'w-full', height = 'h-4', className = '' }: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-card-xs ${width} ${height} bg-exp-navy animate-[shimmer_2s_linear_infinite] bg-gradient-to-r from-exp-navy via-exp-navy-2/30 to-exp-navy bg-[length:200%_100%] ${className}`}
      aria-hidden="true"
    />
  );
}
