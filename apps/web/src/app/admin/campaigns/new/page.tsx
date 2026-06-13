'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBetaToken } from '@/lib/auth-client';
import { adminCreateCampaign } from '@/lib/admin-campaigns-client';
import { adminListSponsors } from '@/lib/sponsors-client';

interface Sponsor { id: string; name: string; }

export default function AdminCampaignsNewPage() {
  const router = useRouter();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    sponsorId: '',
    description: '',
    startDate: '',
    endDate: '',
    maxParticipationsPerFan: '1',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminListSponsors(getBetaToken())
      .then((data: { sponsors: Sponsor[] }) => setSponsors(data.sponsors ?? data))
      .catch(() => {});
  }, []);

  function handleChange(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await adminCreateCampaign(getBetaToken(), {
        ...form,
        sponsorId: form.sponsorId || undefined,
        maxParticipationsPerFan: Number(form.maxParticipationsPerFan),
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      });
      router.push('/admin/campaigns');
    } catch (err: unknown) {
      setError(String(err));
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/campaigns" className="text-sm text-gray-500 hover:underline">← Campaigns</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">New Campaign</h1>
        <p className="text-gray-500 text-sm mt-1">New campaigns start as DRAFT and require approval before publishing.</p>
      </div>

      {error && <p className="text-red-600 bg-red-50 rounded p-3 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input className="w-full border rounded px-3 py-2 text-sm" value={form.name} onChange={e => handleChange('name', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
          <input className="w-full border rounded px-3 py-2 text-sm font-mono" value={form.slug} onChange={e => handleChange('slug', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sponsor</label>
          <select className="w-full border rounded px-3 py-2 text-sm" value={form.sponsorId} onChange={e => handleChange('sponsorId', e.target.value)}>
            <option value="">— No sponsor —</option>
            {sponsors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea className="w-full border rounded px-3 py-2 text-sm" rows={3} value={form.description} onChange={e => handleChange('description', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input type="date" className="w-full border rounded px-3 py-2 text-sm" value={form.startDate} onChange={e => handleChange('startDate', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input type="date" className="w-full border rounded px-3 py-2 text-sm" value={form.endDate} onChange={e => handleChange('endDate', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Participations Per Fan</label>
          <input type="number" min={1} className="w-full border rounded px-3 py-2 text-sm" value={form.maxParticipationsPerFan} onChange={e => handleChange('maxParticipationsPerFan', e.target.value)} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
            {saving ? 'Creating…' : 'Create Campaign'}
          </button>
          <Link href="/admin/campaigns" className="text-sm text-gray-600 px-4 py-2 rounded border hover:bg-gray-50">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
