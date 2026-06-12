'use client';

import { useEffect, useState } from 'react';
import { getLaunchReadiness } from '@/lib/admin-operations-client';
import Link from 'next/link';

interface CheckItem {
  area: string;
  status: 'PASS' | 'FAIL' | 'PENDING' | 'WARN';
  detail: string;
}

interface LaunchReadinessData {
  generatedAt: string;
  overallStatus: string;
  passCount: number;
  failCount: number;
  pendingCount: number;
  checklist: CheckItem[];
  blockers: CheckItem[];
  nextSteps: string[];
}

const statusIcon = (s: string) =>
  s === 'PASS' ? '✓' : s === 'FAIL' ? '✗' : s === 'WARN' ? '!' : '…';

const statusColour = (s: string) =>
  s === 'PASS' ? 'text-green-700 bg-green-50' :
  s === 'FAIL' ? 'text-red-700 bg-red-50' :
  s === 'WARN' ? 'text-orange-700 bg-orange-50' :
  'text-gray-500 bg-gray-50';

const overallColour = (s: string) =>
  s === 'READY' ? 'bg-green-100 text-green-800 border-green-200' :
  s === 'BLOCKED' ? 'bg-red-100 text-red-800 border-red-200' :
  'bg-yellow-100 text-yellow-800 border-yellow-200';

export default function LaunchReadinessPage() {
  const [data, setData] = useState<LaunchReadinessData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLaunchReadiness()
      .then((d) => setData(d as LaunchReadinessData))
      .catch((e: unknown) => setError(String(e)));
  }, []);

  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-8 text-gray-500">Loading…</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-gray-500">
          <Link href="/admin/operations" className="hover:underline">Operations</Link> / Launch Readiness
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Launch Readiness</h1>
        <p className="text-sm text-gray-400 mt-0.5">Generated: {new Date(data.generatedAt).toLocaleString()}</p>
      </div>

      <div className={`border rounded-lg p-4 ${overallColour(data.overallStatus)}`}>
        <p className="font-semibold">Overall Status: {data.overallStatus}</p>
        <div className="flex gap-6 mt-1 text-sm">
          <span className="text-green-700">✓ {data.passCount} passed</span>
          <span className="text-red-700">✗ {data.failCount} failed</span>
          <span className="text-gray-500">… {data.pendingCount} pending</span>
        </div>
      </div>

      {data.blockers.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-800 mb-2">Blockers</p>
          <ul className="space-y-1">
            {data.blockers.map((b, i) => (
              <li key={i} className="text-sm text-red-700">✗ {b.area} — {b.detail}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Readiness Checklist</h2>
        <div className="space-y-2">
          {data.checklist.map((item, i) => (
            <div key={i} className={`border rounded p-3 flex items-start gap-3 ${statusColour(item.status)}`}>
              <span className="font-bold text-sm shrink-0 w-4 text-center">{statusIcon(item.status)}</span>
              <div>
                <p className="text-sm font-medium">{item.area}</p>
                <p className="text-xs mt-0.5 opacity-80">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Next Steps</h2>
        <ul className="space-y-2">
          {data.nextSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-blue-500 shrink-0">→</span>
              {step}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
