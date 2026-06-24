import Link from 'next/link';

/**
 * Fixtures page — World Cup 2026 specific fixture list.
 * Renders the same match data as /matches but scoped to WC competition code.
 *
 * PSL_INACTIVE · NO_REAL_MONEY · WC_BETA
 */

const API_BASE = process.env['INTERNAL_API_URL'] ?? 'http://localhost:3001';

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

async function fetchWcFixtures(): Promise<Fixture[]> {
  try {
    const res = await fetch(`${API_BASE}/football/fixtures?seasonSlug=fifa-world-cup-2026`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json() as Fixture[] | { data?: Fixture[] };
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) return data.data as Fixture[];
    return [];
  } catch {
    return [];
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

function statusBadge(status: string): { label: string; className: string } {
  const s = status.toLowerCase();
  if (s === 'in_play' || s === 'in_progress') return { label: 'LIVE', className: 'bg-red-500/20 text-red-400' };
  if (s === 'finished' || s === 'closed' || s === 'ended') return { label: 'FT', className: 'bg-white/10 text-white/50' };
  return { label: status.replace(/_/g, ' '), className: 'bg-emerald-500/10 text-emerald-400' };
}

export default async function FixturesPage() {
  const fixtures = await fetchWcFixtures();
  const grouped = groupByRound(fixtures);

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
        {fixtures.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h2 className="font-semibold text-base mb-2">No Fixtures Loaded</h2>
            <p className="text-white/50 text-sm max-w-sm mx-auto mb-5">
              World Cup 2026 fixtures will appear here once imported via the admin panel.
            </p>
            <Link
              href="/world-cup"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25 transition-colors"
            >
              Go to WC Hub →
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {Array.from(grouped.entries()).map(([round, roundFixtures]) => (
              <section key={round}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">{round}</h2>
                <div className="space-y-2">
                  {roundFixtures.map(f => {
                    const { label, className: badgeClass } = statusBadge(f.status);
                    const kickoff = new Date(f.kickoffAt);
                    return (
                      <Link
                        key={f.id}
                        href={`/matches/${f.id}`}
                        className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] px-5 py-3.5 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate group-hover:text-emerald-400 transition-colors">
                            {f.homeTeam?.shortName ?? f.homeTeam?.name ?? 'TBD'}{' '}
                            <span className="text-white/40">vs</span>{' '}
                            {f.awayTeam?.shortName ?? f.awayTeam?.name ?? 'TBD'}
                          </p>
                          <p className="text-xs text-white/40 mt-0.5">
                            {kickoff.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })}
                            {' · '}
                            {kickoff.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Johannesburg' })} SAST
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {f.homeScore != null && f.awayScore != null && (
                            <span className="font-mono font-bold text-base tabular-nums">
                              {f.homeScore} – {f.awayScore}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>{label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
