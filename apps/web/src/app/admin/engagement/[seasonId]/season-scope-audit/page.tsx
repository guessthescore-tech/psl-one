'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getSeasonScopeAudit } from '@/lib/admin-engagement-client';

interface AuditCheck {
  check: string;
  label: string;
  passed: boolean;
  detail: string;
  source: string | null;
}

interface ScopeSummary {
  direct: number;
  derivableGameweek: number;
  derivableFixture: number;
  derivablePrediction: number;
  derivableChallenge: number;
  trulyUnscoped: number;
}

interface AuditResponse {
  seasonId: string;
  seasonName: string;
  auditStatus: 'READY' | 'READY_WITH_WARNINGS' | 'BLOCKED';
  checks: AuditCheck[];
  blockers: AuditCheck[];
  warnings: string[];
  scopeSummary: ScopeSummary;
  noMigrationNeeded: string;
}

export default function AdminSeasonScopeAuditPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSeasonScopeAudit(seasonId)
      .then((d) => setData(d as AuditResponse))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [seasonId]);

  const statusStyle = {
    READY: 'bg-green-50 border-green-300 text-green-800',
    READY_WITH_WARNINGS: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    BLOCKED: 'bg-red-50 border-red-300 text-red-800',
  };

  const statusLabel = {
    READY: '✓ READY',
    READY_WITH_WARNINGS: '⚠ READY WITH WARNINGS',
    BLOCKED: '✗ BLOCKED',
  };

  return (
    <main className="max-w-3xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
        <Link href="/admin/engagement" className="hover:text-gray-600">Engagement</Link>
        <span>/</span>
        <Link href={`/admin/engagement/${seasonId}`} className="hover:text-gray-600">{data?.seasonName ?? seasonId}</Link>
        <span>/</span>
        <span className="text-gray-600">Season Scope Audit</span>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mt-1 mb-4">Season Scope Audit</h1>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {data && !loading && (
        <div className="space-y-4">
          {/* Status banner */}
          <div className={`border rounded-lg p-4 ${statusStyle[data.auditStatus]}`}>
            <p className="font-bold text-lg">{statusLabel[data.auditStatus]}</p>
            <p className="text-xs mt-1">{data.noMigrationNeeded}</p>
          </div>

          {/* Warnings */}
          {data.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-1">
              {data.warnings.map((w, i) => (
                <p key={i} className="text-xs text-yellow-800">⚠ {w}</p>
              ))}
            </div>
          )}

          {/* Scope summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Scope Summary</h2>
            <div className="grid grid-cols-3 gap-3">
              {(Object.entries(data.scopeSummary) as [string, number][]).map(([k, v]) => {
                const isProblematic = k === 'trulyUnscoped' && v > 0;
                return (
                  <div key={k} className={`rounded-lg p-3 text-center ${isProblematic ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                    <p className={`text-xl font-bold ${isProblematic ? 'text-yellow-700' : 'text-gray-800'}`}>{v.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{k.replace(/([A-Z])/g, ' $1').toLowerCase()}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Check list */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">10 Scope Checks</h2>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-2 font-medium text-gray-500">Check</th>
                  <th className="text-center p-2 font-medium text-gray-500 w-16">Status</th>
                  <th className="text-left p-2 font-medium text-gray-500">Detail</th>
                </tr>
              </thead>
              <tbody>
                {data.checks.map((c) => (
                  <tr key={c.check} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-2 font-medium text-gray-700">{c.label}</td>
                    <td className="p-2 text-center">
                      {c.passed
                        ? <span className="text-green-600 font-bold">✓</span>
                        : <span className="text-red-600 font-bold">✗</span>
                      }
                    </td>
                    <td className="p-2 text-gray-500">{c.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Blockers */}
          {data.blockers.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-red-800 mb-2">Blockers ({data.blockers.length})</h2>
              <ul className="space-y-1">
                {data.blockers.map((b) => (
                  <li key={b.check} className="text-xs text-red-700">✗ {b.label}: {b.detail}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <Link href={`/admin/engagement/${seasonId}/unscoped-ledger`} className="text-xs text-blue-600 underline">Unscoped ledger →</Link>
            <Link href={`/admin/engagement/${seasonId}/activation-impact`} className="text-xs text-blue-600 underline">Activation impact →</Link>
            <Link href="/admin/seasons" className="text-xs text-blue-600 underline">Season switching →</Link>
          </div>
        </div>
      )}
    </main>
  );
}
