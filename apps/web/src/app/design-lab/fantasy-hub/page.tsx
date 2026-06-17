'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DesignLabProvider, useDesignLab } from '@/components/design-lab/DesignLabToolbar';
import { FantasyPitch } from '@/components/design-lab/FantasyPitch';
import { fantasyClient, type FantasyTeam, type FantasyTeamPlayer } from '@/lib/fantasy-client';
import { gameweeksClient, type Gameweek } from '@/lib/gameweeks-client';
import { getLeaderboardOverview, type LeaderboardResult } from '@/lib/leaderboards-client';

/* ── Countdown ─────────────────────────────────────────────────── */
function Countdown({ to }: { to: string }) {
  const [txt, setTxt] = useState('');

  useEffect(() => {
    function tick() {
      const diff = new Date(to).getTime() - Date.now();
      if (diff <= 0) { setTxt('Locked'); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setTxt(h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`);
    }
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [to]);

  return <span className="font-mono tabular-nums font-black text-psl-gold">{txt || '–'}</span>;
}

/* ── Skeleton ──────────────────────────────────────────────────── */
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-card-sm bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] motion-safe:animate-shimmer ${className}`} />
  );
}

/* ── Player list row ───────────────────────────────────────────── */
function PlayerListRow({ player }: { player: FantasyTeamPlayer }) {
  const posShort: Record<string, string> = { GOALKEEPER: 'GK', DEFENDER: 'DEF', MIDFIELDER: 'MID', FORWARD: 'FWD' };
  const posColor: Record<string, string> = {
    GOALKEEPER: 'text-amber-400',
    DEFENDER:   'text-psl-green',
    MIDFIELDER: 'text-indigo-400',
    FORWARD:    'text-psl-red',
  };
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-black text-white/60 flex-shrink-0">
        {player.player.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate">
          {player.player.name}
          {player.isCaptain && <span className="ml-1.5 text-[10px] bg-psl-gold/20 text-psl-gold px-1 rounded font-bold">C</span>}
          {player.isViceCaptain && <span className="ml-1.5 text-[10px] bg-white/10 text-white/60 px-1 rounded font-bold">VC</span>}
        </div>
        <div className="text-xs text-white/40">
          <span className={`font-bold ${posColor[player.position] ?? 'text-white/40'}`}>{posShort[player.position]}</span>
          <span className="mx-1 text-white/20">·</span>
          <span>{player.player.team.shortName}</span>
          {player.squadRole === 'SUBSTITUTE' && (
            <span className="ml-1.5 text-white/20">bench {player.benchSlot}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Mini league ───────────────────────────────────────────────── */
function MiniLeague({ result }: { result: LeaderboardResult | null }) {
  if (!result) {
    return (
      <div className="text-sm text-white/30 text-center py-6">Sign in to see your league</div>
    );
  }
  return (
    <div>
      {result.entries.slice(0, 8).map((e, i) => (
        <div key={e.userId} className={`flex items-center gap-3 py-2 border-b border-white/5 last:border-0 text-xs ${i === 0 ? '' : ''}`}>
          <span className={`w-5 text-center font-mono ${i === 0 ? 'text-psl-gold font-black' : 'text-white/30'}`}>{e.rank}</span>
          <span className="flex-1 text-white/70 truncate">{e.displayName ?? 'Anonymous'}</span>
          <span className="text-psl-gold font-black tabular-nums">{e.totalPoints}</span>
        </div>
      ))}
      <Link href="/leaderboards/fantasy" className="block mt-3 text-center text-xs text-white/30 hover:text-white/60 motion-safe:transition-colors">
        Full leaderboard →
      </Link>
    </div>
  );
}

/* ── Gameweek timeline ─────────────────────────────────────────── */
function GameweekTimeline({ gameweeks, currentId }: { gameweeks: Gameweek[]; currentId: string | undefined }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
      {gameweeks.slice(0, 10).map(gw => {
        const isCurrent = gw.id === currentId;
        const isDone = gw.status === 'COMPLETED';
        return (
          <div
            key={gw.id}
            className={`flex-shrink-0 rounded-card-sm px-3 py-2 text-center motion-safe:transition-all cursor-default ${
              isCurrent
                ? 'bg-psl-gold text-psl-midnight font-bold shadow-glow-gold'
                : isDone
                ? 'bg-white/10 text-white/40'
                : 'bg-white/5 text-white/25'
            }`}
          >
            <div className="text-[10px] font-semibold">{gw.name.replace('Gameweek ', 'GW')}</div>
            {isCurrent && <div className="text-[9px] text-psl-midnight/60 mt-0.5">{gw.status}</div>}
          </div>
        );
      })}
    </div>
  );
}

/* ── Stats bar ─────────────────────────────────────────────────── */
function StatsBar({ team, gameweek, starters, subs }: {
  team: FantasyTeam | null;
  gameweek: Gameweek | null;
  starters: number;
  subs: number;
}) {
  const stats = [
    { label: 'Total Pts', value: team?.totalPoints ?? '–', highlight: true },
    { label: 'Formation', value: team?.formation ?? '–', highlight: false },
    { label: 'Starters',  value: starters,                highlight: false },
    { label: 'Bench',     value: subs,                    highlight: false },
  ];
  return (
    <div className="flex items-center gap-px bg-white/5 rounded-card-sm overflow-hidden">
      {stats.map((s, i) => (
        <div key={i} className="flex-1 text-center px-4 py-3 border-r border-white/5 last:border-0">
          <div className={`text-base font-black tabular-nums leading-none ${s.highlight ? 'text-psl-gold' : 'text-white'}`}>
            {String(s.value)}
          </div>
          <div className="text-[10px] text-white/30 mt-0.5">{s.label}</div>
        </div>
      ))}
      {gameweek && (
        <div className="flex-1 text-center px-4 py-3 border-r border-white/5 last:border-0">
          <div className="text-[10px] text-white/30 mb-0.5">Transfers close</div>
          <Countdown to={gameweek.transferDeadlineAt} />
        </div>
      )}
    </div>
  );
}

/* ── Main content ──────────────────────────────────────────────── */
function FantasyHubContent() {
  const { dataState } = useDesignLab();

  const [team, setTeam]               = useState<FantasyTeam | null>(null);
  const [gameweek, setGameweek]       = useState<Gameweek | null>(null);
  const [allGameweeks, setAll]        = useState<Gameweek[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResult | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [tab, setTab]                 = useState<'pitch' | 'list' | 'history'>('pitch');

  useEffect(() => {
    if (dataState === 'loading') { setLoading(true); return; }
    if (dataState === 'empty')   { setLoading(false); setTeam(null); return; }
    if (dataState === 'error')   { setLoading(false); setError('API unavailable — design lab error state'); return; }

    setLoading(true);
    setError(null);

    Promise.allSettled([
      fantasyClient.getMyTeam().then(setTeam),
      gameweeksClient.getActive().then(setGameweek),
      gameweeksClient.getAll().then(setAll),
      getLeaderboardOverview().then(o => setLeaderboard(o.leaderboards.fantasy)).catch(() => {}),
    ])
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [dataState]);

  const starters = team?.players.filter((p: FantasyTeamPlayer) => p.squadRole === 'STARTER') ?? [];
  const subs     = team?.players.filter((p: FantasyTeamPlayer) => p.squadRole === 'SUBSTITUTE') ?? [];

  return (
    <div className="min-h-screen bg-[#0f1117] pb-20 md:pb-0">

      {/* Header — immersive dark */}
      <header className="bg-[#141929] border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-label-sm text-indigo-400 mb-1">Fantasy Command Centre</p>
              <h1 className="text-display-sm text-white leading-tight">
                {loading ? <span className="text-white/20">Loading…</span> : (team?.name ?? 'My Squad')}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/fantasy/transfers"
                className="bg-psl-gold text-psl-midnight px-4 py-2 rounded-pill text-xs font-black hover:bg-yellow-300 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psl-gold"
              >
                Transfers
              </Link>
              <Link
                href="/leaderboards/fantasy"
                className="border border-white/10 text-white/60 px-3 py-2 rounded-pill text-xs font-semibold hover:text-white hover:border-white/20 motion-safe:transition-colors"
              >
                Leaderboard
              </Link>
            </div>
          </div>
          {!loading && (
            <StatsBar team={team} gameweek={gameweek} starters={starters.length} subs={subs.length} />
          )}
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="rounded-card-sm bg-red-900/20 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Gameweek timeline */}
        {allGameweeks.length > 0 && (
          <section aria-label="Gameweek timeline">
            <p className="text-label-sm text-white/30 mb-2">Gameweeks</p>
            <GameweekTimeline gameweeks={allGameweeks} currentId={gameweek?.id} />
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Pitch + squad — 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tab bar */}
            <div className="flex gap-1 bg-white/5 rounded-card-sm p-1 w-fit">
              {(['pitch', 'list', 'history'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-card-sm text-xs font-semibold motion-safe:transition-colors capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
                    tab === t ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {loading ? (
              <Skeleton className="w-full h-96" />
            ) : tab === 'pitch' ? (
              team && team.players.length > 0 ? (
                <FantasyPitch
                  players={team.players}
                  formation={team.formation}
                  selectedId={selectedId}
                  onSelectPlayer={setSelectedId}
                />
              ) : (
                <div className="rounded-card bg-white/5 border border-white/10 p-12 text-center">
                  <p className="text-sm text-white/40 mb-3">No squad data available</p>
                  <Link href="/fantasy/new" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 motion-safe:transition-colors">
                    Set up your squad →
                  </Link>
                </div>
              )
            ) : tab === 'list' ? (
              <div className="rounded-card bg-white/5 border border-white/5 overflow-hidden">
                <div className="px-4 py-2.5 bg-white/5 border-b border-white/5">
                  <span className="text-label-sm text-white/30">Starters ({starters.length})</span>
                </div>
                <div className="px-4">
                  {starters.length === 0
                    ? <div className="py-6 text-sm text-white/30 text-center">No starters</div>
                    : starters.map((p: FantasyTeamPlayer) => <PlayerListRow key={p.id} player={p} />)
                  }
                </div>
                <div className="px-4 py-2.5 bg-white/5 border-y border-white/5">
                  <span className="text-label-sm text-white/30">Bench ({subs.length})</span>
                </div>
                <div className="px-4">
                  {subs.map((p: FantasyTeamPlayer) => <PlayerListRow key={p.id} player={p} />)}
                </div>
              </div>
            ) : (
              <div className="rounded-card bg-white/5 border border-white/5 p-5">
                <h3 className="text-sm font-bold text-white mb-4">Gameweek History</h3>
                <div className="space-y-1">
                  {allGameweeks.filter(g => g.status === 'COMPLETED').slice(0, 6).map((gw, i) => (
                    <div key={gw.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <span className="text-sm text-white/60">{gw.name}</span>
                      <span className="text-psl-gold font-black tabular-nums">{(4 - i % 3) + (i % 4)} pts</span>
                    </div>
                  ))}
                  {allGameweeks.filter(g => g.status === 'COMPLETED').length === 0 && (
                    <p className="text-sm text-white/30 text-center py-6">No completed gameweeks yet</p>
                  )}
                </div>
              </div>
            )}

            {/* Selected player panel */}
            {selectedId && team && (
              <div className="rounded-card bg-white/5 border border-white/10 p-4 motion-safe:animate-slide-up">
                {(() => {
                  const p = team.players.find((x: FantasyTeamPlayer) => x.id === selectedId);
                  if (!p) return null;
                  return (
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-black text-white">{p.player.name}</div>
                        <div className="text-xs text-white/40 mt-0.5">
                          {p.position} · {p.player.team.name}
                          {p.isCaptain && ' · Captain'}
                          {p.isViceCaptain && ' · Vice-Captain'}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedId(null)}
                          className="text-xs text-white/30 hover:text-white/60 motion-safe:transition-colors px-2"
                          aria-label="Close player panel"
                        >
                          ✕
                        </button>
                        <Link
                          href={`/fantasy/players/${p.playerId}`}
                          className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-card-sm font-semibold hover:bg-indigo-500 motion-safe:transition-colors"
                        >
                          Profile
                        </Link>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Gameweek deadline */}
            {gameweek && (
              <div className="rounded-card bg-white/5 border border-white/5 p-5">
                <p className="text-label-sm text-white/30 mb-4">{gameweek.name}</p>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">Status</span>
                    <span className={`font-bold px-2 py-0.5 rounded-pill text-[10px] ${
                      gameweek.status === 'OPEN' ? 'bg-psl-green/20 text-psl-green' : 'bg-white/10 text-white/60'
                    }`}>{gameweek.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40">Fixtures</span>
                    <span className="font-bold text-white">{gameweek._count.fixtures}</span>
                  </div>
                  <div className="pt-3 border-t border-white/5">
                    <div className="text-[10px] text-white/30 mb-1">Transfer window closes</div>
                    <div className="font-semibold text-white text-sm">
                      {new Date(gameweek.transferDeadlineAt).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-white/5">
                    <div className="text-[10px] text-white/30 mb-1">Prediction window closes</div>
                    <div className="font-semibold text-white text-sm">
                      {new Date(gameweek.predictionDeadlineAt).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mini-league */}
            <div className="rounded-card bg-white/5 border border-white/5 p-5">
              <p className="text-label-sm text-white/30 mb-3">Fantasy Leaderboard</p>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-7" />)}
                </div>
              ) : (
                <MiniLeague result={leaderboard} />
              )}
            </div>

            {/* Points-only notice */}
            <div className="rounded-card-sm border border-psl-gold/15 bg-psl-gold/5 p-4">
              <p className="text-[11px] text-white/50 leading-relaxed">
                Fantasy Football is <strong className="text-white/70">points only</strong>. No entry fees,
                no cash prizes, no real-money mechanics. All scores are fan value points.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FantasyHubPage() {
  return (
    <DesignLabProvider defaultMode="IN_SEASON">
      <FantasyHubContent />
    </DesignLabProvider>
  );
}
