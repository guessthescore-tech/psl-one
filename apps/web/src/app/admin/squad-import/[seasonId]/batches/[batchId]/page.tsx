'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { getBatch, validateBatch, importBatch, publishBatch, cancelBatch } from '@/lib/squad-import-client';

interface Batch {
  id: string;
  status: string;
  sourceType: string;
  notes: string | null;
  totalRows: number;
  validRows: number;
  warningRows: number;
  blockedRows: number;
  importedRows: number;
  publishedRows: number;
  createdByUserId: string | null;
  validatedAt: string | null;
  importedAt: string | null;
  publishedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
}

const STATUS_COLOURS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  VALIDATED: 'bg-blue-100 text-blue-700',
  HAS_WARNINGS: 'bg-yellow-100 text-yellow-700',
  BLOCKED: 'bg-red-100 text-red-700',
  IMPORTED: 'bg-purple-100 text-purple-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-400',
};

export default function BatchDetailPage({ params }: { params: Promise<{ seasonId: string; batchId: string }> }) {
  const { seasonId, batchId } = use(params);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  function loadBatch() {
    setLoading(true);
    getBatch(seasonId, batchId)
      .then(setBatch)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadBatch(); }, [seasonId, batchId]);

  async function handle(action: () => Promise<unknown>, msg: string) {
    setActionLoading(true);
    setActionMsg(null);
    setError(null);
    try {
      await action();
      setActionMsg(msg);
      loadBatch();
    } catch (e: unknown) {
      setError(String(e));
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <Link href={`/admin/squad-import/${seasonId}/batches`} className="text-sm text-blue-600 hover:underline">← Batches</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Batch Detail</h1>

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}
      {actionMsg && <p className="text-green-600 bg-green-50 rounded p-3">{actionMsg}</p>}

      {batch && (
        <>
          <div className="border rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${STATUS_COLOURS[batch.status] ?? 'bg-gray-100'}`}>
                {batch.status}
              </span>
              <span className="text-xs text-gray-400">{batch.id}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[
                { label: 'Total Rows', value: batch.totalRows },
                { label: 'Valid', value: batch.validRows, colour: 'text-green-600' },
                { label: 'Warnings', value: batch.warningRows, colour: 'text-yellow-600' },
                { label: 'Blocked', value: batch.blockedRows, colour: 'text-red-600' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className={`text-2xl font-bold ${s.colour ?? 'text-gray-900'}`}>{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
            {batch.notes && <p className="text-sm text-gray-600 italic">{batch.notes}</p>}
            <div className="text-xs text-gray-400 mt-2">Source: {batch.sourceType} · Created: {new Date(batch.createdAt).toLocaleString()}</div>
          </div>

          <div className="flex gap-3 flex-wrap mb-4">
            <Link href={`/admin/squad-import/${seasonId}/batches/${batchId}/rows`} className="text-sm text-blue-600 hover:underline">
              View Rows
            </Link>
          </div>

          {!actionLoading && (
            <div className="flex gap-3 flex-wrap">
              {['DRAFT', 'HAS_WARNINGS', 'VALIDATED', 'BLOCKED'].includes(batch.status) && (
                <button
                  onClick={() => handle(() => validateBatch(seasonId, batchId), 'Batch validated')}
                  className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
                >
                  Validate
                </button>
              )}
              {['VALIDATED', 'HAS_WARNINGS'].includes(batch.status) && (
                <button
                  onClick={() => handle(() => importBatch(seasonId, batchId), 'Batch imported')}
                  className="bg-purple-600 text-white text-sm px-4 py-2 rounded hover:bg-purple-700"
                >
                  Import
                </button>
              )}
              {batch.status === 'IMPORTED' && (
                <button
                  onClick={() => handle(() => publishBatch(seasonId, batchId), 'Batch published — registrations confirmed')}
                  className="bg-green-600 text-white text-sm px-4 py-2 rounded hover:bg-green-700"
                >
                  Publish
                </button>
              )}
              {!['PUBLISHED', 'CANCELLED'].includes(batch.status) && (
                <button
                  onClick={() => handle(() => cancelBatch(seasonId, batchId), 'Batch cancelled')}
                  className="bg-red-600 text-white text-sm px-4 py-2 rounded hover:bg-red-700"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
          {actionLoading && <p className="text-gray-500 text-sm">Processing…</p>}
        </>
      )}
    </div>
  );
}
