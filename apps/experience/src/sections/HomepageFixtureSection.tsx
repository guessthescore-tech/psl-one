import Link from 'next/link';
import { WcFixtureCard } from '@/components/world-cup/WcFixtureCard';

/**
 * Homepage hero section — API-backed World Cup 2026 fixture data.
 * Shows next upcoming fixture, latest finished, and fixture count from the API.
 * Falls back to "API unavailable" state — never shows hardcoded fixture data.
 *
 * PSL_INACTIVE · WC_BETA · NO_REAL_MONEY
 */

const INTERNAL_API_BASE = process.env['INTERNAL_API_URL'] ?? 'http://localhost:3001';

interface ApiFixture {
  id: string;
  kickoffAt: string;
  status: string;
  round?: string | null;
  homeTeam: { name: string; shortName?: string } | null;
  awayTeam: { name: string; shortName?: string } | null;
  homeScore?: number | null;
  awayScore?: number | null;
  gameweek?: { name: string } | null;
}

async function fetchHomepageFixtures(): Promise<{ fixtures: ApiFixture[]; apiLive: boolean }> {
  try {
    const res = await fetch(
      `${INTERNAL_API_BASE}/football/fixtures?seasonSlug=fifa-world-cup-2026`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return { fixtures: [], apiLive: false };
    const data = (await res.json()) as ApiFixture[] | { data?: ApiFixture[] };
    const fixtures: ApiFixture[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? (data.data as ApiFixture[])
        : [];
    return { fixtures, apiLive: true };
  } catch {
    return { fixtures: [], apiLive: false };
  }
}

export async function HomepageFixtureSection() {
  const { fixtures, apiLive } = await fetchHomepageFixtures();

  const upcoming = [...fixtures]
    .filter(f => f.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime());

  const finished = [...fixtures]
    .filter(f => f.status === 'FINISHED')
    .sort((a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime());

  const nextFixture = upcoming[0] ?? null;
  const lastFinished = finished[0] ?? null;
  const totalFixtures = fixtures.length;
  const upcomingCount = upcoming.length;
  const finishedCount = finished.length;
  const stripFixtures = upcoming.slice(0, 6);

  return (
    <section
      className="relative bg-[#060d19] overflow-hidden"
      aria-label="World Cup 2026 fixtures"
    >
      {/* Beta + API status banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center">
        <span className="text-xs text-amber-400/90 font-medium">
          BETA · World Cup 2026 · PSL INACTIVE · No real-money features
          {apiLive && totalFixtures > 0 && (
            <> · <span className="text-emerald-400">{totalFixtures} fixtures from live API</span></>
          )}
          {!apiLive && (
            <> · <span className="text-red-400">Live beta API unavailable — refresh to retry</span></>
          )}
        </span>
      </div>

      {/* API unavailable state */}
      {!apiLive && (
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="text-5xl mb-5">📡</div>
          <h2 className="text-2xl font-extrabold text-white mb-3">
            Live beta API unavailable
          </h2>
          <p className="text-white/50 text-sm max-w-sm mx-auto mb-6">
            Could not load World Cup 2026 fixtures from the beta API.
            Please refresh the page or try again shortly.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/fixtures"
              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors underline underline-offset-2"
            >
              Try fixtures page →
            </Link>
            <Link
              href="/world-cup"
              className="text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              World Cup hub
            </Link>
          </div>
        </div>
      )}

      {/* API live — show fixture hero */}
      {apiLive && (
        <>
          {/* Hero */}
          <div className="relative min-h-[70dvh] flex items-end overflow-hidden">
            {/* Background gradient */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(135deg, #0a1628 0%, #071020 50%, #050505 100%)',
              }}
              aria-hidden
            />
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'radial-gradient(ellipse 80% 60% at 50% 20%, #10b981 0%, transparent 70%)',
              }}
              aria-hidden
            />

            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-12 pb-16">
              {/* Competition label */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl" aria-hidden>
                  🌍
                </span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full">
                  FIFA World Cup 2026
                </span>
                <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full font-mono">
                  BETA
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                {upcomingCount > 0 ? 'Next Match' : 'Latest Result'}
              </h1>

              {/* Stats row */}
              <div className="flex gap-4 mb-8 text-xs text-white/40">
                <span>{finishedCount} played</span>
                <span>·</span>
                <span>{upcomingCount} upcoming</span>
                <span>·</span>
                <span>{totalFixtures} total</span>
              </div>

              {/* Next upcoming fixture */}
              {nextFixture ? (
                <div className="max-w-lg">
                  <WcFixtureCard
                    id={nextFixture.id}
                    kickoffAt={nextFixture.kickoffAt}
                    status={nextFixture.status}
                    homeTeam={nextFixture.homeTeam}
                    awayTeam={nextFixture.awayTeam}
                    homeScore={nextFixture.homeScore}
                    awayScore={nextFixture.awayScore}
                    round={nextFixture.round}
                    href={`/guess-the-score?fixture=${nextFixture.id}`}
                    variant="predict"
                  />
                  <div className="mt-4 flex gap-3">
                    <Link
                      href={`/guess-the-score?fixture=${nextFixture.id}`}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold px-5 py-2.5 rounded-full transition-colors duration-150 min-h-[44px] flex items-center"
                    >
                      Predict this match
                    </Link>
                    <Link
                      href="/fixtures"
                      className="border border-white/20 hover:border-white/40 text-white/70 hover:text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors duration-150 min-h-[44px] flex items-center"
                    >
                      All fixtures
                    </Link>
                  </div>
                </div>
              ) : lastFinished ? (
                <div className="max-w-lg">
                  <WcFixtureCard
                    id={lastFinished.id}
                    kickoffAt={lastFinished.kickoffAt}
                    status={lastFinished.status}
                    homeTeam={lastFinished.homeTeam}
                    awayTeam={lastFinished.awayTeam}
                    homeScore={lastFinished.homeScore}
                    awayScore={lastFinished.awayScore}
                    round={lastFinished.round}
                    href={`/matches/${lastFinished.id}`}
                  />
                </div>
              ) : (
                <div className="text-white/40 text-sm">
                  No upcoming World Cup fixtures currently available from API.
                </div>
              )}
            </div>
          </div>

          {/* Upcoming fixture strip */}
          {stripFixtures.length > 1 && (
            <div className="bg-[#090f1e] border-t border-white/8 py-8">
              <div className="max-w-5xl mx-auto px-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    Upcoming fixtures
                  </h2>
                  <Link
                    href="/fixtures"
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    See all {upcomingCount} →
                  </Link>
                </div>
                <div className="space-y-2">
                  {/* Skip first (already shown in hero) */}
                  {stripFixtures.slice(1).map(f => (
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
                      href={`/guess-the-score?fixture=${f.id}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* No upcoming fixtures state */}
          {upcomingCount === 0 && (
            <div className="bg-[#090f1e] border-t border-white/8 py-8">
              <div className="max-w-5xl mx-auto px-6 text-center py-6">
                <p className="text-white/40 text-sm">
                  No upcoming World Cup fixtures currently available from API.
                </p>
                <Link
                  href="/fixtures"
                  className="inline-block mt-3 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  View all fixtures →
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
