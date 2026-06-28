import Link from 'next/link';
import { WcFixtureCard } from '@/components/world-cup/WcFixtureCard';
import { getServerApiBase } from '@/lib/server-api-base';

/**
 * World Cup 2026 Hub — server component.
 * Returns empty list (not static fallback) when API is unavailable.
 *
 * PSL_INACTIVE · WC_BETA · NO_REAL_MONEY · GTS_POINTS_ONLY · FANTASY_POINTS_ONLY
 */

const API_BASE = getServerApiBase();

interface WcFixture {
  id: string;
  kickoffAt: string;
  status: string;
  homeTeam: { name: string } | null;
  awayTeam: { name: string } | null;
  homeScore?: number | null;
  awayScore?: number | null;
  round?: string | null;
}

async function fetchUpcomingWcFixtures(): Promise<{ fixtures: WcFixture[]; isLive: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/football/fixtures?seasonSlug=fifa-world-cup-2026`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return { fixtures: [], isLive: false };
    const data = await res.json() as WcFixture[] | { data?: WcFixture[] };
    let fixtures: WcFixture[] = [];
    if (Array.isArray(data)) fixtures = data;
    else if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) fixtures = data.data as WcFixture[];
    return fixtures.length > 0 ? { fixtures: fixtures.slice(0, 6), isLive: true } : { fixtures: [], isLive: false };
  } catch {
    return { fixtures: [], isLive: false };
  }
}

export default async function WorldCupPage() {
  const { fixtures, isLive } = await fetchUpcomingWcFixtures();

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Beta disclaimer */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center">
        <span className="text-xs text-amber-400/90 font-medium">
          BETA — World Cup 2026 read-only preview. PSL INACTIVE. No real-money features. Points only.
        </span>
      </div>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0a1628] via-[#071020] to-[#050505] border-b border-white/10 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-3xl">🏆</span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full">
              FIFA World Cup 2026
            </span>
            <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full font-mono">BETA</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            World Cup <span className="text-emerald-400">2026</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mb-8">
            Predict match results, build your fantasy squad, and follow live scores
            for the greatest football tournament on Earth.
          </p>

          {/* Quick-link grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
              { href: '/world-cup/live', label: 'Live Scores', icon: '🔴', accent: 'border-red-500/30 hover:bg-red-500/5' },
              { href: '/matches', label: 'Fixtures', icon: '📅', accent: 'border-white/10 hover:bg-white/5' },
              { href: '/fantasy', label: 'Fantasy', icon: '⚽', accent: 'border-emerald-500/30 hover:bg-emerald-500/5' },
              { href: '/predict', label: 'Predict', icon: '🎯', accent: 'border-purple-500/30 hover:bg-purple-500/5' },
            ] as const).map(({ href, label, icon, accent }) => (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-2 px-4 py-5 rounded-xl border ${accent} transition-colors text-center`}
              >
                <span className="text-2xl">{icon}</span>
                <span className="text-sm font-semibold text-white/90">{label}</span>
                <span className="text-xs text-white/40">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-14">

        {/* Featured Fixtures */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Featured Fixtures</h2>
            <Link href="/matches" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              All fixtures →
            </Link>
          </div>

          {!isLive && fixtures.length === 0 ? (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
              <div className="text-3xl mb-3">📡</div>
              <h3 className="text-sm font-semibold text-amber-400 mb-1">Fixtures unavailable</h3>
              <p className="text-xs text-white/40 max-w-sm mx-auto">
                Could not load World Cup 2026 fixtures. Please refresh the page or check back shortly.
              </p>
            </div>
          ) : fixtures.length > 0 ? (
            <div className="space-y-2">
              {fixtures.map(f => (
                <WcFixtureCard
                  key={f.id}
                  id={f.id}
                  kickoffAt={f.kickoffAt}
                  status={f.status}
                  homeTeam={f.homeTeam}
                  awayTeam={f.awayTeam}
                  homeScore={f.homeScore}
                  awayScore={f.awayScore}
                  round={f.round}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <div className="text-3xl mb-3">📅</div>
              <p className="text-white/50 text-sm">
                No upcoming fixtures found.
              </p>
            </div>
          )}
        </section>

        {/* Group Standings placeholder */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Group Standings</h2>
            <Link href="/stats/standings" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              Full standings →
            </Link>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="text-3xl mb-3">🗺️</div>
            <p className="text-white/50 text-sm">
              Group stage standings will appear here once the tournament begins.
            </p>
          </div>
        </section>

        {/* Highlights */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-6">Highlights</h2>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="text-3xl mb-3">🎬</div>
            <p className="text-white/50 text-sm mb-4">
              Highlights coming soon. Watch live via the Live Scores page.
            </p>
            <Link
              href="/world-cup/live"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25 transition-colors"
            >
              Go to Live Scores →
            </Link>
          </div>
        </section>

        {/* Feature cards */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-6">Everything WC 2026</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {([
              {
                href: '/world-cup/live',
                title: 'Live Match Centre',
                desc: 'Real-time scores, stats, and commentary as it happens.',
                icon: '📡',
              },
              {
                href: '/videos',
                title: 'Videos & Highlights',
                desc: 'Goal replays and post-match highlights.',
                icon: '🎬',
              },
              {
                href: '/guess-the-score',
                title: 'Guess the Score',
                desc: 'Predict exact scorelines and earn points. Free to play.',
                icon: '🎯',
              },
            ] as const).map(({ href, title, desc, icon }) => (
              <Link
                key={href}
                href={href}
                className="block rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] p-6 transition-colors group"
              >
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors mb-1">{title}</h3>
                <p className="text-xs text-white/40">{desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* PSL INACTIVE notice */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-400/80">
          <strong>PSL INACTIVE:</strong> This is a World Cup 2026 beta experience only.
          The PSL season has not been activated. No real-money features are available.
          Fantasy and prediction scores are points-only.
        </div>
      </div>
    </main>
  );
}
