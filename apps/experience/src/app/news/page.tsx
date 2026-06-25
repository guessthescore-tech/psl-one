import Link from 'next/link';
import { WC_STORIES, WC_VIDEOS, expImg } from '@/lib/data';
import type { ExpStory, ExpVideo } from '@/lib/data';
import { NewsHeroCard } from '@/components/design/NewsHeroCard';
import { VideoTile } from '@/components/design/VideoTile';

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
            <NewsHeroCard
              title={featured.title}
              category={featured.category}
              excerpt={featured.summary}
              publishedAt={featured.publishedAt}
              imageUrl={expImg(`story-wc-${featured.id}`, 800, 450)}
            />
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
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 sm:grid sm:grid-cols-3 sm:overflow-x-visible sm:pb-0 sm:mx-0 sm:px-0">
              {topVideos.map(video => (
                <VideoTile
                  key={video.id}
                  title={video.title}
                  duration={formatDuration(video.durationSeconds)}
                  category={video.category}
                  thumbnailUrl={expImg(`video-wc-${video.id}`, 400, 225)}
                />
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
