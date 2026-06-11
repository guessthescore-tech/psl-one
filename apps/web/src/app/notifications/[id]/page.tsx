'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getNotificationDetail, markRead, archiveNotification } from '@/lib/notifications-client';

const TOKEN = 'dev-token';

interface NotifDetail {
  id: string;
  type: string;
  title: string;
  body: string;
  status: string;
  priority: string;
  sourceType: string | null;
  sourceId: string | null;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function NotificationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [notif, setNotif] = useState<NotifDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getNotificationDetail(TOKEN, id)
      .then(setNotif)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleMarkRead() {
    if (!notif) return;
    try {
      const updated = await markRead(TOKEN, notif.id);
      setNotif(updated);
      setActionMsg('Marked as read');
    } catch (e) {
      setActionMsg(`Error: ${e}`);
    }
  }

  async function handleArchive() {
    if (!notif) return;
    try {
      const updated = await archiveNotification(TOKEN, notif.id);
      setNotif(updated);
      setActionMsg('Archived');
    } catch (e) {
      setActionMsg(`Error: ${e}`);
    }
  }

  if (loading) return <p className="p-8">Loading...</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;
  if (!notif) return <p className="p-8 text-gray-500">Notification not found</p>;

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <a href="/notifications" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        ← Inbox
      </a>
      <div className="border rounded p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded mr-2">{notif.type}</span>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{notif.priority}</span>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded font-medium ${
              notif.status === 'UNREAD'
                ? 'bg-blue-100 text-blue-700'
                : notif.status === 'ARCHIVED'
                ? 'bg-gray-100 text-gray-600'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {notif.status}
          </span>
        </div>
        <h1 className="text-xl font-bold mb-2">{notif.title}</h1>
        <p className="text-gray-700 mb-4">{notif.body}</p>
        {notif.actionUrl && (
          <a href={notif.actionUrl} className="text-blue-600 hover:underline text-sm mb-4 inline-block">
            {notif.actionUrl}
          </a>
        )}
        <div className="text-xs text-gray-400 space-y-1 mt-4">
          <p>Created: {new Date(notif.createdAt).toLocaleString()}</p>
          {notif.readAt && <p>Read: {new Date(notif.readAt).toLocaleString()}</p>}
          {notif.sourceType && <p>Source: {notif.sourceType} / {notif.sourceId}</p>}
        </div>
        {actionMsg && (
          <div className="mt-4 p-2 bg-green-50 border border-green-200 text-green-800 rounded text-sm">
            {actionMsg}
          </div>
        )}
        <div className="flex gap-3 mt-4">
          {notif.status === 'UNREAD' && (
            <button
              onClick={handleMarkRead}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
            >
              Mark as read
            </button>
          )}
          {notif.status !== 'ARCHIVED' && (
            <button
              onClick={handleArchive}
              className="bg-gray-100 text-sm px-4 py-2 rounded hover:bg-gray-200"
            >
              Archive
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
