'use client';

import { useEffect, useState } from 'react';
import { getMyFeed, hideOwnActivity } from '@/lib/activity-client';
import { getBetaToken } from '@/lib/auth-client';


interface FeedItem {
  id: string;
  type: string;
  title: string;
  body: string;
  visibility: string;
  status: string;
  occurredAt: string;
  reactionCounts: Record<string, number>;
}

export default function MyActivityFeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyFeed(getBetaToken(), { limit: 20, offset: 0 });
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
      await hideOwnActivity(getBetaToken(), id);
      setActionMsg('Activity hidden');
      load();
    } catch (e) {
      setActionMsg(String(e));
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">My Activity</h1>
        <a href="/activity" className="text-blue-600 text-sm underline">Global Feed</a>
      </div>

      {actionMsg && (
        <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
          {actionMsg}
        </div>
      )}

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <p className="text-sm text-gray-500 mb-3">{total} items</p>

      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <span className="text-xs font-mono text-gray-400 uppercase mr-2">{item.type}</span>
                <a href={`/activity/${item.id}`} className="font-semibold text-gray-800 hover:text-blue-600">
                  {item.title}
                </a>
                {item.visibility === 'PRIVATE' && (
                  <span className="ml-2 text-xs bg-gray-100 text-gray-500 rounded px-1">private</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{new Date(item.occurredAt).toLocaleString()}</span>
                {item.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleHide(item.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Hide
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600">{item.body}</p>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <p className="text-gray-400 text-sm">No activity on your feed yet.</p>
        )}
      </div>
    </main>
  );
}
