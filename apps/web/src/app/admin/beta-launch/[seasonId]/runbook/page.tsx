'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminGetRunbook } from '@/lib/beta-launch-client';
import Link from 'next/link';

export default function AdminRunbookPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetRunbook(seasonId).then(d => setData(d as Record<string, unknown>)).catch(e => setError(String(e)));
  }, [seasonId]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/admin/beta-launch/${seasonId}`} className="text-sm text-blue-600 hover:underline">← Back</Link>
        <h1 className="text-2xl font-bold">Beta Launch Runbook</h1>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-800">
        This runbook describes the launch procedure. Activation will NOT be performed by reading this page.
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {data && (
        <div className="space-y-4">
          {(data['phases'] as Array<{ phase: number; title: string; steps: string[]; safetyNotes: string[] }> ?? []).map(p => (
            <div key={p.phase} className="border rounded p-4 space-y-2">
              <p className="font-semibold text-sm">Phase {p.phase}: {p.title}</p>
              <ol className="list-decimal list-inside space-y-1">
                {p.steps.map((s, i) => <li key={i} className="text-sm text-gray-700">{s}</li>)}
              </ol>
              {p.safetyNotes.length > 0 && (
                <div className="bg-amber-50 rounded p-2 mt-2">
                  {p.safetyNotes.map((n, i) => <p key={i} className="text-xs text-amber-700">{n}</p>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
