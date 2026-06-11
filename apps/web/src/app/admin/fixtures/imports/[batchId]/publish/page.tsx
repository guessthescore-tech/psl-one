'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function BatchPublishPage() {
  const params = useParams<{ batchId: string }>();
  const batchId = params.batchId;
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ published: number; batchId: string } | null>(null);

  async function handlePublish() {
    if (!confirm('Publish all committed fixtures in this batch? They will become visible to fans immediately.')) return;
    setPublishing(true);
    setError(null);
    try {
      const res = await fetch(`/api/proxy/fixtures/admin/imports/${batchId}/publish`, {
        method: 'POST', credentials: 'include',
      });
      if (!res.ok) { const b = await res.text(); throw new Error(`${res.status}: ${b}`); }
      const data = await res.json() as { published: number; batchId: string };
      setResult(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="mb-6">
        <Link href={`/admin/fixtures/imports/${batchId}`} className="text-sm text-blue-600 hover:underline">
          ← Batch Detail
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Publish Fixtures</h1>
        <p className="text-gray-500 text-sm mt-1">Make committed fixtures visible to fans</p>
      </div>

      {error && <p className="text-red-600 bg-red-50 rounded p-3 mb-4 text-sm">{error}</p>}

      {result ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-green-700 text-lg font-semibold mb-2">
            {result.published} fixture{result.published !== 1 ? 's' : ''} published successfully
          </p>
          <p className="text-green-600 text-sm mb-4">Fixtures are now visible to all fans.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/admin/fixtures/imports" className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700">
              All Batches
            </Link>
            <Link href="/admin/fixtures/publishing" className="border rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50">
              Publishing Overview
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-yellow-800 mb-2">Before publishing</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Only fixtures with no predictions, fantasy data, or live events can be published</li>
              <li>• Fixtures without gameweeks will still be published — assign gameweeks first if needed</li>
              <li>• Published fixtures are immediately visible to fans on the platform</li>
              <li>• This action cannot be undone easily — verify rows before proceeding</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => void handlePublish()}
              disabled={publishing}
              className="bg-green-600 text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {publishing ? 'Publishing…' : 'Publish Fixtures'}
            </button>
            <button
              onClick={() => router.back()}
              className="border rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
