'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { WC_VIDEOS } from '@/lib/data';

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function VideoDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const video = WC_VIDEOS.find((v) => v.id === slug);

  if (!video) {
    return (
      <main className="min-h-[100dvh] bg-exp-void flex items-center justify-center">
        <div className="text-center">
          <p className="text-exp-muted mb-4">Video not found.</p>
          <Link href="/video-centre" className="text-exp-gold hover:underline text-label-sm">
            ← Video Centre
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-exp-void">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back nav */}
        <Link
          href="/video-centre"
          className="inline-flex items-center gap-1 text-label-sm text-exp-muted hover:text-exp-gold transition-colors duration-150 mb-8"
        >
          ← Video Centre
        </Link>

        {/* Video player placeholder */}
        <div
          className="w-full aspect-video bg-exp-ink border border-exp-border-dk rounded-card flex items-center justify-center mb-6"
          role="region"
          aria-label="Video player"
        >
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-exp-gold/10 border border-exp-gold/30 flex items-center justify-center mx-auto mb-3">
              <span className="text-exp-gold text-2xl leading-none ml-1" aria-hidden>▶</span>
            </div>
            <p className="text-exp-muted text-label-sm">Video player</p>
            <p className="text-exp-muted/60 text-label-xs mt-1">Connects to VOD provider at {'/fan/videos/'}{slug}</p>
          </div>
        </div>

        {/* Video meta */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-label-xs text-exp-gold uppercase tracking-wider">{video.category}</span>
            <span className="text-label-xs text-exp-muted">{formatDuration(video.durationSeconds)}</span>
          </div>
          <h1 className="text-display-sm font-bold text-white leading-tight">{video.title}</h1>
        </div>

        {/* Rights notice */}
        <div className="bg-exp-ink border border-exp-border-dk rounded p-3 text-label-xs text-exp-muted/70">
          Rights status: Video availability does not imply PSL One streaming rights.
          Public display requires CLEAR rights status approval.
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-exp-border-dk">
          <Link href="/video-centre" className="text-label-sm text-exp-gold hover:underline">
            ← More videos
          </Link>
        </div>
      </div>
    </main>
  );
}
