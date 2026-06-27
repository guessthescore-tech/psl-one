import Link from 'next/link';
import { getServerApiBase } from '../../lib/server-api-base';

/**
 * Videos & Highlights hub — server component.
 *
 * ScoreBat widget embed is fetched server-side so no tokens are exposed
 * to the client. Falls back to a placeholder when the token is not configured.
 *
 * PSL_INACTIVE · NO_REAL_MONEY · WC_BETA
 */

const API_BASE = getServerApiBase();

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchWidgetConfig(): Promise<{ available: boolean; embedUrl: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/football/world-cup/scorebat-widget`, {
      cache: 'no-store',
    });
    if (!res.ok) return { available: false, embedUrl: null };
    return res.json() as Promise<{ available: boolean; embedUrl: string | null }>;
  } catch {
    return { available: false, embedUrl: null };
  }
}

export default async function VideosPage() {
  const widgetConfig = await fetchWidgetConfig();

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
            <span className="text-2xl">🎬</span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full">
              Videos & Highlights
            </span>
            <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full font-mono">BETA</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Goals &amp; <span className="text-emerald-400">Highlights</span>
          </h1>
          <p className="text-white/60 max-w-xl">
            World Cup 2026 goal replays, post-match highlights, and more.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">

        {/* ScoreBat widget or placeholder */}
        {widgetConfig.available && widgetConfig.embedUrl ? (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-5">
              Live Highlights — Powered by ScoreBat
            </h2>
            <div className="rounded-xl overflow-hidden border border-white/10">
              <iframe
                src={widgetConfig.embedUrl}
                width="100%"
                height="600"
                frameBorder="0"
                allowFullScreen
                title="ScoreBat World Cup Highlights"
                className="w-full"
              />
            </div>
          </section>
        ) : (
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="text-4xl mb-4">🎬</div>
            <h2 className="font-semibold text-base mb-2">Highlights Coming Soon</h2>
            <p className="text-white/50 text-sm mb-5 max-w-sm mx-auto">
              Video highlights will be available here once the World Cup 2026 begins
              and the highlights provider is configured.
            </p>
            <Link
              href="/world-cup/live"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25 transition-colors"
            >
              Watch Live Scores Instead →
            </Link>
          </section>
        )}

        {/* More videos section */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-6">More Videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {([
              { icon: '⚽', title: 'Goals of the Week', desc: 'Best strikes from matchday highlights.' },
              { icon: '🎤', title: 'Press Conferences', desc: 'Post-match manager and player interviews.' },
              { icon: '🏆', title: 'Tournament Moments', desc: 'Iconic World Cup 2026 moments.' },
            ] as const).map(({ icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center"
              >
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-semibold text-sm text-white mb-1">{title}</h3>
                <p className="text-xs text-white/40 mb-3">{desc}</p>
                <span className="text-xs text-white/30 italic">Coming soon</span>
              </div>
            ))}
          </div>
        </section>

        {/* Link to WC hub */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-sm text-white mb-1">World Cup 2026 Hub</p>
            <p className="text-xs text-white/40">Fixtures, predictions, fantasy, and live scores.</p>
          </div>
          <Link
            href="/world-cup"
            className="flex-shrink-0 px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25 transition-colors"
          >
            Go to WC Hub →
          </Link>
        </div>
      </div>
    </main>
  );
}
