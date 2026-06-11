'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { footballClient, type LiveMatchDashboard, type MatchEvent, type FixtureLineup, type LiveFantasyPlayerPreview } from '@/lib/football-client';

const POLL_MS = 20000;

const EVENT_ICON: Record<string, string> = {
  GOAL: '⚽',
  OWN_GOAL: '⚽',
  YELLOW_CARD: '🟨',
  SECOND_YELLOW: '🟨🟥',
  RED_CARD: '🟥',
  SUBSTITUTION: '🔄',
  KICKOFF: '▶',
  HALF_TIME: '—',
  SECOND_HALF: '▶',
  FULL_TIME: '■',
  VAR: 'VAR',
  PENALTY_SCORED: '⚽ P',
  PENALTY_MISS: '✗ P',
  PENALTY_SAVE: '🧤',
  INJURY: '🩹',
  OTHER: '•',
};

function LiveBadge({ status, minute }: { status: string; minute: number | null }) {
  if (status === 'LIVE')
    return (
      <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        LIVE{minute != null ? ` ${minute}'` : ''}
      </span>
    );
  if (status === 'HALF_TIME')
    return <span className="inline-block bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">HT</span>;
  if (status === 'FINISHED')
    return <span className="inline-block bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">FT</span>;
  return <span className="inline-block bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full">{status}</span>;
}

function TimelineEvent({ event }: { event: MatchEvent }) {
  const icon = EVENT_ICON[event.eventType] ?? '•';
  return (
    <div className="flex items-start gap-3 py-2.5 px-3 hover:bg-gray-50">
      <span className="text-gray-400 text-xs w-10 text-right font-mono mt-0.5 shrink-0">
        {event.minute}&apos;{event.stoppageMinute != null ? `+${event.stoppageMinute}` : ''}
      </span>
      <span className="text-base w-6 text-center shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        {event.player && <p className="text-sm font-medium text-gray-900">{event.player.name}</p>}
        {event.relatedPlayer && event.eventType === 'SUBSTITUTION' && (
          <p className="text-xs text-gray-500">↑ {event.relatedPlayer.name}</p>
        )}
        {event.description && <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>}
        {event.team && <p className="text-xs text-gray-400 mt-0.5">{event.team.shortName}</p>}
      </div>
    </div>
  );
}

