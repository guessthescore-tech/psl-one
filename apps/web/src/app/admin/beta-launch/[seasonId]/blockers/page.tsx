'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminGetBlockers } from '@/lib/beta-launch-client';
import Link from 'next/link';

export default function AdminBlockersPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<{ blockers: unknown[]; count: number; notice: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetBlockers(seasonId).then(d => setData(d as typeof data)).catch(e => setError(String(e)));
  }, [seasonId]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/admin/beta-launch/${seasonId}`} className="text-sm text-blue-600 hover:underline">← Back</Link>
        <h1 className="text-2xl font-bold">Readiness Blockers</h1>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {data && (
        <>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">{data.notice}</p>

          {data.count === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded p-4 text-green-800 text-sm font-medium">
              No blockers — all 13 readiness checks clear
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-red-700">{data.count} blocker{data.count !== 1 ? 's' : ''} must be resolved before approval</p>
              {(data.blockers as Array<{ key: string; label: string; message: string; adminRoute?: string }>).map(b => (
                <div key={b.key} className="border border-red-200 rounded p-3 bg-red-50">
                  <p className="font-medium text-sm text-red-800">{b.label}</p>
                  <p className="text-xs text-red-700 mt-1">{b.message}</p>
                  {b.adminRoute && (
                    <Link href={b.adminRoute} className="text-xs text-blue-600 hover:underline mt-1 inline-block">{b.adminRoute}</Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
