'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminGetWalkthrough } from '@/lib/beta-launch-client';
import Link from 'next/link';

export default function AdminWalkthroughPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetWalkthrough(seasonId).then(d => setData(d as Record<string, unknown>)).catch(e => setError(String(e)));
  }, [seasonId]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/admin/beta-launch/${seasonId}`} className="text-sm text-blue-600 hover:underline">← Back</Link>
        <h1 className="text-2xl font-bold">Frontend Walkthrough</h1>
      </div>
      <p className="text-sm text-gray-600">Step-by-step walkthrough of all fan and admin pages before beta cohort invite.</p>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {data && (
        <div className="space-y-4">
          {(data['steps'] as Array<{ step: number; domain: string; adminPages: string[]; fanPages: string[]; notes: string }> ?? []).map(s => (
            <div key={s.step} className="border rounded p-4 space-y-2">
              <div className="flex items-center gap-3">
                <span className="bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">{s.step}</span>
                <p className="font-semibold text-sm">{s.domain}</p>
              </div>
              {s.notes && <p className="text-xs text-gray-500">{s.notes}</p>}
              {s.adminPages.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Admin pages</p>
                  {s.adminPages.map(p => <p key={p} className="text-xs font-mono text-blue-700">{p}</p>)}
                </div>
              )}
              {s.fanPages.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Fan pages</p>
                  {s.fanPages.map(p => <p key={p} className="text-xs font-mono text-green-700">{p}</p>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
