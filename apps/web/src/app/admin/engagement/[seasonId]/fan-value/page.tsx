'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getEngagementFanValue } from '@/lib/admin-engagement-client';

interface ByRow { valueType?: string; sourceType?: string; totalPoints: number; count: number }
interface FanValueData {
  seasonId: string;
  seasonName: string;
  totalPoints: number;
  totalEntries: number;
  byType: ByRow[];
  bySource: ByRow[];
  legacyUnscopedCount: number;
  nonFinancial: boolean;
  disclaimer: string;
}

function BreakdownTable({ rows, keyField }: { rows: ByRow[]; keyField: 'valueType' | 'sourceType' }) {
  if (rows.length === 0) return <p className="text-xs text-gray-400">No data</p>;
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="text-left pb-1 font-medium text-gray-500">{keyField === 'valueType' ? 'Type' : 'Source'}</th>
          <th className="text-right pb-1 font-medium text-gray-500">Points</th>
          <th className="text-right pb-1 font-medium text-gray-500">Count</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-gray-50">
            <td className="py-1 text-gray-700 font-mono">{r[keyField] ?? '—'}</td>
            <td className="py-1 text-right text-gray-800 font-semibold">{r.totalPoints.toLocaleString()}</td>
            <td className="py-1 text-right text-gray-500">{r.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function AdminEngagementFanValuePage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<FanValueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEngagementFanValue(seasonId)
      .then((d) => setData(d as FanValueData))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [seasonId]);

  return (
    <main className="max-w-3xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
        <Link href="/admin/engagement" className="hover:text-gray-600">Engagement</Link>
        <span>/</span>
        <Link href={`/admin/engagement/${seasonId}`} className="hover:text-gray-600">{data?.seasonName ?? seasonId}</Link>
        <span>/</span>
        <span className="text-gray-600">Fan Value</span>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mt-1 mb-2">Fan Value Engagement</h1>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 mb-4">
        <strong>Non-financial.</strong> {data?.disclaimer ?? 'Fan Value has no cash value and cannot be withdrawn, deposited, or traded.'}
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {data && !loading && (
        <div className="space-y-4">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{data.totalPoints.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-0.5">Total Points</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{data.totalEntries.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-0.5">Ledger Entries</p>
            </div>
            <div className={`border rounded-lg p-4 text-center ${data.legacyUnscopedCount > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
              <p className={`text-2xl font-bold ${data.legacyUnscopedCount > 0 ? 'text-yellow-700' : 'text-green-700'}`}>{data.legacyUnscopedCount}</p>
              <p className={`text-xs mt-0.5 ${data.legacyUnscopedCount > 0 ? 'text-yellow-600' : 'text-green-600'}`}>Legacy Unscoped</p>
            </div>
          </div>

          {data.legacyUnscopedCount > 0 && (
            <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
              <span>{data.legacyUnscopedCount} entries have null seasonId — admin-visible only, excluded from fan leaderboard.</span>
              <Link href={`/admin/engagement/${seasonId}/unscoped-ledger`} className="text-yellow-700 underline ml-3 shrink-0">Review →</Link>
            </div>
          )}

          {/* By type */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">By Value Type</h2>
            <BreakdownTable rows={data.byType} keyField="valueType" />
          </div>

          {/* By source */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">By Source</h2>
            <BreakdownTable rows={data.bySource} keyField="sourceType" />
          </div>
        </div>
      )}
    </main>
  );
}
