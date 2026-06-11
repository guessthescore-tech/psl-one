'use client';

import { useEffect, useState } from 'react';
import { getUserAudience } from '@/lib/admin-dashboard-client';

const TOKEN = 'dev-token';

export default function UserAudienceDashboardPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUserAudience(TOKEN).then(setData).catch(e => setError(String(e))).finally(() => setLoading(false));
  }, []);

  const fansByClub = (data?.fansByFavouriteClub ?? []) as { teamId: string; count: number }[];
  const byRole = (data?.usersByRole ?? {}) as Record<string, number>;

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/dashboard" className="text-blue-600 text-sm underline">← Dashboard</a>
        <h1 className="text-2xl font-bold">User &amp; Audience Intelligence</h1>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {data && (
        <div className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Users', value: data.totalUsers },
              { label: 'Fan Profiles', value: data.totalFanProfiles },
              { label: 'Avg Fan Value', value: data.avgFanValue },
              { label: 'Reward Eligible', value: data.rewardEligibleCount },
            ].map(({ label, value }) => (
              <div key={label} className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-cyan-800">{String(value ?? 0)}</div>
                <div className="text-xs text-cyan-600 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Users by Role */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-2">Users by Role</h2>
            {Object.keys(byRole).length === 0 ? (
              <p className="text-gray-400 text-sm">No role data yet</p>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {Object.entries(byRole).map(([role, count]) => (
                  <span key={role} className="text-xs bg-cyan-100 text-cyan-700 rounded px-2 py-1">{role}: {count}</span>
                ))}
              </div>
            )}
          </div>

          {/* Fans by Favourite Club */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-2">Fans by Favourite Club (Top 10)</h2>
            {fansByClub.length === 0 ? (
              <p className="text-gray-400 text-sm">No club preference data yet</p>
            ) : (
              <ol className="space-y-1">
                {fansByClub.slice(0, 10).map((f, i) => (
                  <li key={f.teamId} className="flex justify-between text-sm">
                    <span className="text-gray-500">{i + 1}. {f.teamId}</span>
                    <span className="font-medium">{f.count} fans</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Engagement */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-2">Engagement</h2>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Fans with Fantasy', value: (data.engagementMetrics as Record<string, number> | undefined)?.fansWithFantasyTeam },
                { label: 'Fans with Predictions', value: (data.engagementMetrics as Record<string, number> | undefined)?.fansWithPredictions },
                { label: 'Fans with Achievements', value: (data.engagementMetrics as Record<string, number> | undefined)?.fansWithAchievements },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded p-2 text-center">
                  <div className="font-bold">{String(value ?? 0)}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex gap-2 flex-wrap">
            <a href="/admin/dashboard/compliance" className="text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded px-3 py-1.5 hover:bg-rose-100">
              Compliance →
            </a>
            <a href="/admin/dashboard/system" className="text-xs bg-gray-50 border border-gray-200 text-gray-700 rounded px-3 py-1.5 hover:bg-gray-100">
              System Ops →
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
