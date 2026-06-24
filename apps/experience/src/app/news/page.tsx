import Link from 'next/link';

/**
 * News & Media hub — redirects / links to the /media page which
 * contains the full news content.
 *
 * PSL_INACTIVE · NO_REAL_MONEY · WC_BETA
 */
export default function NewsPage() {
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
              News & Media
            </span>
            <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full font-mono">BETA</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Latest <span className="text-emerald-400">News</span>
          </h1>
          <p className="text-white/60 max-w-xl">
            PSL and World Cup 2026 news, match reports, and behind-the-scenes content.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/media"
            className="flex flex-col gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 px-6 py-5 transition-colors group"
          >
            <span className="text-2xl">📰</span>
            <span className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors">
              All Media
            </span>
            <span className="text-xs text-white/40">Articles, interviews & news →</span>
          </Link>

          <Link
            href="/videos"
            className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] px-6 py-5 transition-colors group"
          >
            <span className="text-2xl">🎬</span>
            <span className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors">
              Videos
            </span>
            <span className="text-xs text-white/40">Highlights & replays →</span>
          </Link>

          <Link
            href="/world-cup"
            className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] px-6 py-5 transition-colors group"
          >
            <span className="text-2xl">🏆</span>
            <span className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors">
              World Cup 2026
            </span>
            <span className="text-xs text-white/40">WC hub & live scores →</span>
          </Link>
        </div>

        {/* Redirect note */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <div className="text-3xl mb-3">📰</div>
          <h2 className="font-semibold text-base mb-2">Full news feed at /media</h2>
          <p className="text-white/50 text-sm mb-5 max-w-sm mx-auto">
            The complete PSL One news and media hub lives at the Media section.
          </p>
          <Link
            href="/media"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25 transition-colors"
          >
            Go to Media →
          </Link>
        </div>
      </div>
    </main>
  );
}
