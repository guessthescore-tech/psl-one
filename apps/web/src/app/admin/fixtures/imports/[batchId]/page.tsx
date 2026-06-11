'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Batch {
  id: string;
  seasonId: string;
  season?: { id: string; name: string; slug: string };
  status: string;
  label?: string;
  source: string;
  fileName?: string;
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  committedRows: number;
  createdAt: string;
  validatedAt?: string;
  committedAt?: string;
  publishedAt?: string;
  rejectedAt?: string;
}

const STATUS_STEPS: Record<string, number> = {
  DRAFT: 1, VALIDATING: 2, VALIDATED: 3, FAILED_VALIDATION: 2,
  COMMITTED: 4, PUBLISHED: 5, REJECTED: 0,
};

export default function BatchDetailPage() {
  const params = useParams<{ batchId: string }>();
  const batchId = params.batchId;
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actioning, setActioning] = useState(false);

  async function load() {
    try {
      const res = await fetch(`/api/proxy/fixtures/admin/imports/${batchId}`, { credentials: 'include' });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json() as Batch;
      setBatch(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [batchId]);

  async function doAction(action: 'validate' | 'commit' | 'publish' | 'reject') {
    setActioning(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/proxy/fixtures/admin/imports/${batchId}/${action}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`${res.status}: ${body}`);
      }
      await load();
    } catch (e) {
      setActionError(String(e));
    } finally {
      setActioning(false);
    }
  }

  if (loading) return <p className="p-6 text-gray-500">Loading…</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!batch) return null;

  const step = STATUS_STEPS[batch.status] ?? 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/fixtures/imports" className="text-sm text-blue-600 hover:underline">
          ← Import Batches
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{batch.label ?? 'Import Batch'}</h1>
        <p className="text-gray-500 text-sm">{batch.id}</p>
      </div>

      {/* Status pipeline */}
      <div className="flex items-center gap-2 mb-6 text-xs font-medium">
        {['DRAFT', 'VALIDATE', 'VALIDATED', 'COMMITTED', 'PUBLISHED'].map((s, i) => (
          <span key={s} className={`px-2 py-1 rounded ${i + 1 <= step ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
            {s}
          </span>
        ))}
        {batch.status === 'REJECTED' && (
          <span className="px-2 py-1 rounded bg-red-100 text-red-600">REJECTED</span>
        )}
      </div>

      {actionError && <p className="text-red-600 bg-red-50 rounded p-3 mb-4 text-sm">{actionError}</p>}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Season</p>
          <p className="font-medium">{batch.season?.name ?? batch.seasonId}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Source</p>
          <p className="font-medium">{batch.source}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Total Rows</p>
          <p className="text-2xl font-bold">{batch.totalRows}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Errors / Warnings</p>
          <p className="text-2xl font-bold">
            <span className={batch.errorRows > 0 ? 'text-red-600' : 'text-green-600'}>{batch.errorRows}</span>
            <span className="text-gray-300 mx-1">/</span>
            <span className="text-yellow-600">{batch.warningRows}</span>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <Link href={`/admin/fixtures/imports/${batchId}/rows`} className="border rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50">
          View Rows
        </Link>

        {(batch.status === 'DRAFT' || batch.status === 'FAILED_VALIDATION') && (
          <Link href={`/admin/fixtures/imports/${batchId}/validation`} className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700">
            Validate
          </Link>
        )}

        {batch.status === 'VALIDATED' && (
          <button
            disabled={actioning || batch.errorRows > 0}
            onClick={() => void doAction('commit')}
            className="bg-purple-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            {actioning ? 'Committing…' : 'Commit Fixtures'}
          </button>
        )}

        {batch.status === 'COMMITTED' && (
          <Link href={`/admin/fixtures/imports/${batchId}/publish`} className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-green-700">
            Publish Fixtures
          </Link>
        )}

        {batch.status !== 'PUBLISHED' && batch.status !== 'REJECTED' && (
          <button
            disabled={actioning}
            onClick={() => void doAction('reject')}
            className="border border-red-300 text-red-600 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-50 disabled:opacity-50"
          >
            Reject Batch
          </button>
        )}
      </div>

      {batch.validatedAt && (
        <p className="text-xs text-gray-400 mt-4">Validated: {new Date(batch.validatedAt).toLocaleString()}</p>
      )}
      {batch.committedAt && (
        <p className="text-xs text-gray-400">Committed: {new Date(batch.committedAt).toLocaleString()}</p>
      )}
      {batch.publishedAt && (
        <p className="text-xs text-gray-400">Published: {new Date(batch.publishedAt).toLocaleString()}</p>
      )}
    </div>
  );
}
