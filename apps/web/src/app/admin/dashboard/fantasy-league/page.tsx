'use client';

import { useEffect, useState } from 'react';
import { getFantasyLeague } from '@/lib/admin-dashboard-client';
import { getBetaToken } from '@/lib/auth-client';


export default function FantasyLeagueDashboardPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFantasyLeague(getBetaToken()).then(setData).catch(e => setError(String(e))).finally(() => setLoading(false));
  }, []);

  const leagues = (data?.leaguesByType ?? {}) as Record<string, number>;
  const autoSubs = (data?.autoSubstitutions ?? {}) as Record<string, number>;

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/dashboard" className="text-blue-600 text-sm underline">← Dashboard</a>
        <h1 className="text-2xl font-bold">Fantasy League</h1>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {data && (
        <div className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Teams', value: data.totalFantasyTeams },
              { label: 'Points Awarded', value: data.totalPointsAwarded },
              { label: 'Gameweek Scores', value: data.gameweekScoreCount },
              { label: 'Transfers', value: data.totalTransfers },
            ].map(({ label, value }) => (
              <div key={label} className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-indigo-800">{String(value ?? 0)}</div>
                <div className="text-xs text-indigo-600 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Leagues by Type */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-2">Leagues by Type</h2>
            {Object.keys(leagues).length === 0 ? (
              <p className="text-gray-400 text-sm">No leagues yet</p>
            ) : (
              <div className="flex gap-3 flex-wrap">
                {Object.entries(leagues).map(([type, count]) => (
                  <div key={type} className="bg-gray-50 rounded px-3 py-2 text-center min-w-[80px]">
                    <div className="font-bold">{count}</div>
                    <div className="text-xs text-gray-500">{type}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gameweeks */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-2">Gameweeks</h2>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Total', value: (data.gameweeks as Record<string, number> | undefined)?.total },
                { label: 'Open', value: (data.gameweeks as Record<string, number> | undefined)?.open },
                { label: 'Locked', value: (data.gameweeks as Record<string, number> | undefined)?.locked },
                { label: 'Completed', value: (data.gameweeks as Record<string, number> | undefined)?.completed },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded p-2 text-center">
                  <div className="font-bold">{String(value ?? 0)}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-Substitutions */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-2">Auto-Substitutions</h2>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Applied', value: autoSubs.applied },
                { label: 'Skipped', value: autoSubs.skipped },
                { label: 'Total', value: autoSubs.total },
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
            <a href="/admin/fantasy/leagues" className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 rounded px-3 py-1.5 hover:bg-indigo-100">
              Manage Leagues
            </a>
            <a href="/admin/dashboard/fantasy-rules" className="text-xs bg-purple-50 border border-purple-200 text-purple-700 rounded px-3 py-1.5 hover:bg-purple-100">
              Fantasy Rules →
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
