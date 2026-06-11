'use client';

import { useState } from 'react';
import { adminSendToUser } from '@/lib/notifications-client';

const TOKEN = 'dev-admin-token';

const TYPES = [
  'SYSTEM', 'ADMIN_BROADCAST', 'FANTASY_DEADLINE', 'FANTASY_RESULT',
  'PREDICTION_LOCK', 'PREDICTION_RESULT', 'CHALLENGE_INVITE', 'CHALLENGE_RESULT',
  'ACHIEVEMENT_UNLOCKED', 'REWARD_ELIGIBLE', 'LIVE_MATCH_ALERT',
];

const PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

export default function AdminSendNotificationPage() {
  const [userId, setUserId] = useState('');
  const [type, setType] = useState('SYSTEM');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [actionUrl, setActionUrl] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !title || !body) return;
    setSending(true);
    setResult(null);
    setError(null);
    try {
      const res = await adminSendToUser(TOKEN, userId, {
        type,
        title,
        body,
        priority,
        ...(actionUrl ? { actionUrl } : {}),
      });
      setResult(`Sent! Notification ID: ${res.id}`);
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
      <h1 className="text-2xl font-bold mb-6">Send Notification to User</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">User ID</label>
          <input
            type="text"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            placeholder="Enter user UUID"
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
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
            rows={3}
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
        {result && <p className="text-green-700 text-sm">{result}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={sending}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Send Notification'}
        </button>
      </form>
    </main>
  );
}
