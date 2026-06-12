'use client';

import { useEffect, useState } from 'react';
import { getGuessTheScore } from '@/lib/admin-dashboard-client';
import { getBetaToken } from '@/lib/auth-client';


export default function GuessTheScoreDashboardPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGuessTheScore(getBetaToken()).then(setData).catch(e => setError(String(e))).finally(() => setLoading(false));
  }, []);

  const byStatus = (data?.byStatus ?? {}) as Record<string, number>;
  const accuracy = (data?.accuracy ?? {}) as Record<string, number>;
  const challenges = (data?.peerChallenges ?? {}) as Record<string, number>;
  const quickLinks = (data?.quickLinks ?? []) as { label: string; href: string; status?: string }[];

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/dashboard" className="text-blue-600 text-sm underline">← Dashboard</a>
        <h1 className="text-2xl font-bold">Guess the Score</h1>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {data && (
        <div className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Predictions', value: data.totalPredictions },
              { label: 'Points Awarded', value: data.predictionPointsAwarded },
              { label: 'Exact Scores', value: data.exactScoreCount },
              { label: 'Result-Only', value: data.resultOnlyCount },
            ].map(({ label, value }) => (
              <div key={label} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-800">{String(value ?? 0)}</div>
                <div className="text-xs text-blue-600 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Accuracy */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-2">Accuracy</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded p-2 text-center">
                <div className="text-lg font-bold">{((accuracy.exactScoreRate ?? 0) * 100).toFixed(1)}%</div>
                <div className="text-xs text-gray-500">Exact Score Rate</div>
              </div>
              <div className="bg-gray-50 rounded p-2 text-center">
                <div className="text-lg font-bold">{((accuracy.resultAccuracyRate ?? 0) * 100).toFixed(1)}%</div>
                <div className="text-xs text-gray-500">Result Accuracy Rate</div>
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-2">Predictions by Status</h2>
            {Object.keys(byStatus).length === 0 ? (
              <p className="text-gray-400 text-sm">No predictions yet</p>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {Object.entries(byStatus).map(([s, c]) => (
                  <span key={s} className="text-xs bg-gray-100 text-gray-700 rounded px-2 py-1">{s}: {c}</span>
                ))}
              </div>
            )}
          </div>

          {/* Peer Challenges */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-2">Peer Challenges</h2>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Total', value: challenges.total },
                { label: 'Active', value: challenges.active },
                { label: 'Settled', value: challenges.settled },
                { label: 'Points', value: challenges.pointsAwarded },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded p-2 text-center">
                  <div className="font-bold">{String(value ?? 0)}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Settlement */}
          {Array.isArray(data.pendingSettlementFixtures) && data.pendingSettlementFixtures.length > 0 && (
            <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
              <h2 className="font-semibold text-amber-800 mb-2">
                Pending Settlement ({(data.pendingSettlementFixtures as unknown[]).length} fixtures)
              </h2>
              <ul className="space-y-1">
                {(data.pendingSettlementFixtures as { id: string; homeTeam: { name: string }; awayTeam: { name: string }; kickoffAt: string }[]).map(f => (
                  <li key={f.id} className="text-sm text-amber-700">
                    {f.homeTeam.name} vs {f.awayTeam.name} — {new Date(f.kickoffAt).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Links */}
          <div className="flex gap-2 flex-wrap">
            {quickLinks.map((ql, i) => (
              <a key={i} href={ql.href}
                className="text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded px-3 py-1.5 hover:bg-blue-100">
                {ql.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
