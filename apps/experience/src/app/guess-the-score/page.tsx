import Link from 'next/link';

/**
 * Guess the Score hub — server component.
 * Derives open markets from the public /football/fixtures endpoint (SCHEDULED fixtures = open for prediction).
 * Returns empty list (not static fallback) when API is unavailable.
 *
 * PSL_INACTIVE · GTS_POINTS_ONLY · NO_REAL_MONEY · WC_BETA
 */

const API_BASE = process.env['INTERNAL_API_URL'] ?? 'http://localhost:3001';

interface OpenMarket {
  id: string;
  fixtureId: string;
  kickoffAt: string;
  homeTeam: { name: string } | null;
  awayTeam: { name: string } | null;
  status: string;
}

interface ApiFixture {
  id: string;
  kickoffAt: string;
  status: string;
  homeTeam: { name: string } | null;
  awayTeam: { name: string } | null;
}

async function fetchOpenMarkets(): Promise<{ markets: OpenMarket[]; isLive: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/football/fixtures?seasonSlug=fifa-world-cup-2026`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return { markets: [], isLive: false };
    const data = await res.json() as ApiFixture[] | { data?: ApiFixture[] };
    let fixtures: ApiFixture[] = [];
    if (Array.isArray(data)) fixtures = data;
    else if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) fixtures = data.data as ApiFixture[];
    const markets: OpenMarket[] = fixtures
      .filter(f => f.status === 'SCHEDULED' || f.status === 'not_started')
      .slice(0, 8)
      .map(f => ({ id: f.id, fixtureId: f.id, kickoffAt: f.kickoffAt, homeTeam: f.homeTeam, awayTeam: f.awayTeam, status: 'OPEN' }));
    return markets.length > 0 ? { markets, isLive: true } : { markets: [], isLive: false };
  } catch {
    return { markets: [], isLive: false };
  }
}

export default async function GuessTheScorePage() {
  const { markets, isLive } = await fetchOpenMarkets();

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Beta banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center">
        <span className="text-xs text-amber-400/90 font-medium">
          BETA — Points only · No real-money prizes · PSL INACTIVE
        </span>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0a1628] via-[#071020] to-[#050505] border-b border-white/10 py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🎯</span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full">
              Guess the Score
            </span>
            <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full font-mono">BETA · POINTS ONLY</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Predict the <span className="text-emerald-400">Score</span>
          </h1>
          <p className="text-white/60 max-w-xl">
            Predict exact scorelines for World Cup 2026 matches.
            Earn points for correct predictions. Free to play — no real money involved.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/predict"
              className="px-5 py-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25 transition-colors"
            >
              Open Prediction Markets →
            </Link>
            <Link
              href="/predict/challenge"
              className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Challenge a Friend →
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">

        {/* How it works */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {([
              { step: '1', title: 'Pick a Match', desc: 'Choose any open WC 2026 fixture below.', icon: '📅' },
              { step: '2', title: 'Predict the Score', desc: 'Enter your exact scoreline prediction before kick-off.', icon: '🎯' },
              { step: '3', title: 'Earn Points', desc: 'Exact scores = max points. Correct result = bonus points.', icon: '🏅' },
            ] as const).map(({ step, title, desc, icon }) => (
              <div key={step} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                    {step}
                  </span>
                  <span className="text-xl">{icon}</span>
                </div>
                <h3 className="font-semibold text-sm text-white mb-1">{title}</h3>
                <p className="text-xs text-white/40">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Open markets */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">
              Open Markets — WC 2026
              {isLive && <span className="ml-2 text-emerald-400/60 font-normal normal-case tracking-normal text-xs">· Live from API</span>}
            </h2>
            <Link href="/predict" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              All markets →
            </Link>
          </div>

          {!isLive && markets.length === 0 ? (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
              <div className="text-3xl mb-3">📡</div>
              <h3 className="text-sm font-semibold text-amber-400 mb-1">Fixture data unavailable</h3>
              <p className="text-xs text-white/40 max-w-sm mx-auto">
                Could not load World Cup 2026 fixtures from the beta API.
                Please refresh the page or try again shortly.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {markets.map(m => {
                const kickoff = new Date(m.kickoffAt);
                return (
                  <Link
                    key={m.id}
                    href={`/predict?fixtureId=${m.fixtureId}`}
                    className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] hover:border-emerald-500/30 px-5 py-4 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate group-hover:text-emerald-400 transition-colors">
                        {m.homeTeam?.name ?? 'TBD'}{' '}
                        <span className="text-white/40">vs</span>{' '}
                        {m.awayTeam?.name ?? 'TBD'}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {kickoff.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {' · '}
                        {kickoff.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Johannesburg' })} SAST
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400">
                        OPEN
                      </span>
                      <span className="text-xs text-white/30 group-hover:text-emerald-400 transition-colors">Predict →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* No real money notice */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-400/80">
          <strong>Free to play:</strong> Guess the Score is points-based during the beta.
          No real money is involved, no bets are placed, and no cash prizes are offered.
          PSL season is INACTIVE.
        </div>
      </div>
    </main>
  );
}
