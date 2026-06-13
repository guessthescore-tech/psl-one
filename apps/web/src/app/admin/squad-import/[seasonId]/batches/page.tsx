'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { listBatches } from '@/lib/squad-import-client';

interface Batch {
  id: string;
  seasonId: string;
  sourceType: string;
  status: string;
  totalRows: number;
  validRows: number;
  warningRows: number;
  blockedRows: number;
  importedRows: number;
  publishedRows: number;
  createdAt: string;
  validatedAt: string | null;
  importedAt: string | null;
  publishedAt: string | null;
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

export default function BatchListPage({ params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = use(params);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listBatches(seasonId)
      .then(data => setBatches(Array.isArray(data) ? data : []))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [seasonId]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-4">
        <Link href={`/admin/squad-import/${seasonId}`} className="text-sm text-blue-600 hover:underline">← Season Overview</Link>
      </div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Import Batches</h1>
      </div>

      {loading && <p className="text-gray-500">Loading batches…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}

      {!loading && batches.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg text-gray-400">
          <p className="text-lg mb-2">No import batches yet</p>
          <p className="text-sm">Use the API to create a manual batch.</p>
        </div>
      )}

      {batches.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium text-right">Valid</th>
                <th className="px-4 py-3 font-medium text-right">Warnings</th>
                <th className="px-4 py-3 font-medium text-right">Blocked</th>
                <th className="px-4 py-3 font-medium text-right">Imported</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {batches.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLOURS[b.status] ?? 'bg-gray-100'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{b.sourceType}</td>
                  <td className="px-4 py-3 text-right">{b.totalRows}</td>
                  <td className="px-4 py-3 text-right text-green-600">{b.validRows}</td>
                  <td className="px-4 py-3 text-right text-yellow-600">{b.warningRows}</td>
                  <td className="px-4 py-3 text-right text-red-600">{b.blockedRows}</td>
                  <td className="px-4 py-3 text-right">{b.importedRows}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(b.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <Link href={`/admin/squad-import/${seasonId}/batches/${b.id}`} className="text-blue-600 hover:underline text-xs">Detail</Link>
                    <Link href={`/admin/squad-import/${seasonId}/batches/${b.id}/rows`} className="text-blue-600 hover:underline text-xs">Rows</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
