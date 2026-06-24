'use client';

import Link from 'next/link';
import { WC_VIDEOS } from '@/lib/data';
import type { ExpVideo } from '@/lib/data';
import { SectionHeader } from '@/components/ui/SectionHeader';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function VideoCard({ video }: { video: ExpVideo }) {
  return (
    <article>
      <Link
        href={`/video-centre/${video.id}`}
        className="block group focus-visible:outline-2 focus-visible:outline-exp-gold focus-visible:outline-offset-2 rounded-card"
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-exp-ink border border-exp-border-dk rounded-card overflow-hidden mb-3 group-hover:border-exp-gold/40 transition-colors duration-150">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-exp-gold/10 border border-exp-gold/30 flex items-center justify-center group-hover:bg-exp-gold/20 transition-colors duration-150">
              <span className="text-exp-gold text-lg leading-none ml-1" aria-hidden>▶</span>
            </div>
          </div>
          <span className="absolute bottom-2 right-2 text-label-xs bg-black/70 text-white px-2 py-0.5 rounded">
            {formatDuration(video.durationSeconds)}
          </span>
          <span className="absolute top-0 left-0 right-0 bottom-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-gradient-to-t from-black/60 to-transparent">
            <span className="text-label-xs text-white uppercase tracking-wider">{video.category}</span>
          </span>
        </div>

        {/* Info */}
        <div>
          <span className="text-label-xs text-exp-gold uppercase tracking-wider mb-1 block">{video.category}</span>
          <h2 className="text-body-sm font-semibold text-white leading-snug line-clamp-2">{video.title}</h2>
        </div>
      </Link>
    </article>
  );
}

const VIDEO_CATEGORIES = ['All', 'Highlights', 'Goals', 'Interviews', 'Training', 'Press Conference'];

export default function VideoCentrePage() {
  const featured = WC_VIDEOS.slice(0, 1);
  const rest = WC_VIDEOS.slice(1);

  return (
    <main className="min-h-[100dvh] bg-exp-void">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <SectionHeader title="Video Centre" subtitle="Watch the best of World Cup 2026" dark />

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mt-6" role="navigation" aria-label="Video categories">
          {VIDEO_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className="flex-shrink-0 text-label-sm px-4 py-1.5 rounded-full border border-exp-border-dk text-exp-muted hover:border-exp-gold/40 hover:text-white transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-exp-gold"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured video */}
        {featured.length > 0 && featured[0] && (
          <section className="mt-8" aria-label="Featured video">
            <h2 className="text-label-lg text-exp-muted uppercase tracking-wider mb-4">Featured</h2>
            <div className="max-w-2xl">
              <VideoCard video={featured[0]} />
            </div>
          </section>
        )}

        {/* Video grid */}
        {rest.length > 0 && (
          <section className="mt-8" aria-label="Latest videos">
            <h2 className="text-label-lg text-exp-muted uppercase tracking-wider mb-4">Latest Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </section>
        )}

        {WC_VIDEOS.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-exp-muted">No videos published yet. Check back soon.</p>
          </div>
        )}
      </div>
    </main>
  );
}
