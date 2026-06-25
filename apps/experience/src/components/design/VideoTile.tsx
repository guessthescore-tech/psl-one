'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { PlayCircle } from '@phosphor-icons/react';

interface VideoTileProps {
  title: string;
  thumbnailUrl?: string;
  duration: string;
  category: string;
  onPlay?: () => void;
}

const FALLBACK_BG =
  'linear-gradient(135deg, #060d19 0%, #0d1b2e 60%, #1b3a6b 100%)';

export function VideoTile({
  title,
  thumbnailUrl,
  duration,
  category,
  onPlay,
}: VideoTileProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      className={clsx(
        'w-[200px] flex-shrink-0 rounded-card overflow-hidden bg-exp-ink border border-exp-border-dk shadow-card-md',
        'flex flex-col text-left cursor-pointer group transition-shadow duration-200',
        hovered && 'shadow-card-xl',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold focus-visible:ring-offset-2 focus-visible:ring-offset-exp-void',
        'min-h-[44px]',
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onPlay}
      aria-label={`Play video: ${title}`}
    >
      {/* Thumbnail */}
      <div
        className="relative w-full h-[112px] flex items-center justify-center overflow-hidden"
        style={
          !thumbnailUrl ? { background: FALLBACK_BG } : undefined
        }
      >
        {thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt=""
            className="w-full h-full object-cover"
            aria-hidden
          />
        )}

        {/* Dark overlay on hover */}
        <div
          className={clsx(
            'absolute inset-0 bg-exp-void/40 transition-opacity duration-150',
            hovered ? 'opacity-100' : 'opacity-0',
          )}
          aria-hidden
        />

        {/* Play button */}
        <div
          className={clsx(
            'absolute inset-0 flex items-center justify-center transition-transform duration-200',
            hovered ? 'scale-110' : 'scale-100',
          )}
          aria-hidden
        >
          <PlayCircle
            size={40}
            weight="fill"
            className={clsx(
              'text-white transition-opacity duration-150',
              hovered ? 'opacity-100' : 'opacity-70',
            )}
          />
        </div>

        {/* Duration chip */}
        <span className="absolute bottom-2 right-2 bg-exp-void/80 text-white text-label-sm rounded-card-xs px-1.5 py-0.5 font-mono">
          {duration}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1">
        <span className="text-label-sm text-exp-gold uppercase tracking-wider">
          {category}
        </span>
        <p className="text-label-lg text-white leading-tight line-clamp-2">
          {title}
        </p>
      </div>
    </button>
  );
}
