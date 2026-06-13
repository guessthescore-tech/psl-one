'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { getImportOverview } from '@/lib/squad-import-client';

interface Overview {
  seasonId: string;
  seasonName: string;
  teamCount: number;
  totalRegistrations: number;
  confirmedRegistrations: number;
  provisionalRegistrations: number;
  latestBatchStatus: string | null;
  latestBatchImportedRows: number;
  recentBatches: { id: string; status: string; totalRows: number; importedRows: number; createdAt: string }[];
}

export default function SquadImportOverviewPage({ params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = use(params);
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getImportOverview(seasonId)
      .then(setData)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [seasonId]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-4">
        <Link href="/admin/squad-import" className="text-sm text-blue-600 hover:underline">← Squad Import</Link>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Squad Import Overview</h1>
          {data && <p className="text-gray-500 mt-1">{data.seasonName}</p>}
        </div>
        <Link href={`/admin/squad-import/${seasonId}/batches`} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
          Manage Batches
        </Link>
      </div>

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-600 bg-red-50 rounded p-3">{error}</p>}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Teams', value: data.teamCount },
              { label: 'Total Registrations', value: data.totalRegistrations },
              { label: 'Confirmed', value: data.confirmedRegistrations },
              { label: 'Provisional', value: data.provisionalRegistrations },
            ].map(stat => (
              <div key={stat.label} className="border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap mb-6">
            <Link href={`/admin/squad-import/${seasonId}/batches`} className="text-sm text-blue-600 hover:underline">Batches</Link>
            <span className="text-gray-300">|</span>
            <Link href={`/admin/squad-import/${seasonId}/duplicates`} className="text-sm text-blue-600 hover:underline">Duplicates</Link>
            <span className="text-gray-300">|</span>
            <Link href={`/admin/squad-import/${seasonId}/readiness`} className="text-sm text-blue-600 hover:underline">Readiness</Link>
            <span className="text-gray-300">|</span>
            <Link href={`/admin/squad-import/${seasonId}/activation-impact`} className="text-sm text-blue-600 hover:underline">Activation Impact</Link>
            <span className="text-gray-300">|</span>
            <Link href={`/admin/squad-import/${seasonId}/activation-dry-run`} className="text-sm text-blue-600 hover:underline">Dry Run</Link>
          </div>

          {data.recentBatches.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Recent Batches</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 text-gray-600 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Rows</th>
                      <th className="px-4 py-3 font-medium text-right">Imported</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.recentBatches.map(b => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">{b.status}</span>
                        </td>
                        <td className="px-4 py-3 text-right">{b.totalRows}</td>
                        <td className="px-4 py-3 text-right">{b.importedRows}</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(b.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/squad-import/${seasonId}/batches/${b.id}`} className="text-blue-600 hover:underline text-xs">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
