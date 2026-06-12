'use client';

import { useEffect, useState } from 'react';
import { getAdminFeed } from '@/lib/activity-client';
import { getBetaToken } from '@/lib/auth-client';


interface FeedItem {
  id: string;
  userId: string | null;
  type: string;
  title: string;
  body: string;
  visibility: string;
  status: string;
  occurredAt: string;
  hiddenReason: string | null;
  reactionCounts: Record<string, number>;
}

export default function AdminActivityFeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  async function load(type?: string, status?: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminFeed(getBetaToken(), {
        ...(type ? { type } : {}),
        ...(status ? { status } : {}),
        limit: 50,
        offset: 0,
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function handleTypeChange(value: string) {
    setTypeFilter(value);
    load(value || undefined, statusFilter || undefined);
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value);
    load(typeFilter || undefined, value || undefined);
  }

  const statusBadge = (s: string) => {
    if (s === 'ACTIVE') return 'bg-green-100 text-green-700';
    if (s === 'HIDDEN') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-500';
  };

  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Activity Feed — Admin</h1>
        <div className="flex gap-2">
          <a href="/admin/activity/moderation" className="text-sm text-blue-600 underline">Moderation</a>
          <a href="/admin/activity/system" className="text-sm text-blue-600 underline">Post System Activity</a>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <select
          className="border rounded px-2 py-1 text-sm"
          value={typeFilter}
          onChange={e => handleTypeChange(e.target.value)}
        >
          <option value="">All Types</option>
          {['SYSTEM', 'ACHIEVEMENT_UNLOCKED', 'BADGE_EARNED', 'FANTASY_RESULT', 'PREDICTION_RESULT',
            'CHALLENGE_CREATED', 'CHALLENGE_RESULT', 'REWARD_ELIGIBLE', 'LIVE_MATCH_ALERT', 'ADMIN_POST'].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          className="border rounded px-2 py-1 text-sm"
          value={statusFilter}
          onChange={e => handleStatusChange(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="HIDDEN">Hidden</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <p className="text-sm text-gray-500 mb-3">{total} items</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="border px-3 py-2">Type</th>
              <th className="border px-3 py-2">Title</th>
              <th className="border px-3 py-2">Visibility</th>
              <th className="border px-3 py-2">Status</th>
              <th className="border px-3 py-2">Occurred</th>
              <th className="border px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="border px-3 py-2 font-mono text-xs">{item.type}</td>
                <td className="border px-3 py-2">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-gray-500 text-xs">{item.body}</div>
                  {item.hiddenReason && (
                    <div className="text-red-500 text-xs mt-1">Reason: {item.hiddenReason}</div>
                  )}
                </td>
                <td className="border px-3 py-2 text-xs">{item.visibility}</td>
                <td className="border px-3 py-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${statusBadge(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="border px-3 py-2 text-xs text-gray-500">
                  {new Date(item.occurredAt).toLocaleString()}
                </td>
                <td className="border px-3 py-2">
                  <a href={`/admin/activity/moderation?id=${item.id}`} className="text-blue-600 text-xs underline">
                    Moderate
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && items.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-6">No activity items found.</p>
        )}
      </div>
    </main>
  );
}
