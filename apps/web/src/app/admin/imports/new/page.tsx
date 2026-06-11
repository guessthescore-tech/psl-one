'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDraftJob } from '@/lib/admin-imports-client';

const PLACEHOLDER = JSON.stringify(
  { source: 'MANUAL', sourceType: 'JSON_FILE', competition: { name: '', slug: '', format: 'LEAGUE', hasGroups: false, hasKnockouts: false, hasHomeAway: true, usesNeutralVenues: false } },
  null,
  2,
);

export default function NewDraftJobPage() {
  const router = useRouter();
  const [json, setJson] = useState(PLACEHOLDER);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    let parsed: unknown;
    try { parsed = JSON.parse(json); }
    catch { setError('Invalid JSON — check syntax'); return; }
    setSaving(true);
    try {
      const job = await createDraftJob(parsed);
      router.push(`/admin/imports/${job.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
      setSaving(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">New Draft Import Job</h1>
      <p className="text-sm text-gray-500 mb-6">Save a payload as a DRAFT without committing. Use <a href="/admin/imports/manual" className="text-blue-600 hover:underline">/admin/imports/manual</a> to validate and commit immediately.</p>

      {error && <p className="text-red-600 bg-red-50 p-3 rounded mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Import Payload (JSON)</label>
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            rows={20}
            className="w-full border rounded px-3 py-2 text-xs font-mono"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/imports')}
            className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
