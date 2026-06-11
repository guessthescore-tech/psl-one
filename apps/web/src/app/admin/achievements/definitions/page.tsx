'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { achievementsClient, CATEGORY_LABELS, type AchievementDefinition } from '@/lib/achievements-client';

export default function AdminAchievementDefinitionsPage() {
  const [defs, setDefs] = useState<AchievementDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);

  const load = () => {
    setLoading(true);
    const params = filterActive !== 'all' ? { isActive: filterActive === 'active' } : undefined;
    achievementsClient.adminGetDefinitions(params)
      .then(setDefs)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filterActive]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Achievement Definitions</h1>
        <div className="flex gap-3 text-sm">
          <Link href="/admin/achievements" className="text-blue-600 underline">Stats</Link>
          <Link href="/admin/achievements/badges" className="text-blue-600 underline">Badges</Link>
          <button onClick={() => setShowCreate(!showCreate)} className="px-3 py-1 bg-green-600 text-white rounded text-xs">
            {showCreate ? 'Hide Form' : '+ Create'}
          </button>
        </div>
      </div>

      {showCreate && <CreateDefinitionForm onCreated={() => { setShowCreate(false); load(); }} />}

      <div className="flex gap-2 mb-4">
        {['all', 'active', 'inactive'].map(f => (
          <button
            key={f}
            onClick={() => setFilterActive(f)}
            className={`px-3 py-1 rounded text-xs font-medium border ${filterActive === f ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-300 text-gray-700 hover:border-gray-500'}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="border rounded overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-2 text-xs font-medium text-gray-600">Slug</th>
                <th className="text-left p-2 text-xs font-medium text-gray-600">Name</th>
                <th className="text-left p-2 text-xs font-medium text-gray-600">Category</th>
                <th className="text-left p-2 text-xs font-medium text-gray-600">Trigger</th>
                <th className="text-right p-2 text-xs font-medium text-gray-600">Threshold</th>
                <th className="text-right p-2 text-xs font-medium text-gray-600">Points</th>
                <th className="text-center p-2 text-xs font-medium text-gray-600">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {defs.map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="p-2 font-mono text-xs text-gray-500">{d.slug}</td>
                  <td className="p-2 font-medium">{d.name}</td>
                  <td className="p-2 text-xs">{CATEGORY_LABELS[d.category]}</td>
                  <td className="p-2 text-xs text-gray-500">{d.triggerType}</td>
                  <td className="p-2 text-right text-xs">{d.threshold ?? '—'}</td>
                  <td className="p-2 text-right text-xs font-medium text-yellow-600">{d.fanValuePoints > 0 ? `+${d.fanValuePoints}` : '—'}</td>
                  <td className="p-2 text-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${d.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </td>
                </tr>
              ))}
              {defs.length === 0 && (
                <tr><td colSpan={7} className="p-4 text-center text-gray-400 text-sm">No definitions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function CreateDefinitionForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({ slug: '', name: '', description: '', category: 'FANTASY', triggerType: 'MANUAL', fanValuePoints: 0, threshold: '' });
  const [working, setWorking] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWorking(true);
    setErr(null);
    try {
      await achievementsClient.adminCreateDefinition({
        ...form,
        fanValuePoints: Number(form.fanValuePoints),
        ...(form.threshold ? { threshold: Number(form.threshold) } : {}),
      } as AchievementDefinition);
      onCreated();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed');
    } finally {
      setWorking(false);
    }
  };

  const categories = ['FANTASY', 'PREDICTIONS', 'CHALLENGES', 'LEAGUES', 'PROFILE', 'FAN_VALUE', 'PLATFORM'];
  const triggerTypes = ['FIRST_FANTASY_TEAM', 'FIRST_PREDICTION', 'FIRST_EXACT_PREDICTION', 'FIRST_LEAGUE_JOIN', 'FIRST_LEAGUE_CREATED', 'FIRST_CHALLENGE', 'FIRST_CHALLENGE_WIN', 'FANTASY_GAMEWEEK_POINTS', 'FANTASY_SEASON_POINTS', 'PREDICTION_POINTS', 'FAN_VALUE_POINTS', 'PROFILE_COMPLETED', 'MANUAL'];

  return (
    <form onSubmit={handleSubmit} className="border rounded p-3 mb-4 space-y-3 bg-gray-50">
      <h2 className="font-semibold text-sm">Create Achievement Definition</h2>
      <div className="grid grid-cols-2 gap-2">
        <input required placeholder="slug (e.g. first-fantasy-team)" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="border rounded px-2 py-1 text-xs" />
        <input required placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="border rounded px-2 py-1 text-xs" />
        <input required placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="border rounded px-2 py-1 text-xs col-span-2" />
        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="border rounded px-2 py-1 text-xs">
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={form.triggerType} onChange={e => setForm(f => ({ ...f, triggerType: e.target.value }))} className="border rounded px-2 py-1 text-xs">
          {triggerTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input type="number" placeholder="Threshold (optional)" value={form.threshold} onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))} className="border rounded px-2 py-1 text-xs" />
        <input type="number" placeholder="Fan Value Points" value={form.fanValuePoints} onChange={e => setForm(f => ({ ...f, fanValuePoints: Number(e.target.value) }))} className="border rounded px-2 py-1 text-xs" />
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
      <button type="submit" disabled={working} className="px-3 py-1 bg-green-600 text-white rounded text-xs disabled:opacity-50">
        {working ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
