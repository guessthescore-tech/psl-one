'use client';

import { useEffect, useState } from 'react';
import { getFixtureManagement } from '@/lib/admin-dashboard-client';

const TOKEN = 'dev-token';

export default function FixtureManagementDashboardPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFixtureManagement(TOKEN).then(setData).catch(e => setError(String(e))).finally(() => setLoading(false));
  }, []);

  const byStatus = (data?.fixturesByStatus ?? {}) as Record<string, number>;

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/dashboard" className="text-blue-600 text-sm underline">← Dashboard</a>
        <h1 className="text-2xl font-bold">Fixture Management</h1>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {data && (
        <div className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Fixtures', value: data.totalFixtures },
              { label: 'Upcoming (7d)', value: data.upcomingNext7Days },
              { label: 'Live Now', value: data.liveCount },
              { label: 'Cancelled', value: data.cancelledCount },
            ].map(({ label, value }) => (
              <div key={label} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-800">{String(value ?? 0)}</div>
                <div className="text-xs text-yellow-600 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Status Breakdown */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-2">Fixtures by Status</h2>
            {Object.keys(byStatus).length === 0 ? (
              <p className="text-gray-400 text-sm">No fixtures yet</p>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {Object.entries(byStatus).map(([s, c]) => (
                  <span key={s} className={`text-xs rounded px-2 py-1 ${s === 'LIVE' ? 'bg-red-100 text-red-700 font-bold' : 'bg-gray-100 text-gray-700'}`}>
                    {s}: {c}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Match Stats */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-2">Match Stats</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Total Match Stats Records', value: data.matchStatsCount },
                { label: 'Goals This Season', value: data.totalGoalsThisSeason },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded p-2 text-center">
                  <div className="font-bold text-lg">{String(value ?? 0)}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Postponed Alert */}
          {Number(data.postponedCount ?? 0) > 0 && (
            <div className="border border-amber-200 bg-amber-50 rounded-lg p-3 text-sm text-amber-700">
              {Number(data.postponedCount)} fixture{Number(data.postponedCount) > 1 ? 's' : ''} postponed — check scheduling
            </div>
          )}

          {/* Quick Links */}
          <div className="flex gap-2 flex-wrap">
            <a href="/admin/fixtures" className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-700 rounded px-3 py-1.5 hover:bg-yellow-100">
              Manage Fixtures
            </a>
            <a href="/admin/dashboard/league-management" className="text-xs bg-green-50 border border-green-200 text-green-700 rounded px-3 py-1.5 hover:bg-green-100">
              League Management →
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
