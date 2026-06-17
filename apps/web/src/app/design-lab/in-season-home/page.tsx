'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { DesignLabProvider, useDesignLab } from '@/components/design-lab/DesignLabToolbar';
import { footballClient, type Fixture, type Season, type StandingGroup, type Standing, type Team } from '@/lib/football-client';
import { getLeaderboardOverview, type LeaderboardOverview } from '@/lib/leaderboards-client';
import { fanValueClient, type FanValueSummary } from '@/lib/fan-value-client';
import { listPublicMedia } from '@/lib/media-client';
import { fantasyClient, type FantasyTeam } from '@/lib/fantasy-client';
import { gameweeksClient, type Gameweek } from '@/lib/gameweeks-client';

/* ── Primitives ────────────────────────────────────────────────── */

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-card-sm bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%] motion-safe:animate-shimmer ${className}`}
    />
  );
}

function LiveBadge({ minute }: { minute?: number }) {
  return (
    <span className="inline-flex items-center gap-1 bg-psl-live text-white text-[10px] font-bold px-2 py-0.5 rounded-pill uppercase tracking-wide">
      <span className="w-1.5 h-1.5 rounded-full bg-white motion-safe:animate-live-pulse" />
      {minute ? `${minute}'` : 'Live'}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'LIVE') return <LiveBadge />;
  if (status === 'HALF_TIME') return (
    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-pill uppercase tracking-wide">HT</span>
  );
  if (status === 'FINISHED') return (
    <span className="text-[10px] font-bold text-psl-muted">FT</span>
  );
  return null;
}

function FormDot({ result }: { result: 'W' | 'D' | 'L' }) {
  const cls: Record<string, string> = {
    W: 'bg-psl-green title="Win"',
    D: 'bg-amber-400 title="Draw"',
    L: 'bg-psl-red title="Loss"',
  };
  const bg = { W: 'bg-psl-green', D: 'bg-amber-400', L: 'bg-psl-red' }[result];
  return <span className={`w-2 h-2 rounded-full ${bg}`} aria-label={result} />;
}

