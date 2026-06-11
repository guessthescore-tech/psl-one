'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { achievementsClient, RARITY_COLORS, RARITY_LABELS, CATEGORY_LABELS } from '@/lib/achievements-client';

interface BadgeDef {
  id: string;
  slug: string;
  name: string;
  description: string;
  rarity: string;
  category: string;
  icon: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}

export default function AdminBadgeDefinitionsPage() {
  const [badges, setBadges] = useState<BadgeDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = () => {
    setLoading(true);
    achievementsClient.adminGetBadgeDefinitions()
      .then((data: unknown[]) => setBadges(data as BadgeDef[]))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <main className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Badge Definitions</h1>
        <div className="flex gap-3 text-sm">
          <Link href="/admin/achievements" className="text-blue-600 underline">Stats</Link>
          <Link href="/admin/achievements/definitions" className="text-blue-600 underline">Achievement Defs</Link>
          <button onClick={() => setShowCreate(!showCreate)} className="px-3 py-1 bg-purple-600 text-white rounded text-xs">
            {showCreate ? 'Hide Form' : '+ Create Badge'}
          </button>
        </div>
      </div>

      {showCreate && <CreateBadgeForm onCreated={() => { setShowCreate(false); load(); }} />}
      <LinkBadgeForm />

      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {badges.map(b => (
            <div key={b.id} className={`border rounded p-3 flex flex-col items-center text-center ${!b.isActive ? 'opacity-50' : ''}`}>
              <div className="text-3xl mb-1">{b.icon ?? '🏅'}</div>
              <div className="font-medium text-sm">{b.name}</div>
              <div className={`text-xs mt-0.5 font-medium ${RARITY_COLORS[b.rarity as keyof typeof RARITY_COLORS] ?? ''}`}>
                {RARITY_LABELS[b.rarity as keyof typeof RARITY_LABELS] ?? b.rarity}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{CATEGORY_LABELS[b.category as keyof typeof CATEGORY_LABELS] ?? b.category}</div>
              {!b.isActive && <span className="text-xs text-gray-400 mt-1">Inactive</span>}
            </div>
          ))}
          {badges.length === 0 && (
            <div className="col-span-full text-center text-gray-400 text-sm p-6">No badge definitions found.</div>
          )}
        </div>
      )}
    </main>
  );
}

function CreateBadgeForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({ slug: '', name: '', description: '', rarity: 'COMMON', category: 'FANTASY', icon: '' });
  const [working, setWorking] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWorking(true);
    setErr(null);
    try {
      await achievementsClient.adminCreateBadge({ ...form, ...(form.icon ? {} : { icon: null }) });
      onCreated();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed');
    } finally {
      setWorking(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded p-3 mb-4 space-y-3 bg-gray-50">
      <h2 className="font-semibold text-sm">Create Badge Definition</h2>
      <div className="grid grid-cols-2 gap-2">
        <input required placeholder="slug" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="border rounded px-2 py-1 text-xs" />
        <input required placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="border rounded px-2 py-1 text-xs" />
        <input required placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="border rounded px-2 py-1 text-xs col-span-2" />
        <select value={form.rarity} onChange={e => setForm(f => ({ ...f, rarity: e.target.value }))} className="border rounded px-2 py-1 text-xs">
          {['COMMON','UNCOMMON','RARE','EPIC','LEGENDARY'].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="border rounded px-2 py-1 text-xs">
          {['FANTASY','PREDICTIONS','CHALLENGES','LEAGUES','PROFILE','FAN_VALUE','PLATFORM'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input placeholder="Icon emoji (optional)" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="border rounded px-2 py-1 text-xs col-span-2" />
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
      <button type="submit" disabled={working} className="px-3 py-1 bg-purple-600 text-white rounded text-xs disabled:opacity-50">
        {working ? 'Creating...' : 'Create Badge'}
      </button>
    </form>
  );
}

function LinkBadgeForm() {
  const [achId, setAchId] = useState('');
  const [badgeId, setBadgeId] = useState('');
  const [working, setWorking] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleLink = async () => {
    if (!achId.trim() || !badgeId.trim()) return;
    setWorking(true);
    setMsg(null);
    try {
      await achievementsClient.adminLinkBadge(achId.trim(), badgeId.trim());
      setMsg('Badge linked to achievement.');
      setAchId('');
      setBadgeId('');
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : 'Failed');
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="border rounded p-3 mb-4 bg-blue-50">
      <h2 className="font-semibold text-sm mb-2">Link Badge to Achievement</h2>
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-xs text-gray-500 block mb-0.5">Achievement Definition ID</label>
          <input value={achId} onChange={e => setAchId(e.target.value)} placeholder="UUID" className="border rounded px-2 py-1 text-xs w-full font-mono" />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 block mb-0.5">Badge Definition ID</label>
          <input value={badgeId} onChange={e => setBadgeId(e.target.value)} placeholder="UUID" className="border rounded px-2 py-1 text-xs w-full font-mono" />
        </div>
        <button onClick={handleLink} disabled={working || !achId.trim() || !badgeId.trim()} className="px-3 py-1 bg-blue-600 text-white rounded text-xs disabled:opacity-50">
          Link
        </button>
      </div>
      {msg && <p className={`text-xs mt-2 ${msg.includes('Failed') ? 'text-red-600' : 'text-green-700'}`}>{msg}</p>}
    </div>
  );
}
