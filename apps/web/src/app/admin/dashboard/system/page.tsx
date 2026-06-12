'use client';

import { useEffect, useState } from 'react';
import { getSystemOperations } from '@/lib/admin-dashboard-client';
import { getBetaToken } from '@/lib/auth-client';


export default function SystemOperationsDashboardPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSystemOperations(getBetaToken()).then(setData).catch(e => setError(String(e))).finally(() => setLoading(false));
  }, []);

  const health = (data?.health ?? {}) as Record<string, unknown>;
  const events = (data?.recentEvents ?? []) as { type: string; label: string; timestamp: string }[];
  const deliveryByStatus = (data?.notificationDeliveryByStatus ?? {}) as Record<string, number>;

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/dashboard" className="text-blue-600 text-sm underline">← Dashboard</a>
        <h1 className="text-2xl font-bold">System &amp; Operations</h1>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {data && (
        <div className="space-y-4">
          {/* Platform Health */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-2">Platform Health</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(health).map(([key, val]) => (
                <div key={key} className={`rounded p-2 text-center border ${String(val) === 'LOCAL_POSTGRESQL_ONLY' || String(val) === 'UP' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className={`text-xs font-bold ${String(val) === 'LOCAL_POSTGRESQL_ONLY' || String(val) === 'UP' ? 'text-green-700' : 'text-gray-500'}`}>
                    {String(val)}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{key}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Notification Delivery by Status */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-2">Notification Delivery</h2>
            {Object.keys(deliveryByStatus).length === 0 ? (
              <p className="text-gray-400 text-sm">No delivery data yet</p>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {Object.entries(deliveryByStatus).map(([s, c]) => (
                  <span key={s} className={`text-xs rounded px-2 py-1 ${s === 'FAILED' ? 'bg-red-100 text-red-700 font-bold' : 'bg-gray-100 text-gray-700'}`}>
                    {s}: {c}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* DB Counts */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="font-semibold text-gray-700 mb-2">Database Counts</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {[
                { label: 'Users', value: data.userCount },
                { label: 'Fans', value: data.fanProfileCount },
                { label: 'Notifications', value: data.notificationCount },
                { label: 'Delivery Logs', value: data.deliveryLogCount },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded p-2 text-center">
                  <div className="font-bold">{String(value ?? 0)}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Operational Events */}
          {events.length > 0 && (
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h2 className="font-semibold text-gray-700 mb-2">Recent Events</h2>
              <ul className="space-y-1">
                {events.map((e, i) => (
                  <li key={i} className="flex justify-between text-sm text-gray-600">
                    <span className="text-xs bg-gray-100 rounded px-1.5 py-0.5 mr-2">{e.type}</span>
                    <span className="flex-1">{e.label}</span>
                    <span className="text-gray-400 text-xs">{new Date(e.timestamp).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Notice */}
          <div className="border border-gray-200 bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
            AWS commands, Terraform, and Kafka operations are not available via this dashboard. Local PostgreSQL only.
          </div>

          {/* Quick Links */}
          <div className="flex gap-2 flex-wrap">
            <a href="/admin/dashboard" className="text-xs bg-gray-50 border border-gray-200 text-gray-700 rounded px-3 py-1.5 hover:bg-gray-100">
              ← Command Centre
            </a>
            <a href="/admin/dashboard/compliance" className="text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded px-3 py-1.5 hover:bg-rose-100">
              Compliance →
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
