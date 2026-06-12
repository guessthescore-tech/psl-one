'use client';

import { useEffect, useState } from 'react';
import { getReporting } from '@/lib/admin-dashboard-client';
import { getBetaToken } from '@/lib/auth-client';


export default function ReportingDashboardPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getReporting(getBetaToken()).then(setData).catch(e => setError(String(e))).finally(() => setLoading(false));
  }, []);

  const topFans = (data?.topFansByFanValue ?? []) as { fanId: string; totalFanValue: number }[];
  const achievementDefs = (data?.topAchievementDefinitions ?? []) as { achievementDefinitionId: string; count: number }[];

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/dashboard" className="text-blue-600 text-sm underline">← Dashboard</a>
        <h1 className="text-2xl font-bold">Reporting Centre</h1>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {data && (
        <div className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Users', value: data.totalUsers },
              { label: 'Fan Profiles', value: data.totalFans },
              { label: 'Active Season Fixtures', value: data.activeSeasonFixtureCount },
              { label: 'Predictions (all-time)', value: data.allTimePredictions },
            ].map(({ label, value }) => (
              <div key={label} className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-teal-800">{String(value ?? 0)}</div>
                <div className="text-xs text-teal-600 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Platform Totals */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-2">Platform Totals</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {[
                { label: 'Fantasy Teams', value: data.totalFantasyTeams },
                { label: 'Total Points Awarded', value: data.totalPointsAwarded },
                { label: 'Fan Value Transactions', value: data.fanValueTransactionCount },
                { label: 'Achievements Earned', value: data.achievementsEarned },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded p-2 text-center">
                  <div className="font-bold">{String(value ?? 0)}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Fans by Fan Value */}
          {topFans.length > 0 && (
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h2 className="font-semibold text-gray-700 mb-2">Top Fans by Fan Value</h2>
              <ol className="space-y-1">
                {topFans.slice(0, 5).map((f, i) => (
                  <li key={f.fanId} className="flex justify-between text-sm">
                    <span className="text-gray-500">{i + 1}. {f.fanId.slice(0, 8)}…</span>
                    <span className="font-medium">{f.totalFanValue} FV</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Top Achievement Definitions */}
          {achievementDefs.length > 0 && (
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h2 className="font-semibold text-gray-700 mb-2">Most Earned Achievements</h2>
              <ol className="space-y-1">
                {achievementDefs.slice(0, 5).map((a, i) => (
                  <li key={a.achievementDefinitionId} className="flex justify-between text-sm">
                    <span className="text-gray-500">{i + 1}. {a.achievementDefinitionId.slice(0, 8)}…</span>
                    <span className="font-medium">{a.count} earned</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Notice */}
          <div className="border border-gray-200 bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
            Full report builder, scheduled delivery, and custom exports are not yet implemented.
          </div>

          {/* Quick Links */}
          <div className="flex gap-2 flex-wrap">
            <a href="/admin/dashboard/compliance" className="text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded px-3 py-1.5 hover:bg-rose-100">
              Compliance →
            </a>
            <a href="/admin/dashboard/user-audience" className="text-xs bg-cyan-50 border border-cyan-200 text-cyan-700 rounded px-3 py-1.5 hover:bg-cyan-100">
              User Audience →
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
