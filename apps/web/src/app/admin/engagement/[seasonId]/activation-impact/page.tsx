'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getActivationImpact } from '@/lib/admin-engagement-client';

interface Impact { area: string; impact: string; detail: string }
interface ImpactResponse {
  seasonId: string;
  seasonName: string;
  activationSafe: boolean;
  engagementSeparation: string;
  impacts: Impact[];
  warnings: string[];
  safetyConfirmations: Record<string, boolean>;
}

const IMPACT_STYLE: Record<string, string> = {
  PRESERVED: 'bg-green-100 text-green-800',
  ACTIVE: 'bg-blue-100 text-blue-800',
  CLEAN: 'bg-green-100 text-green-800',
  ISOLATED: 'bg-yellow-100 text-yellow-800',
  PSL_SEASON: 'bg-gray-100 text-gray-700',
};

export default function AdminActivationImpactPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<ImpactResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getActivationImpact(seasonId)
      .then((d) => setData(d as ImpactResponse))
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
        <span className="text-gray-600">Activation Impact</span>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mt-1 mb-4">Activation Impact — Engagement</h1>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {data && !loading && (
        <div className="space-y-4">
          {/* Overall status */}
          <div className={`border rounded-lg p-4 ${data.activationSafe ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
            <p className={`font-bold text-lg ${data.activationSafe ? 'text-green-800' : 'text-red-800'}`}>
              {data.activationSafe ? '✓ Activation Safe' : '✗ Activation Unsafe'}
            </p>
            <p className={`text-xs mt-1 ${data.activationSafe ? 'text-green-700' : 'text-red-700'}`}>
              Engagement separation: <strong>{data.engagementSeparation}</strong>
            </p>
          </div>

          {/* Warnings */}
          {data.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              {data.warnings.map((w, i) => (
                <p key={i} className="text-xs text-yellow-800">⚠ {w}</p>
              ))}
            </div>
          )}

          {/* World Cup / PSL call-outs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-800 mb-1">World Cup History</p>
              <p className="text-xs text-blue-700">WC fan value, fantasy, and prediction data remain accessible. No deletion. Queryable via <code className="bg-blue-100 px-1 rounded">?seasonSlug=fifa-world-cup-2026</code>.</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-green-800 mb-1">PSL Clean Start</p>
              <p className="text-xs text-green-700">PSL leaderboard starts clean — season-scoped queries filter strictly by <code className="bg-green-100 px-1 rounded">seasonId</code>.</p>
            </div>
          </div>

          {/* Impact table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Engagement Impact Summary</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {data.impacts.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold shrink-0 ${IMPACT_STYLE[item.impact] ?? 'bg-gray-100 text-gray-700'}`}>
                    {item.impact}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-700">{item.area}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safety confirmations */}
          <div className="border border-green-200 bg-green-50 rounded-lg p-4">
            <h2 className="text-xs font-semibold text-green-800 mb-3">Safety Confirmations</h2>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(data.safetyConfirmations).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 text-xs text-green-700">
                  <span className="font-bold shrink-0">{v ? '✓' : '✗'}</span>
                  <span>{k.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-links */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Next Steps</h2>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/admin/seasons" className="text-xs text-blue-600 underline">Season Switching →</Link>
              <Link href="/admin/operations/launch-readiness" className="text-xs text-blue-600 underline">Launch Readiness →</Link>
              <Link href={`/admin/engagement/${seasonId}/season-scope-audit`} className="text-xs text-blue-600 underline">Scope Audit →</Link>
              <Link href={`/admin/engagement/${seasonId}/unscoped-ledger`} className="text-xs text-blue-600 underline">Unscoped Ledger →</Link>
              <Link href="/admin/fantasy" className="text-xs text-blue-600 underline">Fantasy Calibration →</Link>
              <Link href="/admin/predictions" className="text-xs text-blue-600 underline">Prediction Rules →</Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
