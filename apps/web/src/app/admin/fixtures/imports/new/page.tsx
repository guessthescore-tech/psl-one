'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewImportBatchPage() {
  const router = useRouter();
  const [seasonId, setSeasonId] = useState('');
  const [label, setLabel] = useState('');
  const [source, setSource] = useState('MANUAL');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!seasonId.trim()) {
      setError('Season ID is required');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/proxy/fixtures/admin/imports', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seasonId: seasonId.trim(), label: label.trim() || undefined, source }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`${res.status}: ${body}`);
      }
      const batch = await res.json() as { id: string };
      router.push(`/admin/fixtures/imports/${batch.id}`);
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="mb-6">
        <a href="/admin/fixtures/imports" className="text-sm text-blue-600 hover:underline">
          ← Import Batches
        </a>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">New Import Batch</h1>
        <p className="text-gray-500 text-sm mt-1">Create a staging area for importing PSL fixtures</p>
      </div>

      {error && <p className="text-red-600 bg-red-50 rounded p-3 mb-4 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="seasonId">
            Season ID <span className="text-red-500">*</span>
          </label>
          <input
            id="seasonId"
            type="text"
            value={seasonId}
            onChange={e => setSeasonId(e.target.value)}
            placeholder="e.g. cuid1234..."
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-400 mt-1">The PSL season UUID to import fixtures into</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="label">
            Label
          </label>
          <input
            id="label"
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="e.g. PSL 2026/27 Matchday 1-10"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="source">
            Source
          </label>
          <select
            id="source"
            value={source}
            onChange={e => setSource(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="MANUAL">Manual Entry</option>
            <option value="CSV_UPLOAD">CSV Upload</option>
            <option value="PROVIDER_API">Provider API</option>
          </select>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create Import Batch'}
          </button>
        </div>
      </form>
    </div>
  );
}