function LineupSection({ lineups, teamId, teamName }: { lineups: FixtureLineup[]; teamId: string; teamName: string }) {
  const starters = lineups
    .filter(l => l.teamId === teamId && l.status === 'STARTING')
    .sort((a, b) => (a.shirtNumber ?? 99) - (b.shirtNumber ?? 99));
  const subs = lineups
    .filter(l => l.teamId === teamId && l.status === 'SUBSTITUTE')
    .sort((a, b) => (a.shirtNumber ?? 99) - (b.shirtNumber ?? 99));

  if (starters.length === 0 && subs.length === 0)
    return <p className="text-sm text-gray-400 italic">Lineup not yet available</p>;

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{teamName}</p>
      {starters.map(l => (
        <div key={l.id} className="flex items-center gap-2 py-1">
          <span className="text-xs text-gray-400 w-5 text-right shrink-0">{l.shirtNumber ?? '—'}</span>
          <span className="text-sm text-gray-900">{l.player.name}</span>
          <span className="text-xs text-gray-400">{l.position ?? l.player.position}</span>
        </div>
      ))}
      {subs.length > 0 && (
        <>
          <p className="text-xs text-gray-400 mt-3 mb-1 font-medium">Substitutes</p>
          {subs.map(l => (
            <div key={l.id} className="flex items-center gap-2 py-0.5 text-gray-500">
              <span className="text-xs text-gray-400 w-5 text-right shrink-0">{l.shirtNumber ?? '—'}</span>
              <span className="text-sm">{l.player.name}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function FantasyPreview({ players }: { players: LiveFantasyPlayerPreview[] }) {
  if (players.length === 0)
    return <p className="text-sm text-gray-400 italic">No player stats yet — check back during the match</p>;
  const sorted = [...players].sort((a, b) => b.estimatedPoints - a.estimatedPoints);
  return (
    <div className="overflow-x-auto">
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-3">
        ⚠ Provisional — computed from live stats. Points are not settled until the fixture is finalised.
      </p>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-500 uppercase border-b border-gray-200">
            <th className="text-left pb-2 pr-3">Player</th>
            <th className="text-left pb-2 pr-3">Pos</th>
            <th className="text-right pb-2 pr-2">Mins</th>
            <th className="text-right pb-2 pr-2">G</th>
            <th className="text-right pb-2 pr-2">A</th>
            <th className="text-right pb-2 pr-2">YC</th>
            <th className="text-right pb-2 pr-2">RC</th>
            <th className="text-right pb-2 pr-2">Sv</th>
            <th className="text-right pb-2 pr-2">CS</th>
            <th className="text-right pb-2 font-bold">Pts*</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(p => (
            <tr key={p.playerId} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="py-1.5 pr-3 font-medium text-gray-900">{p.playerName ?? '—'}</td>
              <td className="py-1.5 pr-3 text-gray-500">{p.position?.slice(0, 3) ?? '—'}</td>
              <td className="py-1.5 pr-2 text-right text-gray-600">{p.minutesPlayed}</td>
              <td className="py-1.5 pr-2 text-right">{p.goals}</td>
              <td className="py-1.5 pr-2 text-right">{p.assists}</td>
              <td className="py-1.5 pr-2 text-right">{p.yellowCards}</td>
              <td className="py-1.5 pr-2 text-right">{p.redCards}</td>
              <td className="py-1.5 pr-2 text-right">{p.saves}</td>
              <td className="py-1.5 pr-2 text-right">{p.cleanSheet ? '✓' : '—'}</td>
              <td className="py-1.5 text-right font-bold text-gray-900">{p.estimatedPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-400 mt-2">* Provisional. Not settled.</p>
    </div>
  );
}

export default function MatchCentrePage() {
  const { fixtureId } = useParams<{ fixtureId: string }>();
  const [data, setData] = useState<LiveMatchDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [tab, setTab] = useState<'timeline' | 'lineups' | 'stats' | 'fantasy'>('timeline');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const d = await footballClient.getLiveMatchDashboard(fixtureId);
      setData(d);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    }
  }, [fixtureId]);

  // Initial load
  useEffect(() => {
    void load();
  }, [load]);

  // Polling — always poll while LIVE or HALF_TIME
  useEffect(() => {
    if (!data) return;
    const isLive = data.fixture.status === 'LIVE' || data.fixture.status === 'HALF_TIME';
    if (!isLive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => void load(), POLL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [data?.fixture.status, load]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6 text-gray-400 animate-pulse">Loading match centre…</div>;

  const { fixture, homeTeam, awayTeam, events, lineups, playerStats, liveFantasyPreview } = data;
  const isLive = fixture.status === 'LIVE' || fixture.status === 'HALF_TIME';
  const competition = (fixture as unknown as { season?: { competition?: { name?: string } } }).season?.competition?.name;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-gray-500">
        <Link href="/football" className="hover:underline">Football</Link>
        {competition && <> / <span>{competition}</span></>}
        {' / '}
        <span>Match Centre</span>
      </div>

      {/* Score card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
        {/* Title row */}
        <div className="flex items-center justify-between mb-4">
          <LiveBadge status={fixture.status} minute={fixture.currentMinute} />
          <div className="text-right text-xs text-gray-400">
            {new Date(fixture.kickoffAt).toLocaleDateString(undefined, {
              weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
            })}
          </div>
        </div>

        {/* Teams and score */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center">
            <p className="text-lg font-bold text-gray-900">{homeTeam.name}</p>
            <p className="text-xs text-gray-400">{homeTeam.shortName}</p>
          </div>
          <div className="text-5xl font-mono font-bold text-gray-900 min-w-[8rem] text-center">
            {fixture.homeScore ?? 0} – {fixture.awayScore ?? 0}
          </div>
          <div className="flex-1 text-center">
            <p className="text-lg font-bold text-gray-900">{awayTeam.name}</p>
            <p className="text-xs text-gray-400">{awayTeam.shortName}</p>
          </div>
        </div>

        {/* Period + venue */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-400">
          {fixture.period && (
            <span className="capitalize">{fixture.period.replace(/_/g, ' ')}</span>
          )}
          {fixture.venue && (
            <span>{fixture.venue.name}, {fixture.venue.city}</span>
          )}
        </div>

        {/* Auto-refresh indicator */}
        {isLive && (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-green-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Auto-refreshing every {POLL_MS / 1000}s
            {lastUpdated && <span className="text-gray-400 ml-1">· Last: {lastUpdated.toLocaleTimeString()}</span>}
          </div>
        )}
        {!isLive && lastUpdated && (
          <p className="mt-2 text-center text-xs text-gray-400">
            Updated {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200 overflow-x-auto">
        {(['timeline', 'lineups', 'stats', 'fantasy'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap -mb-px shrink-0 ${
              tab === t
                ? 'border-b-2 border-gray-900 text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'fantasy' ? `Fantasy Preview${liveFantasyPreview.length > 0 ? ` (${liveFantasyPreview.length})` : ''}`
              : t === 'timeline' ? `Timeline${events.length > 0 ? ` (${events.length})` : ''}`
              : t === 'lineups' ? 'Lineups'
              : 'Player Stats'}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {tab === 'timeline' && (
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          {events.length === 0 ? (
            <p className="p-6 text-sm text-gray-400 italic text-center">No events yet</p>
          ) : (
            events.map(e => <TimelineEvent key={e.id} event={e} />)
          )}
        </div>
      )}

      {/* Lineups */}
      {tab === 'lineups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <LineupSection lineups={lineups} teamId={homeTeam.id} teamName={homeTeam.name} />
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <LineupSection lineups={lineups} teamId={awayTeam.id} teamName={awayTeam.name} />
          </div>
        </div>
      )}

      {/* Player Stats */}
      {tab === 'stats' && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 overflow-x-auto">
          {playerStats.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center">No player stats available yet</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase border-b border-gray-200">
                  <th className="text-left pb-2 pr-3">Player</th>
                  <th className="text-right pb-2 pr-2">Mins</th>
                  <th className="text-right pb-2 pr-2">G</th>
                  <th className="text-right pb-2 pr-2">A</th>
                  <th className="text-right pb-2 pr-2">YC</th>
                  <th className="text-right pb-2 pr-2">RC</th>
                  <th className="text-right pb-2 pr-2">Sv</th>
                  <th className="text-right pb-2 pr-2">GC</th>
                  <th className="text-right pb-2">CS</th>
                </tr>
              </thead>
              <tbody>
                {playerStats.map(s => (
                  <tr key={s.playerId} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-1.5 pr-3">
                      <span className="font-medium text-gray-900">{s.player?.name ?? '—'}</span>
                      {s.team && <span className="ml-2 text-xs text-gray-400">{s.team.shortName}</span>}
                    </td>
                    <td className="py-1.5 pr-2 text-right">{s.minutesPlayed}</td>
                    <td className="py-1.5 pr-2 text-right">{s.goals}</td>
                    <td className="py-1.5 pr-2 text-right">{s.assists}</td>
                    <td className="py-1.5 pr-2 text-right">{s.yellowCards}</td>
                    <td className="py-1.5 pr-2 text-right">{s.redCards}</td>
                    <td className="py-1.5 pr-2 text-right">{s.saves}</td>
                    <td className="py-1.5 pr-2 text-right">{s.goalsConceded}</td>
                    <td className="py-1.5 text-right">{s.cleanSheet ? '✓' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Fantasy Preview */}
      {tab === 'fantasy' && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <FantasyPreview players={liveFantasyPreview} />
        </div>
      )}
    </div>
  );
}
