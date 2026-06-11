'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { footballClient, type MatchCentre, type MatchEvent, type FixtureLineup } from '@/lib/football-client';

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: 'Scheduled',
  LIVE: 'Live',
  HALF_TIME: 'Half Time',
  FINISHED: 'Full Time',
  POSTPONED: 'Postponed',
  CANCELLED: 'Cancelled',
};

const EVENT_ICON: Record<string, string> = {
  GOAL: '⚽',
  YELLOW_CARD: '🟨',
  RED_CARD: '🟥',
  SUBSTITUTION: '🔄',
  KICKOFF: '▶',
  HALF_TIME: '—',
  FULL_TIME: '■',
  VAR: 'VAR',
  OTHER: '•',
};

function LiveBadge({ status, minute }: { status: string; minute: number | null }) {
  if (status === 'LIVE') {
    return (
      <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        LIVE{minute != null ? ` ${minute}'` : ''}
      </span>
    );
  }
  if (status === 'HALF_TIME') {
    return <span className="inline-block bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">HT</span>;
  }
  return null;
}

function EventRow({ event }: { event: MatchEvent }) {
  const icon = EVENT_ICON[event.eventType] ?? '•';
  const isGoal = event.eventType === 'GOAL';
  return (
    <div className={`flex items-center gap-3 py-2 px-3 rounded ${isGoal ? 'bg-green-50' : ''}`}>
      <span className="text-gray-400 text-xs w-8 text-right font-mono">{event.minute}&apos;</span>
      <span className="text-sm">{icon}</span>
      <div className="flex-1 min-w-0">
        {event.player && (
          <span className="text-sm font-medium text-gray-900">{event.player.name}</span>
        )}
        {event.description && !event.player && (
          <span className="text-sm text-gray-600">{event.description}</span>
        )}
        {event.team && (
          <span className="ml-2 text-xs text-gray-400">{event.team.shortName}</span>
        )}
      </div>
    </div>
  );
}

function LineupGrid({ lineups, homeTeamId }: { lineups: FixtureLineup[]; homeTeamId: string }) {
  const home = lineups.filter(l => l.teamId === homeTeamId && l.status === 'STARTING');
  const away = lineups.filter(l => l.teamId !== homeTeamId && l.status === 'STARTING');

  if (home.length === 0 && away.length === 0) return null;

  return (
    <div className="bg-white rounded-lg overflow-hidden mb-6">
      <h2 className="text-sm font-semibold text-gray-700 px-4 py-3 border-b border-gray-100">Starting Line-ups</h2>
      <div className="grid grid-cols-2 divide-x divide-gray-100">
        <div className="px-3 py-2">
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">{home[0]?.team.shortName ?? 'Home'}</p>
          {home.map(l => (
            <div key={l.id} className="flex items-center gap-2 py-1">
              {l.shirtNumber != null && (
                <span className="text-xs text-gray-400 w-5 text-right font-mono">{l.shirtNumber}</span>
              )}
              <span className="text-sm text-gray-900 truncate">{l.player.name}</span>
            </div>
          ))}
        </div>
        <div className="px-3 py-2">
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">{away[0]?.team.shortName ?? 'Away'}</p>
          {away.map(l => (
            <div key={l.id} className="flex items-center gap-2 py-1">
              {l.shirtNumber != null && (
                <span className="text-xs text-gray-400 w-5 text-right font-mono">{l.shirtNumber}</span>
              )}
              <span className="text-sm text-gray-900 truncate">{l.player.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FixtureDetailPage() {
  const params = useParams();
  const id = params['id'] as string;

  const [data, setData] = useState<MatchCentre | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    footballClient.getMatchCentre(id)
      .then(setData)
      .catch(() => setError('Fixture not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-psl-navy flex items-center justify-center">
        <p className="text-white text-sm">Loading…</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-psl-navy flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Fixture not found'}</p>
          <Link href="/football/fixtures" className="text-psl-gold underline text-sm">Back to fixtures</Link>
        </div>
      </main>
    );
  }

  const { fixture, venue, events, lineups } = data;
  const kickoff = new Date(fixture.kickoffAt);
  const statusLabel = STATUS_LABEL[fixture.status] ?? fixture.status;

  return (
    <main className="min-h-screen bg-psl-navy">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <nav className="text-gray-400 text-sm mb-6">
          <Link href="/football" className="hover:text-white transition">Football</Link>
          <span className="mx-2">›</span>
          <Link href="/football/fixtures" className="hover:text-white transition">Fixtures</Link>
          <span className="mx-2">›</span>
          <span className="text-white">Match Centre</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-4">
          {fixture.group && (
            <p className="text-psl-gold text-xs font-semibold uppercase tracking-wider mb-1">
              Group {fixture.group.name}
            </p>
          )}
          <p className="text-gray-400 text-xs">
            {kickoff.toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {' · '}
            {kickoff.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Scoreboard */}
        <div className="bg-white rounded-xl px-6 py-8 mb-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-psl-navy">{fixture.homeTeam.shortName}</p>
              <p className="text-gray-500 text-xs mt-1">{fixture.homeTeam.name}</p>
            </div>

            <div className="text-center">
              {fixture.homeScore != null && fixture.awayScore != null ? (
                <>
                  <p className="text-4xl font-bold text-psl-navy">
                    {fixture.homeScore} – {fixture.awayScore}
                  </p>
                  <div className="mt-2 flex justify-center">
                    <LiveBadge status={fixture.status} minute={fixture.currentMinute} />
                    {fixture.status !== 'LIVE' && fixture.status !== 'HALF_TIME' && (
                      <p className="text-green-600 text-xs font-semibold">{statusLabel}</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-300">vs</p>
                  <p className="text-gray-500 text-xs mt-1">{statusLabel}</p>
                </>
              )}
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold text-psl-navy">{fixture.awayTeam.shortName}</p>
              <p className="text-gray-500 text-xs mt-1">{fixture.awayTeam.name}</p>
            </div>
          </div>
        </div>

        {/* Venue */}
        {venue && (
          <div className="bg-white/10 rounded-lg px-4 py-3 mb-6">
            <p className="text-white text-sm font-medium">{venue.name}</p>
            <p className="text-gray-400 text-xs">{venue.city}, {venue.country}{venue.capacity ? ` · ${venue.capacity.toLocaleString()} capacity` : ''}</p>
          </div>
        )}

        {/* Lineups */}
        {lineups.length > 0 && (
          <LineupGrid lineups={lineups} homeTeamId={fixture.homeTeam.id} />
        )}

        {/* Event timeline */}
        {events.length > 0 ? (
          <div className="bg-white rounded-lg overflow-hidden mb-6">
            <h2 className="text-sm font-semibold text-gray-700 px-4 py-3 border-b border-gray-100">Match Events</h2>
            <div className="divide-y divide-gray-50">
              {events.map(ev => <EventRow key={ev.id} event={ev} />)}
            </div>
          </div>
        ) : (
          <div className="bg-white/5 rounded-lg px-4 py-6 text-center mb-6">
            <p className="text-gray-400 text-sm">
              {fixture.status === 'SCHEDULED' ? 'Match has not started yet' : 'No events recorded'}
            </p>
          </div>
        )}

        <div className="text-center">
          <Link href="/football/fixtures" className="text-gray-400 text-sm hover:text-white transition">← All fixtures</Link>
        </div>
      </div>
    </main>
  );
}
