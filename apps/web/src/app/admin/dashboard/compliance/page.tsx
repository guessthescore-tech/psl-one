'use client';

import { useEffect, useState } from 'react';
import { getCompliance } from '@/lib/admin-dashboard-client';

const TOKEN = 'dev-token';

export default function ComplianceDashboardPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCompliance(TOKEN).then(setData).catch(e => setError(String(e))).finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/dashboard" className="text-blue-600 text-sm underline">← Dashboard</a>
        <h1 className="text-2xl font-bold">Compliance &amp; POPIA Governance</h1>
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
              { label: 'Password Reset Tokens Active', value: data.passwordResetTokenCount },
              { label: 'Audit Log Entries', value: data.auditLogCount },
            ].map(({ label, value }) => (
              <div key={label} className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-rose-800">{String(value ?? 0)}</div>
                <div className="text-xs text-rose-600 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Notification Delivery */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-2">Notification Delivery</h2>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Total Logs', value: (data.notificationDelivery as Record<string, number> | undefined)?.total },
                { label: 'Failed', value: (data.notificationDelivery as Record<string, number> | undefined)?.failed },
                { label: 'Unsubscribed', value: (data.notificationDelivery as Record<string, number> | undefined)?.unsubscribed },
              ].map(({ label, value }) => (
                <div key={label} className={`rounded p-2 text-center ${label === 'Failed' && Number(value) > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <div className={`font-bold ${label === 'Failed' && Number(value) > 0 ? 'text-red-700' : ''}`}>{String(value ?? 0)}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Fan Notifications Opt-In */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-2">Fan Notification Preferences</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Opted In', value: (data.fanNotificationOptIn as Record<string, number> | undefined)?.optedIn },
                { label: 'Opted Out', value: (data.fanNotificationOptIn as Record<string, number> | undefined)?.optedOut },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded p-2 text-center">
                  <div className="font-bold text-lg">{String(value ?? 0)}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Notice */}
          <div className="border border-gray-200 bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
            Full compliance case management, data deletion workflows, and POPIA export tools are not yet implemented.
            No raw personal data, password hashes, or auth secrets are displayed here.
          </div>

          {/* Quick Links */}
          <div className="flex gap-2 flex-wrap">
            <a href="/admin/notifications" className="text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded px-3 py-1.5 hover:bg-rose-100">
              Notifications
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
