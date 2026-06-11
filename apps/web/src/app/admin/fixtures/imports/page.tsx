'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ImportBatch {
  id: string;
  seasonId: string;
  status: string;
  label?: string;
  source: string;
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  committedRows: number;
  createdAt: string;
  validatedAt?: string;
  committedAt?: string;
  publishedAt?: string;
}

const STATUS_COLOURS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  VALIDATING: 'bg-yellow-100 text-yellow-700',
  VALIDATED: 'bg-blue-100 text-blue-700',
  FAILED_VALIDATION: 'bg-red-100 text-red-700',
  COMMITTED: 'bg-purple-100 text-purple-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function ImportBatchesPage() {
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/proxy/fixtures/admin/imports', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setBatches(Array.isArray(data) ? data : []))
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fixture Import Batches</h1>
          <p className="text-gray-500 mt-1">Import, validate, and publish PSL fixtures</p>
        </div>
        <Link
          href="/admin/fixtures/imports/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          New Import
        </Link>
      </div>

      <div className="flex gap-3 mb-4">
        <Link href="/admin/fixtures/validation" className="text-sm text-blue-600 hover:underline">
          Season Validation
        </Link>
        <span className="text-gray-300">|</span>
        <Link href="/admin/fixtures/conflicts" className="text-sm text-blue-600 hover:underline">
          Conflict Detection
        </Link>
        <span className="text-gray-300">|</span>
        <Link href="/admin/fixtures/gameweeks" className="text-sm text-blue-600 hover:underline">
          Gameweek Readiness
        </Link>
        <span className="text-gray-300">|</span>
        <Link href="/admin/fixtures/publishing" className="text-sm text-blue-600 hover:underline">
          Publishing
        </Link>
      </div>

      {loading && <p className="text-gray-500">Loading import batches…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}

      {!loading && batches.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg text-gray-400">
          <p className="text-lg mb-2">No import batches yet</p>
          <p className="text-sm">Create a new import to get started.</p>
        </div>
      )}

      {batches.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Label / Source</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Rows</th>
                <th className="px-4 py-3 font-medium text-right">Errors</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {batches.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-medium">{b.label ?? 'Unlabelled'}</span>
                    <span className="block text-gray-400 text-xs">{b.source}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLOURS[b.status] ?? 'bg-gray-100'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{b.totalRows}</td>
                  <td className="px-4 py-3 text-right">
                    {b.errorRows > 0 ? (
                      <span className="text-red-600 font-medium">{b.errorRows}</span>
                    ) : (
                      <span className="text-green-600">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(b.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/fixtures/imports/${b.id}`} className="text-blue-600 hover:underline text-xs mr-2">
                      View
                    </Link>
                    <Link href={`/admin/fixtures/imports/${b.id}/rows`} className="text-blue-600 hover:underline text-xs mr-2">
                      Rows
                    </Link>
                    {(b.status === 'DRAFT' || b.status === 'FAILED_VALIDATION') && (
                      <Link href={`/admin/fixtures/imports/${b.id}/validation`} className="text-blue-600 hover:underline text-xs">
                        Validate
                      </Link>
                    )}
                    {b.status === 'COMMITTED' && (
                      <Link href={`/admin/fixtures/imports/${b.id}/publish`} className="text-green-600 hover:underline text-xs">
                        Publish
                      </Link>
                    )}
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
