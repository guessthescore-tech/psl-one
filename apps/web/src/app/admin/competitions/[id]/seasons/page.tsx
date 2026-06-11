'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { listAdminSeasons, createSeason, type AdminSeason } from '@/lib/admin-client';

export default function ManageSeasonsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [seasons, setSeasons] = useState<AdminSeason[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    listAdminSeasons(id)
      .then(setSeasons)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  function handleNameChange(v: string) {
    setName(v);
    setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setFormError(null);
    try {
      const season = await createSeason(id, { name, slug, startDate, endDate });
      setSeasons((prev) => [season, ...prev]);
      setName(''); setSlug(''); setStartDate(''); setEndDate('');
      router.push(`/admin/seasons/${season.id}`);
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Unknown error');
      setSaving(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
        <Link href="/admin/competitions" className="hover:underline">Competitions</Link>
        <span>/</span>
        <Link href={`/admin/competitions/${id}`} className="hover:underline">Competition</Link>
        <span>/</span>
        <span>Seasons</span>
      </div>

      <h1 className="text-2xl font-bold mb-6">Manage Seasons</h1>

      {/* Create Season Form */}
      <div className="border rounded-lg p-4 mb-8">
        <h2 className="font-semibold mb-4">Create New Season</h2>
        {formError && <p className="text-red-600 bg-red-50 p-2 rounded text-sm mb-3">{formError}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="PSL Premiership 2026/27"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full border rounded px-3 py-2 text-sm font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Season'}
          </button>
        </form>
      </div>

      {/* Season List */}
      <h2 className="font-semibold mb-3">Existing Seasons</h2>
      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="space-y-2">
        {seasons.map((s) => (
          <Link
            key={s.id}
            href={`/admin/seasons/${s.id}`}
            className="flex items-center justify-between border rounded p-3 hover:bg-gray-50 text-sm"
          >
            <div>
              <span className="font-medium">{s.name}</span>
              {s.isActive && <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">ACTIVE</span>}
              <p className="text-gray-500 text-xs">{s.status} · {s._count.fixtures} fixtures</p>
            </div>
            <span className="text-gray-400">&rarr;</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
