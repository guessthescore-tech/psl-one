'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { getActivityDetail, addReaction, removeReaction } from '@/lib/activity-client';
import { getBetaToken } from '@/lib/auth-client';


const REACTION_TYPES = ['LIKE', 'FIRE', 'CLAP', 'TROPHY', 'BALL'] as const;
const REACTION_EMOJI: Record<string, string> = {
  LIKE: '👍', FIRE: '🔥', CLAP: '👏', TROPHY: '🏆', BALL: '⚽',
};

interface FeedItem {
  id: string;
  type: string;
  title: string;
  body: string;
  visibility: string;
  status: string;
  sourceType: string | null;
  sourceId: string | null;
  actionUrl: string | null;
  occurredAt: string;
  reactionCounts: Record<string, number>;
  myReactions: string[];
}

export default function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [item, setItem] = useState<FeedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getActivityDetail(getBetaToken(), id);
      setItem(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function toggleReaction(reactionType: string, hasIt: boolean) {
    if (!item) return;
    try {
      if (hasIt) {
        await removeReaction(getBetaToken(), item.id, reactionType);
      } else {
        await addReaction(getBetaToken(), item.id, reactionType);
      }
      setActionMsg(`Reaction ${hasIt ? 'removed' : 'added'}`);
      load();
    } catch (e) {
      setActionMsg(String(e));
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="mb-4">
        <a href="/activity" className="text-blue-600 text-sm underline">← Back to Feed</a>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {item && (
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-gray-400 uppercase bg-gray-100 px-2 py-0.5 rounded">
              {item.type}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded ${
              item.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {item.status}
            </span>
            <span className="text-xs text-gray-400 ml-auto">
              {new Date(item.occurredAt).toLocaleString()}
            </span>
          </div>

          <h1 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h1>
          <p className="text-gray-600 mb-4">{item.body}</p>

          {item.actionUrl && (
            <a href={item.actionUrl} className="text-blue-600 text-sm underline mb-4 block">
              View →
            </a>
          )}

          {item.sourceType && (
            <p className="text-xs text-gray-400 mb-4">
              Source: {item.sourceType} / {item.sourceId}
            </p>
          )}

          {actionMsg && (
            <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
              {actionMsg}
            </div>
          )}

          {item.visibility === 'PUBLIC' && item.status === 'ACTIVE' && (
            <div className="flex gap-2 flex-wrap">
              {REACTION_TYPES.map(rt => {
                const count = item.reactionCounts[rt] ?? 0;
                const hasIt = item.myReactions.includes(rt);
                return (
                  <button
                    key={rt}
                    onClick={() => toggleReaction(rt, hasIt)}
                    className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded border ${
                      hasIt ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {REACTION_EMOJI[rt]} {count > 0 && <span>{count}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
