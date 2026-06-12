'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBetaKnownIssues } from '@/lib/beta-feedback-client';

interface KnownIssue {
  id: string;
  title: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  category: string;
  description: string;
  status: 'OPEN' | 'TRACKED' | 'DEFERRED' | 'RESOLVED';
  sprint: string;
  resolution: string;
}

interface IssuesData {
  issues: KnownIssue[];
  total: number;
  note: string;
}

const SEVERITY_COLOURS: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW: 'bg-blue-100 text-blue-700',
  INFO: 'bg-gray-100 text-gray-600',
};

const STATUS_COLOURS: Record<string, string> = {
  OPEN: 'bg-red-50 text-red-700',
  TRACKED: 'bg-amber-50 text-amber-700',
  DEFERRED: 'bg-gray-100 text-gray-600',
  RESOLVED: 'bg-green-100 text-green-700',
};

export default function BetaKnownIssuesPage() {
  const [data, setData] = useState<IssuesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBetaKnownIssues()
      .then((d) => setData(d as IssuesData))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
        <Link href="/admin/operations" className="hover:text-gray-600">Operations</Link>
        <span>/</span>
        <Link href="/admin/beta-feedback" className="hover:text-gray-600">Beta Feedback</Link>
        <span>/</span>
        <span className="text-gray-600">Known Issues</span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Known Issues</h1>
        <Link href="/admin/beta-feedback" className="text-sm text-blue-600 underline">← Beta Feedback</Link>
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {data && !loading && (
        <div className="space-y-4">
          {data.note && (
            <p className="text-xs text-gray-500 italic">{data.note}</p>
          )}
          <p className="text-xs text-gray-400">{data.total} issues tracked</p>

          <div className="space-y-3">
            {data.issues.map((issue) => (
              <div key={issue.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-gray-400">{issue.id}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${SEVERITY_COLOURS[issue.severity] ?? 'bg-gray-100 text-gray-600'}`}>
                      {issue.severity}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLOURS[issue.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {issue.status}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{issue.category}</span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{issue.title}</p>
                <p className="text-xs text-gray-600 mb-2">{issue.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>Sprint: <span className="text-gray-600">{issue.sprint}</span></span>
                </div>
                <p className="text-xs text-green-700 mt-1 italic">Resolution: {issue.resolution}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
