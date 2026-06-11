'use client';

import { useEffect, useState } from 'react';
import { getSponsorManagement } from '@/lib/admin-dashboard-client';

const TOKEN = 'dev-token';

export default function SponsorManagementDashboardPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSponsorManagement(TOKEN).then(setData).catch(e => setError(String(e))).finally(() => setLoading(false));
  }, []);

  const byStatus = (data?.rewardsByStatus ?? {}) as Record<string, number>;

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/dashboard" className="text-blue-600 text-sm underline">← Dashboard</a>
        <h1 className="text-2xl font-bold">Sponsor Management</h1>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {data && (
        <div className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Reward Definitions', value: data.rewardDefinitionCount },
              { label: 'Fan Eligibility Records', value: data.fanRewardReadinessCount },
              { label: 'Eligible Fans', value: data.eligibleCount },
              { label: 'Ineligible Fans', value: data.ineligibleCount },
            ].map(({ label, value }) => (
              <div key={label} className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-orange-800">{String(value ?? 0)}</div>
                <div className="text-xs text-orange-600 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Rewards by Status */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-2">Fan Reward Readiness by Status</h2>
            {Object.keys(byStatus).length === 0 ? (
              <p className="text-gray-400 text-sm">No reward data yet</p>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {Object.entries(byStatus).map(([s, c]) => (
                  <span key={s} className="text-xs bg-gray-100 text-gray-700 rounded px-2 py-1">{s}: {c}</span>
                ))}
              </div>
            )}
          </div>

          {/* Notice */}
          <div className="border border-gray-200 bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
            Sponsor portal access, campaign execution, billing, contracts, and fulfilment are not yet implemented.
            This dashboard shows reward readiness data only.
          </div>

          {/* Quick Links */}
          <div className="flex gap-2 flex-wrap">
            <a href="/admin/rewards/definitions" className="text-xs bg-orange-50 border border-orange-200 text-orange-700 rounded px-3 py-1.5 hover:bg-orange-100">
              Reward Definitions
            </a>
            <a href="/admin/dashboard/reporting" className="text-xs bg-teal-50 border border-teal-200 text-teal-700 rounded px-3 py-1.5 hover:bg-teal-100">
              Reporting Centre →
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
