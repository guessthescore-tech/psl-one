'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DesignLabProvider, useDesignLab } from '@/components/design-lab/DesignLabToolbar';
import { FantasyPitch } from '@/components/design-lab/FantasyPitch';
import { fantasyClient, type FantasyTeam, type FantasyTeamPlayer } from '@/lib/fantasy-client';
import { gameweeksClient, type Gameweek } from '@/lib/gameweeks-client';
import { getLeaderboardOverview, type LeaderboardResult } from '@/lib/leaderboards-client';

/* ─── Countdown ─────────────────────────────────────────────────── */
function Countdown({ to, label }: { to: string; label: string }) {
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

  return (
    <div className="text-center">
      <div className="text-xs text-white/50 mb-0.5">{label}</div>
      <div className="text-lg font-black font-mono tabular-nums text-psl-gold">{txt || '–'}</div>
    </div>
  );
}

/* ─── Player card ───────────────────────────────────────────────── */
function PlayerCard({
  player,
  onRemove,
}: {
  player: FantasyTeamPlayer;
  onRemove?: () => void;
}) {
  const posColors: Record<string, string> = {
    GOALKEEPER: 'text-amber-500',
    DEFENDER:   'text-psl-green',
    MIDFIELDER: 'text-psl-navy',
    FORWARD:    'text-psl-red',
  };
  const posShort: Record<string, string> = {
    GOALKEEPER: 'GK', DEFENDER: 'DEF', MIDFIELDER: 'MID', FORWARD: 'FWD',
  };
  const cls = posColors[player.position] ?? 'text-gray-400';
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-400">
        {player.player.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-psl-navy truncate">
          {player.player.name}
          {player.isCaptain && <span className="ml-1.5 text-[10px] bg-psl-gold/20 text-psl-navy px-1 rounded font-bold">C</span>}
          {player.isViceCaptain && <span className="ml-1.5 text-[10px] bg-gray-100 text-gray-500 px-1 rounded font-bold">VC</span>}
        </div>
        <div className="text-xs text-gray-400">
          <span className={`font-bold ${cls}`}>{posShort[player.position]}</span>
          <span className="mx-1">·</span>
          <span>{player.player.team.shortName}</span>
          {player.squadRole === 'SUBSTITUTE' && (
            <span className="ml-1.5 text-gray-300">bench {player.benchSlot}</span>
          )}
        </div>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-gray-300 hover:text-psl-red transition-colors text-lg leading-none"
          aria-label={`Remove ${player.player.name}`}
        >
          ×
        </button>
      )}
    </div>
  );
}

/* ─── Mini league table ─────────────────────────────────────────── */
function MiniLeague({ result }: { result: LeaderboardResult | null }) {
  if (!result) {
    return <div className="text-sm text-gray-400 text-center py-4">Sign in to see your league</div>;
  }
  return (
    <div>
      {result.entries.slice(0, 8).map((e, i) => (
        <div key={e.userId} className={`flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0 text-xs ${i === 0 ? 'font-bold' : ''}`}>
          <span className="w-5 text-center text-gray-400 font-mono">{e.rank}</span>
          <span className="flex-1 text-psl-navy truncate">{e.displayName ?? 'Anonymous'}</span>
          <span className="text-psl-gold font-black">{e.totalPoints}</span>
        </div>
      ))}
      <Link href="/leaderboards/fantasy" className="block mt-3 text-center text-xs text-psl-navy/50 hover:text-psl-navy transition-colors">
        Full table →
      </Link>
    </div>
  );
}

