import Link from 'next/link';

/**
 * Match Centre — live-score style layout, server component.
 * Shows today's and upcoming matches across all loaded competitions.
 *
 * PSL_INACTIVE · NO_REAL_MONEY · WC_BETA
 */

const API_BASE = process.env['INTERNAL_API_URL'] ?? 'http://localhost:3001';

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

async function fetchTodayFixtures(): Promise<Fixture[]> {
  try {
    const res = await fetch(`${API_BASE}/football/fixtures?seasonSlug=fifa-world-cup-2026`, {
      next: { revalidate: 60 },
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

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function statusLabel(status: string): { label: string; className: string; pulse?: boolean } {
  const s = status.toLowerCase();
  if (s === 'in_play' || s === 'in_progress' || s === 'half_time') {
    return { label: s === 'half_time' ? 'HT' : 'LIVE', className: 'text-red-400 bg-red-500/20', pulse: true };
  }
  if (s === 'finished' || s === 'closed' || s === 'ended') {
    return { label: 'FT', className: 'text-white/50 bg-white/10' };
  }
  return { label: 'SCH', className: 'text-emerald-400 bg-emerald-500/10' };
}

export default async function MatchCentrePage() {
  const all = await fetchTodayFixtures();
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

        {/* Today */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Today</h2>
          </div>

          {todayMatches.length > 0 ? (
            <div className="space-y-2">
              {todayMatches.map(f => {
                const { label, className: badgeClass, pulse } = statusLabel(f.status);
                const kickoff = new Date(f.kickoffAt);
                return (
                  <Link
                    key={f.id}
                    href={`/matches/${f.id}`}
                    className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] px-5 py-4 transition-colors group"
                  >
                    {/* Competition badge */}
                    {f.competitionCode && (
                      <span className="text-xs font-mono text-white/30 flex-shrink-0 w-8 text-center">
                        {f.competitionCode}
                      </span>
                    )}

                    {/* Teams */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate group-hover:text-emerald-400 transition-colors">
                        {f.homeTeam?.shortName ?? f.homeTeam?.name ?? 'TBD'}{' '}
                        <span className="text-white/30">vs</span>{' '}
                        {f.awayTeam?.shortName ?? f.awayTeam?.name ?? 'TBD'}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {kickoff.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Johannesburg' })} SAST
                        {f.round ? ` · ${f.round}` : ''}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {f.homeScore != null && f.awayScore != null && (
                        <span className="font-mono font-bold text-xl tabular-nums">
                          {f.homeScore} – {f.awayScore}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1.5 ${badgeClass}`}>
                        {pulse && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
                        {label}
                      </span>
                    </div>
                  </Link>
                );
              })}
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
              {upcoming.map(f => {
                const kickoff = new Date(f.kickoffAt);
                return (
                  <Link
                    key={f.id}
                    href={`/matches/${f.id}`}
                    className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] px-5 py-3 transition-colors group"
                  >
                    {f.competitionCode && (
                      <span className="text-xs font-mono text-white/30 flex-shrink-0 w-8 text-center">
                        {f.competitionCode}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate group-hover:text-emerald-400 transition-colors">
                        {f.homeTeam?.shortName ?? f.homeTeam?.name ?? 'TBD'}{' '}
                        <span className="text-white/30">vs</span>{' '}
                        {f.awayTeam?.shortName ?? f.awayTeam?.name ?? 'TBD'}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {kickoff.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {' · '}
                        {kickoff.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Johannesburg' })} SAST
                      </p>
                    </div>
                    <span className="text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">Predict →</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty state */}
        {all.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="text-4xl mb-4">📡</div>
            <h2 className="font-semibold text-base mb-2">No Fixtures Loaded</h2>
            <p className="text-white/50 text-sm max-w-sm mx-auto mb-5">
              Fixtures will appear here once imported. World Cup 2026 fixtures are imported
              via the admin data-provider tools.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/world-cup"
                className="px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25 transition-colors"
              >
                WC Hub →
              </Link>
              <Link
                href="/matches"
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                All Matches →
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
