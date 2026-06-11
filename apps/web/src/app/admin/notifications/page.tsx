'use client';

import { useEffect, useState } from 'react';
import { getAdminStats, getAdminRecentNotifications } from '@/lib/notifications-client';

const TOKEN = 'dev-admin-token';

interface AdminStats {
  total: number;
  unread: number;
  read: number;
  archived: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  delivery: {
    total: number;
    delivered: number;
    failed: number;
    activeProviders: string[];
    externalProvidersActive: boolean;
    note: string;
  };
}

interface RecentNotif {
  id: string;
  userId: string;
  type: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  readAt: string | null;
}

export default function AdminNotificationsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recent, setRecent] = useState<RecentNotif[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAdminStats(TOKEN), getAdminRecentNotifications(TOKEN, 20)])
      .then(([s, r]) => {
        setStats(s);
        setRecent(r);
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-8">Loading...</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin — Notifications</h1>
      <div className="flex gap-3 mb-6">
        <a href="/admin/notifications/send" className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700">
          Send to user
        </a>
        <a href="/admin/notifications/broadcast" className="bg-indigo-600 text-white text-sm px-4 py-2 rounded hover:bg-indigo-700">
          Broadcast
        </a>
      </div>
      {stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total', value: stats.total },
              { label: 'Unread', value: stats.unread },
              { label: 'Read', value: stats.read },
              { label: 'Archived', value: stats.archived },
            ].map(({ label, value }) => (
              <div key={label} className="border rounded p-4 text-center">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="border rounded p-4">
              <h2 className="font-semibold mb-3">By Type</h2>
              {Object.entries(stats.byType).length === 0 ? (
                <p className="text-sm text-gray-500">No data</p>
              ) : (
                <ul className="space-y-1">
                  {Object.entries(stats.byType).map(([type, count]) => (
                    <li key={type} className="flex justify-between text-sm">
                      <span>{type}</span>
                      <span className="font-medium">{count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border rounded p-4">
              <h2 className="font-semibold mb-3">Delivery</h2>
              <p className="text-sm mb-1">Total: {stats.delivery.total}</p>
              <p className="text-sm mb-1">Delivered: {stats.delivery.delivered}</p>
              <p className="text-sm mb-2">Failed: {stats.delivery.failed}</p>
              <p className="text-xs text-gray-500">{stats.delivery.note}</p>
            </div>
          </div>
        </>
      )}
      <h2 className="text-lg font-semibold mb-3">Recent Notifications</h2>
      {recent.length === 0 ? (
        <p className="text-gray-500 text-sm">No notifications yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="border px-3 py-2">Type</th>
                <th className="border px-3 py-2">Title</th>
                <th className="border px-3 py-2">Status</th>
                <th className="border px-3 py-2">Priority</th>
                <th className="border px-3 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(n => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{n.type}</td>
                  <td className="border px-3 py-2">{n.title}</td>
                  <td className="border px-3 py-2">{n.status}</td>
                  <td className="border px-3 py-2">{n.priority}</td>
                  <td className="border px-3 py-2">{new Date(n.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
