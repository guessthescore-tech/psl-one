import Link from 'next/link';
import { WcFixtureCard } from '@/components/world-cup/WcFixtureCard';
import { getServerApiBase } from '@/lib/server-api-base';

/**
 * Match Centre — live-score style layout, server component.
 * Returns empty list (not static fallback) when API is unavailable.
 *
 * PSL_INACTIVE · NO_REAL_MONEY · WC_BETA
 */

const API_BASE = getServerApiBase();

interface Fixture {
  id: string;
  kickoffAt: string;
  status: string;
  competitionCode?: string | null;
  round?: string | null;
  homeTeam: { name: string; shortName?: string } | null;
  awayTeam: { name: string; shortName?: string } | null;
  homeScore?: number | null;
  awayScore?: number | null;
}

async function fetchTodayFixtures(): Promise<{ fixtures: Fixture[]; isLive: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/football/fixtures?seasonSlug=fifa-world-cup-2026`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { fixtures: [], isLive: false };
    const data = await res.json() as Fixture[] | { data?: Fixture[] };
    let fixtures: Fixture[] = [];
    if (Array.isArray(data)) fixtures = data;
    else if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) fixtures = data.data as Fixture[];
    return fixtures.length > 0 ? { fixtures, isLive: true } : { fixtures: [], isLive: false };
  } catch {
    return { fixtures: [], isLive: false };
  }
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}


export default async function MatchCentrePage() {
  const { fixtures: all, isLive } = await fetchTodayFixtures();
  const todayMatches = all.filter(f => isToday(f.kickoffAt));
  const upcoming = all.filter(f => !isToday(f.kickoffAt)).slice(0, 10);

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
            <span className="text-2xl">📡</span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full">
              Match Centre
            </span>
            <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full font-mono">BETA</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Live <span className="text-emerald-400">Scores</span>
          </h1>
          <p className="text-white/60 max-w-xl">
            Today's fixtures and upcoming matches. Click any match for live stats and prediction markets.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">

        {/* API unavailable notice */}
        {!isLive && all.length === 0 && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
            <div className="text-3xl mb-3">📡</div>
            <h3 className="text-sm font-semibold text-amber-400 mb-1">Match data unavailable</h3>
            <p className="text-xs text-white/40 max-w-sm mx-auto">
              Could not load World Cup 2026 fixtures from the beta API.
              Please refresh the page or try again shortly.
            </p>
          </div>
        )}

        {/* Today */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Today</h2>
          </div>

          {todayMatches.length > 0 ? (
            <div className="space-y-2">
              {todayMatches.map(f => (
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
                  variant={f.status === 'IN_PLAY' || f.status === 'in_progress' ? 'live' : 'default'}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <div className="text-3xl mb-3">📅</div>
              <p className="text-white/50 text-sm">No matches today.</p>
            </div>
          )}
        </section>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-5">Upcoming</h2>
            <div className="space-y-2">
              {upcoming.map(f => (
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
                  variant="predict"
                />
              ))}
            </div>
          </section>
        )}

        {/* Explore more */}
        <div className="flex justify-center gap-3 pt-4">
          <Link
            href="/world-cup"
            className="px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25 transition-colors"
          >
            WC Hub →
          </Link>
          <Link
            href="/fixtures"
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm font-medium hover:bg-white/10 transition-colors"
          >
            All Fixtures →
          </Link>
        </div>
      </div>
    </main>
  );
}
