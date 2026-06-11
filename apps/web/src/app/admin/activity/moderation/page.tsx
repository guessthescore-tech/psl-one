'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAdminFeed, adminHideActivity, adminUnhideActivity } from '@/lib/activity-client';

const TOKEN = 'dev-token';

interface FeedItem {
  id: string;
  userId: string | null;
  type: string;
  title: string;
  body: string;
  status: string;
  visibility: string;
  occurredAt: string;
  hiddenReason: string | null;
  hiddenAt: string | null;
}

function ModerationContent() {
  const searchParams = useSearchParams();
  const focusId = searchParams.get('id');

  const [items, setItems] = useState<FeedItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [hideReason, setHideReason] = useState('');
  const [activeItemId, setActiveItemId] = useState<string | null>(focusId);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminFeed(TOKEN, { limit: 50, offset: 0 });
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleHide(id: string) {
    try {
      await adminHideActivity(TOKEN, id, hideReason || undefined);
      setActionMsg('Item hidden');
      setHideReason('');
      setActiveItemId(null);
      load();
    } catch (e) {
      setActionMsg(String(e));
    }
  }

  async function handleUnhide(id: string) {
    try {
      await adminUnhideActivity(TOKEN, id);
      setActionMsg('Item unhidden');
      load();
    } catch (e) {
      setActionMsg(String(e));
    }
  }

  const activeItem = activeItemId ? items.find(i => i.id === activeItemId) : null;

  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Activity Moderation</h1>
        <a href="/admin/activity" className="text-blue-600 text-sm underline">← All Activity</a>
      </div>

      {actionMsg && (
        <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
          {actionMsg}
        </div>
      )}

      {activeItem && (
        <div className="mb-6 border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
          <h2 className="font-semibold text-blue-800 mb-2">Moderate: {activeItem.title}</h2>
          <p className="text-sm text-gray-700 mb-3">{activeItem.body}</p>
          <p className="text-xs text-gray-500 mb-3">Status: {activeItem.status} | Type: {activeItem.type}</p>

          {activeItem.status === 'ACTIVE' ? (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Reason (optional)"
                className="border rounded px-2 py-1 text-sm flex-1"
                value={hideReason}
                onChange={e => setHideReason(e.target.value)}
              />
              <button
                onClick={() => handleHide(activeItem.id)}
                className="bg-red-600 text-white text-sm px-3 py-1.5 rounded hover:bg-red-700"
              >
                Hide
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleUnhide(activeItem.id)}
              className="bg-green-600 text-white text-sm px-3 py-1.5 rounded hover:bg-green-700"
            >
              Unhide
            </button>
          )}
        </div>
      )}

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <p className="text-sm text-gray-500 mb-3">{total} items</p>

      <div className="space-y-2">
        {items.map(item => (
          <div
            key={item.id}
            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
              activeItemId === item.id ? 'border-blue-400 bg-blue-50' : 'hover:bg-gray-50'
            } ${item.status === 'HIDDEN' ? 'opacity-60' : ''}`}
            onClick={() => setActiveItemId(activeItemId === item.id ? null : item.id)}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400 uppercase">{item.type}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                item.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                item.status === 'HIDDEN' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {item.status}
              </span>
              <span className="font-medium text-sm">{item.title}</span>
              <span className="text-xs text-gray-400 ml-auto">{new Date(item.occurredAt).toLocaleDateString()}</span>
            </div>
            {item.hiddenReason && (
              <p className="text-xs text-red-500 mt-1">Hidden: {item.hiddenReason}</p>
            )}
          </div>
        ))}
        {!loading && items.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-6">No items to moderate.</p>
        )}
      </div>
    </main>
  );
}

export default function ActivityModerationPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">Loading...</div>}>
      <ModerationContent />
    </Suspense>
  );
}
