import Link from 'next/link';
import { WcFixtureCard } from '@/components/world-cup/WcFixtureCard';
import { getServerApiBase } from '@/lib/server-api-base';

/**
 * Fixtures page — World Cup 2026 specific fixture list.
 * Returns empty list (not static fallback) when API is unavailable.
 *
 * PSL_INACTIVE · NO_REAL_MONEY · WC_BETA
 */

const API_BASE = getServerApiBase();

interface Fixture {
  id: string;
  kickoffAt: string;
  status: string;
  round?: string | null;
  homeTeam: { name: string; shortName?: string } | null;
  awayTeam: { name: string; shortName?: string } | null;
  homeScore?: number | null;
  awayScore?: number | null;
}

async function fetchWcFixtures(): Promise<{ fixtures: Fixture[]; isLive: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/football/fixtures?seasonSlug=fifa-world-cup-2026`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return { fixtures: [], isLive: false };
    const data = await res.json() as Fixture[] | { data?: Fixture[] };
    let fixtures: Fixture[] = [];
    if (Array.isArray(data)) fixtures = data;
    else if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) fixtures = data.data as Fixture[];
    if (fixtures.length === 0) return { fixtures: [], isLive: false };
    return { fixtures, isLive: true };
  } catch {
    return { fixtures: [], isLive: false };
  }
}

function groupByRound(fixtures: Fixture[]): Map<string, Fixture[]> {
  const map = new Map<string, Fixture[]>();
  for (const f of fixtures) {
    const key = f.round ?? 'Group Stage';
    const list = map.get(key) ?? [];
    list.push(f);
    map.set(key, list);
  }
  return map;
}


export default async function FixturesPage() {
  const { fixtures, isLive } = await fetchWcFixtures();
  const grouped = groupByRound(fixtures);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Beta banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center">
        <span className="text-xs text-amber-400/90 font-medium">
          BETA — PSL INACTIVE · World Cup 2026 Beta · No real-money features
          {!isLive && fixtures.length === 0 && ' · API unavailable — refresh to retry'}
        </span>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0a1628] via-[#071020] to-[#050505] border-b border-white/10 py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📅</span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full">
              FIFA World Cup 2026
            </span>
            <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full font-mono">BETA</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            WC 2026 <span className="text-emerald-400">Fixtures</span>
          </h1>
          <p className="text-white/60 max-w-xl">
            All World Cup 2026 fixtures. Click a match to predict the result.
          </p>
          <div className="flex gap-3 mt-6">
            <Link
              href="/matches"
              className="text-xs text-white/50 hover:text-white/80 transition-colors"
            >
              ← All matches (incl. PSL)
            </Link>
            <Link
              href="/world-cup"
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              WC hub →
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {!isLive && fixtures.length === 0 && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-10 text-center mb-10">
            <div className="text-4xl mb-4">📡</div>
            <h3 className="text-lg font-bold text-amber-400 mb-2">Fixtures unavailable</h3>
            <p className="text-white/50 text-sm max-w-sm mx-auto">
              Could not load World Cup 2026 fixtures from the beta API.
              Please refresh the page or try again shortly.
            </p>
          </div>
        )}
        <div className="space-y-10">
          {Array.from(grouped.entries()).map(([round, roundFixtures]) => (
            <section key={round}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">{round}</h2>
              <div className="space-y-2">
                {roundFixtures.map(f => (
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
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