/* ─── Gameweek timeline ─────────────────────────────────────────── */
function GameweekTimeline({ gameweeks, currentId }: { gameweeks: Gameweek[]; currentId: string | undefined }) {
  const shown = gameweeks.slice(0, 10);
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
      {shown.map(gw => (
        <div
          key={gw.id}
          className={`shrink-0 rounded-lg px-3 py-2 text-center cursor-default transition-colors ${
            gw.id === currentId
              ? 'bg-psl-navy text-white'
              : gw.status === 'COMPLETED'
              ? 'bg-gray-100 text-gray-500'
              : 'bg-gray-50 text-gray-400'
          }`}
        >
          <div className="text-[10px] font-semibold">{gw.name.replace('Gameweek ', 'GW')}</div>
          {gw.id === currentId && (
            <div className="text-[9px] text-white/60 mt-0.5">{gw.status}</div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Main content ─────────────────────────────────────────────────── */
function FantasyHubContent() {
  const { dataState, theme } = useDesignLab();

  const [team, setTeam] = useState<FantasyTeam | null>(null);
  const [gameweek, setGameweek] = useState<Gameweek | null>(null);
  const [allGameweeks, setAllGameweeks] = useState<Gameweek[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pitch' | 'list' | 'history'>('pitch');

  useEffect(() => {
    if (dataState === 'loading') { setLoading(true); return; }
    if (dataState === 'empty')   { setLoading(false); setTeam(null); return; }
    if (dataState === 'error')   { setLoading(false); setError('Demo error state'); return; }

    setLoading(true);
    setError(null);

    Promise.allSettled([
      fantasyClient.getMyTeam().then(setTeam),
      gameweeksClient.getActive().then(setGameweek),
      gameweeksClient.getAll().then(setAllGameweeks),
      getLeaderboardOverview()
        .then(o => setLeaderboard(o.leaderboards.fantasy))
        .catch(() => {}),
    ])
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [dataState]);

  const bg   = theme === 'dark' ? 'bg-[#12142b]' : 'bg-gray-50';
  const card = theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-100 text-psl-navy';
  const head = theme === 'dark' ? 'text-white' : 'text-psl-navy';

  const starters   = team?.players.filter(p => p.squadRole === 'STARTER') ?? [];
  const subs       = team?.players.filter(p => p.squadRole === 'SUBSTITUTE') ?? [];

  return (
    <div className={`min-h-screen ${bg} pb-20 md:pb-0`}>
      {/* Header */}
      <div className="bg-[#1e1b4b] text-white px-4 py-4 border-b border-white/10">
        <div className="mx-auto max-w-7xl flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-0.5">Fantasy Football</p>
            <h1 className="text-xl font-black">{team?.name ?? 'My Squad'}</h1>
          </div>
          <div className="flex items-center gap-6">
            {team && (
              <div className="text-center">
                <div className="text-2xl font-black text-psl-gold">{team.totalPoints}</div>
                <div className="text-[10px] text-white/50">Total Points</div>
              </div>
            )}
            {gameweek && (
              <>
                <Countdown to={gameweek.transferDeadlineAt} label="Transfer deadline" />
                <Countdown to={gameweek.predictionDeadlineAt} label="Prediction deadline" />
              </>
            )}
            <Link href="/fantasy/transfers" className="text-xs bg-psl-gold text-psl-navy px-3 py-1.5 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
              Transfers
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-auto max-w-7xl px-4 mt-4">
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Gameweek timeline */}
        {allGameweeks.length > 0 && (
          <section className="mb-6">
            <h2 className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'} mb-2`}>
              Gameweeks
            </h2>
            <GameweekTimeline gameweeks={allGameweeks} currentId={gameweek?.id} />
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pitch + squad tabs */}
          <div className="lg:col-span-2">
            {/* Tab selector */}
            <div className="flex gap-1 mb-4 bg-white rounded-xl border border-gray-100 p-1 w-fit">
              {(['pitch', 'list', 'history'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
                    activeTab === tab
                      ? 'bg-psl-navy text-white'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="w-full h-80 rounded-xl bg-gray-100 animate-pulse" />
            ) : activeTab === 'pitch' ? (
              team && team.players.length > 0 ? (
                <FantasyPitch
                  players={team.players}
                  formation={team.formation}
                  selectedId={selectedPlayerId}
                  onSelectPlayer={setSelectedPlayerId}
                />
              ) : (
                <div className={`rounded-xl border ${card} p-8 text-center text-sm ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>
                  {dataState === 'empty' ? 'No squad in empty state' : 'Sign in to view your squad'}
                </div>
              )
            ) : activeTab === 'list' ? (
              <div className={`rounded-xl border ${card} divide-y divide-gray-50 overflow-hidden`}>
                <div className="px-4 py-2 bg-gray-50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Starters ({starters.length})
                  </span>
                </div>
                {starters.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-gray-400 text-center">No starters</div>
                ) : (
                  <div className="px-4">
                    {starters.map(p => <PlayerCard key={p.id} player={p} />)}
                  </div>
                )}
                <div className="px-4 py-2 bg-gray-50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Bench ({subs.length})
                  </span>
                </div>
                <div className="px-4">
                  {subs.map(p => <PlayerCard key={p.id} player={p} />)}
                </div>
              </div>
            ) : (
              <div className={`rounded-xl border ${card} p-6`}>
                <h3 className={`text-sm font-bold ${head} mb-4`}>Gameweek History</h3>
                <div className="space-y-2">
                  {allGameweeks.filter(g => g.status === 'COMPLETED').slice(0, 6).map((gw, i) => (
                    <div key={gw.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0 text-xs">
                      <span className={head}>{gw.name}</span>
                      <span className="text-psl-gold font-black">{(3 - i % 3) + (i % 5)} pts</span>
                    </div>
                  ))}
                  {allGameweeks.filter(g => g.status === 'COMPLETED').length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">No completed gameweeks yet</p>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-3 italic">Points per gameweek — design demo</p>
              </div>
            )}

            {/* Selected player panel */}
            {selectedPlayerId && team && (
              <div className={`mt-4 rounded-xl border ${card} p-4`}>
                {(() => {
                  const p = team.players.find(x => x.id === selectedPlayerId);
                  if (!p) return null;
                  return (
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className={`text-base font-black ${head}`}>{p.player.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {p.position} · {p.player.team.name}
                          {p.isCaptain && ' · Captain'}
                          {p.isViceCaptain && ' · Vice-Captain'}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedPlayerId(null);
                          }}
                          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          Close
                        </button>
                        <Link
                          href={`/fantasy/players/${p.playerId}`}
                          className="text-xs bg-psl-navy text-white px-3 py-1.5 rounded font-semibold hover:bg-psl-navy/90 transition-colors"
                        >
                          View profile
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
            {/* Manager card */}
            <div className="bg-gradient-to-br from-[#1e1b4b] to-[#312e81] rounded-xl p-4 text-white">
              <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-3">Manager</div>
              <div className="text-base font-black mb-0.5">{team?.name ?? 'No team'}</div>
              <div className="text-3xl font-black text-psl-gold mb-1">{team?.totalPoints ?? 0}</div>
              <div className="text-xs text-white/50">total points · {team?.formation ?? '–'} formation</div>
              <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs text-white/60">
                <span>Starters: <strong className="text-white">{starters.length}</strong></span>
                <span>Bench: <strong className="text-white">{subs.length}</strong></span>
              </div>
            </div>

            {/* Mini-league */}
            <div className={`rounded-xl border ${card} p-4`}>
              <h3 className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-white/50' : 'text-gray-400'} mb-3`}>
                Fantasy Leaderboard
              </h3>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-6 rounded bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : (
                <MiniLeague result={leaderboard} />
              )}
            </div>

            {/* Deadline card */}
            {gameweek && (
              <div className={`rounded-xl border ${card} p-4`}>
                <h3 className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-white/50' : 'text-gray-400'} mb-3`}>
                  {gameweek.name}
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-white/50' : 'text-gray-400'}>Status</span>
                    <span className={`font-bold ${head}`}>{gameweek.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-white/50' : 'text-gray-400'}>Fixtures</span>
                    <span className={`font-bold ${head}`}>{gameweek._count.fixtures}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-white/50' : 'text-gray-400'}>Transfers</span>
                    <span className={`font-bold ${head}`}>
                      {new Date(gameweek.transferDeadlineAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={theme === 'dark' ? 'text-white/50' : 'text-gray-400'}>Predictions</span>
                    <span className={`font-bold ${head}`}>
                      {new Date(gameweek.predictionDeadlineAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Non-financial notice */}
            <div className="rounded-xl bg-psl-gold/10 border border-psl-gold/20 p-3">
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Fantasy Football uses <strong>points only</strong>. No entry fees, no cash prizes,
                no real-money mechanics. All scores are fan value points.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────── */
export default function FantasyHubPage() {
  return (
    <DesignLabProvider defaultMode="IN_SEASON">
      <FantasyHubContent />
    </DesignLabProvider>
  );
}
