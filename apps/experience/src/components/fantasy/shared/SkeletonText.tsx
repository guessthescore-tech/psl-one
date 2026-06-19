'use client';

type TextWidth = 'full' | '3/4' | '1/2' | '1/4';
type TextSize = 'sm' | 'md' | 'lg';

interface SkeletonTextProps {
  width?: TextWidth;
  size?: TextSize;
}

const widthMap: Record<TextWidth, string> = {
  full:  'w-full',
  '3/4': 'w-3/4',
  '1/2': 'w-1/2',
  '1/4': 'w-1/4',
};

const heightMap: Record<TextSize, string> = {
  sm: 'h-3',
  md: 'h-4',
  lg: 'h-5',
};

export function SkeletonText({ width = '3/4', size = 'md' }: SkeletonTextProps) {
  return (
    <div
      className={`${widthMap[width]} ${heightMap[size]} rounded-pill overflow-hidden bg-exp-ink`}
      aria-hidden="true"
    >
      <div
        className="h-full w-full animate-shimmer"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
        }}
      />
    </div>
  );
}
