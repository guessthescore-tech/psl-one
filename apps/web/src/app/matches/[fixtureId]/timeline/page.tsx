'use client';

import { use, useEffect, useState } from 'react';
import { getFixtureMatchCentre } from '@/lib/match-centre-client';

interface MatchEvent {
  id: string;
  minute: number;
  stoppageMinute?: number;
  eventType: string;
  description?: string;
  player?: { name: string };
  team?: { shortName: string };
}

interface MatchCentreData {
  events?: MatchEvent[];
  homeTeam?: { name: string };
  awayTeam?: { name: string };
}

const EVENT_ICON: Record<string, string> = {
  GOAL: '⚽',
  OWN_GOAL: '⚽',
  YELLOW_CARD: '🟨',
  RED_CARD: '🟥',
  SECOND_YELLOW: '🟨🟥',
  SUBSTITUTION: '🔄',
  PENALTY_SCORED: '⚽',
  PENALTY_MISSED: '❌',
  KICKOFF: '▶',
  HALF_TIME: '—',
  FULL_TIME: '■',
};

export default function MatchTimelinePage({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = use(params);
  const [data, setData] = useState<MatchCentreData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFixtureMatchCentre(fixtureId)
      .then(d => setData(d as MatchCentreData))
      .catch(e => setError(String(e)));
  }, [fixtureId]);

  const events = (data?.events ?? []).sort((a, b) => a.minute - b.minute);

  return (
    <main className="max-w-xl mx-auto p-6">
      <a href={`/matches/${fixtureId}`} className="text-xs text-blue-600 underline mb-4 inline-block">← Match Overview</a>
      <h1 className="text-2xl font-bold mb-4">Match Timeline</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {!data && !error && <p className="text-gray-400 text-sm">Loading…</p>}
      <div className="space-y-2">
        {events.map(e => (
          <div key={e.id} className="flex items-start gap-3 border-l-2 border-gray-200 pl-3">
            <span className="text-xs text-gray-400 w-8 pt-0.5">{e.minute}{e.stoppageMinute ? `+${e.stoppageMinute}` : ''}'</span>
            <span className="text-base">{EVENT_ICON[e.eventType] ?? '•'}</span>
            <div>
              <div className="text-sm font-medium">{e.eventType.replace(/_/g, ' ')}</div>
              {e.player && <div className="text-xs text-gray-500">{e.player.name}</div>}
              {e.team && <div className="text-xs text-gray-400">{e.team.shortName}</div>}
              {e.description && <div className="text-xs text-gray-400">{e.description}</div>}
            </div>
          </div>
        ))}
        {data && events.length === 0 && <p className="text-gray-400 text-sm">No events recorded yet.</p>}
      </div>
    </main>
  );
}
