'use client';

import { useEffect, useState } from 'react';
import { getFantasyRules } from '@/lib/admin-dashboard-client';
import { getBetaToken } from '@/lib/auth-client';


export default function FantasyRulesDashboardPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFantasyRules(getBetaToken()).then(setData).catch(e => setError(String(e))).finally(() => setLoading(false));
  }, []);

  const config = (data?.config ?? {}) as Record<string, unknown>;
  const gameweeks = (data?.gameweeks ?? {}) as Record<string, number>;

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/dashboard" className="text-blue-600 text-sm underline">← Dashboard</a>
        <h1 className="text-2xl font-bold">Fantasy Rules</h1>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {data && (
        <div className="space-y-4">
          {/* Status Banner */}
          <div className={`border rounded-lg p-4 ${data.configStatus === 'ACTIVE' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${data.configStatus === 'ACTIVE' ? 'text-green-700' : 'text-amber-700'}`}>
                Config Status: {String(data.configStatus ?? 'NOT_CONFIGURED')}
              </span>
              {data.configStatus !== 'ACTIVE' && (
                <span className="text-xs text-amber-600">— Fantasy disabled until rules are configured</span>
              )}
            </div>
          </div>

          {/* Gameweek Summary */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-2">Gameweeks</h2>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Total', value: gameweeks.total },
                { label: 'Open', value: gameweeks.open },
                { label: 'Locked', value: gameweeks.locked },
                { label: 'Completed', value: gameweeks.completed },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded p-2 text-center">
                  <div className="font-bold">{String(value ?? 0)}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Config Details */}
          {Boolean(config.id) && (
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h2 className="font-semibold text-gray-700 mb-2">Active Configuration</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { label: 'Squad Size', key: 'squadSize' },
                  { label: 'Starting XI', key: 'startingXiSize' },
                  { label: 'Formation', key: 'defaultFormation' },
                  { label: 'Budget (FV)', key: 'transferBudgetFv' },
                  { label: 'Free Transfers', key: 'freeTransfersPerGameweek' },
                  { label: 'Transfer Deadline (hrs)', key: 'transferDeadlineHours' },
                ].map(({ label, key }) => (
                  <div key={key} className="flex justify-between bg-gray-50 rounded px-2 py-1">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium">{String(config[key] ?? '—')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Auto-substitution */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-2">Auto-Substitution</h2>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Applied', value: (data.autoSubstitutions as Record<string, number> | undefined)?.applied },
                { label: 'Skipped', value: (data.autoSubstitutions as Record<string, number> | undefined)?.skipped },
                { label: 'Gameweeks Active', value: (data.autoSubstitutions as Record<string, number> | undefined)?.byGameweek },
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
            <a href="/admin/fantasy/rules" className="text-xs bg-purple-50 border border-purple-200 text-purple-700 rounded px-3 py-1.5 hover:bg-purple-100">
              Manage Rules Config
            </a>
            <a href="/admin/dashboard/fantasy-league" className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 rounded px-3 py-1.5 hover:bg-indigo-100">
              Fantasy League →
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
