'use client';

import Link from 'next/link';
import { useState } from 'react';
import { fanValueClient, type FanValueEntry, type FanValueType } from '@/lib/fan-value-client';

const VALUE_TYPES: FanValueType[] = [
  'FANTASY_POINTS', 'PREDICTION_POINTS', 'CHALLENGE_POINTS',
  'ACHIEVEMENT_POINTS', 'LOYALTY_POINTS', 'REWARD_CREDITS_READY',
];

type Mode = 'admin' | 'sponsor';

export default function AdminPostEntryPage() {
  const [mode, setMode] = useState<Mode>('admin');
  const [userId, setUserId] = useState('');
  const [points, setPoints] = useState('');
  const [valueType, setValueType] = useState<FanValueType>('LOYALTY_POINTS');
  const [sourceId, setSourceId] = useState('');
  const [description, setDescription] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [metadataRaw, setMetadataRaw] = useState('');
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [result, setResult] = useState<FanValueEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function parseMetadata(): object | undefined {
    if (!metadataRaw.trim()) return undefined;
    try {
      const parsed = JSON.parse(metadataRaw.trim()) as unknown;
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        setMetadataError('Metadata must be a JSON object');
        return undefined;
      }
      setMetadataError(null);
      return parsed as object;
    } catch {
      setMetadataError('Invalid JSON');
      return undefined;
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId.trim() || !idempotencyKey.trim() || points === '') return;
    const metadataJson = metadataRaw.trim() ? parseMetadata() : undefined;
    if (metadataRaw.trim() && metadataJson === undefined) return;

    setLoading(true);
    setResult(null);
    setError(null);
    try {
      if (mode === 'sponsor') {
        const r = await fanValueClient.adminPostSponsorEngagement({
          userId: userId.trim(),
          points: Number(points),
          idempotencyKey: idempotencyKey.trim(),
          ...(description.trim() ? { description: description.trim() } : {}),
          ...(metadataJson ? { metadataJson } : {}),
        });
        setResult(r);
      } else {
        const r = await fanValueClient.adminPostEntry({
          userId: userId.trim(),
          points: Number(points),
          valueType,
          idempotencyKey: idempotencyKey.trim(),
          ...(sourceId.trim() ? { sourceId: sourceId.trim() } : {}),
          ...(description.trim() ? { description: description.trim() } : {}),
          ...(metadataJson ? { metadataJson } : {}),
        });
        setResult(r);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = !loading && userId.trim() && idempotencyKey.trim() && points !== '' && !metadataError;

  return (
    <main className="max-w-xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Post Fan Value Entry</h1>
        <Link href="/admin/fan-value" className="text-sm text-blue-600 underline">Admin Summary</Link>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4 text-xs text-amber-800">
        Fan Value is <strong>non-financial</strong>. No cash value, no deposits, no withdrawals.
      </div>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMode('admin')}
          className={`px-3 py-1.5 rounded text-sm border ${mode === 'admin' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700'}`}
        >
          Admin Adjustment
        </button>
        <button
          type="button"
          onClick={() => setMode('sponsor')}
          className={`px-3 py-1.5 rounded text-sm border ${mode === 'sponsor' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700'}`}
        >
          Sponsor Engagement
        </button>
      </div>

      {mode === 'admin' && (
        <div className="mb-3 px-3 py-2 bg-gray-50 rounded border text-xs text-gray-500">
          Source type: <span className="font-medium text-gray-700">ADMIN_ADJUSTMENT</span> (always)
        </div>
      )}
      {mode === 'sponsor' && (
        <div className="mb-3 px-3 py-2 bg-gray-50 rounded border text-xs text-gray-500">
          Source type: <span className="font-medium text-gray-700">SPONSOR_ENGAGEMENT_READY</span> · Value type: <span className="font-medium text-gray-700">LOYALTY_POINTS</span>
        </div>
      )}

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">User ID <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="UUID"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Points <span className="text-red-500">*</span></label>
          <input
            type="number"
            placeholder="e.g. 10 or -5 (adjustment only)"
            value={points}
            onChange={e => setPoints(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        {mode === 'admin' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Value Type</label>
              <select
                value={valueType}
                onChange={e => setValueType(e.target.value as FanValueType)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                {VALUE_TYPES.map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Source ID <span className="text-gray-400">(optional, defaults to idempotency key)</span></label>
              <input
                type="text"
                placeholder="e.g. achievement-id, event-ref"
                value={sourceId}
                onChange={e => setSourceId(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Idempotency Key <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="Unique key — re-submitting the same key is safe"
            value={idempotencyKey}
            onChange={e => setIdempotencyKey(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Description <span className="text-gray-400">(optional)</span></label>
          <input
            type="text"
            placeholder="Reason or note"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Metadata JSON <span className="text-gray-400">(optional object)</span></label>
          <textarea
            rows={3}
            placeholder={'{\n  "campaignId": "...",\n  "eventRef": "..."\n}'}
            value={metadataRaw}
            onChange={e => { setMetadataRaw(e.target.value); setMetadataError(null); }}
            className={`w-full border rounded px-3 py-2 text-sm font-mono text-xs ${metadataError ? 'border-red-400' : ''}`}
          />
          {metadataError && <p className="text-xs text-red-600 mt-1">{metadataError}</p>}
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Posting…' : 'Post Entry'}
        </button>
      </form>

      {error && (
        <div className="mt-4 border border-red-300 rounded p-3 bg-red-50 text-sm text-red-700">{error}</div>
      )}

      {result && (
        <div className="mt-4 border rounded p-3 bg-green-50">
          <p className="text-xs font-semibold text-green-700 mb-2">Entry posted (idempotent — re-posting same key is safe)</p>
          <pre className="text-xs overflow-auto whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <p className="mt-6 text-xs text-gray-400 italic">
        Fan Value entries are non-financial and have no cash value. No deposits, withdrawals, or monetary transactions.
      </p>
    </main>
  );
}
