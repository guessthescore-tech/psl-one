import Link from 'next/link';
import { clsx } from 'clsx';
import { expImg } from '@/lib/data';
import type { ExpVideo } from '@/lib/data';

interface VideoCardProps {
  video: ExpVideo;
  index?: number;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link
      href={`/media/${video.id}`}
      className={clsx(
        'snap-card group relative rounded-card overflow-hidden flex-shrink-0 w-[220px] sm:w-[260px]',
        'block bg-exp-ink border border-exp-border-dk shadow-card',
        'hover:shadow-card-md transition-shadow duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-exp-gold',
      )}
      aria-label={`Watch: ${video.title}`}
    >
      {/* Thumbnail */}
      <div className="relative h-[132px] sm:h-[152px] overflow-hidden">
        <img
          src={expImg(video.thumbnailKey, 520, 304)}
          alt=""
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300 motion-reduce:transition-none"
          loading="lazy"
        />
        {/* Dark scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-exp-void/70 to-transparent" aria-hidden />

        {/* Play button */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-exp-gold/90 transition-colors duration-200">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-exp-void/80 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-[4px]">
          {formatDuration(video.durationSeconds)}
        </div>

        {/* Category badge */}
        <div className="absolute top-2 left-2 bg-exp-gold text-exp-void text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] uppercase tracking-wide">
          {video.category}
        </div>
      </div>

      {/* Title */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
          {video.title}
        </h3>
      </div>
    </Link>
  );
}
