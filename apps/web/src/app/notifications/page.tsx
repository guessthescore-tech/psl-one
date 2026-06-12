'use client';

import { useEffect, useState } from 'react';
import { getInbox, markRead, markAllRead, archiveNotification } from '@/lib/notifications-client';
import { getBetaToken } from '@/lib/auth-client';


interface NotifItem {
  id: string;
  type: string;
  title: string;
  body: string;
  status: string;
  priority: string;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
}

export default function NotificationsInboxPage() {
  const [items, setItems] = useState<NotifItem[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  async function load(status?: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await getInbox(getBetaToken(), { ...(status ? { status } : {}), limit: 20, offset: 0 });
      setItems(data.items);
      setTotal(data.total);
      setUnreadCount(data.unreadCount);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(statusFilter); }, [statusFilter]);

  async function handleMarkRead(id: string) {
    try {
      await markRead(getBetaToken(), id);
      setActionMsg('Marked as read');
      load(statusFilter);
    } catch (e) {
      setActionMsg(`Error: ${e}`);
    }
  }

  async function handleMarkAllRead() {
    try {
      const res = await markAllRead(getBetaToken());
      setActionMsg(`Marked ${res.updated} as read`);
      load(statusFilter);
    } catch (e) {
      setActionMsg(`Error: ${e}`);
    }
  }

  async function handleArchive(id: string) {
    try {
      await archiveNotification(getBetaToken(), id);
      setActionMsg('Archived');
      load(statusFilter);
    } catch (e) {
      setActionMsg(`Error: ${e}`);
    }
  }

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Notifications</h1>
      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm text-gray-500">{unreadCount} unread / {total} total</span>
        <button
          onClick={handleMarkAllRead}
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Mark all read
        </button>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-sm border px-2 py-1 rounded"
        >
          <option value="">All</option>
          <option value="UNREAD">Unread</option>
          <option value="READ">Read</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>
      {actionMsg && (
        <div className="mb-3 p-2 bg-green-50 border border-green-200 text-green-800 rounded text-sm">
          {actionMsg}
        </div>
      )}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">No notifications</p>
      ) : (
        <ul className="space-y-3">
          {items.map(n => (
            <li
              key={n.id}
              className={`border rounded p-4 ${n.status === 'UNREAD' ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm">{n.title}</p>
                  <p className="text-gray-700 text-sm mt-1">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {n.type} · {n.priority} · {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  {n.status === 'UNREAD' && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                    >
                      Read
                    </button>
                  )}
                  {n.status !== 'ARCHIVED' && (
                    <button
                      onClick={() => handleArchive(n.id)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                    >
                      Archive
                    </button>
                  )}
                  <a
                    href={`/notifications/${n.id}`}
                    className="text-xs text-blue-600 hover:underline px-2 py-1"
                  >
                    Detail
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
