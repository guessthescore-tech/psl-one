'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { getDuplicates } from '@/lib/squad-import-client';

interface DuplicateResult {
  seasonId: string;
  seasonName: string;
  duplicateCount: number;
  rows: { id: string; proposedPlayerName: string; teamId: string | null; duplicatePlayerIds: unknown; validationStatus: string }[];
}

export default function DuplicatesPage({ params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = use(params);
  const [data, setData] = useState<DuplicateResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDuplicates(seasonId)
      .then(setData)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [seasonId]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-4">
        <Link href={`/admin/squad-import/${seasonId}`} className="text-sm text-blue-600 hover:underline">← Season Overview</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Duplicate Detection</h1>
      {data && <p className="text-gray-500 mb-6">{data.seasonName}</p>}

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}

      {data && (
        <>
          {data.duplicateCount === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-lg text-gray-400">
              <p className="text-lg mb-2">No duplicates detected</p>
              <p className="text-sm">All import rows have unique player names within their team.</p>
            </div>
          ) : (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 font-medium">{data.duplicateCount} row{data.duplicateCount !== 1 ? 's' : ''} with possible duplicates</p>
                <p className="text-yellow-700 text-sm mt-1">Review each row and resolve before publishing the import batch.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 text-gray-600 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Player Name</th>
                      <th className="px-4 py-3 font-medium">Team ID</th>
                      <th className="px-4 py-3 font-medium">Validation</th>
                      <th className="px-4 py-3 font-medium">Duplicate Player IDs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.rows.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{r.proposedPlayerName}</td>
                        <td className="px-4 py-3 text-gray-500">{r.teamId ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded ${r.validationStatus === 'BLOCKED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {r.validationStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {JSON.stringify(r.duplicatePlayerIds)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
