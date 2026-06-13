'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBetaToken } from '@/lib/auth-client';
import { adminCreateMedia } from '@/lib/admin-media-client';

const MEDIA_TYPES = ['VIDEO', 'ARTICLE', 'GALLERY', 'AUDIO', 'DOCUMENT'];
const RIGHTS_STATUSES = ['PENDING', 'CLEAR', 'RESTRICTED', 'BLOCKED'];

export default function AdminMediaNewPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    slug: '',
    mediaType: 'VIDEO',
    rightsStatus: 'PENDING',
    description: '',
    thumbnailUrl: '',
    contentUrl: '',
    durationSeconds: '',
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
      await adminCreateMedia(getBetaToken(), {
        ...form,
        durationSeconds: form.durationSeconds ? Number(form.durationSeconds) : undefined,
      });
      router.push('/admin/media');
    } catch (err: unknown) {
      setError(String(err));
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/media" className="text-sm text-gray-500 hover:underline">← Media Catalogue</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">New Media Asset</h1>
        <p className="text-amber-700 text-sm mt-1 bg-amber-50 border border-amber-200 rounded p-2">
          Media availability does not imply that PSL One owns streaming rights. Public availability requires an approved rights status.
        </p>
      </div>

      {error && <p className="text-red-600 bg-red-50 rounded p-3 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input className="w-full border rounded px-3 py-2 text-sm" value={form.title} onChange={e => handleChange('title', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
          <input className="w-full border rounded px-3 py-2 text-sm font-mono" value={form.slug} onChange={e => handleChange('slug', e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Media Type</label>
            <select className="w-full border rounded px-3 py-2 text-sm" value={form.mediaType} onChange={e => handleChange('mediaType', e.target.value)}>
              {MEDIA_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rights Status</label>
            <select className="w-full border rounded px-3 py-2 text-sm" value={form.rightsStatus} onChange={e => handleChange('rightsStatus', e.target.value)}>
              {RIGHTS_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea className="w-full border rounded px-3 py-2 text-sm" rows={3} value={form.description} onChange={e => handleChange('description', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
          <input className="w-full border rounded px-3 py-2 text-sm" value={form.thumbnailUrl} onChange={e => handleChange('thumbnailUrl', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content URL</label>
          <input className="w-full border rounded px-3 py-2 text-sm" value={form.contentUrl} onChange={e => handleChange('contentUrl', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (seconds)</label>
          <input type="number" className="w-full border rounded px-3 py-2 text-sm" value={form.durationSeconds} onChange={e => handleChange('durationSeconds', e.target.value)} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
            {saving ? 'Creating…' : 'Create Asset'}
          </button>
          <Link href="/admin/media" className="text-sm text-gray-600 px-4 py-2 rounded border hover:bg-gray-50">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
