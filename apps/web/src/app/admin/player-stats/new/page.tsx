'use client';

import { useState } from 'react';
import Link from 'next/link';
import { upsertStat } from '@/lib/admin-player-stats-client';

export default function AdminNewStatPage() {
  const [form, setForm] = useState({
    playerId: '',
    fixtureId: '',
    teamId: '',
    minutesPlayed: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    saves: 0,
    cleanSheet: false,
    started: true,
    rating: '',
    notes: '',
    source: 'MANUAL',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await upsertStat({
        ...form,
        minutesPlayed: Number(form.minutesPlayed),
        goals: Number(form.goals),
        assists: Number(form.assists),
        yellowCards: Number(form.yellowCards),
        redCards: Number(form.redCards),
        saves: Number(form.saves),
        rating: form.rating ? Number(form.rating) : undefined,
        teamId: form.teamId || undefined,
      });
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
        <Link href="/admin/player-stats" className="hover:text-gray-600">Player Stats</Link>
        <span>/</span>
        <span className="text-gray-600">New Entry</span>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mt-1 mb-4">New Player Stat Entry</h1>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-green-800 font-semibold">Saved successfully</p>
          <Link href="/admin/player-stats" className="text-xs text-green-700 underline mt-1 block">Back to list</Link>
        </div>
      )}

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4 bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Player ID *</label>
            <input required value={form.playerId} onChange={(e) => setForm((f) => ({ ...f, playerId: e.target.value }))} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Fixture ID *</label>
            <input required value={form.fixtureId} onChange={(e) => setForm((f) => ({ ...f, fixtureId: e.target.value }))} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Team ID</label>
            <input value={form.teamId} onChange={(e) => setForm((f) => ({ ...f, teamId: e.target.value }))} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Source</label>
            <select value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm">
              <option value="MANUAL">MANUAL</option>
              <option value="IMPORTED">IMPORTED</option>
              <option value="SYSTEM_DERIVED">SYSTEM_DERIVED</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { key: 'minutesPlayed', label: 'Minutes' },
            { key: 'goals', label: 'Goals' },
            { key: 'assists', label: 'Assists' },
            { key: 'yellowCards', label: 'Y.Cards' },
            { key: 'redCards', label: 'R.Cards' },
            { key: 'saves', label: 'Saves' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs text-gray-500 block mb-1">{label}</label>
              <input
                type="number" min={0}
                value={form[key as keyof typeof form] as number}
                onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
              />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Rating</label>
            <input type="number" step="0.1" min={0} max={10} value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" />
          </div>
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input type="checkbox" checked={form.started} onChange={(e) => setForm((f) => ({ ...f, started: e.target.checked }))} />
            Started
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input type="checkbox" checked={form.cleanSheet} onChange={(e) => setForm((f) => ({ ...f, cleanSheet: e.target.checked }))} />
            Clean Sheet
          </label>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm" rows={2} />
        </div>

        <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white py-2 rounded text-sm font-semibold disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Entry'}
        </button>
      </form>
    </main>
  );
}
