'use client';

import { useState } from 'react';
import { adminUpsertPlayerRating } from '@/lib/admin-match-centre-client';

export default function AdminRatingsPage() {
  const [form, setForm] = useState({
    playerId: '',
    fixtureId: '',
    performanceRating: 7.0,
    minutesPlayed: 90,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    ratingSource: 'MANUAL',
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set(k: string, v: string | number) { setForm(f => ({ ...f, [k]: v })); }

  async function submit() {
    if (!form.playerId || !form.fixtureId) { setError('Player ID and Fixture ID required'); return; }
    if (form.performanceRating < 0 || form.performanceRating > 10) { setError('Rating must be 0–10'); return; }
    setSubmitting(true);
    setError(null);
    try {
      await adminUpsertPlayerRating(form);
      setMsg(`Rating saved for player ${form.playerId} in fixture ${form.fixtureId}.`);
    } catch (e) {
      setError(String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Upsert Player Rating</h1>
      <p className="text-xs text-gray-500 mb-5">
        Manual entry — PROVISIONAL data source. Official provider integration is INTEGRATION_READY.
      </p>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Player ID</label>
            <input className="border rounded px-2 py-1.5 text-sm w-full" value={form.playerId} onChange={e => set('playerId', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Fixture ID</label>
            <input className="border rounded px-2 py-1.5 text-sm w-full" value={form.fixtureId} onChange={e => set('fixtureId', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Performance Rating (0–10): <strong>{form.performanceRating}</strong></label>
          <input type="range" min={0} max={10} step={0.1} value={form.performanceRating} onChange={e => set('performanceRating', Number(e.target.value))} className="w-full" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Minutes Played</label>
            <input type="number" className="border rounded px-2 py-1.5 text-sm w-full" value={form.minutesPlayed} onChange={e => set('minutesPlayed', Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Goals</label>
            <input type="number" className="border rounded px-2 py-1.5 text-sm w-full" value={form.goals} onChange={e => set('goals', Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Assists</label>
            <input type="number" className="border rounded px-2 py-1.5 text-sm w-full" value={form.assists} onChange={e => set('assists', Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Yellow Cards</label>
            <input type="number" className="border rounded px-2 py-1.5 text-sm w-full" value={form.yellowCards} onChange={e => set('yellowCards', Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Red Cards</label>
            <input type="number" className="border rounded px-2 py-1.5 text-sm w-full" value={form.redCards} onChange={e => set('redCards', Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Rating Source</label>
            <select className="border rounded px-2 py-1.5 text-sm w-full" value={form.ratingSource} onChange={e => set('ratingSource', e.target.value)}>
              <option>MANUAL</option>
              <option>SANDBOX_PROVIDER</option>
            </select>
          </div>
        </div>
        <button onClick={submit} disabled={submitting} className="w-full bg-blue-600 text-white py-2 rounded text-sm disabled:opacity-50">
          {submitting ? 'Saving...' : 'Save Rating'}
        </button>
      </div>

      {msg && <p className="mt-4 text-green-700 text-sm bg-green-50 border border-green-200 rounded p-3">{msg}</p>}
      {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
    </main>
  );
}
