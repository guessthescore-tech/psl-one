'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { getAutoSubs, type AutoSubResult, type AutoSubStatus } from '@/lib/fantasy-rules-client';

const STATUS_LABEL: Record<AutoSubStatus, string> = {
  APPLIED: 'Applied',
  SKIPPED_NO_ELIGIBLE_SUB: 'No eligible sub',
  SKIPPED_FORMATION_INVALID: 'Formation blocked',
  SKIPPED_BENCH_PLAYER_DID_NOT_PLAY: 'Bench player DNP',
  SKIPPED_GOALKEEPER_ONLY: 'GK only',
  SKIPPED_STARTER_PLAYED: 'Starter played',
};

const STATUS_CLS: Record<AutoSubStatus, string> = {
  APPLIED: 'bg-green-100 text-green-700',
  SKIPPED_NO_ELIGIBLE_SUB: 'bg-gray-100 text-gray-500',
  SKIPPED_FORMATION_INVALID: 'bg-amber-100 text-amber-700',
  SKIPPED_BENCH_PLAYER_DID_NOT_PLAY: 'bg-gray-100 text-gray-500',
  SKIPPED_GOALKEEPER_ONLY: 'bg-red-50 text-red-500',
  SKIPPED_STARTER_PLAYED: 'bg-blue-50 text-blue-500',
};

export default function GameweekAutoSubsPage({ params }: { params: Promise<{ gameweekId: string }> }) {
  const { gameweekId } = use(params);
  const [data, setData] = useState<AutoSubResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAutoSubs(gameweekId)
      .then(setData)
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [gameweekId]);

  if (loading) return <main className="p-4 text-sm text-gray-400">Loading…</main>;
  if (error) return <main className="p-4"><p className="text-red-600 text-sm">{error}</p></main>;
  if (!data) return null;

  const applied = data.substitutions.filter(s => s.status === 'APPLIED');
  const skipped = data.substitutions.filter(s => s.status !== 'APPLIED');

  return (
    <main className="max-w-lg mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">Auto-Substitutions</h1>
          <p className="text-xs text-gray-500">Gameweek {gameweekId.slice(0, 8)}…</p>
        </div>
        <div className="flex flex-col items-end gap-1 text-xs text-gray-400">
          <Link href={`/fantasy/gameweeks/${gameweekId}/score`} className="text-blue-600 underline">Score</Link>
          <Link href={`/fantasy/history/${gameweekId}`} className="text-blue-600 underline">History</Link>
        </div>
      </div>

      {/* Formation */}
      {(data.formationBefore || data.formationAfter) && (
        <div className="bg-white border rounded-xl p-4 mb-4 flex items-center gap-3 text-sm">
          <span className="text-gray-500">Formation</span>
          <span className="font-mono font-semibold">{data.formationBefore || '—'}</span>
          {data.formationBefore !== data.formationAfter && data.formationAfter && (
            <>
              <span className="text-gray-400">→</span>
              <span className="font-mono font-semibold text-green-700">{data.formationAfter}</span>
            </>
          )}
        </div>
      )}

      {data.substitutions.length === 0 && (
        <p className="text-gray-400 italic text-sm text-center py-8">No auto-substitution records for this gameweek yet.</p>
      )}

      {applied.length > 0 && (
        <section className="mb-4">
          <h2 className="text-sm font-semibold mb-2 text-green-700">Applied ({applied.length})</h2>
          <div className="space-y-2">
            {applied.map((sub, i) => (
              <div key={i} className="bg-white border border-green-200 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CLS[sub.status]}`}>
                    {STATUS_LABEL[sub.status]}
                  </span>
                  {sub.benchPriority != null && (
                    <span className="text-xs text-gray-400">Bench #{sub.benchPriority + 1}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-red-500 line-through">{sub.outPlayerName}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-green-700 font-medium">{sub.inPlayerName ?? '—'}</span>
                </div>
                {sub.formationBefore && sub.formationAfter && sub.formationBefore !== sub.formationAfter && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {sub.formationBefore} → {sub.formationAfter}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {skipped.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-2 text-gray-500">Skipped ({skipped.length})</h2>
          <div className="space-y-2">
            {skipped.map((sub, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CLS[sub.status]}`}>
                    {STATUS_LABEL[sub.status]}
                  </span>
                </div>
                <div className="text-sm text-gray-500">{sub.outPlayerName}</div>
                <div className="text-xs text-gray-400 mt-0.5">{sub.reason.replace(/_/g, ' ')}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
