'use client';

interface CaptainMarkerProps {
  type: 'C' | 'VC';
  className?: string;
}

export function CaptainMarker({ type, className = '' }: CaptainMarkerProps) {
  return (
    <span
      aria-label={type === 'C' ? 'Captain' : 'Vice Captain'}
      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold leading-none ${
        type === 'C'
          ? 'bg-exp-gold text-exp-void shadow-glow-gold'
          : 'bg-exp-navy-2 text-exp-gold border border-exp-gold/40'
      } ${className}`}
    >
      {type}
    </span>
  );
}
