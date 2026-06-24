import Link from 'next/link';
import { WC_STORIES, WC_VIDEOS } from '@/lib/data';
import type { ExpStory, ExpVideo } from '@/lib/data';

/**
 * News & Media hub — World Cup 2026 news centre.
 * Renders WC_STORIES and WC_VIDEOS from lib/data (editorial content).
 *
 * PSL_INACTIVE · NO_REAL_MONEY · WC_BETA
 */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function categoryBadge(category: string): string {
  const map: Record<string, string> = {
    'Match Report': 'bg-blue-500/15 text-blue-400',
    'Feature': 'bg-purple-500/15 text-purple-400',
    'Analysis': 'bg-amber-500/15 text-amber-400',
    'Fantasy': 'bg-emerald-500/15 text-emerald-400',
    'Goals': 'bg-red-500/15 text-red-400',
    'Highlights': 'bg-orange-500/15 text-orange-400',
    'Best Of': 'bg-pink-500/15 text-pink-400',
  };
  return map[category] ?? 'bg-white/10 text-white/60';
}

function StoryCard({ story, featured = false }: { story: ExpStory; featured?: boolean }) {
  return (
    <article className={`rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden hover:bg-white/[0.05] transition-colors group ${featured ? 'sm:col-span-2' : ''}`}>
      {featured && (
        <div className="h-40 bg-gradient-to-br from-emerald-900/40 via-blue-900/30 to-[#071020] flex items-center justify-center border-b border-white/10">
          <span className="text-4xl">🏆</span>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryBadge(story.category)}`}>
            {story.category}
          </span>
          <span className="text-xs text-white/30">{formatDate(story.publishedAt)}</span>
        </div>
        <h3 className="font-bold text-sm leading-snug mb-2 group-hover:text-emerald-400 transition-colors">
          {story.title}
        </h3>
        <p className="text-xs text-white/50 leading-relaxed line-clamp-2 mb-3">
          {story.summary}
        </p>
        <span className="text-xs text-white/30">{story.readMinutes} min read</span>
      </div>
    </article>
  );
}

function VideoCard({ video }: { video: ExpVideo }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden hover:bg-white/[0.05] transition-colors group cursor-pointer">
      <div className="h-28 bg-gradient-to-br from-slate-800/60 to-[#071020] flex items-center justify-center border-b border-white/10 relative">
        <span className="text-3xl">▶</span>
        <span className="absolute bottom-2 right-2 text-xs font-mono bg-black/60 px-1.5 py-0.5 rounded text-white/70">
          {formatDuration(video.durationSeconds)}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryBadge(video.category)}`}>
            {video.category}
          </span>
        </div>
        <h3 className="text-sm font-semibold leading-snug group-hover:text-emerald-400 transition-colors">
          {video.title}
        </h3>
      </div>
    </div>
  );
}

export default function NewsPage() {
  const featuredStory = WC_STORIES.find(s => s.featured);
  const otherStories = WC_STORIES.filter(s => !s.featured);

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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📰</span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full">
              News & Analysis
            </span>
            <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full font-mono">WC 2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            World Cup <span className="text-emerald-400">News Centre</span>
          </h1>
          <p className="text-white/60 max-w-xl">
            Match reports, analysis, and fantasy insights from FIFA World Cup 2026.
          </p>
          <div className="flex gap-4 mt-6">
            <Link href="/videos" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              Videos & Highlights →
            </Link>
            <Link href="/world-cup" className="text-xs text-white/50 hover:text-white/80 transition-colors">
              WC Hub →
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-14">

        {/* Featured story */}
        {featuredStory && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5">Featured</h2>
            <article className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/8 transition-colors overflow-hidden group">
              <div className="h-48 bg-gradient-to-br from-emerald-900/40 via-blue-900/30 to-[#071020] flex items-center justify-center border-b border-emerald-500/20">
                <span className="text-6xl">⚽</span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryBadge(featuredStory.category)}`}>
                    {featuredStory.category}
                  </span>
                  <span className="text-xs text-white/30">{formatDate(featuredStory.publishedAt)}</span>
                  <span className="text-xs text-emerald-400/60 font-medium ml-auto">Editor&apos;s Pick</span>
                </div>
                <h2 className="text-xl font-extrabold leading-snug mb-3 group-hover:text-emerald-400 transition-colors">
                  {featuredStory.title}
                </h2>
                <p className="text-sm text-white/60 leading-relaxed mb-4">
                  {featuredStory.summary}
                </p>
                <span className="text-xs text-white/30">{featuredStory.readMinutes} min read</span>
              </div>
            </article>
          </section>
        )}

        {/* Latest stories */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-5">Latest Stories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {otherStories.map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </section>

        {/* Video highlights */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">Video Highlights</h2>
            <Link href="/videos" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              All videos →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {WC_VIDEOS.slice(0, 3).map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>

        {/* Quick links */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/fixtures"
            className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] px-6 py-5 transition-colors group"
          >
            <span className="text-2xl">📅</span>
            <span className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors">WC Fixtures</span>
            <span className="text-xs text-white/40">All 104 matches →</span>
          </Link>
          <Link
            href="/guess-the-score"
            className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] px-6 py-5 transition-colors group"
          >
            <span className="text-2xl">🎯</span>
            <span className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors">Guess the Score</span>
            <span className="text-xs text-white/40">Predict WC results →</span>
          </Link>
          <Link
            href="/videos"
            className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] px-6 py-5 transition-colors group"
          >
            <span className="text-2xl">🎬</span>
            <span className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors">Videos</span>
            <span className="text-xs text-white/40">Goals & highlights →</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
