'use client';

import { useEffect, useState } from 'react';
import { getLeagueManagement } from '@/lib/admin-dashboard-client';
import { getBetaToken } from '@/lib/auth-client';


export default function LeagueManagementDashboardPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLeagueManagement(getBetaToken()).then(setData).catch(e => setError(String(e))).finally(() => setLoading(false));
  }, []);

  const byStatus = (data?.seasonsByStatus ?? {}) as Record<string, number>;
  const fixturesByStatus = (data?.fixturesByStatus ?? {}) as Record<string, number>;

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/dashboard" className="text-blue-600 text-sm underline">← Dashboard</a>
        <h1 className="text-2xl font-bold">League Management</h1>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {data && (
        <div className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Competitions', value: data.competitionCount },
              { label: 'Seasons', value: data.seasonCount },
              { label: 'Teams', value: data.teamCount },
              { label: 'Players', value: data.playerCount },
            ].map(({ label, value }) => (
              <div key={label} className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-800">{String(value ?? 0)}</div>
                <div className="text-xs text-green-600 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Seasons by Status */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-2">Seasons by Status</h2>
            {Object.keys(byStatus).length === 0 ? (
              <p className="text-gray-400 text-sm">No seasons yet</p>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {Object.entries(byStatus).map(([s, c]) => (
                  <span key={s} className="text-xs bg-gray-100 text-gray-700 rounded px-2 py-1">{s}: {c}</span>
                ))}
              </div>
            )}
          </div>

          {/* Fixtures by Status */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-2">Fixtures by Status</h2>
            {Object.keys(fixturesByStatus).length === 0 ? (
              <p className="text-gray-400 text-sm">No fixtures yet</p>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {Object.entries(fixturesByStatus).map(([s, c]) => (
                  <span key={s} className="text-xs bg-gray-100 text-gray-700 rounded px-2 py-1">{s}: {c}</span>
                ))}
              </div>
            )}
          </div>

          {/* Active Season */}
          {Boolean(data.activeSeason) && (() => {
            const s = data.activeSeason as { name?: string; slug?: string; status?: string } | null;
            return (
              <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                <h2 className="font-semibold text-green-800 mb-1">Active Season</h2>
                <p className="text-sm text-green-800 font-medium">{s?.name ?? '—'}</p>
                <p className="text-xs text-green-600">{s?.slug} · {s?.status}</p>
              </div>
            );
          })()}

          {/* Quick Links */}
          <div className="flex gap-2 flex-wrap">
            <a href="/admin/competitions" className="text-xs bg-green-50 border border-green-200 text-green-700 rounded px-3 py-1.5 hover:bg-green-100">
              Competitions
            </a>
            <a href="/admin/seasons" className="text-xs bg-green-50 border border-green-200 text-green-700 rounded px-3 py-1.5 hover:bg-green-100">
              Seasons
            </a>
            <a href="/admin/dashboard/fixture-management" className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-700 rounded px-3 py-1.5 hover:bg-yellow-100">
              Fixture Management →
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
