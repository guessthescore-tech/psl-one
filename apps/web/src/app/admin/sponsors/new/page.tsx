'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBetaToken } from '@/lib/auth-client';
import { adminCreateSponsor } from '@/lib/sponsors-client';

const SECTORS = ['FINANCIAL_SERVICES', 'TELECOMMUNICATIONS', 'ENERGY', 'RETAIL', 'AUTOMOTIVE', 'FOOD_BEVERAGE', 'TECHNOLOGY', 'MEDIA', 'SPORT', 'OTHER'];
const STATUSES = ['PROSPECT', 'ACTIVE', 'INACTIVE', 'SUSPENDED'];

export default function AdminSponsorsNewPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    slug: '',
    sector: 'OTHER',
    status: 'PROSPECT',
    logoUrl: '',
    websiteUrl: '',
    primaryContactName: '',
    primaryContactEmail: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await adminCreateSponsor(getBetaToken(), form);
      router.push('/admin/sponsors');
    } catch (err: unknown) {
      setError(String(err));
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/sponsors" className="text-sm text-gray-500 hover:underline">← Sponsors</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">New Sponsor</h1>
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
            <select className="w-full border rounded px-3 py-2 text-sm" value={form.sector} onChange={e => handleChange('sector', e.target.value)}>
              {SECTORS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className="w-full border rounded px-3 py-2 text-sm" value={form.status} onChange={e => handleChange('status', e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
          <input className="w-full border rounded px-3 py-2 text-sm" value={form.logoUrl} onChange={e => handleChange('logoUrl', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
          <input className="w-full border rounded px-3 py-2 text-sm" value={form.websiteUrl} onChange={e => handleChange('websiteUrl', e.target.value)} />
        </div>
        <div className="border-t pt-4">
          <p className="text-xs text-gray-500 mb-3">Contact details are admin-only and never exposed to fans.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Contact Name</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={form.primaryContactName} onChange={e => handleChange('primaryContactName', e.target.value)} />
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Contact Email</label>
            <input type="email" className="w-full border rounded px-3 py-2 text-sm" value={form.primaryContactEmail} onChange={e => handleChange('primaryContactEmail', e.target.value)} />
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea className="w-full border rounded px-3 py-2 text-sm" rows={3} value={form.notes} onChange={e => handleChange('notes', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
            {saving ? 'Creating…' : 'Create Sponsor'}
          </button>
          <Link href="/admin/sponsors" className="text-sm text-gray-600 px-4 py-2 rounded border hover:bg-gray-50">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
