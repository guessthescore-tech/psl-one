'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { DesignLabProvider, useDesignLab } from '@/components/design-lab/DesignLabToolbar';
import { footballClient, type Fixture, type Season, type StandingGroup, type Team } from '@/lib/football-client';
import { getLeaderboardOverview, type LeaderboardOverview } from '@/lib/leaderboards-client';
import { fanValueClient, type FanValueSummary } from '@/lib/fan-value-client';
import { listPublicMedia } from '@/lib/media-client';
import { fantasyClient, type FantasyTeam } from '@/lib/fantasy-client';
import { gameweeksClient, type Gameweek } from '@/lib/gameweeks-client';

/* ─── Skeleton ─────────────────────────────────────────────────── */
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className ?? ''}`} />;
}

/* ─── Fixture status badge ──────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    LIVE: 'bg-psl-green text-white',
    HALF_TIME: 'bg-psl-gold text-psl-navy',
    FINISHED: 'bg-gray-200 text-gray-600',
    SCHEDULED: 'bg-gray-100 text-gray-500',
  };
  const labels: Record<string, string> = { LIVE: 'LIVE', HALF_TIME: 'HT', FINISHED: 'FT', SCHEDULED: '' };
  const cls = map[status] ?? 'bg-gray-100 text-gray-500';
  const label = labels[status] ?? status;
  if (!label) return null;
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

/* ─── Fixture Rail Card ─────────────────────────────────────────── */
function FixtureRailCard({ fixture }: { fixture: Fixture }) {
  const isLive = fixture.status === 'LIVE' || fixture.status === 'HALF_TIME';
  return (
    <Link
      href={`/matches/${fixture.id}`}
      className={`shrink-0 w-48 rounded-xl border p-3 hover:shadow-md transition-all ${
        isLive ? 'border-psl-green/40 bg-psl-green/5' : 'border-gray-100 bg-white'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <StatusBadge status={fixture.status} />
        {fixture.group && <span className="text-[10px] text-gray-400">{fixture.group.name}</span>}
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-bold text-psl-navy truncate flex-1">{fixture.homeTeam.shortName}</span>
          <span className="text-sm font-black text-psl-navy w-6 text-center">
            {fixture.homeScore ?? '–'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-bold text-psl-navy truncate flex-1">{fixture.awayTeam.shortName}</span>
          <span className="text-sm font-black text-psl-navy w-6 text-center">
            {fixture.awayScore ?? '–'}
          </span>
        </div>
      </div>
      <div className="mt-2 text-[10px] text-gray-400 truncate">
        {new Date(fixture.kickoffAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
      </div>
    </Link>
  );
}

/* ─── League Table Row ──────────────────────────────────────────── */
function TableRow({ standing, pos }: { standing: { played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; points: number; team: Pick<Team, 'name' | 'shortName'> }; pos: number }) {
  return (
    <tr className={`text-xs border-b border-gray-50 ${pos <= 2 ? 'bg-psl-green/5' : ''}`}>
      <td className="py-1.5 pl-3 pr-2 font-bold text-gray-500 w-6">{pos}</td>
      <td className="py-1.5 pr-3 font-semibold text-psl-navy truncate max-w-[120px]">{standing.team.shortName}</td>
      <td className="py-1.5 pr-2 text-center text-gray-500">{standing.played}</td>
      <td className="py-1.5 pr-2 text-center text-gray-500">{standing.won}</td>
      <td className="py-1.5 pr-2 text-center text-gray-500">{standing.drawn}</td>
      <td className="py-1.5 pr-2 text-center text-gray-500">{standing.lost}</td>
      <td className="py-1.5 pr-3 text-center font-black text-psl-navy">{standing.points}</td>
    </tr>
  );
}

/* ─── Fan Value Card ────────────────────────────────────────────── */
function FanValueModule({ summary }: { summary: FanValueSummary | null }) {
  return (
    <div className="bg-gradient-to-br from-psl-navy to-[#163060] rounded-xl p-4 text-white">
      <div className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Fan Value</div>
      {summary ? (
        <>
          <div className="text-3xl font-black text-psl-gold mb-1">
            {summary.totalPoints.toLocaleString()}
          </div>
          <div className="text-xs text-white/60">total points · non-financial</div>
          {summary.recentEntries.length > 0 && (
            <div className="mt-3 space-y-1">
              {summary.recentEntries.slice(0, 3).map(e => (
                <div key={e.id} className="flex justify-between text-xs">
                  <span className="text-white/60 truncate">{e.valueType.replace(/_/g, ' ')}</span>
                  <span className="text-psl-gold font-bold ml-2 shrink-0">+{e.points}</span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-sm text-white/40">Sign in to see your Fan Value</div>
      )}
      <Link href="/fan-value" className="mt-3 block text-center text-xs text-psl-gold/70 hover:text-psl-gold transition-colors">
        View full ledger →
      </Link>
    </div>
  );
}

/* ─── Fantasy Status Module ─────────────────────────────────────── */
function FantasyModule({ team, gameweek }: { team: FantasyTeam | null; gameweek: Gameweek | null }) {
  return (
    <div className="bg-[#1e1b4b] rounded-xl p-4 text-white">
      <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">Fantasy</div>
      {team ? (
        <>
          <div className="font-black text-base mb-0.5">{team.name}</div>
          <div className="text-3xl font-black text-psl-gold">{team.totalPoints}</div>
          <div className="text-xs text-white/50">total points · {team.players.length} players</div>
          {gameweek && (
            <div className="mt-2 text-xs text-indigo-300">
              {gameweek.name} · {gameweek.status}
            </div>
          )}
        </>
      ) : (
        <div className="text-sm text-white/40">Sign in to view your fantasy team</div>
      )}
      <Link href="/fantasy" className="mt-3 block text-center text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
        Manage squad →
      </Link>
    </div>
  );
}

/* ─── Top Scorers ───────────────────────────────────────────────── */
function TopPerformers({ teams }: { teams: Team[] }) {
  const sample = teams.slice(0, 5).map((t, i) => ({
    name: `${t.name} Player ${i + 1}`,
    team: t.shortName,
    stat: 3 - Math.floor(i / 2),
  }));
  return (
    <div>
      {sample.map((p, i) => (
        <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
          <span className="w-5 text-xs font-mono text-gray-400 text-center">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-psl-navy truncate">{p.name}</div>
            <div className="text-xs text-gray-400">{p.team}</div>
          </div>
          <span className="text-sm font-black text-psl-gold">{p.stat}</span>
        </div>
      ))}
      <p className="text-[10px] text-gray-400 mt-2 italic">
        Top performers based on match stats — design demo
      </p>
    </div>
  );
}

/* ─── Media Rail ────────────────────────────────────────────────── */
function MediaRailCard({ item }: { item: { title: string; mediaType: string; slug: string } }) {
  return (
    <Link href={`/media/${item.slug}`} className="shrink-0 w-48 group">
      <div className="h-28 bg-gradient-to-br from-psl-navy to-psl-green rounded-xl mb-2 flex items-center justify-center">
        <span className="text-white/50 text-xs font-bold uppercase tracking-wider">{item.mediaType}</span>
      </div>
      <div className="text-xs font-semibold text-psl-navy group-hover:text-psl-green transition-colors leading-snug line-clamp-2">
        {item.title}
      </div>
    </Link>
  );
}

/* ─── Main Demo Content ─────────────────────────────────────────── */
function InSeasonHomeContent() {
  const { seasonMode, dataState, theme } = useDesignLab();

  const [season, setSeason] = useState<Season | null>(null);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [standingGroups, setStandingGroups] = useState<StandingGroup[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [overview, setOverview] = useState<LeaderboardOverview | null>(null);
  const [fanValue, setFanValue] = useState<FanValueSummary | null>(null);
  const [mediaItems, setMediaItems] = useState<{ id: string; title: string; mediaType: string; slug: string }[]>([]);
  const [fantasyTeam, setFantasyTeam] = useState<FantasyTeam | null>(null);
  const [gameweek, setGameweek] = useState<Gameweek | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeNav, setActiveNav] = useState('matches');
  const fixtureRailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dataState === 'loading') { setLoading(true); return; }
    if (dataState === 'empty') { setLoading(false); setSeason(null); setFixtures([]); return; }
    if (dataState === 'error') { setLoading(false); setError('Demo error state — API not called'); return; }

    setLoading(true);
    setError(null);

    footballClient.getActiveSeason()
      .then(s => {
        setSeason(s);
        return Promise.allSettled([
          footballClient.listFixtures({ seasonSlug: s.slug }).then(f => setFixtures(f.slice(0, 12))),
          footballClient.listStandings({ seasonSlug: s.slug }).then(setStandingGroups),
          footballClient.listTeams({ seasonSlug: s.slug }).then(t => setTeams(t.slice(0, 8))),
        ]);
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));

    getLeaderboardOverview().then(setOverview).catch(() => {});
    fanValueClient.getSummary().then(setFanValue).catch(() => {});
    listPublicMedia().then((d: unknown) => {
      const arr = Array.isArray(d) ? d : ((d as { assets?: unknown[] }).assets ?? []);
      setMediaItems((arr as { id: string; title: string; mediaType: string; slug: string }[]).slice(0, 6));
    }).catch(() => {});
    fantasyClient.getMyTeam().then(setFantasyTeam).catch(() => {});
    gameweeksClient.getActive().then(setGameweek).catch(() => {});
  }, [dataState]);

  const bg = theme === 'dark' ? 'bg-psl-dark' : 'bg-gray-50';
  const cardBg = theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100';
  const headingColor = theme === 'dark' ? 'text-white' : 'text-psl-navy';

  const NAV_ITEMS = ['Matches', 'Table', 'Statistics', 'Fantasy', 'Predictions', 'News', 'Players', 'Clubs', 'Video'];

  const firstGroup = standingGroups[0];

  return (
    <div className={`min-h-screen ${bg} pb-20 md:pb-0`}>
      {/* League header */}
      <div className="bg-psl-navy text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-3 py-3 border-b border-white/10">
            <div className="w-8 h-8 rounded-full bg-psl-gold flex items-center justify-center text-psl-navy font-black text-xs">WC</div>
            <div>
              <div className="font-black text-sm">{season?.competition?.name ?? 'FIFA World Cup 2026'}</div>
              <div className="text-[10px] text-white/50">Beta Season · {seasonMode.replace(/_/g, ' ')}</div>
            </div>
            <div className="ml-auto flex items-center gap-3 text-sm text-white/60">
              <Link href="/profile" className="hover:text-white transition-colors text-xs">Sign In</Link>
              <Link href="/register" className="bg-psl-gold text-psl-navy px-3 py-1 rounded text-xs font-bold hover:bg-yellow-400 transition-colors">
                Join Beta
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <nav aria-label="League navigation" className="flex overflow-x-auto scrollbar-none">
            {NAV_ITEMS.map(item => (
              <button
                key={item}
                onClick={() => setActiveNav(item.toLowerCase())}
                className={`shrink-0 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeNav === item.toLowerCase()
                    ? 'border-psl-gold text-psl-gold'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Matchweek selector */}
      {gameweek && (
        <div className="bg-psl-navy/90 border-b border-white/10 px-4 py-2">
          <div className="mx-auto max-w-7xl flex items-center gap-3">
            <button className="text-white/40 hover:text-white transition-colors text-lg">‹</button>
            <div className="text-xs font-semibold text-white">{gameweek.name}</div>
            <span className="text-[10px] bg-psl-gold/20 text-psl-gold px-2 py-0.5 rounded">{gameweek.status}</span>
            <button className="text-white/40 hover:text-white transition-colors text-lg ml-1">›</button>
            <div className="ml-auto text-[10px] text-white/40">
              Deadline: {new Date(gameweek.transferDeadlineAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Fixture Rail */}
        <section aria-label="Fixture rail" className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-base font-black ${headingColor}`}>Fixtures</h2>
            <Link href="/matches" className="text-xs text-psl-navy/60 hover:text-psl-navy transition-colors">View all →</Link>
          </div>

          {loading ? (
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="w-48 h-28 shrink-0" />)}
            </div>
          ) : fixtures.length === 0 ? (
            <div className={`rounded-xl border ${cardBg} p-8 text-center text-sm text-gray-400`}>
              No fixtures available
            </div>
          ) : (
            <div
              ref={fixtureRailRef}
              className="flex gap-3 overflow-x-auto pb-2 scroll-smooth"
              style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
              role="list"
              aria-label="Fixture cards"
            >
              {fixtures.map(f => (
                <div key={f.id} style={{ scrollSnapAlign: 'start' }} role="listitem">
                  <FixtureRailCard fixture={f} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Table + Results */}
          <div className="space-y-6">
            {/* League Table Snapshot */}
            <section aria-label="League table">
              <div className="flex items-center justify-between mb-3">
                <h2 className={`text-base font-black ${headingColor}`}>
                  {firstGroup ? firstGroup.groupName : 'Table'}
                </h2>
                <Link href="/football/standings" className="text-xs text-psl-navy/60 hover:text-psl-navy">Full table →</Link>
              </div>
              <div className={`rounded-xl border ${cardBg} overflow-hidden`}>
                {loading ? (
                  <div className="p-4 space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-6" />)}
                  </div>
                ) : firstGroup ? (
                  <table className="w-full">
                    <thead>
                      <tr className="text-[10px] text-gray-400 border-b border-gray-100">
                        <th className="py-2 pl-3 pr-2 text-left w-6">#</th>
                        <th className="py-2 pr-3 text-left">Team</th>
                        <th className="py-2 pr-2 text-center">P</th>
                        <th className="py-2 pr-2 text-center">W</th>
                        <th className="py-2 pr-2 text-center">D</th>
                        <th className="py-2 pr-2 text-center">L</th>
                        <th className="py-2 pr-3 text-center font-black">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {firstGroup.standings.slice(0, 6).map((s, i) => (
                        <TableRow key={s.team.id ?? i} standing={s} pos={i + 1} />
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-4 text-sm text-gray-400">No standings available</div>
                )}
              </div>
            </section>

            {/* Fan Value */}
            <FanValueModule summary={fanValue} />
          </div>

          {/* Centre column: Featured + Predictions */}
          <div className="space-y-6">
            {/* Featured match */}
            {fixtures[0] && (
              <section aria-label="Featured match">
                <h2 className={`text-base font-black ${headingColor} mb-3`}>Featured Match</h2>
                <div className={`rounded-xl border ${cardBg} p-5`}>
                  <div className="flex items-center justify-between mb-4">
                    <StatusBadge status={fixtures[0].status} />
                    <span className="text-xs text-gray-400">
                      {fixtures[0].group?.name ?? 'Group Stage'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 text-center">
                      <div className={`text-lg font-black ${headingColor}`}>{fixtures[0].homeTeam.shortName}</div>
                      <div className="text-xs text-gray-400">{fixtures[0].homeTeam.name}</div>
                    </div>
                    <div className="text-center px-4">
                      <div className={`text-4xl font-black ${headingColor}`}>
                        {fixtures[0].homeScore !== null ? fixtures[0].homeScore : '–'}
                        {' '}:{' '}
                        {fixtures[0].awayScore !== null ? fixtures[0].awayScore : '–'}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(fixtures[0].kickoffAt).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="flex-1 text-center">
                      <div className={`text-lg font-black ${headingColor}`}>{fixtures[0].awayTeam.shortName}</div>
                      <div className="text-xs text-gray-400">{fixtures[0].awayTeam.name}</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    <Link href={`/matches/${fixtures[0].id}`} className="flex-1 text-center text-xs py-2 rounded-lg bg-psl-navy text-white font-semibold hover:bg-psl-navy/90 transition-colors">
                      Match Centre
                    </Link>
                    <Link href={`/predictions/fixtures/${fixtures[0].id}`} className="flex-1 text-center text-xs py-2 rounded-lg border border-psl-navy text-psl-navy font-semibold hover:bg-psl-navy/5 transition-colors">
                      Predict
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* Prediction status */}
            <section aria-label="Prediction status">
              <h2 className={`text-base font-black ${headingColor} mb-3`}>Predictions</h2>
              <div className={`rounded-xl border ${cardBg} p-4`}>
                <div className="flex items-center gap-4 mb-3">
                  {overview?.leaderboards.predictions.entries[0] && (
                    <div>
                      <div className="text-2xl font-black text-psl-gold">
                        {overview.leaderboards.predictions.entries[0].totalPoints}
                      </div>
                      <div className="text-xs text-gray-400">Points · Points only</div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href="/predictions/fixtures" className="flex-1 text-center text-xs py-2 rounded-lg bg-psl-green text-white font-semibold hover:bg-psl-green/90 transition-colors">
                    Make Prediction
                  </Link>
                  <Link href="/predictions/me" className="flex-1 text-center text-xs py-2 rounded-lg border border-psl-green text-psl-green font-semibold hover:bg-psl-green/5 transition-colors">
                    My Predictions
                  </Link>
                </div>
              </div>
            </section>
          </div>

          {/* Right column: Fantasy + Top Scorers + Media */}
          <div className="space-y-6">
            <FantasyModule team={fantasyTeam} gameweek={gameweek} />

            {/* Top Performers */}
            <section aria-label="Top performers">
              <div className="flex items-center justify-between mb-3">
                <h2 className={`text-base font-black ${headingColor}`}>Top Scorers</h2>
                <Link href="/players" className="text-xs text-psl-navy/60 hover:text-psl-navy">All stats →</Link>
              </div>
              <div className={`rounded-xl border ${cardBg} p-3`}>
                {loading ? (
                  <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
                ) : teams.length > 0 ? (
                  <TopPerformers teams={teams} />
                ) : (
                  <div className="text-sm text-gray-400 text-center py-4">No data available</div>
                )}
              </div>
            </section>

            {/* Sponsor placement */}
            <div className="rounded-xl border-2 border-dashed border-psl-gold/30 bg-psl-gold/5 p-4 text-center">
              <div className="text-[10px] font-bold uppercase tracking-widest text-psl-gold/60 mb-1">Sponsor Partner</div>
              <Link href="/campaigns" className="text-xs text-psl-navy font-semibold hover:underline">
                View fan campaigns →
              </Link>
            </div>
          </div>
        </div>

        {/* Media Rail */}
        {(mediaItems.length > 0 || loading) && (
          <section aria-label="Latest media" className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-base font-black ${headingColor}`}>Latest</h2>
              <Link href="/media" className="text-xs text-psl-navy/60 hover:text-psl-navy transition-colors">View all →</Link>
            </div>
            {loading ? (
              <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="w-48 h-40 shrink-0" />)}
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}>
                {mediaItems.map(item => (
                  <div key={item.id} style={{ scrollSnapAlign: 'start' }}>
                    <MediaRailCard item={item} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Club content rail */}
        {teams.length > 0 && (
          <section aria-label="Clubs" className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-base font-black ${headingColor}`}>Teams</h2>
              <Link href="/clubs" className="text-xs text-psl-navy/60 hover:text-psl-navy transition-colors">All clubs →</Link>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {teams.map(t => (
                <div key={t.id} className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-psl-navy flex items-center justify-center text-white text-xs font-bold mb-1">
                    {t.shortName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[10px] text-gray-500 truncate w-full text-center">{t.shortName}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile bottom navigation */}
      <nav
        className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-100 md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="grid grid-cols-5 h-16 max-w-md mx-auto">
          {[
            { href: '/', label: 'Home' },
            { href: '/matches', label: 'Matches' },
            { href: '/fantasy', label: 'Fantasy' },
            { href: '/predictions', label: 'Predict' },
            { href: '/profile', label: 'Profile' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-gray-400 hover:text-psl-navy transition-colors"
            >
              <span className="w-1 h-1 rounded-full bg-transparent" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

/* ─── Page export ───────────────────────────────────────────────── */
export default function InSeasonHomePage() {
  return (
    <DesignLabProvider defaultMode="IN_SEASON">
      <InSeasonHomeContent />
    </DesignLabProvider>
  );
}