/* ── Fixture Rail Card ─────────────────────────────────────────── */
function FixtureRailCard({ fixture }: { fixture: Fixture }) {
  const isLive = fixture.status === 'LIVE' || fixture.status === 'HALF_TIME';
  const isFinished = fixture.status === 'FINISHED';
  return (
    <Link
      href={`/matches/${fixture.id}`}
      aria-label={`${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`}
      className={`flex-shrink-0 w-44 rounded-card-sm p-3.5 border motion-safe:transition-all motion-safe:duration-150 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-card-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-navy focus-visible:ring-offset-1 ${
        isLive ? 'border-psl-live/25 bg-white shadow-card' : 'border-[#e8eaf0] bg-white shadow-card'
      }`}
    >
      <div className="flex items-center justify-between mb-3 min-h-[18px]">
        <StatusBadge status={fixture.status} />
        {fixture.group && (
          <span className="text-[10px] text-psl-muted truncate ml-1">{fixture.group.name}</span>
        )}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-psl-navy truncate flex-1">{fixture.homeTeam.shortName}</span>
          <span className={`text-base font-black w-5 text-right tabular-nums ${isLive ? 'text-psl-live' : 'text-psl-navy'}`}>
            {fixture.homeScore ?? '–'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-psl-navy truncate flex-1">{fixture.awayTeam.shortName}</span>
          <span className={`text-base font-black w-5 text-right tabular-nums ${isLive ? 'text-psl-live' : 'text-psl-navy'}`}>
            {fixture.awayScore ?? '–'}
          </span>
        </div>
      </div>
      <div className="mt-3 text-[10px] text-psl-muted">
        {isFinished
          ? 'Full time'
          : isLive
          ? 'In progress'
          : new Date(fixture.kickoffAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
      </div>
    </Link>
  );
}

/* ── League Table Row ──────────────────────────────────────────── */
function TableRow({ standing, pos }: { standing: Standing; pos: number }) {
  const isPromotion = pos <= 2;
  const form: ('W' | 'D' | 'L')[] = (['W', 'W', 'D', 'L', 'W'] as ('W' | 'D' | 'L')[]).reverse().slice(0, 5) as ('W' | 'D' | 'L')[];
  return (
    <tr className={`text-xs border-b border-[#f0f2f8] last:border-0 motion-safe:transition-colors motion-safe:hover:bg-[#f5f7fb] ${isPromotion ? 'bg-psl-green/[0.04]' : ''}`}>
      <td className="py-2.5 pl-4 pr-2 w-7">
        {isPromotion
          ? <span className="font-black text-psl-green">{pos}</span>
          : <span className="font-mono text-psl-muted text-[11px]">{pos}</span>}
      </td>
      <td className="py-2.5 pr-3 font-semibold text-psl-navy max-w-[100px] truncate">{standing.team.shortName}</td>
      <td className="py-2.5 pr-2 text-center text-psl-muted tabular-nums">{standing.played}</td>
      <td className="py-2.5 pr-2 text-center font-semibold text-psl-navy tabular-nums">{standing.won}</td>
      <td className="py-2.5 pr-2 text-center text-psl-muted tabular-nums">{standing.drawn}</td>
      <td className="py-2.5 pr-2 text-center text-psl-muted tabular-nums">{standing.lost}</td>
      <td className="py-2.5 pr-2 hidden sm:table-cell">
        <div className="flex gap-0.5 items-center">
          {form.map((r, i) => <FormDot key={i} result={r} />)}
        </div>
      </td>
      <td className="py-2.5 pr-4 text-center font-black text-psl-navy tabular-nums">{standing.points}</td>
    </tr>
  );
}

/* ── Fan Value Card ────────────────────────────────────────────── */
function FanValueCard({ summary }: { summary: FanValueSummary | null }) {
  if (!summary) {
    return (
      <div className="rounded-card bg-psl-midnight p-5 text-white">
        <p className="text-label-md text-white/40 mb-2">Fan Value</p>
        <p className="text-sm text-white/40 mb-4">Sign in to see your fan value</p>
        <Link href="/login" className="block text-center text-xs font-semibold text-psl-gold hover:text-yellow-300 motion-safe:transition-colors">
          Sign in →
        </Link>
      </div>
    );
  }
  return (
    <div className="rounded-card bg-gradient-to-br from-psl-midnight to-[#163060] p-5 text-white shadow-card-md">
      <p className="text-label-md text-white/40 mb-3">Fan Value</p>
      <div className="text-stat-lg text-psl-gold tabular-nums leading-none mb-1">{summary.totalPoints.toLocaleString()}</div>
      <p className="text-xs text-white/40 mb-4">points · non-financial</p>
      {summary.recentEntries.slice(0, 3).map(e => (
        <div key={e.id} className="flex justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
          <span className="text-white/50 truncate capitalize">{String(e.valueType).replace(/_/g, ' ').toLowerCase()}</span>
          <span className="text-psl-gold font-bold ml-3 shrink-0">+{e.points}</span>
        </div>
      ))}
      <Link href="/fan-value" className="mt-4 block text-center text-xs text-white/30 hover:text-white/60 motion-safe:transition-colors">
        Full ledger →
      </Link>
    </div>
  );
}

/* ── Fantasy Card ──────────────────────────────────────────────── */
function FantasyCard({ team, gameweek }: { team: FantasyTeam | null; gameweek: Gameweek | null }) {
  if (!team) {
    return (
      <div className="rounded-card bg-[#1e1b4b] p-5 text-white">
        <p className="text-label-md text-indigo-400 mb-2">Fantasy</p>
        <p className="text-sm text-white/40 mb-4">Sign in to manage your squad</p>
        <Link href="/login" className="block text-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 motion-safe:transition-colors">
          Sign in →
        </Link>
      </div>
    );
  }
  return (
    <div className="rounded-card bg-[#1e1b4b] p-5 text-white shadow-card-md">
      <div className="flex items-start justify-between mb-3">
        <p className="text-label-md text-indigo-400">Fantasy</p>
        {gameweek && (
          <span className="text-[10px] bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-pill">{gameweek.name}</span>
        )}
      </div>
      <div className="font-black text-sm text-white leading-tight mb-1">{team.name}</div>
      <div className="text-stat-lg text-psl-gold tabular-nums leading-none mb-1">{team.totalPoints}</div>
      <p className="text-xs text-white/40 mb-4">total points</p>
      <Link href="/design-lab/fantasy-hub" className="block text-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 motion-safe:transition-colors">
        Fantasy Command Centre →
      </Link>
    </div>
  );
}

/* ── Predictions Card ──────────────────────────────────────────── */
function PredictCard({ overview, fixture }: { overview: LeaderboardOverview | null; fixture: Fixture | null }) {
  const pts = overview?.leaderboards.predictions.entries[0]?.totalPoints ?? null;
  return (
    <div className="rounded-card bg-white border border-[#e8eaf0] p-5 shadow-card">
      <p className="text-label-md text-psl-muted mb-3">Predictions</p>
      {pts !== null ? (
        <>
          <div className="text-stat-md text-psl-navy tabular-nums leading-none mb-0.5">{pts}</div>
          <p className="text-xs text-psl-muted mb-4">prediction points</p>
        </>
      ) : (
        <p className="text-sm text-psl-muted mb-4">Sign in to see your points</p>
      )}
      {fixture && (
        <div className="bg-[#f5f7fb] rounded-card-sm p-3 mb-4">
          <div className="flex items-center justify-between text-xs font-bold text-psl-navy">
            <span>{fixture.homeTeam.shortName}</span>
            <span className="text-psl-muted font-normal text-[10px]">vs</span>
            <span>{fixture.awayTeam.shortName}</span>
          </div>
          <p className="text-[10px] text-psl-muted mt-1 text-center">Upcoming — make your call</p>
        </div>
      )}
      <div className="flex gap-2">
        <Link href="/design-lab/prediction-carousel" className="flex-1 text-center py-2.5 rounded-card-sm bg-psl-green text-white text-xs font-bold hover:bg-psl-green/90 motion-safe:transition-colors">
          Predict now
        </Link>
        <Link href="/predictions/me" className="flex-1 text-center py-2.5 rounded-card-sm border border-psl-green text-psl-green text-xs font-bold hover:bg-psl-green/5 motion-safe:transition-colors">
          My picks
        </Link>
      </div>
    </div>
  );
}

/* ── Top Scorers ───────────────────────────────────────────────── */
function TopScorersCard({ teams }: { teams: Team[] }) {
  const entries = teams.slice(0, 5).map((t, i) => ({
    name: `${t.shortName} ${['Striker', 'Forward', 'Winger', 'Attacker', 'Forward'][i]}`,
    team: t.shortName,
    goals: [7, 6, 5, 4, 4][i] ?? 3,
  }));
  return (
    <div className="rounded-card bg-white border border-[#e8eaf0] shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f2f8]">
        <h3 className="text-sm font-black text-psl-navy">Top Scorers</h3>
        <Link href="/players" className="text-[11px] text-psl-muted hover:text-psl-navy motion-safe:transition-colors">All stats →</Link>
      </div>
      <div className="divide-y divide-[#f0f2f8]">
        {entries.map((p, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5 motion-safe:transition-colors motion-safe:hover:bg-[#f5f7fb]">
            <span className="w-5 text-center text-xs font-mono text-psl-muted">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-psl-navy truncate">{p.name}</div>
              <div className="text-[10px] text-psl-muted">{p.team}</div>
            </div>
            <span className="text-sm font-black text-psl-gold tabular-nums">{p.goals}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Media Card ────────────────────────────────────────────────── */
function MediaCard({ item }: { item: { id: string; title: string; mediaType: string; slug: string } }) {
  return (
    <Link href={`/media/${item.slug}`} className="flex-shrink-0 w-52 group" style={{ scrollSnapAlign: 'start' }}>
      <div className="h-32 rounded-card-sm mb-2.5 overflow-hidden bg-gradient-to-br from-psl-navy to-psl-green flex items-end p-3 group-hover:opacity-90 motion-safe:transition-opacity">
        <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">{item.mediaType}</span>
      </div>
      <p className="text-xs font-semibold text-psl-navy group-hover:text-psl-green motion-safe:transition-colors leading-snug line-clamp-2">
        {item.title}
      </p>
    </Link>
  );
}

/* ── Main content ──────────────────────────────────────────────── */
function LeagueMatchdayContent() {
  const { dataState, theme } = useDesignLab();

  const [season, setSeason]         = useState<Season | null>(null);
  const [fixtures, setFixtures]     = useState<Fixture[]>([]);
  const [groups, setGroups]         = useState<StandingGroup[]>([]);
  const [teams, setTeams]           = useState<Team[]>([]);
  const [overview, setOverview]     = useState<LeaderboardOverview | null>(null);
  const [fanValue, setFanValue]     = useState<FanValueSummary | null>(null);
  const [media, setMedia]           = useState<{ id: string; title: string; mediaType: string; slug: string }[]>([]);
  const [fantasyTeam, setFantasy]   = useState<FantasyTeam | null>(null);
  const [gameweek, setGameweek]     = useState<Gameweek | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const [activeNav, setActiveNav] = useState('matches');
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dataState === 'loading') { setLoading(true); return; }
    if (dataState === 'empty')   { setLoading(false); setSeason(null); setFixtures([]); setGroups([]); return; }
    if (dataState === 'error')   { setLoading(false); setError('API unavailable — design lab error state'); return; }

    setLoading(true);
    setError(null);

    footballClient.getActiveSeason()
      .then(s => {
        setSeason(s);
        return Promise.allSettled([
          footballClient.listFixtures({ seasonSlug: s.slug }).then(f => setFixtures(f.slice(0, 12))),
          footballClient.listStandings({ seasonSlug: s.slug }).then(setGroups),
          footballClient.listTeams({ seasonSlug: s.slug }).then(t => setTeams(t.slice(0, 8))),
        ]);
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));

    getLeaderboardOverview().then(setOverview).catch(() => {});
    fanValueClient.getSummary().then(setFanValue).catch(() => {});
    listPublicMedia().then((d: unknown) => {
      const arr = Array.isArray(d) ? d : ((d as { assets?: unknown[] }).assets ?? []);
      setMedia((arr as { id: string; title: string; mediaType: string; slug: string }[]).slice(0, 6));
    }).catch(() => {});
    fantasyClient.getMyTeam().then(setFantasy).catch(() => {});
    gameweeksClient.getActive().then(setGameweek).catch(() => {});
  }, [dataState]);

  const isDark = theme === 'dark';
  const bg     = isDark ? 'bg-psl-dark' : 'bg-psl-surface';
  const cardCls = isDark ? 'bg-psl-card-dk border-white/10' : 'bg-white border-[#e8eaf0]';
  const h       = isDark ? 'text-white' : 'text-psl-navy';

  const firstGroup   = groups[0] ?? null;
  const liveFixtures = fixtures.filter(f => f.status === 'LIVE' || f.status === 'HALF_TIME');
  const nextFixture  = fixtures.find(f => f.status === 'SCHEDULED') ?? null;
  const featured     = liveFixtures[0] ?? fixtures[0] ?? null;

  const NAV = ['Matches', 'Table', 'Statistics', 'Fantasy', 'Predictions', 'News', 'Players', 'Clubs', 'Video'];

  return (
    <div className={`min-h-screen ${bg} pb-20 md:pb-0`}>

      {/* League header */}
      <header className="bg-psl-midnight text-white sticky top-0 z-40 shadow-inner-top">
        {/* Brand bar */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 border-b border-white/10">
          <div className="w-8 h-8 rounded-full bg-psl-gold flex items-center justify-center text-psl-midnight font-black text-xs flex-shrink-0 select-none">
            WC
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-sm leading-tight truncate">
              {season?.competition?.name ?? 'FIFA World Cup 2026'}
            </div>
            <div className="text-[10px] text-white/40">Beta · Group Stage</div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/login" className="text-xs text-white/50 hover:text-white motion-safe:transition-colors">Sign in</Link>
            <Link
              href="/register"
              className="bg-psl-gold text-psl-midnight px-3 py-1.5 rounded-pill text-xs font-bold hover:bg-yellow-300 motion-safe:transition-colors"
            >
              Join
            </Link>
          </div>
        </div>

        {/* Tab navigation */}
        <nav aria-label="League navigation">
          <div className="max-w-7xl mx-auto flex overflow-x-auto" style={{ scrollbarWidth: 'none' }} role="tablist">
            {NAV.map(item => (
              <button
                key={item}
                role="tab"
                aria-selected={activeNav === item.toLowerCase()}
                onClick={() => setActiveNav(item.toLowerCase())}
                className={`flex-shrink-0 px-4 py-3 text-xs font-semibold border-b-2 motion-safe:transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:bg-white/5 ${
                  activeNav === item.toLowerCase()
                    ? 'border-psl-gold text-psl-gold'
                    : 'border-transparent text-white/50 hover:text-white hover:border-white/20'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Live strip */}
      {liveFixtures.length > 0 && (
        <div className="bg-psl-live/10 border-b border-psl-live/20">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
            <LiveBadge />
            <span className="text-xs text-psl-live font-semibold">
              {liveFixtures.length} match{liveFixtures.length !== 1 ? 'es' : ''} in progress
            </span>
            <div className="ml-auto flex gap-4 overflow-x-auto">
              {liveFixtures.map(f => (
                <Link key={f.id} href={`/matches/${f.id}`} className="text-xs font-bold text-psl-live whitespace-nowrap hover:underline">
                  {f.homeTeam.shortName} {f.homeScore}–{f.awayScore} {f.awayTeam.shortName}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Matchweek bar */}
      {gameweek && (
        <div className="bg-white border-b border-[#e8eaf0]">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2 text-xs">
            <button aria-label="Previous matchweek" className="text-psl-muted hover:text-psl-navy w-6 h-6 flex items-center justify-center motion-safe:transition-colors">‹</button>
            <span className="font-bold text-psl-navy">{gameweek.name}</span>
            <span className="bg-[#f0f2f8] text-psl-navy px-2 py-0.5 rounded-pill font-semibold text-[10px]">{gameweek.status}</span>
            <button aria-label="Next matchweek" className="text-psl-muted hover:text-psl-navy w-6 h-6 flex items-center justify-center motion-safe:transition-colors">›</button>
            <span className="ml-auto text-[10px] text-psl-muted hidden sm:block">
              Transfers close {new Date(gameweek.transferDeadlineAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="rounded-card-sm bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">

        {/* ── Fixture rail ── */}
        <section aria-label="Fixture rail">
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-display-sm ${h}`}>Fixtures</h2>
            <Link href="/matches" className="text-xs text-psl-muted hover:text-psl-navy motion-safe:transition-colors">View all →</Link>
          </div>
          {loading ? (
            <div className="flex gap-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="w-44 h-28 flex-shrink-0" />)}
            </div>
          ) : fixtures.length === 0 ? (
            <div className={`rounded-card border ${cardCls} p-8 text-center text-sm text-psl-muted`}>No fixtures available</div>
          ) : (
            <div
              ref={railRef}
              role="list"
              aria-label="Fixture cards"
              className="flex gap-3 overflow-x-auto pb-2"
              style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {fixtures.map(f => (
                <div key={f.id} role="listitem" style={{ scrollSnapAlign: 'start' }}>
                  <FixtureRailCard fixture={f} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 3-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Table + Fan Value */}
          <div className="space-y-6">
            <section aria-label="League standings">
              <div className="flex items-center justify-between mb-3">
                <h2 className={`text-display-sm ${h}`}>{firstGroup?.groupName ?? 'Standings'}</h2>
                <Link href="/football/standings" className="text-xs text-psl-muted hover:text-psl-navy motion-safe:transition-colors">Full table →</Link>
              </div>
              <div className={`rounded-card border ${cardCls} overflow-hidden shadow-card`}>
                {loading ? (
                  <div className="p-4 space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9" />)}
                  </div>
                ) : firstGroup ? (
                  <table className="w-full" aria-label="League standings table">
                    <thead>
                      <tr className="text-[10px] font-bold uppercase tracking-wider text-psl-muted border-b border-[#f0f2f8]">
                        <th scope="col" className="py-2.5 pl-4 pr-2 text-left w-7">#</th>
                        <th scope="col" className="py-2.5 pr-3 text-left">Team</th>
                        <th scope="col" className="py-2.5 pr-2 text-center">P</th>
                        <th scope="col" className="py-2.5 pr-2 text-center">W</th>
                        <th scope="col" className="py-2.5 pr-2 text-center">D</th>
                        <th scope="col" className="py-2.5 pr-2 text-center">L</th>
                        <th scope="col" className="py-2.5 pr-2 text-center hidden sm:table-cell">Form</th>
                        <th scope="col" className="py-2.5 pr-4 text-center">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {firstGroup.standings.slice(0, 6).map((s, i) => (
                        <TableRow key={s.team.id ?? i} standing={s} pos={i + 1} />
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-sm text-psl-muted text-center">No standings available</div>
                )}
              </div>
            </section>

            <FanValueCard summary={fanValue} />
          </div>

          {/* Centre: Featured match + Predictions */}
          <div className="space-y-6">
            <section aria-label="Featured match">
              <h2 className={`text-display-sm ${h} mb-3`}>Featured Match</h2>
              {loading ? (
                <Skeleton className="h-52 rounded-card" />
              ) : featured ? (
                <div className={`rounded-card border ${cardCls} overflow-hidden shadow-card-md`}>
                  <div className="bg-psl-midnight p-5">
                    <div className="flex items-center justify-between mb-4">
                      <StatusBadge status={featured.status} />
                      <span className="text-[10px] text-white/30">{featured.group?.name ?? 'Group Stage'}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 text-center">
                        <div className="text-display-sm text-white">{featured.homeTeam.shortName}</div>
                        <div className="text-[10px] text-white/30 mt-0.5 uppercase tracking-wider truncate">{featured.homeTeam.name}</div>
                      </div>
                      <div className="text-center px-2 flex-shrink-0">
                        {featured.homeScore !== null ? (
                          <div className="text-display-lg text-white tabular-nums">
                            {featured.homeScore}–{featured.awayScore}
                          </div>
                        ) : (
                          <>
                            <div className="text-sm text-white/20 font-bold">vs</div>
                            <div className="text-[10px] text-psl-gold mt-1">
                              {new Date(featured.kickoffAt).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex-1 text-center">
                        <div className="text-display-sm text-white">{featured.awayTeam.shortName}</div>
                        <div className="text-[10px] text-white/30 mt-0.5 uppercase tracking-wider truncate">{featured.awayTeam.name}</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex gap-2">
                    <Link href={`/matches/${featured.id}`} className="flex-1 text-center text-xs font-bold py-2.5 rounded-card-sm bg-psl-navy text-white hover:bg-psl-navy/90 motion-safe:transition-colors">
                      Match Centre
                    </Link>
                    <Link href="/design-lab/prediction-carousel" className="flex-1 text-center text-xs font-bold py-2.5 rounded-card-sm border border-psl-navy text-psl-navy hover:bg-psl-navy/5 motion-safe:transition-colors">
                      Predict
                    </Link>
                  </div>
                </div>
              ) : (
                <div className={`rounded-card border ${cardCls} p-8 text-center text-sm text-psl-muted`}>No fixture selected</div>
              )}
            </section>

            <PredictCard overview={overview} fixture={nextFixture} />
          </div>

          {/* Right: Fantasy + Top Scorers + Sponsor */}
          <div className="space-y-6">
            <FantasyCard team={fantasyTeam} gameweek={gameweek} />

            {loading ? (
              <Skeleton className="h-56 rounded-card" />
            ) : teams.length > 0 ? (
              <TopScorersCard teams={teams} />
            ) : null}

            <div className="rounded-card border border-dashed border-psl-gold/30 bg-psl-gold/5 p-5 text-center">
              <p className="text-label-sm text-psl-gold/60 mb-1">Sponsor Partner</p>
              <p className="text-xs text-psl-muted mb-3">Campaign activation slot</p>
              <Link href="/campaigns" className="text-xs font-semibold text-psl-navy hover:underline">View campaigns →</Link>
            </div>
          </div>
        </div>

        {/* ── Media rail ── */}
        {(media.length > 0 || loading) && (
          <section aria-label="Latest media">
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-display-sm ${h}`}>Latest</h2>
              <Link href="/media" className="text-xs text-psl-muted hover:text-psl-navy motion-safe:transition-colors">View all →</Link>
            </div>
            {loading ? (
              <div className="flex gap-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="w-52 h-40 flex-shrink-0" />)}
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}>
                {media.map(item => (
                  <MediaCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Teams rail ── */}
        {teams.length > 0 && !loading && (
          <section aria-label="Teams in tournament">
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-display-sm ${h}`}>Teams</h2>
              <Link href="/clubs" className="text-xs text-psl-muted hover:text-psl-navy motion-safe:transition-colors">All teams →</Link>
            </div>
            <div className="grid grid-cols-8 gap-3">
              {teams.map(t => (
                <Link key={t.id} href={`/clubs/${t.id}`} className="flex flex-col items-center gap-1 group">
                  <div className="w-10 h-10 rounded-full bg-psl-navy flex items-center justify-center text-white text-xs font-black group-hover:bg-psl-green motion-safe:transition-colors">
                    {t.shortName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[10px] text-psl-muted truncate w-full text-center group-hover:text-psl-navy motion-safe:transition-colors">
                    {t.shortName}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-[#e8eaf0] md:hidden"
        aria-label="Mobile navigation"
        style={{ height: '56px' }}
      >
        <div className="grid grid-cols-5 h-full max-w-md mx-auto">
          {[
            { href: '/',                                  label: 'Home',    active: false },
            { href: '/matches',                           label: 'Matches', active: true  },
            { href: '/design-lab/fantasy-hub',            label: 'Fantasy', active: false },
            { href: '/design-lab/prediction-carousel',    label: 'Predict', active: false },
            { href: '/design-lab/account',                label: 'Profile', active: false },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold motion-safe:transition-colors min-h-[44px] ${
                item.active ? 'text-psl-navy' : 'text-psl-muted hover:text-psl-navy'
              }`}
            >
              {item.active && <span className="w-4 h-0.5 rounded-full bg-psl-navy mb-0.5" aria-hidden="true" />}
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default function LeagueMatchdayPage() {
  return (
    <DesignLabProvider defaultMode="IN_SEASON">
      <LeagueMatchdayContent />
    </DesignLabProvider>
  );
}
