import { ScoreBatWorldCupWidget } from '../../../components/world-cup/ScoreBatWorldCupWidget';
import { WC_FALLBACK_FIXTURES } from '@/lib/data';

/**
 * World Cup 2026 Live page — server component.
 * Falls back to WC_FALLBACK_FIXTURES (includes SA vs KOR) when API unreachable.
 *
 * No PSL activation. No real money. No betting/odds content.
 * World Cup beta context only.
 */

const API_BASE = process.env['INTERNAL_API_URL'] ?? 'http://localhost:3001';

interface WcFixture {
  id: string;
  kickoffAt: string;
  status: string;
  homeTeam: { name: string } | null;
  awayTeam: { name: string } | null;
  homeScore?: number | null;
  awayScore?: number | null;
}

async function fetchWcFixtures(): Promise<WcFixture[]> {
  try {
    const res = await fetch(`${API_BASE}/football/fixtures?seasonSlug=fifa-world-cup-2026`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return WC_FALLBACK_FIXTURES;
    const data = await res.json() as WcFixture[];
    const fixtures = Array.isArray(data) ? data : [];
    return fixtures.length > 0 ? fixtures : WC_FALLBACK_FIXTURES;
  } catch {
    return WC_FALLBACK_FIXTURES;
  }
}

async function fetchWidgetConfig(): Promise<{ available: boolean; embedUrl: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/football/world-cup/scorebat-widget`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { available: false, embedUrl: null };
    return res.json() as Promise<{ available: boolean; embedUrl: string | null }>;
  } catch {
    return { available: false, embedUrl: null };
  }
}

export default async function WorldCupLivePage() {
  const [fixtures, widgetConfig] = await Promise.all([
    fetchWcFixtures(),
    fetchWidgetConfig(),
  ]);

  const liveFixtures = fixtures.filter(f => f.status === 'LIVE' || f.status === 'IN_PLAY' || f.status === 'HALF_TIME');
  const upcomingFixtures = fixtures.filter(f => f.status === 'SCHEDULED' || f.status === 'not_started');
  const completedFixtures = fixtures.filter(
    f => f.status === 'FINISHED' || f.status === 'closed' || f.status === 'ended',
  );

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0a1628] via-[#071020] to-[#050505] border-b border-white/10 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🏆</span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full">
              FIFA World Cup 2026
            </span>
            <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">BETA</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            World Cup <span className="text-emerald-400">Live</span>
          </h1>
          <p className="text-white/60 max-w-xl">
            Real-time match scores, highlights, and Group Stage standings.
            Predict results and challenge your friends.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">

        {/* Live now */}
        {liveFixtures.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-5">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-red-400">Live Now</h2>
            </div>
            <div className="space-y-3">
              {liveFixtures.map(f => (
                <FixtureCard key={f.id} fixture={f} liveStyle />
              ))}
            </div>
          </section>
        )}

        {/* Highlights widget */}
        {widgetConfig.available && widgetConfig.embedUrl ? (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-5">Match Highlights</h2>
            <ScoreBatWorldCupWidget embedUrl={widgetConfig.embedUrl} />
          </section>
        ) : (
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-white/40 text-sm">
              Highlights widget not configured —{' '}
              <span className="text-white/60">set <code className="text-emerald-400">SCOREBAT_WIDGET_TOKEN</code> to enable</span>
            </p>
          </section>
        )}

        {/* Upcoming fixtures */}
        {upcomingFixtures.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-5">Upcoming Matches</h2>
            <div className="space-y-3">
              {upcomingFixtures.slice(0, 8).map(f => (
                <FixtureCard key={f.id} fixture={f} />
              ))}
            </div>
          </section>
        )}

        {/* Recent results */}
        {completedFixtures.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-5">Recent Results</h2>
            <div className="space-y-3">
              {completedFixtures.slice(0, 5).map(f => (
                <FixtureCard key={f.id} fixture={f} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {fixtures.length === 0 && (
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-bold mb-2">Fixtures Not Yet Loaded</h3>
            <p className="text-white/50 text-sm max-w-sm mx-auto">
              World Cup 2026 fixtures will appear here once imported.
              Run the dry-run fixture import tool to preview available matches.
            </p>
          </section>
        )}

        {/* Beta notice */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-400/80">
          <strong>Beta:</strong> World Cup 2026 data context only. PSL season inactive.
          No real-money features. Fantasy and prediction scores are points-only.
        </div>
      </div>
    </main>
  );
}

function FixtureCard({ fixture: f, liveStyle }: { fixture: WcFixture; liveStyle?: boolean }) {
  const kickoff = new Date(f.kickoffAt);
  const timeStr = kickoff.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Johannesburg' });
  const dateStr = kickoff.toLocaleDateString('en-ZA', { weekday: 'short', month: 'short', day: 'numeric' });

  const hasScore = f.homeScore != null && f.awayScore != null;

  return (
    <div className={`rounded-xl border px-5 py-4 flex items-center justify-between gap-4 transition-colors ${
      liveStyle
        ? 'border-red-500/30 bg-red-500/5'
        : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05]'
    }`}>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">
          {f.homeTeam?.name ?? 'TBD'} <span className="text-white/40">vs</span> {f.awayTeam?.name ?? 'TBD'}
        </p>
        <p className="text-xs text-white/40 mt-0.5">{dateStr} · {timeStr} SAST</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {hasScore && (
          <span className="font-mono font-bold text-lg tabular-nums">
            {f.homeScore} – {f.awayScore}
          </span>
        )}
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          liveStyle
            ? 'bg-red-500/20 text-red-400'
            : f.status === 'FINISHED' || f.status === 'closed'
              ? 'bg-white/10 text-white/50'
              : 'bg-emerald-500/10 text-emerald-400'
        }`}>
          {liveStyle ? 'LIVE' : f.status.replace(/_/g, ' ')}
        </span>
      </div>
    </div>
  );
}
