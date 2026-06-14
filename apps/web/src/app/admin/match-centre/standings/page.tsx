'use client';

import { useState } from 'react';
import { adminUpsertStandings } from '@/lib/admin-match-centre-client';

interface StandingEntry {
  clubId: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  form?: string;
}

export default function AdminStandingsPage() {
  const [seasonId, setSeasonId] = useState('');
  const [rawJson, setRawJson] = useState('[\n  {\n    "clubId": "",\n    "position": 1,\n    "played": 0,\n    "won": 0,\n    "drawn": 0,\n    "lost": 0,\n    "goalsFor": 0,\n    "goalsAgainst": 0,\n    "points": 0\n  }\n]');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!seasonId) { setError('Season ID required'); return; }
    let entries: StandingEntry[];
    try {
      entries = JSON.parse(rawJson) as StandingEntry[];
    } catch {
      setError('Invalid JSON in entries');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const r = await adminUpsertStandings({ seasonId, entries }) as { updated: number };
      setMsg(`Updated ${r.updated} standings. Source: MANUAL / PROVISIONAL.`);
    } catch (e) {
      setError(String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Upsert League Standings</h1>
      <p className="text-xs text-gray-500 mb-5">
        Manual entry — PROVISIONAL data source. Official provider integration is INTEGRATION_READY.
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Season ID</label>
          <input className="border rounded px-3 py-1.5 text-sm w-full" value={seasonId} onChange={e => setSeasonId(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Standings Entries (JSON array)</label>
          <textarea
            className="border rounded px-3 py-2 text-sm w-full font-mono"
            rows={12}
            value={rawJson}
            onChange={e => setRawJson(e.target.value)}
          />
        </div>
        <button
          onClick={submit}
          disabled={submitting || !seasonId}
          className="bg-blue-600 text-white px-5 py-2 rounded text-sm disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Upsert Standings'}
        </button>
      </div>

      {msg && <p className="mt-4 text-green-700 text-sm bg-green-50 border border-green-200 rounded p-3">{msg}</p>}
      {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
    </main>
  );
}
