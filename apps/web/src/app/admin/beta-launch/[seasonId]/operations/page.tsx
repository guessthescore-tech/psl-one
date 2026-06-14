'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminGetOperationsReadiness } from '@/lib/beta-launch-client';
import Link from 'next/link';

export default function AdminOperationsReadinessPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetOperationsReadiness(seasonId).then(d => setData(d as Record<string, unknown>)).catch(e => setError(String(e)));
  }, [seasonId]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/admin/beta-launch/${seasonId}`} className="text-sm text-blue-600 hover:underline">← Back</Link>
        <h1 className="text-2xl font-bold">Operations &amp; Infrastructure Readiness</h1>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {data && (
        <div className="space-y-4">
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">{String(data['notice'] ?? '')}</p>
          <div className="bg-white border rounded divide-y">
            {(data['areas'] as Array<{ area: string; status: string; notes: string[] }> ?? []).map((a, i) => (
              <div key={i} className="p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{a.area}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${a.status === 'READY' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{a.status}</span>
                </div>
                {a.notes.map((n, ni) => <p key={ni} className="text-xs text-gray-500 mt-1">{n}</p>)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
