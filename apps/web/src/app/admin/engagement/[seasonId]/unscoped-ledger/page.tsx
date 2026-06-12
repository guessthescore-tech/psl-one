'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getUnscopedLedger } from '@/lib/admin-engagement-client';

type ScopeSource = 'DIRECT' | 'DERIVED_GAMEWEEK' | 'DERIVED_FIXTURE' | 'DERIVED_PREDICTION' | 'DERIVED_PEER_CHALLENGE' | 'LEGACY_UNSCOPED';

interface UnscopedEntry {
  id: string;
  userId: string;
  sourceType: string;
  points: number;
  seasonScopeSource: ScopeSource;
  occurredAt: string;
}

interface UnscopedResponse {
  seasonId: string;
  note: string;
  unscopedCount: number;
  scopedCount: number;
  entries: UnscopedEntry[];
  recommendation: string;
}

const SOURCE_STYLE: Record<ScopeSource, string> = {
  DIRECT: 'bg-green-100 text-green-800',
  DERIVED_GAMEWEEK: 'bg-blue-100 text-blue-800',
  DERIVED_FIXTURE: 'bg-cyan-100 text-cyan-800',
  DERIVED_PREDICTION: 'bg-indigo-100 text-indigo-800',
  DERIVED_PEER_CHALLENGE: 'bg-violet-100 text-violet-800',
  LEGACY_UNSCOPED: 'bg-red-100 text-red-800',
};

export default function AdminUnscopedLedgerPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<UnscopedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUnscopedLedger(seasonId)
      .then((d) => setData(d as UnscopedResponse))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [seasonId]);

  return (
    <main className="max-w-3xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
        <Link href="/admin/engagement" className="hover:text-gray-600">Engagement</Link>
        <span>/</span>
        <Link href={`/admin/engagement/${seasonId}`} className="hover:text-gray-600">{seasonId}</Link>
        <span>/</span>
        <span className="text-gray-600">Unscoped Ledger</span>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mt-1 mb-2">Unscoped Legacy Ledger</h1>

      {data?.note && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 mb-3">
          {data.note}
        </div>
      )}

      {data?.recommendation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 mb-4">
          <strong>Recommendation:</strong> {data.recommendation}
        </div>
      )}

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {data && !loading && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`border rounded-lg p-4 text-center ${data.unscopedCount > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
              <p className={`text-3xl font-bold ${data.unscopedCount > 0 ? 'text-yellow-700' : 'text-green-700'}`}>{data.unscopedCount}</p>
              <p className={`text-xs mt-0.5 ${data.unscopedCount > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                {data.unscopedCount === 0 ? 'No unscoped entries ✓' : 'Unscoped Entries'}
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{data.scopedCount.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-0.5">Scoped Entries</p>
            </div>
          </div>

          {/* Scope source legend */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Season Scope Classification</h2>
            <div className="flex flex-wrap gap-2 text-xs">
              {(Object.entries(SOURCE_STYLE) as [ScopeSource, string][]).map(([k, cls]) => (
                <span key={k} className={`px-2 py-0.5 rounded font-medium ${cls}`}>{k}</span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Priority: DIRECT → DERIVED_GAMEWEEK → DERIVED_PREDICTION → DERIVED_PEER_CHALLENGE → DERIVED_FIXTURE → LEGACY_UNSCOPED
            </p>
          </div>

          {/* Entries table */}
          {data.entries.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">Entries (showing up to 200)</h2>
                <span className="text-xs text-gray-400">{data.entries.length} shown</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-2 font-medium text-gray-500">User ID</th>
                      <th className="text-left p-2 font-medium text-gray-500">Source</th>
                      <th className="text-right p-2 font-medium text-gray-500">Pts</th>
                      <th className="text-left p-2 font-medium text-gray-500">Scope Classification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.entries.map((e) => (
                      <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="p-2 font-mono text-gray-500">{e.userId.slice(0, 12)}…</td>
                        <td className="p-2 text-gray-600">{e.sourceType}</td>
                        <td className="p-2 text-right font-semibold text-gray-800">{e.points}</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${SOURCE_STYLE[e.seasonScopeSource] ?? 'bg-gray-100 text-gray-600'}`}>
                            {e.seasonScopeSource}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-700 font-semibold text-sm">No unscoped entries</p>
              <p className="text-xs text-green-600 mt-1">All fan value entries have a season relation. Season scope is clean.</p>
            </div>
          )}

          {/* Safety note */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-500">
            <strong>No destructive backfill.</strong> Do not force-assign ambiguous World Cup beta records. Backfill only where derivation is deterministic (e.g. <code className="bg-gray-100 px-1 rounded">gameweekId → gameweek.seasonId</code>).
          </div>

          <Link href={`/admin/engagement/${seasonId}/season-scope-audit`} className="text-xs text-blue-600 underline">
            Full scope audit →
          </Link>
        </div>
      )}
    </main>
  );
}
