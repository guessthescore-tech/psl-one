'use client';

import { useEffect, useState, useCallback } from 'react';
import { getToken } from '@/lib/auth-client';

const API = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';
const POLL_MS = 20000;

interface LiveFixture {
  id: string;
  status: string;
  currentMinute?: number;
  period?: string;
  homeScore?: number;
  awayScore?: number;
  homeTeam?: { name: string; shortName: string };
  awayTeam?: { name: string; shortName: string };
  kickoffAt: string;
}

export default function LiveMatchesPage() {
  const [live, setLive] = useState<LiveFixture[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const token = getToken();
    fetch(`${API}/match-centre/fixtures/live`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      cache: 'no-store',
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(d => setLive(Array.isArray(d) ? d : d.fixtures ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  return (
    <main className="max-w-2xl mx-auto p-6">
      <a href="/matches" className="text-xs text-blue-600 underline mb-4 inline-block">← All Matches</a>
      <h1 className="text-2xl font-bold mb-1">Live Now</h1>
      <p className="text-xs text-gray-400 mb-4">Auto-refreshes every {POLL_MS / 1000}s</p>
      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      <div className="space-y-3">
        {live.map(f => (
          <a key={f.id} href={`/matches/${f.id}`} className="block border-2 border-green-300 rounded-lg p-4 bg-green-50 hover:bg-green-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-green-700 font-medium">{f.period ?? 'LIVE'} {f.currentMinute ? `${f.currentMinute}'` : ''}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm font-semibold">{f.homeTeam?.shortName ?? f.homeTeam?.name}</div>
              <div className="text-xl font-bold mx-4">{f.homeScore ?? 0} – {f.awayScore ?? 0}</div>
              <div className="text-sm font-semibold">{f.awayTeam?.shortName ?? f.awayTeam?.name}</div>
            </div>
          </a>
        ))}
        {!loading && live.length === 0 && (
          <p className="text-gray-400 text-sm">No matches are live right now.</p>
        )}
      </div>
    </main>
  );
}
