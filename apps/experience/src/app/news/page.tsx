import Link from 'next/link';
import { WC_STORIES, WC_VIDEOS } from '@/lib/data';
import type { ExpStory, ExpVideo } from '@/lib/data';

/**
 * News — World Cup 2026 News Centre (Sprint 38C rebuild).
 *
 * Uses editorial data from lib/data.ts (WC_STORIES, WC_VIDEOS).
 * No redirect to /media. Full standalone news centre.
 *
 * PSL_INACTIVE · NO_REAL_MONEY · WC_BETA
 */

function formatReadTime(mins: number) {
  return `${mins} min read`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function NewsPage() {
  const featured: ExpStory | undefined = WC_STORIES.find(s => s.featured);
  const remaining: ExpStory[] = WC_STORIES.filter(s => !s.featured);
  const topVideos: ExpVideo[] = WC_VIDEOS.slice(0, 3);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Beta banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center">
        <span className="text-xs text-amber-400/90 font-medium">
          BETA — PSL INACTIVE · World Cup 2026 Beta · No real-money features
        </span>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0a1628] via-[#071020] to-[#050505] border-b border-white/10 py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📰</span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full">
              World Cup 2026 News
            </span>
            <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full font-mono">EDITORIAL BETA</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            WC 2026 <span className="text-emerald-400">News Centre</span>
          </h1>
          <p className="text-white/60 max-w-xl">
            Match reports, features, analysis and fantasy insights from FIFA World Cup 2026.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-14">

        {/* Featured story */}
        {featured && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5">Featured</h2>
            <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900/20 to-transparent p-6 md:p-8">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-0.5 rounded-full">
                {featured.category}
              </span>
              <h3 className="mt-4 text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
                {featured.title}
              </h3>
              <p className="mt-3 text-white/60 leading-relaxed max-w-2xl">
                {featured.summary}
              </p>
              <div className="mt-5 flex items-center gap-4 text-xs text-white/40">
                <span>{formatDate(featured.publishedAt)}</span>
                <span>·</span>
                <span>{formatReadTime(featured.readMinutes)}</span>
              </div>
            </div>
          </section>
        )}

        {/* Remaining stories grid */}
        {remaining.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5">Latest Stories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {remaining.map(story => (
                <div
                  key={story.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05] transition-colors"
                >
                  <span className="text-xs font-medium text-white/40 uppercase tracking-wide">
                    {story.category}
                  </span>
                  <h3 className="mt-2 font-semibold text-sm leading-snug">{story.title}</h3>
                  <p className="mt-2 text-xs text-white/50 leading-relaxed line-clamp-2">{story.summary}</p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-white/30">
                    <span>{formatDate(story.publishedAt)}</span>
                    <span>·</span>
                    <span>{formatReadTime(story.readMinutes)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Video highlights */}
        {topVideos.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">Video Highlights</h2>
              <Link href="/videos" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                All videos →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {topVideos.map(video => (
                <div
                  key={video.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.05] transition-colors"
                >
                  <div className="w-full aspect-video rounded-lg bg-white/5 flex items-center justify-center mb-3">
                    <span className="text-2xl">▶</span>
                  </div>
                  <span className="text-xs font-medium text-white/40 uppercase tracking-wide">
                    {video.category}
                  </span>
                  <h3 className="mt-1 text-xs font-semibold leading-snug">{video.title}</h3>
                  <p className="mt-2 text-xs text-white/30">{formatDuration(video.durationSeconds)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quick links */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/fixtures"
              className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] px-5 py-4 transition-colors group"
            >
              <span className="text-xl">📅</span>
              <span className="font-semibold text-sm group-hover:text-emerald-400 transition-colors">Fixtures</span>
              <span className="text-xs text-white/40">All WC 2026 matches →</span>
            </Link>
            <Link
              href="/guess-the-score"
              className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] px-5 py-4 transition-colors group"
            >
              <span className="text-xl">🎯</span>
              <span className="font-semibold text-sm group-hover:text-emerald-400 transition-colors">Guess the Score</span>
              <span className="text-xs text-white/40">Predict match results →</span>
            </Link>
            <Link
              href="/videos"
              className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] px-5 py-4 transition-colors group"
            >
              <span className="text-xl">🎬</span>
              <span className="font-semibold text-sm group-hover:text-emerald-400 transition-colors">Videos</span>
              <span className="text-xs text-white/40">Goals &amp; highlights →</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
