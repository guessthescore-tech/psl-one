'use client';

import { type VisionMediaStory, visionImg } from '@/lib/vision-data';

interface VideoHighlightRailProps {
  stories: VisionMediaStory[];
}

function VideoThumb({ story, index }: { story: VisionMediaStory; index: number }) {
  const seeds = ['football-match-action-1', 'football-match-action-2', 'football-match-action-3', 'football-goal-1', 'football-tackle-1'];

  return (
    <div className="flex-shrink-0 w-56 group cursor-pointer" style={{ scrollSnapAlign: 'start' }}>
      <div className="relative rounded-card-sm overflow-hidden mb-2 aspect-video">
        <img
          src={visionImg(seeds[index % seeds.length] ?? 'football-1', 448, 252)}
          alt=""
          className="w-full h-full object-cover motion-safe:group-hover:scale-105 motion-safe:transition-transform motion-safe:duration-300"
        />
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 motion-safe:group-hover:bg-black/20 motion-safe:transition-colors">
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-card-md motion-safe:group-hover:scale-110 motion-safe:transition-transform">
            <svg className="w-4 h-4 text-psl-navy ml-0.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          {1 + index}:{(index * 17 + 24).toString().padStart(2, '0')}
        </div>
      </div>
      <p className="text-xs font-semibold text-psl-navy leading-snug line-clamp-2">
        {story.title}
      </p>
      <p className="text-[10px] text-psl-muted mt-1">{story.category}</p>
    </div>
  );
}

export function VideoHighlightRail({ stories }: VideoHighlightRailProps) {
  return (
    <section className="py-8 px-6 bg-psl-surface" aria-label="Video highlights">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-display-sm text-psl-navy">Highlights</h2>
        <a href="/media" className="text-xs font-semibold text-psl-gold hover:underline">All videos</a>
      </div>
      <div
        className="flex gap-4 overflow-x-auto pb-3"
        style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}
        role="list"
      >
        {stories.map((s, i) => (
          <div key={s.id} role="listitem">
            <VideoThumb story={s} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}
