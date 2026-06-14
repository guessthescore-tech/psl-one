'use client';

import { useEffect, useState } from 'react';
import { getToken } from '@/lib/auth-client';

const API = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

export default function MatchesPage() {
  const [fixtures, setFixtures] = useState<Array<{ id: string; kickoffAt: string; status: string; homeTeam?: { name: string }; awayTeam?: { name: string }; homeScore?: number; awayScore?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    fetch(`${API}/match-centre/fixtures`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      cache: 'no-store',
    })
      .then(r => r.json())
      .then(d => setFixtures(Array.isArray(d) ? d : d.fixtures ?? []))
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Matches</h1>
      <div className="flex gap-4 mb-5 text-xs">
        <a href="/matches/live" className="text-blue-600 underline">Live Now</a>
        <a href="/match-centre/standings/current" className="text-blue-600 underline">Standings</a>
      </div>
      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="space-y-2">
        {fixtures.map(f => (
          <a key={f.id} href={`/matches/${f.id}`} className="block border rounded-lg p-4 bg-white shadow-sm hover:bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">
                {f.homeTeam?.name ?? '?'} vs {f.awayTeam?.name ?? '?'}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${f.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {f.status}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {f.homeScore !== null && f.homeScore !== undefined ? `${f.homeScore} – ${f.awayScore}` : new Date(f.kickoffAt).toLocaleString()}
            </div>
          </a>
        ))}
        {!loading && fixtures.length === 0 && <p className="text-gray-400 text-sm">No upcoming fixtures found.</p>}
      </div>
    </main>
  );
}
