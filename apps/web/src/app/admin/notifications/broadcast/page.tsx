'use client';

import { useState } from 'react';
import { adminBroadcast } from '@/lib/notifications-client';

const TOKEN = 'dev-admin-token';

const PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

export default function AdminBroadcastPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [actionUrl, setActionUrl] = useState('');
  const [result, setResult] = useState<{ broadcastTo: number; delivered: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !body) return;
    setSending(true);
    setResult(null);
    setError(null);
    try {
      const res = await adminBroadcast(TOKEN, {
        type: 'ADMIN_BROADCAST',
        title,
        body,
        priority,
        ...(actionUrl ? { actionUrl } : {}),
      });
      setResult(res);
    } catch (e) {
      setError(String(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="p-8 max-w-lg mx-auto">
      <a href="/admin/notifications" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        ← Admin Notifications
      </a>
      <h1 className="text-2xl font-bold mb-6">Broadcast Notification</h1>
      <p className="text-sm text-gray-600 mb-6">
        Sends an in-app notification to all active users. No external providers are active.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Body</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={4}
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Action URL (optional)</label>
          <input
            type="text"
            value={actionUrl}
            onChange={e => setActionUrl(e.target.value)}
            placeholder="/some/path"
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
        {result && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
            Broadcast sent to {result.broadcastTo} users. Delivered: {result.delivered}.
          </div>
        )}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={sending}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {sending ? 'Broadcasting...' : 'Broadcast to all users'}
        </button>
      </form>
    </main>
  );
}
