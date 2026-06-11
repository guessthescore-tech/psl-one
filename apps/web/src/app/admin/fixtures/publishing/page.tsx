'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PublishingReadiness {
  seasonId: string;
  totalFixtures: number;
  publishedFixtures: number;
  unpublishedFixtures: number;
  batchesCommitted: number;
  blockingErrors: string[];
  warnings: string[];
  canPublish: boolean;
}

export default function PublishingPage() {
  const [seasonId, setSeasonId] = useState('');
  const [readiness, setReadiness] = useState<PublishingReadiness | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<string | null>(null);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!seasonId.trim()) return;
    setLoading(true);
    setError(null);
    setActionResult(null);
    try {
      const res = await fetch(`/api/proxy/fixtures/admin/publishing/season/${seasonId.trim()}/readiness`, { credentials: 'include' });
      if (!res.ok) { const b = await res.text(); throw new Error(`${res.status}: ${b}`); }
      const data = await res.json() as PublishingReadiness;
      setReadiness(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handlePublishAll() {
    if (!seasonId.trim()) return;
    if (!confirm('Publish ALL unpublished fixtures in this season? They will become visible to fans immediately.')) return;
    setPublishing(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/fixtures/admin/publishing/season/${seasonId.trim()}/publish-provisional`, {
        method: 'POST', credentials: 'include',
      });
      if (!res.ok) { const b = await res.text(); throw new Error(`${res.status}: ${b}`); }
      const data = await res.json() as { published: number };
      setActionResult(`${data.published} fixture(s) published successfully.`);
      const r2 = await fetch(`/api/proxy/fixtures/admin/publishing/season/${seasonId.trim()}/readiness`, { credentials: 'include' });
      if (r2.ok) setReadiness(await r2.json() as PublishingReadiness);
    } catch (e) {
      setError(String(e));
    } finally {
      setPublishing(false);
    }
  }

  async function handleUnpublishSafe() {
    if (!seasonId.trim()) return;
    if (!confirm('Unpublish safe fixtures (those with no predictions, fantasy data, or live events)?')) return;
    setUnpublishing(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/fixtures/admin/publishing/season/${seasonId.trim()}/unpublish-provisional`, {
        method: 'POST', credentials: 'include',
      });
      if (!res.ok) { const b = await res.text(); throw new Error(`${res.status}: ${b}`); }
      const data = await res.json() as { unpublished: number; note?: string };
      setActionResult(data.note ?? `${data.unpublished} fixture(s) unpublished.`);
      const r2 = await fetch(`/api/proxy/fixtures/admin/publishing/season/${seasonId.trim()}/readiness`, { credentials: 'include' });
      if (r2.ok) setReadiness(await r2.json() as PublishingReadiness);
    } catch (e) {
      setError(String(e));
    } finally {
      setUnpublishing(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/fixtures/imports" className="text-sm text-blue-600 hover:underline">
          ← Import Batches
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Season Publishing</h1>
        <p className="text-gray-500 text-sm mt-1">Publish or unpublish fixtures for a season</p>
      </div>

      <form onSubmit={handleCheck} className="flex gap-3 mb-6">
        <input
          type="text"
          value={seasonId}
          onChange={e => setSeasonId(e.target.value)}
          placeholder="Season ID"
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !seasonId.trim()}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Checking…' : 'Check'}
        </button>
      </form>

      {error && <p className="text-red-600 bg-red-50 rounded p-3 mb-4">{error}</p>}
      {actionResult && <p className="text-green-700 bg-green-50 rounded p-3 mb-4">{actionResult}</p>}

      {readiness && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total', value: readiness.totalFixtures },
              { label: 'Published', value: readiness.publishedFixtures },
              { label: 'Unpublished', value: readiness.unpublishedFixtures },
              { label: 'Committed Batches', value: readiness.batchesCommitted },
            ].map(s => (
              <div key={s.label} className="border rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              </div>
            ))}
          </div>

          {readiness.blockingErrors.length > 0 && (
            <div className="border border-red-200 rounded-lg p-4 mb-4 bg-red-50">
              <p className="text-red-700 font-medium mb-2">Blocking Errors</p>
              <ul className="text-sm text-red-600 space-y-1">
                {readiness.blockingErrors.map((e, i) => <li key={i}>• {e}</li>)}
              </ul>
            </div>
          )}

          {readiness.warnings.length > 0 && (
            <div className="border border-yellow-200 rounded-lg p-4 mb-4 bg-yellow-50">
              <p className="text-yellow-700 font-medium mb-2">Warnings</p>
              <ul className="text-sm text-yellow-600 space-y-1">
                {readiness.warnings.map((w, i) => <li key={i}>• {w}</li>)}
              </ul>
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            <button
              disabled={!readiness.canPublish || publishing}
              onClick={() => void handlePublishAll()}
              className="bg-green-600 text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {publishing ? 'Publishing…' : `Publish All (${readiness.unpublishedFixtures})`}
            </button>
            <button
              disabled={readiness.publishedFixtures === 0 || unpublishing}
              onClick={() => void handleUnpublishSafe()}
              className="border border-orange-300 text-orange-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-orange-50 disabled:opacity-50"
            >
              {unpublishing ? 'Unpublishing…' : 'Unpublish Safe Fixtures'}
            </button>
          </div>

          {readiness.unpublishedFixtures === 0 && readiness.publishedFixtures > 0 && (
            <p className="text-green-600 text-sm mt-4">All fixtures are published.</p>
          )}
        </>
      )}
    </div>
  );
}
