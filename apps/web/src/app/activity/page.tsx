'use client';

import { useEffect, useState } from 'react';
import { getGlobalFeed, addReaction, removeReaction } from '@/lib/activity-client';

const TOKEN = 'dev-token';

const REACTION_TYPES = ['LIKE', 'FIRE', 'CLAP', 'TROPHY', 'BALL'] as const;
const REACTION_EMOJI: Record<string, string> = {
  LIKE: '👍', FIRE: '🔥', CLAP: '👏', TROPHY: '🏆', BALL: '⚽',
};

interface FeedItem {
  id: string;
  userId: string | null;
  type: string;
  title: string;
  body: string;
  visibility: string;
  status: string;
  occurredAt: string;
  reactionCounts: Record<string, number>;
  myReactions: string[];
}

export default function ActivityFeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  async function load(type?: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await getGlobalFeed(TOKEN, { ...(type ? { type } : {}), limit: 20, offset: 0 });
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleReaction(itemId: string, reactionType: string, hasIt: boolean) {
    try {
      if (hasIt) {
        await removeReaction(TOKEN, itemId, reactionType);
      } else {
        await addReaction(TOKEN, itemId, reactionType);
      }
      setActionMsg(`Reaction ${hasIt ? 'removed' : 'added'}`);
      load(typeFilter || undefined);
    } catch (e) {
      setActionMsg(String(e));
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Activity Feed</h1>

      <div className="flex gap-2 mb-4">
        <select
          className="border rounded px-2 py-1 text-sm"
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); load(e.target.value || undefined); }}
        >
          <option value="">All Types</option>
          {['SYSTEM', 'ACHIEVEMENT_UNLOCKED', 'BADGE_EARNED', 'FANTASY_RESULT', 'PREDICTION_RESULT',
            'CHALLENGE_CREATED', 'CHALLENGE_RESULT', 'REWARD_ELIGIBLE', 'LIVE_MATCH_ALERT'].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <a href="/activity/me" className="text-blue-600 text-sm underline self-center">My Feed</a>
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
              </div>
              <span className="text-xs text-gray-400">{new Date(item.occurredAt).toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{item.body}</p>
            <div className="flex gap-2 flex-wrap">
              {REACTION_TYPES.map(rt => {
                const count = item.reactionCounts[rt] ?? 0;
                const hasIt = item.myReactions.includes(rt);
                return (
                  <button
                    key={rt}
                    onClick={() => toggleReaction(item.id, rt, hasIt)}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${
                      hasIt ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {REACTION_EMOJI[rt]} {count > 0 && count}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <p className="text-gray-400 text-sm">No activity yet.</p>
        )}
      </div>
    </main>
  );
}
